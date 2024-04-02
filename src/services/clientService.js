import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import Client from '../models/Client.js';
import { EmailAlreadyExists, ClientNotFound, InvalidEmail, InvalidName, InsecurePasssword, InvalidPhone, NoClientsFound } from '../errors/clientErrors.js';

dotenv.config();
const salt = process.env.CRYPT_SALT;

async function findAll(page) {
  try {
    const limit = 5;
    const countUser = await Client.count();
    
    if (countUser == 0) {
      throw new NoClientsFound();
    }
    
    const lastPage = Math.ceil(countUser / limit);
    const offset = Number(limit * (page - 1));

    const clients =  await Client.findAll({
      attributes: ['email', 'name', 'phone'],
      order: [['name', 'ASC']],
      offset: offset,
      limit: limit,
    });

    if (clients.length == 0) {
      throw new NoClientsFound();
    }

    const pagination = {
      path: '/clients',
      page: page,
      prev_page_url: page -1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage: lastPage,
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
    email = validateEmail(email);

    const client =  await Client.findByPk(email);
    
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
    data.email = validateEmail(data.email);
    data.name = validateName(data.name);
    data.password = validatePassword(data.password);
    data.phone = validatePhone(data.phone);

    const client = data;
    
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

async function update(email, client) {
  try {
    email = validateEmail(email);
    client.email = validateEmail(client.email);
    client.name = validateName(client.name);
    client.password = validatePassword(client.password);
    client.phone = validatePhone(client.phone);

    if (!await Client.findByPk(email)) {
      throw new ClientNotFound();
    }

    return await Client.update(client, { where: { email } });
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function destroy(email) {
  try {
    email = validateEmail(email);

    if (!await Client.findByPk(email)) {
      throw new ClientNotFound();
    }

    return await Client.destroy({ where: { email } });
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if(!emailRegex.test(email)) throw new InvalidEmail();

  return email;
}

function validateName(name) {
  if (name.length == 0 || name == '' || name == undefined) {
    throw new InvalidName();
  }

  return name;
}

function validatePassword(password) {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[0-9a-zA-Z!@#$%^&*()_+]{8,}$/;

  if (!passwordRegex.test(password)) {
    throw new InsecurePasssword();
  }

  return bcrypt.hashSync(password, salt);
}

function validatePhone(phone) {
  if (phone.length == 0 || phone == '' || phone == undefined) {
    throw new InvalidPhone('O campo telefone é obrigatório');
  }

  const brazilianPhoneNumberRegex = /^(?:\+|00)?(?:55)?(?:\s|-|\.)?(?:(?:\(?\d{2}\)?)(?:\s|-|\.)?)?(?:9\d{4}|\d{4})[-. ]?\d{4}$/;

  if (!brazilianPhoneNumberRegex.test(phone)) {
    throw new InvalidPhone();
  }

  return phone;
}

export { findAll, findByPk, create, update, destroy };
