/* eslint-disable no-console */
import dotenv from 'dotenv';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { scheduleJob } from 'node-schedule';
import { v4 as uuid } from 'uuid';
import prisma from './prisma.js';

import UserService from '../services/userService.js';

dotenv.config();

const { MERCADOPAGO_ACCESS_TOKEN } = process.env;

export const paymentClient = new MercadoPagoConfig({
  accessToken: MERCADOPAGO_ACCESS_TOKEN,
  options: { timeout: 10000, idempotencyKey: uuid() },
});

export const checkIfPaid = async (id) => {
  const payment = new Payment(paymentClient);

  const paymentDetails = await payment.get({ id });

  return paymentDetails.status === 'approved';
};

const adjustPublishLimit = async (email, limit) => {
  const user = await UserService.find({ email });

  user.publishLimit = limit;
  await prisma.userInfo.update({ where: { email }, data: { publishLimit: limit } });
  console.log(`O limite de publicações do usuário ${email} foi ajustado para ${limit}`);
  console.log(user);
};

const adjustHighlightLimit = async (email, limit) => {
  const user = await UserService.find({ email });

  user.highlightLimit = limit;
  await prisma.userInfo.update({ where: { email }, data: { highlightLimit: limit } });
  console.log(`O limite de destaques do usuário ${email} foi ajustado para ${limit}`);
  console.log(user);
};

// TODO: Separar apropriadamente as responsabilidades
// TODO: Adicionar validações de entrada
// TODO: Adicionar tratamento de erros
// TODO: Sistema de cancelamento de pagamento
// TODO: Sistema de reembolso
// TODO: Sistema para aumentar o limite de publicações do usuário quando o pagamento for aprovado

export const createPaymentPreference = async (req, res, next) => {
  try {
    const payment = new Payment(paymentClient);
    const newLimit = req.body.new_limit;
    const type = req.body.type ? req.body.type : 'publish';

    const body = {
      transaction_amount: req.body.transaction_amount,
      description: req.body.description,
      payment_method_id: req.body.payment_method_id,
      payer: {
        email: req.body.payer.email,
        identification: {
          type: req.body.payer.identification.type,
          number: req.body.payer.identification.number,
        },
      },
    };

    const requestOptions = { idempotencyKey: uuid() };

    const result = await payment.create({ body, requestOptions });

    res.status(200).json(result);

    const endTime = new Date(Date.now() + 45 * 60 * 1000);

    const job = scheduleJob({ start: new Date(), end: endTime, rule: '*/15 * * * * *' }, async () => {
      if (Date.now() >= endTime) { job.cancel(); }

      if (checkIfPaid(result.id) && type === 'publish') {
        adjustPublishLimit(body.payer.email, newLimit);
        job.cancel();
      } else if (checkIfPaid(result.id) && type === 'highlight') {
        adjustHighlightLimit(body.payer.email, newLimit);
        job.cancel();
      }
    });
  } catch (error) {
    next(error);
  }
};

export const paymentStatus = async (req, res, next) => {
  const { paymentId } = req.params;

  const payment = new Payment(paymentClient);
  console.log(paymentId);

  try {
    const paymentDetails = await payment.get({ id: paymentId });
    res.json(paymentDetails);
  } catch (error) {
    next(error);
  }
};
