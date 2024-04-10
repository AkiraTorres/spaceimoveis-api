import Client from '../db/models/Client.js';
import Realstate from '../db/models/Realstate.js';

import RealstateNotFound from '../errors/realstateErrors/realstateNotFound.js';
import NoRealstatesFound from '../errors/realstateErrors/noRealstatesFound.js';
import ClientNotFound from '../errors/clientErrors/clientNotFound.js';
import {
  validateEmail, validateString, validatePassword, validatePhone, validateCnpj, validateUF,
  validateCep, validateCreci, validateIfUniqueEmail, validateIfUniqueCnpj, validateIfUniqueCreci,
} from '../validators/inputValidators.js';

async function findAll(page) {
  try {
    const attributes = ['email', 'company_name', 'phone', 'cnpj', 'creci', 'cep', 'address', 'district', 'house_number', 'city', 'state', 'type', 'social_one', 'social_two'];
    if (page < 1) {
      return await Realstate.findAll({
        attributes,
        order: [['company_name', 'ASC']],
      });
    }

    const limit = 5;
    const countTotal = await Realstate.count();

    if (countTotal === 0) {
      throw new NoRealstatesFound();
    }

    const lastPage = Math.ceil(countTotal / limit);
    const offset = Number(limit * (page - 1));

    const realstates = await Realstate.findAll({
      attributes,
      order: [['company_name', 'ASC']],
      offset,
      limit,
    });

    if (realstates.length === 0) {
      throw new NoRealstatesFound();
    }

    const pagination = {
      path: '/realstates',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total: countTotal,
    };

    return { realstates, pagination };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function findByPk(email, password = false) {
  try {
    const validatedEmail = validateEmail(email);
    const attributes = ['email', 'company_name', 'phone', 'cnpj', 'creci', 'cep', 'address', 'district', 'house_number', 'city', 'state', 'type', 'social_one', 'social_two'];
    if (password) attributes.push('password');

    const realstate = await Realstate.findByPk(validatedEmail, {
      attributes,
    });

    if (!realstate) {
      throw new RealstateNotFound();
    }

    return realstate;
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function findByCnpj(cnpj, password = false) {
  try {
    const validatedCnpj = validateCnpj(cnpj);
    const attributes = ['email', 'company_name', 'phone', 'cnpj', 'creci', 'cep', 'address', 'district', 'house_number', 'city', 'state', 'type', 'social_one', 'social_two'];
    if (password) attributes.push('password');

    const realstate = await Realstate.findOne({ where: { cnpj: validatedCnpj } }, {
      attributes,
    });

    if (!realstate) {
      throw new RealstateNotFound();
    }

    return realstate;
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function findByCreci(creci, password = false) {
  try {
    const validatedCreci = validateCreci(creci);
    const attributes = ['email', 'company_name', 'phone', 'cnpj', 'creci', 'cep', 'address', 'district', 'house_number', 'city', 'state', 'type', 'social_one', 'social_two'];
    if (password) attributes.push('password');

    const realstate = await Realstate.findOne({ where: { creci: validatedCreci } }, {
      attributes,
    });

    if (!realstate) {
      throw new RealstateNotFound();
    }

    return realstate;
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
    userData.company_name = validateString(data.company_name, 'O campo razão social é obrigatório');
    userData.password = validatePassword(data.password);
    userData.phone = validatePhone(data.phone);
    userData.cnpj = validateCnpj(data.cnpj);
    userData.creci = validateCreci(data.creci);
    userData.cep = validateCep(data.cep);
    userData.address = validateString(data.address, 'O campo endereço é obrigatório');
    userData.district = validateString(data.district, 'O campo bairro é obrigatório');
    userData.house_number = validateString(data.house_number, 'O campo número é obrigatório');
    userData.city = validateString(data.city, 'O campo cidade é obrigatório');
    userData.state = validateUF(data.state);
    if (data.socialOne) userData.social_one = data.socialOne;
    if (data.socialTwo) userData.social_two = data.socialTwo;

    await validateIfUniqueEmail(userData.email);
    await validateIfUniqueCnpj(userData.cnpj);
    await validateIfUniqueCreci(userData.creci);

    const realstate = userData;

    return await Realstate.create(realstate);
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function update(email, data) {
  try {
    const validatedEmail = validateEmail(email);

    const oldRealstate = await Realstate.findByPk(validatedEmail);
    if (!oldRealstate) {
      throw new RealstateNotFound();
    }

    const realstate = {
      email: data.email || oldRealstate.email,
      company_name: data.company_name || oldRealstate.company_name,
      phone: data.phone || oldRealstate.phone,
      cnpj: data.cnpj || oldRealstate.cnpj,
      creci: data.creci || oldRealstate.creci,
      cep: data.cep || oldRealstate.cep,
      address: data.address || oldRealstate.address,
      district: data.district || oldRealstate.district,
      house_number: data.house_number || oldRealstate.house_number,
      city: data.city || oldRealstate.city,
      state: data.state || oldRealstate.state,
    };

    if (oldRealstate.social_one || data.socialOne) {
      realstate.social_one = validateString(data.socialOne || oldRealstate.social_one);
    }
    if (oldRealstate.social_two || data.socialTwo) {
      realstate.social_two = validateString(data.socialTwo || oldRealstate.social_two);
    }

    realstate.email = validateEmail(realstate.email);
    realstate.company_name = validateString(realstate.company_name, 'O campo razão social é obrigatório');
    realstate.phone = validatePhone(realstate.phone);
    realstate.cnpj = validateCnpj(realstate.cnpj);
    realstate.creci = validateCreci(realstate.creci);
    realstate.cep = validateCep(realstate.cep);
    realstate.address = validateString(realstate.address, 'O campo endereço é obrigatório');
    realstate.district = validateString(realstate.district, 'O campo bairro é obrigatório');
    realstate.house_number = validateString(realstate.house_number, 'O campo número é obrigatório');
    realstate.city = validateString(realstate.city, 'O campo cidade é obrigatório');
    realstate.state = validateUF(realstate.state);

    if (realstate.email !== oldRealstate.email) await validateIfUniqueEmail(realstate.email);
    if (realstate.cnpj !== oldRealstate.cnpj) await validateIfUniqueCnpj(realstate.cnpj);
    if (realstate.creci !== oldRealstate.creci) await validateIfUniqueCreci(realstate.creci);

    return await Realstate.update(realstate, { where: { email: validatedEmail } });
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function elevate(email, data) {
  try {
    const validatedEmail = validateEmail(email);

    const client = await Client.findByPk(validatedEmail);
    if (!client) {
      throw new ClientNotFound();
    }

    const realstate = {
      email: validateEmail(client.email),
      company_name: validateString(client.name, 'O campo nome é obrigatório'),
      phone: validatePhone(client.phone || data.phone),
      cnpj: validateCnpj(data.cnpj),
      creci: validateCreci(data.creci),
      cep: validateCep(data.cep),
      address: validateString(data.address, 'O campo endereço é obrigatório'),
      district: validateString(data.district, 'O campo bairro é obrigatório'),
      house_number: validateString(data.house_number, 'O campo número é obrigatório'),
      city: validateString(data.city, 'O campo cidade é obrigatório'),
      state: validateUF(data.state),
    };

    await validateIfUniqueCnpj(realstate.cnpj);
    await validateIfUniqueCreci(realstate.creci);

    await Client.destroy({ where: { email: validatedEmail } });
    return await Realstate.create(realstate);
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function destroy(email) {
  try {
    const validatedEmail = validateEmail(email);

    if (!await Realstate.findByPk(validatedEmail)) {
      throw new RealstateNotFound();
    }

    await Realstate.destroy({ where: { email: validatedEmail } });
    return { message: 'Usuário apagado com sucesso' };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

export { findAll, findByPk, findByCnpj, findByCreci, create, update, elevate, destroy };
