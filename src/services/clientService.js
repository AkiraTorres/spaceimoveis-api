import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import validator from 'validator';

import Client from '../models/Client.js';
import EmailAlreadyExists from '../errors/emailAlreadyExists.js';
import ClientNotFound from '../errors/clientErrors/clientNotFound.js';
import InvalidEmail from '../errors/invalidEmail.js';
import InvalidName from '../errors/invalidName.js';
import InsecurePassword from '../errors/insecurePassword.js';
import InvalidPhone from '../errors/invalidPhone.js';
import NoClientsFound from '../errors/clientErrors/noClientsFound.js';

dotenv.config();
const salt = process.env.CRYPT_SALT;

function validateEmail(email) {
  const sanitizedEmail = validator.escape(email);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitizedEmail)) throw new InvalidEmail();

  return sanitizedEmail;
}

function validateName(name) {
  const sanitizedName = validator.escape(name);

  if (sanitizedName.length === 0 || sanitizedName === '' || sanitizedName === undefined) {
    throw new InvalidName();
  }

  return sanitizedName;
}

function validatePassword(password) {
  const sanitizedPassword = validator.escape(password);

  if (sanitizedPassword.length === 0 || sanitizedPassword === '' || sanitizedPassword === undefined) {
    throw new InsecurePassword('O campo senha é obrigatório');
  }

  const sanitizedPasswordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[0-9a-zA-Z!@#$%^&*()_+]{8,}$/;

  if (!sanitizedPasswordRegex.test(sanitizedPassword)) {
    throw new InsecurePassword();
  }

  return bcrypt.hashSync(sanitizedPassword, salt);
}

function validatePhone(phone) {
  const sanitizedPhone = validator.escape(phone);

  if (sanitizedPhone.length === 0 || sanitizedPhone === '' || sanitizedPhone === undefined) {
    throw new InvalidPhone('O campo telefone é obrigatório');
  }

  const brazilianPhoneNumberRegex = /^(?:\+|00)?(?:55)?(?:\s|-|\.)?(?:(?:\(?\d{2}\)?)(?:\s|-|\.)?)?(?:9\d{4}|\d{4})[-. ]?\d{4}$/;

  if (!brazilianPhoneNumberRegex.test(sanitizedPhone)) {
    throw new InvalidPhone();
  }

  return sanitizedPhone;
}

async function findAll(page) {
  try {
    const limit = 5;
    const countUser = await Client.count();

    if (countUser === 0) {
      throw new NoClientsFound();
    }

    const lastPage = Math.ceil(countUser / limit);
    const offset = Number(limit * (page - 1));

    const clients = await Client.findAll({
      attributes: ['email', 'name', 'phone'],
      order: [['name', 'ASC']],
      offset,
      limit,
    });

    if (clients.length === 0) {
      throw new NoClientsFound();
    }

    const pagination = {
      path: '/clients',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total: countUser,
    };

    return { clients, pagination };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function findByPk(email) {
  try {
    const validatedEmail = validateEmail(email);

    const client = await Client.findByPk(validatedEmail, {
      attributes: ['email', 'name', 'phone'],
    });

    if (!client) {
      throw new ClientNotFound();
    }

    return client;
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function create(data) {
  try {
    const userData = {};

    userData.email = validateEmail(data.email);
    userData.name = validateName(data.name);
    userData.password = validatePassword(data.password);
    userData.phone = validatePhone(data.phone);

    const client = userData;

    if (await Client.findByPk(client.email)) {
      throw new EmailAlreadyExists();
    }

    return await Client.create(client);
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function update(email, data) {
  try {
    const validatedEmail = validateEmail(email);

    if (!await Client.findByPk(validatedEmail)) {
      throw new ClientNotFound();
    }

    const client = {};
    client.email = validateEmail(data.email);
    client.name = validateName(data.name);
    client.password = validatePassword(data.password);
    client.phone = validatePhone(data.phone);

    return await Client.update(client, { where: { validatedEmail } });
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function destroy(email) {
  try {
    const validatedEmail = validateEmail(email);

    if (!await Client.findByPk(validatedEmail)) {
      throw new ClientNotFound();
    }

    return await Client.destroy({ where: { validatedEmail } });
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

export { findAll, findByPk, create, update, destroy };
