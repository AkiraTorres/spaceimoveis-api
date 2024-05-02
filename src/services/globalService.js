import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

import Client from '../db/models/Client.js';
import Owner from '../db/models/Owner.js';
import Realtor from '../db/models/Realtor.js';
import Realstate from '../db/models/Realstate.js';

import * as clientService from './clientService.js';
import * as ownerService from './ownerService.js';
import * as realtorService from './realtorService.js';
import * as realstateService from './realstateService.js';

import { validateEmail, validatePassword } from '../validators/inputValidators.js';

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

export async function find(email, pass = false) {
  if (email) {
    try {
      const client = await clientService.findByPk(email, pass);
      if (client) {
        return client;
      }
    } catch (error) { /* empty */ }

    try {
      const owner = await ownerService.findByPk(email, pass);
      if (owner) {
        return owner;
      }
    } catch (error) { /* empty */ }

    try {
      const realtor = await realtorService.findByPk(email, pass);
      if (realtor) {
        return realtor;
      }
    } catch (error) { /* empty */ }

    try {
      const realstate = await realstateService.findByPk(email, pass);
      if (realstate) {
        return realstate;
      }
    } catch (error) { /* empty */ }
  }

  const error = new Error('Email não encontrado');
  error.status = 404;
  throw error;
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
  const validatedEmail = validateEmail(email);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: validatedEmail,
    subject: 'Redefina sua senha!',
    text: 'Funcionalidade ainda em fase de implementação',
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.log(err);
    else console.log(info);
  });
}
