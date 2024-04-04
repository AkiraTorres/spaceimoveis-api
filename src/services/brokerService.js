import Client from '../db/models/Client.js';
import Owner from '../db/models/Owner.js';
import Broker from '../db/models/Broker.js';

import EmailAlreadyExists from '../errors/emailAlreadyExists.js';
import BrokerNotFound from '../errors/brokerErrors/brokerNotFound.js';
import NoBrokersFound from '../errors/brokerErrors/noBrokersFound.js';
import { validateEmail, validateString, validatePassword, validatePhone, validateCpf, validateUF, validateCep, validateCreci } from '../validators/inputValidators.js';

async function findAll(page) {
  try {
    const attributes = ['email', 'name', 'phone', 'cpf', 'rg', 'creci', 'cep', 'address', 'house_number', 'city', 'state', 'type'];
    if (page < 1) {
      return await Broker.findAll({
        attributes,
        order: [['name', 'ASC']],
      });
    }

    const limit = 5;
    const countTotal = await Broker.count();

    if (countTotal === 0) {
      throw new NoBrokersFound();
    }

    const lastPage = Math.ceil(countTotal / limit);
    const offset = Number(limit * (page - 1));

    const brokers = await Broker.findAll({
      attributes,
      order: [['name', 'ASC']],
      offset,
      limit,
    });

    if (brokers.length === 0) {
      throw new NoBrokersFound();
    }

    const pagination = {
      path: '/brokers',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total: countTotal,
    };

    return { brokers, pagination };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function findByPk(email, password) {
  try {
    const validatedEmail = validateEmail(email);
    const attributes = ['email', 'name', 'phone', 'cpf', 'rg', 'creci', 'cep', 'address', 'house_number', 'city', 'state', 'type'];
    if (password) attributes.push('password');

    const broker = await Broker.findByPk(validatedEmail, {
      attributes,
    });

    if (!broker) {
      throw new BrokerNotFound();
    }

    return broker;
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
    userData.cpf = validateCpf(data.cpf);
    userData.rg = validateString(data.rg, 'O campo RG é obrigatório');
    userData.creci = validateCreci(data.creci);
    userData.cep = validateCep(data.cep);
    userData.address = validateString(data.address, 'O campo endereço é obrigatório');
    userData.house_number = validateString(data.house_number, 'O campo número é obrigatório');
    userData.city = validateString(data.city, 'O campo cidade é obrigatório');
    userData.state = validateUF(data.state);

    const broker = userData;

    if (
      await Client.findByPk(broker.email)
      || await Owner.findByPk(broker.email)
      || await Broker.findByPk(broker.email)) {
      throw new EmailAlreadyExists();
    }

    return await Broker.create(broker);
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function update(email, data) {
  try {
    const validatedEmail = validateEmail(email);

    const oldBroker = await Broker.findByPk(validatedEmail);
    if (!oldBroker) {
      throw new BrokerNotFound();
    }

    const broker = {
      email: data.email || oldBroker.email,
      name: data.name || oldBroker.name,
      phone: data.phone || oldBroker.phone,
      cpf: data.cpf || oldBroker.cpf,
      rg: data.rg || oldBroker.rg,
      creci: data.creci || oldBroker.creci,
      cep: data.cep || oldBroker.cep,
      address: data.address || oldBroker.address,
      house_number: data.house_number || oldBroker.house_number,
      city: data.city || oldBroker.city,
      state: data.state || oldBroker.state,
    };

    broker.email = validateEmail(data.email);
    broker.name = validateString(data.name, 'O campo nome é obrigatório');
    broker.password = validatePassword(data.password);
    broker.phone = validatePhone(data.phone);
    broker.cpf = validateCpf(data.cpf);
    broker.rg = validateString(data.rg, 'O campo RG é obrigatório');
    broker.creci = validateCreci(data.creci);
    broker.cep = validateCep(data.cep);
    broker.address = validateString(data.address, 'O campo endereço é obrigatório');
    broker.house_number = validateString(data.house_number, 'O campo número é obrigatório');
    broker.city = validateString(data.city, 'O campo cidade é obrigatório');
    broker.state = validateUF(data.state);

    return await Broker.update(broker, { where: { email: validatedEmail } });
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function destroy(email) {
  try {
    const validatedEmail = validateEmail(email);

    if (!await Broker.findByPk(validatedEmail)) {
      throw new BrokerNotFound();
    }

    return await Broker.destroy({ where: { email: validatedEmail } });
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

export { findAll, findByPk, create, update, destroy };
