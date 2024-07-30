import Client from '../db/models/Client.js';

import ClientNotFound from '../errors/clientErrors/clientNotFound.js';
import NoClientsFound from '../errors/clientErrors/noClientsFound.js';
import { validateEmail, validateIfUniqueEmail, validatePassword, validatePhone, validateString } from '../validators/inputValidators.js';

async function findAll(page) {
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
    const client = {
      email: validateEmail(data.email),
      name: validateString(data.name, 'O campo nome é obrigatório'),
      password: data.password ? validatePassword(data.password) : null,
      phone: data.phone ? validatePhone(data.phone) : null,
      idPhone: data.idPhone ? validateString(data.idPhone) : null,
    };

    await validateIfUniqueEmail(client.email);

    return Client.create(client);
}

async function update(email, data) {
    const validatedEmail = validateEmail(email);

    const oldClient = await Client.findByPk(validatedEmail);
    if (!oldClient) {
      throw new ClientNotFound();
    }

    const client = {
      email: data.email ? validateEmail(data.email) : oldClient.email,
      name: data.name ? validateString(data.name, 'O campo nome é obrigatório') : oldClient.name,
      phone: data.phone ? validatePhone(data.phone) : oldClient.phone,
      idPhone: data.idPhone ? validateString(data.idPhone) : oldClient.idPhone,
    };

    if (client.email !== validatedEmail) await validateIfUniqueEmail(client.email);

    return Client.update(client, { where: { email: validatedEmail } });
}

async function destroy(email) {
    const validatedEmail = validateEmail(email);

    if (!await Client.findByPk(validatedEmail)) {
      throw new ClientNotFound();
    }

    await Client.destroy({ where: { email: validatedEmail } });
    return { message: 'Usuário apagado com sucesso' };
}

export { create, destroy, findAll, findByPk, update };
