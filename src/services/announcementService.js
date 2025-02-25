import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { Payment } from 'mercadopago';
import { v4 as uuid } from 'uuid';

import firebaseConfig from '../config/firebase.js';
import { paymentClient } from '../config/payment.js';
import prisma from '../config/prisma.js';
import ConfigurableError from '../errors/ConfigurableError.js';
import { validateCpf, validateEmail, validatePrice, validateString } from '../validators/inputValidators.js';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default class AnnouncementService {
  static async getAnnouncement(id) {
    const validatedId = validateString(id);

    const announcement = await prisma.announcement.findFirst({ where: { id: validatedId } });
    if (!announcement) throw new ConfigurableError('Anúncio não encontrado', 404);

    return announcement;
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

    const id = uuid();

    const storageRef = ref(storage, `images/announcements/${id}-${photo.originalname}`);
    const metadata = { contentType: photo.mimetype };
    const snapshot = await uploadBytesResumable(storageRef, photo.buffer, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    const announcementData = {
      id,
      announcerName: validateString(data.announcerName),
      announcerEmail: validateEmail(data.announcerEmail),
      announcerCpf: validateCpf(data.announcerCpf),
      photoUrl: downloadUrl,
      siteUrl: data.siteUrl,
      paymentStatus: 'approved',
      active: true,
      validUntil: new Date(Date.now() + 356 * 24 * 60 * 60 * 1000),
      type: validateString(data.type),
    };

    let mailOptions = {};
    let response = 'Anúncio criado por um administrador, sem necessidade de pagamento.';
    if (data.pending) {
      if (!data.transactionAmount) throw new ConfigurableError('Valor da transação não informado', 400);

      const modifier = data.type === 'small' ? 1 : 2;
      const validPrices = [validatePrice('3.50') * modifier, validatePrice('7.50') * modifier, validatePrice('15.00') * modifier];
      if (validPrices.includes(validatePrice(data.transactionAmount))) throw new ConfigurableError('O valor da transação deve estar entre os valores válidos.', 400);

      const payment = new Payment(paymentClient);

      const body = {
        transaction_amount: validatePrice(data.transactionAmount),
        description: validateString(data.description),
        payment_method_id: 'pix',
        notification_url: `${process.env.BASE_URL}/announcement/payment/webhook?source_news=webhooks`,
        payer: {
          email: validateEmail(data.announcerEmail),
          identification: {
            type: 'CPF',
            number: validateCpf(data.announcerCpf),
          },
        },
      };

      const requestOptions = { idempotencyKey: uuid() };
      response = await payment.create({ body, requestOptions });
      const paymentId = (response.id).toString();
      announcementData.paymentId = paymentId;
      announcementData.paymentStatus = 'pending';
      announcementData.paymentType = 'pix'; // at the moment, only pix is available
      announcementData.transactionAmount = validatePrice(data.transactionAmount);
      announcementData.active = false;
      announcementData.validUntil = new Date(Date.now());

      mailOptions = {
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
                      <h2>Prezado(a) ${announcementData.announcerName},</h2>
                      <p>Esperamos que esta mensagem o encontre bem.</p>
                      <p>Seu pagamento está pronto para ser processado. Para concluir a transação, clique no botão abaixo e acesse o link de pagamento da Space Imóveis:</p>
                      <a href="${response.point_of_interaction.transaction_data.ticket_url}" class="btn">Realizar Pagamento</a>
                      <p>Se tiver alguma dúvida, não hesite em nos contatar.</p>
                      <p>Atenciosamente,</p>
                      <p><strong>Space Imóveis</strong></p>
                  </div>
              </body>
            </html>
        `,
      };
    }

    const announcement = await prisma.announcement.create({ data: announcementData });

    let message = 'Anúncio criado com sucesso.';
    if (data.pending) sgMail.send(mailOptions).catch(() => { message += ' Mas o email não pode ser enviado.'; });

    return { announcement, payment: response, message };
  }

  static async addViewAnnouncement(id) {
    const validatedId = validateString(id);

    const announcement = await prisma.announcement.findFirst({ where: { id: validatedId } });
    if (!announcement) throw new ConfigurableError('Anúncio não encontrado', 404);

    const views = announcement.totalViews + 1;
    await prisma.announcement.update({ where: { id: announcement.id }, data: { totalViews: views } });

    return { views };
  }

  static async handlePayment(action, data) {
    if (action === 'payment.updated') {
      const { id } = data;

      const payment = new Payment(paymentClient);
      const paymentDetails = await payment.get({ id });

      if (!paymentDetails) throw new ConfigurableError('Pagamento não encontrado', 404);

      if (paymentDetails.status === 'approved') {
        // eslint-disable-next-line no-console
        console.log(`Pagamento aprovado: ${id}`);

        const announcement = await prisma.announcement.findFirst({ where: { paymentId: id.toString() } });

        const modifier = announcement.type === 'small' ? 1 : 2;
        const days = announcement.transactionAmount * (modifier === 1 ? 2 : 1);
        const newValidDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

        await prisma.announcement.update({
          where: { id: announcement.id },
          data: { active: true, validUntil: newValidDate },
        });
      }
    }

    return { message: 'Evento de pagamento recebido.' };
  }

  static async deleteAnnouncement(id) {
    const validatedId = validateString(id);

    const announcement = await prisma.announcement.findFirst({ where: { id: validatedId } });
    if (!announcement) throw new ConfigurableError('Anúncio não encontrado', 404);

    await prisma.announcement.delete({ where: { id: validatedId } });

    return { message: 'Anúncio excluído com sucesso.' };
  }
}
