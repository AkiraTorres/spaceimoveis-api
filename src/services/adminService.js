import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { deleteObject, getStorage, ref } from 'firebase/storage';

import firebaseConfig from '../config/firebase.js';
import prisma from '../config/prisma.js';
import ConfigurableError from '../errors/ConfigurableError.js';
import { validateString } from '../validators/inputValidators.js';
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
}
