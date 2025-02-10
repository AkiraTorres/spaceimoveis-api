import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { Payment } from 'mercadopago';
import { v4 as uuid } from 'uuid';

import { scheduleJob } from 'node-schedule';
import firebaseConfig from '../config/firebase.js';
import { checkIfPaid, paymentClient } from '../config/payment.js';
import prisma from '../config/prisma.js';
import ConfigurableError from '../errors/ConfigurableError.js';
import { validateCpf, validateEmail, validatePrice, validateString } from '../validators/inputValidators.js';
import PropertyService from './propertyService.js';
import UserService from './userService.js';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default class AdminService extends UserService {
  static async getLastPublishedProperties(page = 1, take = 10) {
    const date = new Date();
    date.setDate(date.getDate() - 3);

    const where = { updatedAt: { gte: date }, verified: 'pending' };

    const total = await prisma.property.count({ where });
    const lastPage = Math.ceil(total / take);
    const skip = Number(take * (page - 1));

    const props = await prisma.property.findMany({ where, take, skip });

    const pagination = {
      path: '/admin/properties/new',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total,
    };

    const properties = await Promise.all(props.map(async (property) => PropertyService.getPropertyDetails(property.id)));

    return { properties, pagination };
  }

  static async getLastRegisteredUsers(page = 1, take = 10) {
    const date = new Date();
    date.setDate(date.getDate() - 3);

    const total = await prisma.user.count({ where: { createdAt: { gte: date } } });
    if (total === 0) throw new ConfigurableError('Nenhum usuário foi encontrado', 404);

    const lastPage = Math.ceil(total / take);
    const offset = Number(take * (page - 1));

    const u = await prisma.user.findMany({ where: { createdAt: { gte: date } }, take, skip: offset });
    if (u.length === 0) throw new ConfigurableError('Nenhum usuário foi encontrado', 404);

    const pagination = {
      path: '/admin/users/new',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total,
    };

    const users = await Promise.all(u.map(async (user) => this.userDetails(user.email)));
    return { users, pagination };
  }

  static async denyProperty(id, reason = false) {
    const validatedId = validateString(id);
    const validatedReason = reason ? ` \n Motivo: ${validateString(reason)}.` : '';
    const property = await prisma.property.findFirst({ where: { id: validatedId } });

    if (!property) throw new ConfigurableError('Imóvel não encontrado', 404);

    const emailBody = reason
      ? `Seu imóvel foi recusado pela administração. ${validatedReason}\nPor favor, edite o seu imóvel para resolver este problema.`
      : 'Seu imóvel foi recusado pela administração.\nPor favor, edite o seu imóvel para resolver este problema.';

    const seller = await this.find({ email: property.advertiserEmail });

    await prisma.reasonRejectedProperty.create({ data: { propertyId: property.id, reason: reason || 'Sem motivo informado.' } });
    await prisma.property.update({ where: { id: property.id }, data: { verified: 'rejected' } });

    let message = 'Anúncio rejeitado.';

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: seller.email,
      subject: 'Anúncio de imóvel negado.',
      text: emailBody,
    };

    sgMail
      .send(mailOptions)
      .catch(() => { message += ' Mas o email não pode ser enviado.'; });

    return { message };
  }

  static async approveProperty(id) {
    const validatedId = validateString(id);

    const property = await prisma.property.findFirst({ where: { id: validatedId } });
    if (!property) throw new ConfigurableError('Imóvel não encontrado', 404);

    await prisma.property.update({ where: { id: property.id }, data: { verified: 'verified' } });

    const emailBody = 'Seu imóvel foi aprovado pela administração!';
    const seller = await this.find({ email: property.advertiserEmail });

    let message = 'Imóvel aprovado com sucesso!';

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: seller.email,
      subject: 'Anúncio de imóvel aprovado.',
      text: emailBody,
    };

    sgMail
      .send(mailOptions)
      .catch(() => { message += ' Mas o email não pode ser enviado.'; });

    return { message };
  }

  static async denyUser(id, reason = false) {
    const validatedId = validateString(id);
    const validatedReason = reason ? ` \n Motivo: ${validateString(reason)}.` : '';

    const emailBody = reason
      ? `Sua conta foi recusada pela administração.${validatedReason}`
      : 'Sua conta foi recusada pela administração.';

    const user = await this.find(validatedId);
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const picture = prisma.userPhoto.findMany({ where: { email: user.email } });
    if (picture) {
      await Promise.all(picture.map(async (photo) => {
        const storageRef = ref(storage, `images/${user.type}s/${user.email}/${photo.name}`);
        await deleteObject(storageRef);
      }));
    }

    await prisma.user.update({ where: { id: user.id }, data: { active: false } });

    let message = 'Usuário removido com sucesso.';

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: user.email,
      subject: 'Cadastro de usuário negado.',
      text: emailBody,
    };

    sgMail
      .send(mailOptions)
      .catch(() => { message += ' Mas o email não pode ser enviado.'; });

    return { message };
  }

  static async filterUsers(filter, page = 1, take = 12) {
    const where = {};
    const orderBy = { createdAt: 'desc' };

    if (filter) {
      if (filter.type) {
        if (filter.type === 'client') where.type = 'client';
        if (filter.type === 'owner') where.type = 'owner';
        if (filter.type === 'realtor') where.type = 'realtor';
        if (filter.type === 'realstate') where.type = 'realstate';
      }
      if (filter.name) where.name = { contains: `${validateString(filter.name)}`, mode: 'insensitive' };
      if (filter.email) where.email = { contains: `${validateString(filter.email)}`, mode: 'insensitive' };
      if (filter.handler) where.handler = { contains: `${validateString(filter.handler)}`, mode: 'insensitive' };
    }

    const total = await prisma.user.count({ where });
    if (total === 0) throw new ConfigurableError('Nenhum usuário foi encontrado', 404);

    const lastPage = Math.ceil(total / take);
    const skip = Number((take / 4) * (page - 1));

    const u = await prisma.user.findMany({ where, orderBy, take, skip });
    const users = await Promise.all(u.map(async (user) => this.userDetails(user.email)));

    const pagination = {
      path: '/admin/users/filter',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total,
    };

    return { users, pagination };
  }

  static async usersRegisteredMonthly() {
    const now = new Date();
    const beginYear = new Date(now.getFullYear() - 1, 11, 31);

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];

    const where = { createdAt: { gte: beginYear, lte: now } };
    const users = await prisma.user.findMany({ where });

    let dataset = [];
    for (let i = 0; i <= now.getMonth(); i++) {
      const total = users.filter((user) => user.createdAt.getMonth() === i);

      dataset = [...dataset, { month: monthNames[i], value: total.length }];
    }

    return dataset;
  }

  static async propertiesRegisteredMonthly() {
    const now = new Date();
    const beginYear = new Date(now.getFullYear() - 1, 11, 31);

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];

    const where = { createdAt: { gte: beginYear, lte: now } };
    const properties = await prisma.property.findMany({ where });

    let dataset = [];
    for (let i = 0; i <= now.getMonth(); i++) {
      const total = properties.filter((property) => property.createdAt.getMonth() === i);

      dataset = [...dataset, { month: monthNames[i], value: total.length }];
    }

    return dataset;
  }

  static async getAnnouncements(active = null) {
    const where = {};
    if (active !== null) where.active = active;

    return prisma.announcement.findMany({ where });
  }

  static async createAnnouncement(data, photo) {
    if (!data) throw new ConfigurableError('Dados não informados', 400);
    if (!['small', 'big'].includes(validateString(data.type))) throw new ConfigurableError('Tipo de anúncio inválido', 400);

    if (!photo) throw new ConfigurableError('Foto não informada', 400);

    // eslint-disable-next-line no-console
    console.log(data);

    const storageRef = ref(storage, `images/announcements/${validateEmail(data.announcerEmail)}-${photo.originalname}`);
    const metadata = { contentType: photo.mimetype };
    const snapshot = await uploadBytesResumable(storageRef, photo.buffer, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    const announcementData = {
      announcerName: validateString(data.announcerName),
      announcerEmail: validateEmail(data.announcerEmail),
      announcerCpf: validateCpf(data.announcerCpf),
      photoUrl: downloadUrl,
      siteUrl: validateString(data.siteUrl),
      paymentType: 'pix', // at the moment, only pix is available
      type: validateString(data.type),
    };

    const announcement = await prisma.announcement.create({ data: announcementData });

    const modifier = announcement.type === 'small' ? 1 : 2;
    const validPrices = [validatePrice('3.50') * modifier, validatePrice('7.50') * modifier, validatePrice('15.00') * modifier];

    const payment = new Payment(paymentClient);

    if (announcement.paymentType !== 'pix') throw new ConfigurableError('Método de pagamento inválido, no momento estamos aceitando apenas pix.', 400);
    if (announcement.active) throw new ConfigurableError(`Este anúncio já está ativo, realize um novo pagamento quando ocorrer o vencimento em ${announcement.validUntil}.`, 400);

    if (validPrices.includes(validatePrice(data.transactionAmount))) throw new ConfigurableError('O valor da transação deve ser maior que R$ 1,00.', 400);

    const days = data.transactionAmount * (modifier === 1 ? 2 : 1);
    const newValidDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const body = {
      transaction_amount: validatePrice(data.transactionAmount),
      description: validateString(data.description),
      payment_method_id: 'pix',
      payer: {
        email: validateEmail(data.announcerEmail),
        identification: {
          type: 'CPF',
          number: validateCpf(data.announcerCpf),
        },
      },
    };

    const requestOptions = { idempotencyKey: uuid() };

    const result = await payment.create({ body, requestOptions });

    scheduleJob({ start: new Date(), rule: '*/15 * * * * *' }, async () => {
      if (checkIfPaid(result.id)) {
        await prisma.announcement.update({ where: { id: announcement.id }, data: { active: true, validUntil: newValidDate } });
      }
    });

    // eslint-disable-next-line no-console
    // console.log(result);

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: data.announcerEmail,
      subject: 'Publicação de anúncio na Spaceimoveis',
      html: `
        <!DOCTYPE html>
          <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Pagamento - Space Imóveis</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }
                    .container {
                        max-width: 600px;
                        background: white;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        margin: 0 auto;
                    }
                    .btn {
                        display: inline-block;
                        padding: 10px 20px;
                        font-size: 16px;
                        color: white;
                        background-color: #007BFF;
                        text-decoration: none;
                        border-radius: 5px;
                        margin-top: 20px;
                    }
                    .btn:hover {
                        background-color: #0056b3;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Prezado(a) ${announcement.announcerName},</h2>
                    <p>Esperamos que esta mensagem o encontre bem.</p>
                    <p>Seu pagamento está pronto para ser processado. Para concluir a transação, clique no botão abaixo e acesse o link de pagamento da Space Imóveis:</p>
                    <a href="${result.point_of_interaction.transaction_data.ticket_url}" class="btn">Realizar Pagamento</a>
                    <p>Se tiver alguma dúvida, não hesite em nos contatar.</p>
                    <p>Atenciosamente,</p>
                    <p><strong>Space Imóveis</strong></p>
                </div>
            </body>
          </html>
      `,
    };

    let message = 'Anúncio criado com sucesso.';
    sgMail.send(mailOptions).catch(() => { message += ' Mas o email não pode ser enviado.'; });

    return { announcement, payment: result, message };
  }
}
