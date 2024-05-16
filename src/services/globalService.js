import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { v4 as uuid } from 'uuid';

import Client from '../db/models/Client.js';
import Owner from '../db/models/Owner.js';
import Photo from '../db/models/Photo.js';
import Property from '../db/models/Property.js';
import Realstate from '../db/models/Realstate.js';
import Realtor from '../db/models/Realtor.js';
import ShareToRealstate from '../db/models/ShareToRealstate.js';
import ShareToRealtor from '../db/models/ShareToRealtor.js';

import * as clientService from './clientService.js';
import * as ownerService from './ownerService.js';
import * as realstateService from './realstateService.js';
import * as realtorService from './realtorService.js';

import { validateEmail, validatePassword, validateString } from '../validators/inputValidators.js';

dotenv.config();

export async function findAll() {
  try {
    const clients = await clientService.findAll(0);
    const owners = await ownerService.findAll(0);
    const realtors = await realtorService.findAll(0);
    const realstate = await realstateService.findAll(0);

    return { ...clients, ...owners, ...realtors, ...realstate };
  } catch (error) {
    error.status = error.status || 500;
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    throw error;
  }
}

export async function find(email, pass = false, otp = false) {
  if (email) {
    try {
      const client = await clientService.findByPk(email, pass, otp);
      if (client) {
        return client;
      }
    } catch (error) { /* empty */ }

    try {
      const owner = await ownerService.findByPk(email, pass, otp);
      if (owner) {
        return owner;
      }
    } catch (error) { /* empty */ }

    try {
      const realtor = await realtorService.findByPk(email, pass, otp);
      if (realtor) {
        return realtor;
      }
    } catch (error) { /* empty */ }

    try {
      const realstate = await realstateService.findByPk(email, pass, otp);
      if (realstate) {
        return realstate;
      }
    } catch (error) { /* empty */ }
  }

  return null;
}

export async function changePassword(email, newPassword) {
  try {
    const validatedEmail = validateEmail(email);

    const user = await find(validatedEmail, true);
    if (!user) throw new Error('Email não encontrado');

    const validatedPassword = validatePassword(newPassword);

    if (user.password === validatedPassword) {
      const error = new Error('A senha não pode ser igual a anterior');
      error.status = 400;
      throw error;
    }

    let result;
    user.password = validatedPassword;
    if (user.type === 'client') result = await Client.update(user, { where: { email: validatedEmail } });
    else if (user.type === 'owner') result = await Owner.update(user, { where: { email: validatedEmail } });
    else if (user.type === 'realtor') result = await Realtor.update(user, { where: { email: validatedEmail } });
    else if (user.type === 'realstate') result = await Realstate.update(user, { where: { email: validatedEmail } });

    if (result === 0) throw new Error('Erro ao atualizar a senha');

    return find(validatedEmail);
  } catch (error) {
    error.status = error.status || 500;
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    throw error;
  }
}

export async function rescuePassword(email) {
  const receiverEmail = validateEmail(email);

  const user = await find(receiverEmail);
  if (!user) return { message: 'Email enviado.' };

  const otp = Math.floor(1000 + Math.random() * 9000);
  const otpTTL = new Date();
  otpTTL.setMinutes(otpTTL.getMinutes() + 6);

  user.otp = otp.toString();
  user.otp_ttl = otpTTL;

  if (user.type === 'client') {
    Client.update(user, { where: { email: receiverEmail } });
  } else if (user.type === 'owner') {
    Owner.update(user, { where: { email: receiverEmail } });
  } else if (user.type === 'realtor') {
    Realtor.update(user, { where: { email: receiverEmail } });
  } else if (user.type === 'realstate') {
    Realstate.update(user, { where: { email: receiverEmail } });
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: receiverEmail,
    subject: 'Redefinição de Senha',
    text: `Seu código para redefinição de senha é ${otp} e ele irá se espirar em 6 minutos`,
  };

  transporter.sendMail(mailOptions);
  return { message: 'Email Enviado.' };
}

