import Client from '../db/models/Client.js';

import ClientNotFound from '../errors/clientErrors/clientNotFound.js';
import NoClientsFound from '../errors/clientErrors/noClientsFound.js';
import { validateEmail, validateIfUniqueEmail, validatePassword, validatePhone, validateString } from '../validators/inputValidators.js';

async function findAll(page) {
  try {
    if (page < 1) {
      return await Client.findAll({
        attributes: { exclude: ['otp', 'otp_ttl', 'password'] },
        order: [['name', 'ASC']],
      });
    }

    const limit = 6;
    const countTotal = await Client.count();

    if (countTotal === 0) {
      throw new NoClientsFound();
    }

    const lastPage = Math.ceil(countTotal / limit);
    const offset = Number(limit * (page - 1));

    const clients = await Client.findAll({
      attributes: { exclude: ['otp', 'otp_ttl', 'password'] },
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
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
    throw error;
  }
}

async function findByPk(email, password = false, otp = false) {
  const validatedEmail = validateEmail(email);
  const attributes = { exclude: [] };
  if (!otp) attributes.exclude.push('otp', 'otp_ttl');
  if (!password) attributes.exclude.push('password');

  const client = await Client.findByPk(validatedEmail, {
    attributes,
  });

  if (!client) {
    throw new ClientNotFound();
  }

  return client;
}

async function create(data) {
  try {
    const userData = {};

    userData.email = validateEmail(data.email);
    userData.name = validateString(data.name, 'O campo nome é obrigatório');

    if (data.password) userData.password = validatePassword(data.password);
    else userData.password = null;

    if (data.phone) userData.phone = validatePhone(data.phone);
    else userData.phone = null;

    const client = userData;

    await validateIfUniqueEmail(client.email);

    return await Client.create(client);
  } catch (error) {
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
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
    if (client.email !== validatedEmail) await validateIfUniqueEmail(client.email);
    client.name = validateString(client.name, 'O campo nome é obrigatório');
    if (client.phone) client.phone = validatePhone(client.phone);

    return await Client.update(client, { where: { email: validatedEmail } });
  } catch (error) {
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
    throw error;
  }
}

async function destroy(email) {
  try {
    const validatedEmail = validateEmail(email);

    if (!await Client.findByPk(validatedEmail)) {
      throw new ClientNotFound();
    }
    await Client.destroy({ where: { email: validatedEmail } });
    return { message: 'Usuário apagado com sucesso' };
  } catch (error) {
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
    throw error;
  }
}

export { create, destroy, findAll, findByPk, update };
