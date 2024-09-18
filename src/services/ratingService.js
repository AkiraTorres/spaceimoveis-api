import prisma from '../config/prisma.js';
import { validateEmail, validateInteger, validateString } from '../validators/inputValidators.js';
import RealtorService from './realtorService.js';

export default class RatingService {
  constructor() {
    this.realtorService = new RealtorService();
  }

  static async getAllRatesByReceiver(receiverEmail, page = 1) {
    const validatedReceiverEmail = validateEmail(receiverEmail);

    const receiver = await this.userService.find(validatedReceiverEmail);
    if (!receiver) throw new Error('Usuário não encontrado.', 404);

    if (!(receiver.type in ['realtor', 'realstate'])) throw new Error('Usuário a receber a avaliação deve ser um corretor ou imobiliária.', 400);

    const take = 6;
    const where = { receiverEmail: validatedReceiverEmail, type: { in: ['realtor', 'realstate'] } };

    const total = await prisma.user.count({ where });
    if (total === 0) throw new Error('Nenhuma avaliação encontrada.', 404);

    const lastPage = Math.ceil(total / take);
    const skip = Number(take * (page - 1));

    const orderBy = { createdAt: 'desc' };

    const pagination = {
      path: `/ratings/${receiverEmail}`,
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total,
    };

    const result = await prisma.userRating.findMany({ where, take, skip, orderBy });

    return { result, pagination };
  }

  static async getAllRatesBySender(senderEmail, page = 1) {
    const validatedSenderEmail = validateEmail(senderEmail);

    const user = await this.userService.find(validatedSenderEmail);
    if (!user) throw new Error('Usuário não encontrado.', 404);

    const take = 6;
    const where = { senderEmail: validatedSenderEmail };

    const total = await prisma.userRating.count({ where });

    if (total === 0) throw new Error('Nenhuma avaliação encontrada.', 404);

    const lastPage = Math.ceil(total / take);
    const skip = Number(take * (page - 1));

    const orderBy = { createdAt: 'desc' };

    const pagination = {
      path: `/ratings/sender/${senderEmail}`,
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total,
    };

    const result = await prisma.userRating.findMany({ where, take, skip, orderBy });

    return { result, pagination };
  }

  static async getAvgRateByReceiver(receiverEmail) {
    return this.realtorService().getAvgRateByReceiver(receiverEmail);
  }

  static async setRate(senderEmail, receiverEmail, rating, comment) {
    const validatedSenderEmail = validateEmail(senderEmail);
    const validatedReceiverEmail = validateEmail(receiverEmail);
    const validatedRating = validateInteger(rating);
    const validatedComment = validateString(comment);

    const sender = await this.userService.find(validatedSenderEmail);
    if (!sender) throw new Error('Usuário não encontrado.', 404);

    const receiver = await this.userService.find(validatedReceiverEmail);
    if (!receiver) throw new Error('Usuário a receber a avaliação não encontrado.', 404);

    if (validatedRating < 0 || validatedRating > 10) throw new Error('Avaliação deve ser um número entre 0 e 10.', 400);

    const ratingData = {
      rating: validatedRating,
      comment: validatedComment,
      receiverEmail: validatedReceiverEmail,
      senderEmail: sender.email,
    };

    const rate = await prisma.userRating.create({ data: ratingData });
    return { ...rate, sender, receiver };
  }

  static async filter(data, page = 1) {
    const take = 6;
    const skip = Number(take * (page - 1));
    let orderBy = { createdAt: 'desc' };

    const where = {};
    if (data) {
      const { receiverEmail, senderEmail, minRating = 0, maxRating = 10, order } = data;
      if (receiverEmail) where.receiverEmail = validateEmail(receiverEmail);
      if (senderEmail) where.sender_email = validateEmail(senderEmail);
      if (order) orderBy = order;
      where.rating = { gte: minRating, lte: maxRating };
    }

    const total = await prisma.userRating.count({ where });

    if (total === 0) throw new Error('Nenhuma avaliação encontrada.', 404);

    const lastPage = Math.ceil(total / take);

    const pagination = {
      path: '/ratings',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total,
    };

    const result = await prisma.userRating.findMany({ where, take, skip, orderBy });
    return { result, pagination };
  }

  static async deleteRate(id, senderEmail) {
    const validateId = validateString(id);
    const validatedSenderEmail = validateEmail(senderEmail);

    const user = await this.userService.find(validatedSenderEmail);
    if (!user) throw new Error('Usuário não encontrado.', 404);

    const rate = await prisma.userRating.findFirst(validateId);
    if (!rate) throw new Error('Avaliação não encontrada.', 404);

    if (rate.senderEmail !== senderEmail) throw new Error('Você não tem permissão para excluir esta avaliação.', 403);

    await rate.destroy();
    return { message: 'Avaliação excluída com sucesso.' };
  }
}