export async function resetPassword(email, password, otp) {
  const validatedEmail = validateEmail(email);
  const user = (await find(validatedEmail, true));

  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    throw error;
  }

  if (!(user.otp === otp && user.otp_ttl > new Date())) {
    const error = new Error('Código inválido ou expirado');
    error.status = 400;
    throw error;
  }

  return changePassword(email, password);
}

export async function shareProperty(propertyId, ownerEmail, guestEmail) {
  const validatedPropertyId = validateString(propertyId);
  const validatedOwnerEmail = validateEmail(ownerEmail);
  const validatedGuestEmail = validateEmail(guestEmail);

  const owner = await ownerService.findByPk(validatedOwnerEmail);
  if (!owner) {
    const error = new Error('Proprietário não encontrado');
    error.status = 404;
    throw error;
  }

  const guest = await find(validatedGuestEmail);
  if (!guest) {
    const error = new Error('O usuário com quem você tentou compartilhar o imóvel não existe');
    error.status = 404;
    throw error;
  }

  const property = await Property.findByPk(validatedPropertyId);
  if (!property) {
    const error = new Error('Imóvel não encontrado');
    error.status = 404;
    throw error;
  }

  const sharedRealtor = await ShareToRealtor.findOne({
    where: {
      email: validatedGuestEmail,
      property_id: validatedPropertyId,
    },
  });
  const sharedRealstate = await ShareToRealstate.findOne({
    where: {
      email: validatedGuestEmail,
      property_id: validatedPropertyId,
    },
  });

  if (sharedRealtor || sharedRealstate) {
    const error = new Error('Imóvel já compartilhado com esse usuário');
    error.status = 400;
    throw error;
  }

  if (guest.type === 'realtor') {
    ShareToRealtor.create({
      id: uuid(),
      email: validatedGuestEmail,
      property_id: validatedPropertyId,
    });
  } else if (guest.type === 'realstate') {
    ShareToRealstate.create({
      id: uuid(),
      email: validatedGuestEmail,
      property_id: validatedPropertyId,
    });
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: validatedGuestEmail,
    subject: 'Compartilhamento de Imóvel',
    text: `O proprietário ${owner.name}, dono de uma casa na cidade de ${property.city}-${property.state} compartilhou um imóvel com você. Para mais informações acesse o site.`,
  };

  const response = { message: 'Email Enviado.' };
  transporter.sendMail(mailOptions);
  return response;
}

export async function getSharedProperties(email, page = 1, limit = 6) {
  const validatedEmail = validateEmail(email);

  let total = 0;
  let sharedProperties;

  const user = await find(validatedEmail);
  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    throw error;
  }

  if (user.type === 'realtor') {
    total = await ShareToRealtor.count({ where: { email: validatedEmail } });

    if (total === 0) {
      const error = new Error('Nenhum imóvel compartilhado com você');
      error.status = 404;
      throw error;
    }

    sharedProperties = await ShareToRealtor.findAll({
      where: { email: validatedEmail },
      order: [['createdAt', 'DESC']],
      limit,
      raw: true,
    });
  } else if (user.type === 'realstate') {
    total = await ShareToRealstate.count({ where: { email: validatedEmail } });

    if (total === 0) {
      const error = new Error('Nenhum imóvel compartilhado com você');
      error.status = 404;
      throw error;
    }

    sharedProperties = await ShareToRealstate.findAll({
      where: { email: validatedEmail },
      order: [['createdAt', 'DESC']],
      limit,
      raw: true,
    });
  }

  const lastPage = Math.ceil(total / limit);

  const pagination = {
    path: '/clients',
    page,
    prev_page_url: page - 1 >= 1 ? page - 1 : null,
    next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
    lastPage,
    total,
  };

  const properties = await Promise.all(sharedProperties.map(async (sharedProperty) => {
    const property = await Property.findOne({
      where: { id: sharedProperty.property_id }, raw: true,
    });
    property.owner = await ownerService.findByPk(property.owner_email);
    property.pictures = await Photo.findAll({ where: { property_id: property.id } });
    return property;
  }));

  return { properties, pagination };
}

