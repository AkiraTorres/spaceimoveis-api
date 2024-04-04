import Client from '../db/models/Client.js';
import Owner from '../db/models/Owner.js';
import Broker from '../db/models/Broker.js';

import EmailAlreadyExists from '../errors/emailAlreadyExists.js';
import ClientNotFound from '../errors/clientErrors/clientNotFound.js';
import NoClientsFound from '../errors/clientErrors/noClientsFound.js';
import { validateEmail, validateString, validatePassword, validatePhone } from '../validators/inputValidators.js';

async function findAll(page) {
  try {
    if (page < 1) {
      return await Client.findAll({
        attributes: ['email', 'name', 'phone', 'type'],
        order: [['name', 'ASC']],
      });
    }

    const limit = 5;
    const countTotal = await Client.count();

    if (countTotal === 0) {
      throw new NoClientsFound();
    }

    const lastPage = Math.ceil(countTotal / limit);
    const offset = Number(limit * (page - 1));

    const clients = await Client.findAll({
      attributes: ['email', 'name', 'phone', 'type'],
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
      total: countTotal,
    };

    return { clients, pagination };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function findByPk(email, password) {
  try {
    const validatedEmail = validateEmail(email);
    const attributes = ['email', 'name', 'phone', 'type'];
    if (password) attributes.push('password');

    const client = await Client.findByPk(validatedEmail, {
      attributes,
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
    userData.name = validateString(data.name, 'O campo nome é obrigatório');
    userData.password = validatePassword(data.password);
    userData.phone = validatePhone(data.phone);

    const client = userData;

    if (
      await Client.findByPk(client.email)
      || await Owner.findByPk(client.email)
      || await Broker.findByPk(client.email)) {
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

    const oldClient = await Client.findByPk(validatedEmail);
    if (!oldClient) {
      throw new ClientNotFound();
    }

    const client = {
      email: data.email || oldClient.email,
      name: data.name || oldClient.name,
      phone: data.phone || oldClient.phone,
    };

    client.email = validateEmail(client.email);
    client.name = validateString(client.name, 'O campo nome é obrigatório');
    client.phone = validatePhone(client.phone);

    return await Client.update(client, { where: { email: validatedEmail } });
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
