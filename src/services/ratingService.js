import { Op } from 'sequelize';

import RealstateRating from '../db/models/RealstateRating.js';
import RealtorRating from '../db/models/RealtorRating.js';
import { validateEmail, validateInteger, validateString } from '../validators/inputValidators.js';
import { find } from './globalService.js';

export async function getAllRatesByReceiver(receiverEmail, page = 1) {
  const validatedReceiverEmail = validateEmail(receiverEmail);

  const receiver = await find(validatedReceiverEmail);
  if (!receiver) {
    const error = new Error('Usuário não encontrado.');
    error.status = 404;
    throw error;
  }

  if (receiver.type !== 'realtor' && receiver.type !== 'realstate') {
    const error = new Error('Usuário a receber a avaliação deve ser um corretor ou imobiliária.');
    error.status = 400;
    throw error;
  }

  const limit = 6;
  const where = { receiver_email: validatedReceiverEmail };

  const total = receiver.type === 'realtor' ? await RealtorRating.count({ where }) : await RealstateRating.count({ where });
  if (total === 0) {
    const error = new Error('Nenhuma avaliação encontrada.');
    error.status = 404;
    throw error;
  }

  const lastPage = Math.ceil(total / limit);
  const offset = Number(limit * (page - 1));

  const order = [['createdAt', 'DESC']];

  const pagination = {
    path: `/ratings/${receiverEmail}`,
    page,
    prev_page_url: page - 1 >= 1 ? page - 1 : null,
    next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
    lastPage,
    total,
  };

  let rates = null;
  if (receiver.type === 'realtor') {
    rates = await RealtorRating.findAll({ where, limit, offset, order, raw: true });
  } else if (receiver.type === 'realstate') {
    rates = await RealstateRating.findAll({ where, limit, offset, order, raw: true });
  } else {
    const error = new Error('Usuário a receber a avaliação deve ser um corretor ou imobiliária.');
    error.status = 400;
    throw error;
  }

  const result = await Promise.all(rates.map(async (rate) => {
    const editedRate = rate;
    editedRate.sender = await find(rate.sender_email);
    return editedRate;
  }));

  return { result, pagination };
}

export async function getAllRatesBySender(senderEmail, page = 1) {
  const validatedSenderEmail = validateEmail(senderEmail);

  const user = await find(validatedSenderEmail);
  if (!user) {
    const error = new Error('Usuário não encontrado.');
    error.status = 404;
    throw error;
  }

  const limit = 6;
  const where = { sender_email: validatedSenderEmail };

  const total = await RealtorRating.count({ where }) + await RealstateRating.count({ where });

  if (total === 0) {
    const error = new Error('Nenhuma avaliação encontrada.');
    error.status = 404;
    throw error;
  }

  const lastPage = Math.ceil(total / limit);
  const offset = Number(limit * (page - 1));

  const order = [['createdAt', 'DESC']];

  const pagination = {
    path: `/ratings/sender/${senderEmail}`,
    page,
    prev_page_url: page - 1 >= 1 ? page - 1 : null,
    next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
    lastPage,
    total,
  };

  const result = await RealtorRating.findAll({ where, limit, offset, order });

  return { result, pagination };
}

export async function getAvgRateByReceiver(receiverEmail) {
  const validatedReceiverEmail = validateEmail(receiverEmail);

  const receiver = await find(validatedReceiverEmail);
  if (!receiver) {
    const error = new Error('Usuário não encontrado.');
    error.status = 404;
    throw error;
  }

  if (receiver.type !== 'realtor' && receiver.type !== 'realstate') {
    const error = new Error('Usuário a receber a avaliação deve ser um corretor ou imobiliária.');
    error.status = 400;
    throw error;
  }

  const where = { receiver_email: validatedReceiverEmail };
  const order = [['createdAt', 'DESC']];

  let ratings = 0;
  if (receiver.type === 'realtor') {
    ratings = await RealtorRating.findAll({ where, order });
  } else if (receiver.type === 'realstate') {
    ratings = await RealstateRating.findAll({ where, order });
  }

  if (ratings === 0) {
    const error = new Error('Nenhuma avaliação encontrada.');
    error.status = 404;
    throw error;
  }

  const total = ratings.length;
  const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
  const avg = ((sum / total) / 2).toFixed(2);
  return { avg, total, receiver };
}

export async function setRate(senderEmail, receiverEmail, rating, comment) {
  const validatedSenderEmail = validateEmail(senderEmail);
  const validatedReceiverEmail = validateEmail(receiverEmail);
  const validatedRating = validateInteger(rating);
  const validatedComment = validateString(comment);

  const sender = await find(validatedSenderEmail);
  if (!sender) {
    const error = new Error('Usuário não encontrado.');
    error.status = 404;
    throw error;
  }

  const receiver = await find(validatedReceiverEmail);
  if (!receiver) {
    const error = new Error('Usuário não encontrado.');
    error.status = 404;
    throw error;
  }

  if (validatedRating < 0 || validatedRating > 10) {
    const error = new Error('A avaliação deve ser um número entre 0 e 10.');
    error.status = 400;
    throw error;
  }

  const ratingData = {
    rating: validatedRating,
    comment: validatedComment,
    receiver_email: validatedReceiverEmail,
    sender_email: sender.email,
  };

  let rate;
  if (receiver.type === 'realtor') {
    rate = await RealtorRating.create(ratingData);
  } else if (receiver.type === 'realstate') {
    rate = await RealstateRating.create(ratingData);
  }

  return { ...rate, ...sender };
}

export async function filter(data, page = 1) {
  const limit = 6;
  const offset = Number(limit * (page - 1));
  const ordering = [['createdAt', 'DESC']];

  const where = {};
  if (data) {
    const { receiverEmail, senderEmail, minRating = 0, maxRating = 10, order, orderType } = data;
    if (receiverEmail) where.receiver_email = validateEmail(receiverEmail);
    if (senderEmail) where.sender_email = validateEmail(senderEmail);
    if (order) ordering[0][0] = validateString(order);
    if (orderType) ordering[0][1] = validateString(orderType);
    where.rating = { [Op.between]: [minRating, maxRating] };
  }

  const total = await RealtorRating.count({ where }) + await RealstateRating.count({ where });

  if (total === 0) {
    const error = new Error('Nenhuma avaliação encontrada.');
    error.status = 404;
    throw error;
  }

  const lastPage = Math.ceil(total / limit);

  const pagination = {
    path: '/ratings',
    page,
    prev_page_url: page - 1 >= 1 ? page - 1 : null,
    next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
    lastPage,
    total,
  };

  const result = await RealtorRating.findAll({ where, limit, offset, order: ordering });
  return { result, pagination };
}

export async function deleteRate(id, senderEmail) {
  const validateId = validateString(id);
  const validatedSenderEmail = validateEmail(senderEmail);

  const user = await find(validatedSenderEmail);
  if (!user) {
    const error = new Error('Usuário não encontrado.');
    error.status = 404;
    throw error;
  }

  let rate = await RealtorRating.findByPk(validateId);
  if (!rate) {
    rate = await RealstateRating.findByPk(validateId);
  }
  if (!rate) {
    const error = new Error('Avaliação não encontrada.');
    error.status = 404;
    throw error;
  }

  if (rate.sender_email !== senderEmail) {
    const error = new Error('Você não tem permissão para excluir essa avaliação.');
    error.status = 403;
    throw error;
  }

  await rate.destroy();
  return { message: 'Avaliação excluída com sucesso.' };
}
