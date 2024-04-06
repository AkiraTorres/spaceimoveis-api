import Owner from '../db/models/Owner.js';

import OwnerNotFound from '../errors/ownerErrors/ownerNotFound.js';
import NoOwnersFound from '../errors/ownerErrors/noOwnersFound.js';
import {
  validateEmail, validateString, validatePassword, validatePhone, validateCpf, validateCep,
  validateUF, validateIfUniqueEmail, validateIfUniqueCpf, validateIfUniqueRg,
} from '../validators/inputValidators.js';

async function findAll(page) {
  try {
    if (page < 1) {
      return await Owner.findAll({
        attributes: ['email', 'name', 'phone', 'cpf', 'rg', 'address', 'house_number', 'cep', 'district', 'city', 'state', 'type'],
        order: [['name', 'ASC']],
      });
    }

    const limit = 5;
    const countTotal = await Owner.count();

    if (countTotal === 0) {
      throw new NoOwnersFound();
    }

    const lastPage = Math.ceil(countTotal / limit);
    const offset = Number(limit * (page - 1));

    const owners = await Owner.findAll({
      attributes: ['email', 'name', 'phone', 'cpf', 'rg', 'address', 'house_number', 'cep', 'district', 'city', 'state', 'type'],
      order: [['name', 'ASC']],
      offset,
      limit,
    });

    if (owners.length === 0) {
      throw new NoOwnersFound();
    }

    const pagination = {
      path: '/owners',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total: countTotal,
    };

    return { owners, pagination };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function findByPk(email, password) {
  try {
    const validatedEmail = validateEmail(email);
    const attributes = ['email', 'name', 'phone', 'cpf', 'rg', 'address', 'house_number', 'cep', 'district', 'city', 'state', 'type'];
    if (password) attributes.push('password');

    const owner = await Owner.findByPk(validatedEmail, {
      attributes,
    });

    if (!owner) {
      throw new OwnerNotFound();
    }

    return owner;
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function findByCpf(cpf, password = false) {
  try {
    const validatedCpf = validateCpf(cpf);
    const attributes = ['email', 'name', 'phone', 'cpf', 'rg', 'address', 'house_number', 'cep', 'district', 'city', 'state', 'type'];
    if (password) attributes.push('password');

    const realtor = await Owner.findOne({ where: { cpf: validatedCpf } }, {
      attributes,
    });

    if (!realtor) {
      throw new OwnerNotFound();
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
    const attributes = ['email', 'name', 'phone', 'cpf', 'rg', 'address', 'house_number', 'cep', 'district', 'city', 'state', 'type'];
    if (password) attributes.push('password');

    const realtor = await Owner.findOne({ where: { rg: validatedRg } }, {
      attributes,
    });

    if (!realtor) {
      throw new OwnerNotFound();
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

    const owner = userData;

    validateIfUniqueEmail(owner.email);

    return await Owner.create(owner);
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function update(email, data) {
  try {
    const validatedEmail = validateEmail(email);

    const oldOwner = await Owner.findByPk(validatedEmail);
    if (!oldOwner) {
      throw new OwnerNotFound();
    }

    const owner = {
      email: data.email || oldOwner.email,
      name: data.name || oldOwner.name,
      phone: data.phone || oldOwner.phone,
      cpf: data.cpf || oldOwner.cpf,
      rg: data.rg || oldOwner.rg,
      address: data.address || oldOwner.address,
      house_number: data.house_number || oldOwner.house_number,
      cep: data.cep || oldOwner.cep,
      district: data.district || oldOwner.district,
      city: data.city || oldOwner.city,
      state: data.state || oldOwner.state,
    };

    owner.email = validateEmail(owner.email);
    validateIfUniqueEmail(owner.email);
    owner.name = validateString(owner.name, 'O campo nome é obrigatório');
    owner.phone = validatePhone(owner.phone);

    if (owner.cpf) {
      owner.cpf = validateCpf(owner.cpf);
      validateIfUniqueCpf(owner.cpf);
    }
    if (owner.rg) {
      owner.rg = validateString(owner.rg, 'O campo RG é obrigatório');
      validateIfUniqueRg(owner.rg);
    }
    if (owner.address) owner.address = validateString(owner.address, 'O campo endereço é obrigatório');
    if (owner.house_number) owner.house_number = validateString(owner.house_number, 'O campo número é obrigatório');
    if (owner.cep) owner.cep = validateCep(owner.cep);
    if (owner.district) owner.district = validateString(owner.district, 'O campo bairro é obrigatório');
    if (owner.city) owner.city = validateString(owner.city, 'O campo cidade é obrigatório');
    if (owner.state) owner.state = validateUF(owner.state);

    return await Owner.update(owner, { where: { email: validatedEmail } });
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function destroy(email) {
  try {
    const validatedEmail = validateEmail(email);

    if (!await Owner.findByPk(validatedEmail)) {
      throw new OwnerNotFound();
    }

    await Owner.destroy({ where: { email: validatedEmail } });
    return { message: 'Usuário apagado com sucesso' };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

export { findAll, findByPk, findByCpf, findByRg, create, update, destroy };
