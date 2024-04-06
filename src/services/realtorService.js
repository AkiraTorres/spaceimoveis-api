import Realtor from '../db/models/Realtor.js';

import RealtorNotFound from '../errors/realtorErrors/realtorNotFound.js';
import NoRealtorsFound from '../errors/realtorErrors/noRealtorsFound.js';
import {
  validateEmail, validateString, validatePassword, validatePhone, validateCpf, validateUF,
  validateCep, validateCreci, validateIfUniqueEmail, validateIfUniqueCpf, validateIfUniqueRg,
} from '../validators/inputValidators.js';

async function findAll(page) {
  try {
    const attributes = ['email', 'name', 'phone', 'cpf', 'rg', 'creci', 'cep', 'address', 'district', 'house_number', 'city', 'state', 'type'];
    if (page < 1) {
      return await Realtor.findAll({
        attributes,
        order: [['name', 'ASC']],
      });
    }

    const limit = 5;
    const countTotal = await Realtor.count();

    if (countTotal === 0) {
      throw new NoRealtorsFound();
    }

    const lastPage = Math.ceil(countTotal / limit);
    const offset = Number(limit * (page - 1));

    const realtors = await Realtor.findAll({
      attributes,
      order: [['name', 'ASC']],
      offset,
      limit,
    });

    if (realtors.length === 0) {
      throw new NoRealtorsFound();
    }

    const pagination = {
      path: '/realtors',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total: countTotal,
    };

    return { realtors, pagination };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function findByPk(email, password = false) {
  try {
    const validatedEmail = validateEmail(email);
    const attributes = ['email', 'name', 'phone', 'cpf', 'rg', 'creci', 'cep', 'address', 'district', 'house_number', 'city', 'state', 'type'];
    if (password) attributes.push('password');

    const realtor = await Realtor.findByPk(validatedEmail, {
      attributes,
    });

    if (!realtor) {
      throw new RealtorNotFound();
    }

    return realtor;
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function findByCpf(cpf, password = false) {
  try {
    const validatedCpf = validateCpf(cpf);
    const attributes = ['email', 'name', 'phone', 'cpf', 'rg', 'creci', 'cep', 'address', 'district', 'house_number', 'city', 'state', 'type'];
    if (password) attributes.push('password');

    const realtor = await Realtor.findOne({ where: { cpf: validatedCpf } }, {
      attributes,
    });

    if (!realtor) {
      throw new RealtorNotFound();
    }

    return realtor;
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function findByRg(rg, password = false) {
  try {
    const validatedRg = validateString(rg);
    const attributes = ['email', 'name', 'phone', 'cpf', 'rg', 'creci', 'cep', 'address', 'district', 'house_number', 'city', 'state', 'type'];
    if (password) attributes.push('password');

    const realtor = await Realtor.findOne({ where: { rg: validatedRg } }, {
      attributes,
    });

    if (!realtor) {
      throw new RealtorNotFound();
    }

    return realtor;
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
    userData.district = validateString(data.district, 'O campo bairro é obrigatório');
    userData.house_number = validateString(data.house_number, 'O campo número é obrigatório');
    userData.city = validateString(data.city, 'O campo cidade é obrigatório');
    userData.state = validateUF(data.state);

    await validateIfUniqueEmail(userData.email);
    await validateIfUniqueCpf(userData.cpf);
    await validateIfUniqueRg(userData.rg);

    const realtor = userData;

    return await Realtor.create(realtor);
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function update(email, data) {
  try {
    const validatedEmail = validateEmail(email);

    const oldRealtor = await Realtor.findByPk(validatedEmail);
    if (!oldRealtor) {
      throw new RealtorNotFound();
    }

    const realtor = {
      email: data.email || oldRealtor.email,
      name: data.name || oldRealtor.name,
      phone: data.phone || oldRealtor.phone,
      cpf: data.cpf || oldRealtor.cpf,
      rg: data.rg || oldRealtor.rg,
      creci: data.creci || oldRealtor.creci,
      cep: data.cep || oldRealtor.cep,
      address: data.address || oldRealtor.address,
      house_number: data.house_number || oldRealtor.house_number,
      city: data.city || oldRealtor.city,
      state: data.state || oldRealtor.state,
    };

    realtor.email = validateEmail(realtor.email);
    realtor.name = validateString(realtor.name, 'O campo nome é obrigatório');
    realtor.password = validatePassword(realtor.password);
    realtor.phone = validatePhone(realtor.phone);
    realtor.cpf = validateCpf(realtor.cpf);
    realtor.rg = validateString(realtor.rg, 'O campo RG é obrigatório');
    realtor.creci = validateCreci(realtor.creci);
    realtor.cep = validateCep(realtor.cep);
    realtor.address = validateString(realtor.address, 'O campo endereço é obrigatório');
    realtor.district = validateString(data.district, 'O campo bairro é obrigatório');
    realtor.house_number = validateString(realtor.house_number, 'O campo número é obrigatório');
    realtor.city = validateString(realtor.city, 'O campo cidade é obrigatório');
    realtor.state = validateUF(realtor.state);

    await validateIfUniqueEmail(realtor.email);
    await validateIfUniqueCpf(realtor.cpf);
    await validateIfUniqueRg(realtor.rg);

    return await Realtor.update(realtor, { where: { email: validatedEmail } });
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function destroy(email) {
  try {
    const validatedEmail = validateEmail(email);

    if (!await Realtor.findByPk(validatedEmail)) {
      throw new RealtorNotFound();
    }

    await Realtor.destroy({ where: { email: validatedEmail } });
    return { message: 'Usuário apagado com sucesso' };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

export { findAll, findByPk, findByCpf, findByRg, create, update, destroy };
