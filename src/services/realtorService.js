import prisma, { excludeFromObject } from '../config/prisma.js';
import ConfigurableError from '../errors/ConfigurableError.js';
import { validateEmail, validateString, validateUF, validateUserType } from '../validators/inputValidators.js';
import UserService from './userService.js';

export default class RealtorService extends UserService {
  static async getAvgRateByReceiver(receiverEmail) {
    const validatedReceiverEmail = validateEmail(receiverEmail);

    const receiver = await prisma.user.findFirst({ where: { email: validatedReceiverEmail } });
    if (!receiver) throw new ConfigurableError('Usuário não encontrado', 404);
    if (!['realtor', 'realstate'].includes(receiver.type)) {
      throw new Error('Usuário a receber a avaliação deve ser um corretor ou imobiliária.', 400);
    }

    const where = { receiverEmail: validatedReceiverEmail };
    const orderBy = { createdAt: 'desc' };

    const ratings = await prisma.userRating.findMany({ where, orderBy });

    if (ratings === 0) return ratings;

    const total = ratings.length;
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    return ((sum / total) / 2).toFixed(2);
  }

  static async userDetails(userEmail) {
    const user = await prisma.user.findFirst({ where: { email: userEmail } });

    user.info = await prisma.userInfo.findFirst({ where: { email: userEmail } });
    user.address = await prisma.userAddress.findFirst({ where: { email: userEmail } });
    user.profile = await prisma.userPhoto.findFirst({ where: { email: userEmail } });
    user.avgRating = await this.getAvgRateByReceiver(userEmail);
    user.totalRatings = await prisma.userRating.count({ where: { receiverEmail: userEmail } });
    user.favorites = await prisma.favorite.findMany({ where: { userEmail } });
    user.followers = await prisma.follower.findMany({ where: { followedEmail: userEmail } });
    user.follow = await prisma.follower.findMany({ where: { followerEmail: userEmail } });
    user.socials = await prisma.userSocial.findMany({ where: { email: userEmail } });

    return excludeFromObject(user, ['otp', 'otp_ttl', 'password']);
  }

  static async filter(data, t, page = 1) {
    const take = 6;
    const skip = Number(take * (page - 1));
    const type = validateUserType(t);
    const where = { type };
    let orderBy = { name: 'asc' };

    if (data) {
      const { name, email, city, state, order } = data;
      if (name) where.name = { contains: `${validateString(name)}`, mode: 'insensitive' };
      if (email) where.email = validateEmail(email);
      if (city) where.city = { contains: `${validateString(city)}`, mode: 'insensitive' };
      if (state) where.state = validateUF(state);
      if (order) orderBy = order;
    }

    const total = await prisma.user.count({ where });
    const lastPage = Math.ceil(total / take);

    const pagination = {
      path: `/${type}/filter`,
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total,
    };

    const realtors = await prisma.user.findMany({ where, orderBy, skip, take });
    if (realtors.length === 0) throw new ConfigurableError('Nenhum corretor encontrado', 404);

    const result = await Promise.all(realtors.map(async (realtor) => this.userDetails(realtor.email)));

    result.sort(async (a, b) => (await a.avgRating < await b.avgRating ? 1 : -1));

    return { result, pagination };
  }

  static async findAllRealtorsAndRealstates(page = 1, limit = 6) {
    const where = { type: { in: ['realtor', 'realstate'] } };

    if (page < 1) {
      const users = await prisma.user.findMany({ where, orderBy: { name: 'asc' } });
      // if (users.length === 0) throw new ConfigurableError('Não existe nenhum corretor ou imobiliária cadastrado.', 404);
      if (users.length === 0) return [];

      const result = await Promise.all(users.map(async (user) => RealtorService.userDetails(user.email)));
      result.sort((a, b) => b.avgRating - a.avgRating);
      return result;
    }

    const total = await prisma.user.count({ where });
    if (total === 0) return { result: [], pagination: {} };

    const lastPage = Math.ceil(total / limit);
    const offset = Number(limit * (page - 1));

    const users = await prisma.user.findMany({ where, orderBy: { name: 'asc' }, skip: offset, take: limit });
    const result = await Promise.all(users.map(async (user) => RealtorService.userDetails(user.email)));
    result.sort((a, b) => b.avgRating - a.avgRating);

    const pagination = {
      path: '/realtors-and-realstates',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total,
    };

    return { result, pagination };
  }

  static async getAvailability(email) {
    const validatedEmail = validateEmail(email);
    const user = await prisma.user.findFirst({ where: { email: validatedEmail } });
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);
    // if (!['realtor', 'realstate'].includes(user.type)) throw new ConfigurableError('Usuário não é um corretor/imobiliária', 400);

    const availability = await prisma.availableTime.findMany({ where: { advertiserEmail: validatedEmail } });

    return availability.map((day) => {
      const { weekDay, start, end } = day;
      return { dia: this.translateDay(weekDay), inicio: start, fim: end };
    });
  }

  static async setAvailability(email, availability) {
    const validatedEmail = validateEmail(email);
    const user = await prisma.user.findFirst({ where: { email: validatedEmail } });
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);
    if (!['realtor', 'realstate'].includes(user.type)) throw new ConfigurableError('Usuário não é um corretor/imobiliária', 400);

    let transformedAvailability = [];
    if (availability) {
      transformedAvailability = availability.map((day) => {
        const { dia, inicio: start, fim: end } = day;
        const weekDay = this.translateDay(dia);

        if (!start || !end) throw new ConfigurableError('Horário de início e/ou fim não informados', 400);

        return { advertiserEmail: validatedEmail, weekDay, start, end };
      });
    }

    const transactions = [
      prisma.availableTime.deleteMany({ where: { advertiserEmail: validatedEmail } }),
    ];

    if (transformedAvailability.length > 0) {
      transactions.push(prisma.availableTime.createMany({ data: transformedAvailability }));
    }

    return prisma.$transaction(transactions);
  }

  static async approveAppointment(appointmentId, email) {
    const validatedId = validateString(appointmentId);
    const appointment = await this.findAppointmentById(validatedId, email);
    if (!appointment) throw new ConfigurableError('Agendamento não encontrado', 404);

    return prisma.appointment.update({ where: { id: validatedId }, data: { status: 'accepted' } });
  }

  static async rejectAppointment(appointmentId, email) {
    const validatedId = validateString(appointmentId);
    const appointment = await this.findAppointmentById(validatedId, email);
    if (!appointment) throw new ConfigurableError('Agendamento não encontrado', 404);

    return prisma.appointment.update({ where: { id: validatedId }, data: { status: 'rejected' } });
  }
}