export async function getSharedProperty(email, propertyId) {
  const validatedEmail = validateEmail(email);
  const validatedPropertyId = validateString(propertyId);

  let property;

  const user = await find(validatedEmail);
  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    throw error;
  }

  if (user.type === 'realtor') {
    property = await ShareToRealtor.findOne({
      where: { email: validatedEmail, property_id: validatedPropertyId },
    });
  } else if (user.type === 'realstate') {
    property = await ShareToRealstate.findOne({
      where: { email: validatedEmail, property_id: validatedPropertyId },
    });
  }

  if (!property) {
    const error = new Error('Imóvel não compartilhado com você');
    error.status = 404;
    throw error;
  }

  property.owner = await ownerService.findByPk(property.owner_email);
  property.pictures = await Photo.findAll({ where: { property_id: property.id } });

  return property;
}

export async function confirmSharedProperty(propertyId, email) {
  const validatedEmail = validateEmail(email);
  const validatedPropertyId = validateString(propertyId);
  let sharedProperty;
  let emailBody;

  const user = await find(validatedEmail);
  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    throw error;
  }

  if (user.type === 'realtor') {
    sharedProperty = await ShareToRealtor.findOne({
      where: { email: validatedEmail, property_id: validatedPropertyId },
    });
  } else if (user.type === 'realstate') {
    sharedProperty = await ShareToRealstate.findOne({
      where: { email: validatedEmail, property_id: validatedPropertyId },
    });
  }

  if (!sharedProperty) {
    const error = new Error('Imóvel não compartilhado com você');
    error.status = 404;
    throw error;
  }

  if (user.type === 'realtor') {
    ShareToRealtor.update(
      { accepted: true },
      { where: { email: validatedEmail, property_id: validatedPropertyId } },
    );
    emailBody = `O corretor ${user.name} aceitou o compartilhamento do imóvel com o id ${sharedProperty.property_id}!`;
  } else if (user.type === 'realstate') {
    ShareToRealstate.update(
      { accepted: true },
      { where: { email: validatedEmail, property_id: validatedPropertyId } },
    );
    emailBody = `A imobiliária ${user.name} aceitou o compartilhamento do imóvel com o id ${sharedProperty.property_id}!`;
  }

  const property = await Property.findByPk(validatedPropertyId);

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: property.owner_email,
    subject: 'Aceito o compartilhamento do imóvel!',
    text: emailBody,
  };

  transporter.sendMail(mailOptions);

  return { message: 'Compartilhamento aceito com sucesso!' };
}

export async function negateSharedProperty(propertyId, email, reason) {
  const validatedEmail = validateEmail(email);
  const validatedPropertyId = validateString(propertyId);
  const validatedReason = reason ? ` \nMotivo: ${validateString(reason)}.` : '';
  let sharedProperty;
  let emailBody;

  const user = await find(validatedEmail);
  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    throw error;
  }

  if (user.type === 'realtor') {
    sharedProperty = await ShareToRealtor.findOne({
      where: { email: validatedEmail, property_id: validatedPropertyId },
    });
  } else if (user.type === 'realstate') {
    sharedProperty = await ShareToRealstate.findOne({
      where: { email: validatedEmail, property_id: validatedPropertyId },
    });
  }

  if (!sharedProperty) {
    const error = new Error('Imóvel não compartilhado com você');
    error.status = 404;
    throw error;
  }

  if (user.type === 'realtor') {
    await ShareToRealtor.destroy({
      where: { email: validatedEmail, property_id: validatedPropertyId },
    });
    emailBody = `Infelizmente, o corretor ${user.name} negou o compartilhamento do imóvel com o id ${sharedProperty.property_id}.`;
  } else if (user.type === 'realstate') {
    await ShareToRealstate.destroy({
      where: { email: validatedEmail, property_id: validatedPropertyId },
    });
    emailBody = `Infelizmente, a imobiliária ${user.name} negou o compartilhamento do imóvel com o id ${sharedProperty.property_id}.`;
  }

  emailBody += validatedReason;

  const property = await Property.findByPk(validatedPropertyId);

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: property.owner_email,
    subject: 'Compartilhamento de imóvel negado.',
    text: emailBody,
  };

  transporter.sendMail(mailOptions, (error) => { console.error(error); });

  return { message: 'Compartilhamento negado com sucesso!' };
}
