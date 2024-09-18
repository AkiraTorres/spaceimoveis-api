import prisma, { excludeFromObject } from '../config/prisma.js';
import ConfigurableError from '../errors/ConfigurableError.js';
import { validateEmail, validateString, validateUF, validateUserType } from '../validators/inputValidators.js';
import UserService from './userService.js';

export default class RealtorService extends UserService {
  static async getAvgRateByReceiver(receiverEmail) {
    const validatedReceiverEmail = validateEmail(receiverEmail);

    const receiver = await prisma.user.findByPk(validatedReceiverEmail);
    if (!receiver) throw new ConfigurableError('Usuário não encontrado', 404);
    if (!(receiver.type in ['realtor', 'realstate'])) throw new Error('Usuário a receber a avaliação deve ser um corretor ou imobiliária.', 400);

    const where = { receiverEmail: validatedReceiverEmail };
    const orderBy = { createdAt: 'desc' };

    const ratings = await prisma.userRating.findAll({ where, orderBy });

    if (ratings === 0) return ratings;

    const total = ratings.length;
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    return ((sum / total) / 2).toFixed(2);
  }

  static async userDetails(user) {
    const editedUser = user;

    editedUser.info = await prisma.userInfo.findUnique({ where: { email: user.email } });
    editedUser.address = await prisma.userAddress.findUnique({ where: { email: user.email } });
    editedUser.profile = await prisma.userPhoto.findUnique({ where: { email: user.email } });
    editedUser.avgRating = await this.getAvgRateByReceiver(user.email);
    editedUser.totalRatings = await prisma.userRating.count({ where: { email: user.email } });
    editedUser.favorites = await prisma.favorite.findMany({ where: { userEmail: user.email } });
    editedUser.followers = await prisma.follower.findMany({ where: { followedEmail: user.email } });
    editedUser.follow = await prisma.follower.findMany({ where: { followerEmail: user.email } });

    return excludeFromObject(editedUser, ['otp', 'otp_ttl', 'password']);
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

    const realtors = await prisma.user.findAll({ where, orderBy, skip, take });
    if (realtors.length === 0) throw new ConfigurableError('Nenhum corretor encontrado', 404);

    const result = await Promise.all(realtors.map(async (realtor) => this.userDetails(realtor)));

    result.sort(async (a, b) => (await a.avgRating < await b.avgRating ? 1 : -1));

    return { result, pagination };
  }
}
