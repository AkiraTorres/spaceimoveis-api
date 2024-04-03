import Client from '../models/Client.js';
import Owner from '../models/Owner.js';

import EmailAlreadyExists from '../errors/emailAlreadyExists.js';
import OwnerNotFound from '../errors/ownerErrors/ownerNotFound.js';
import NoOwnersFound from '../errors/ownerErrors/noOwnersFound.js';
import { validateEmail, validateString, validatePassword, validatePhone, validateCpf, validateCep, validateUF } from '../validators/inputValidators.js';

async function findAll(page) {
  try {
    const limit = 5;
    const countTotal = await Owner.count();

    if (countTotal === 0) {
      throw new NoOwnersFound();
    }

    const lastPage = Math.ceil(countTotal / limit);
    const offset = Number(limit * (page - 1));

    const owners = await Owner.findAll({
      attributes: ['email', 'name', 'phone', 'cpf', 'rg', 'address', 'cep', 'district', 'city', 'state'],
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

async function findByPk(email) {
  try {
    const validatedEmail = validateEmail(email);

    const owner = await Owner.findByPk(validatedEmail, {
      attributes: ['email', 'name', 'phone', 'cpf', 'rg', 'address', 'cep', 'district', 'city', 'state'],
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

async function create(data) {
  try {
    const userData = {};

    userData.email = validateEmail(data.email);
    userData.name = validateString(data.name, 'O campo nome é obrigatório');
    userData.password = validatePassword(data.password);
    userData.phone = validatePhone(data.phone);

    const owner = userData;

    if (await Owner.findByPk(owner.email) || await Client.findByPk(owner.email)) {
      throw new EmailAlreadyExists();
    }

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

    const owner = {};
    owner.email = validateEmail(data.email) || oldOwner.email;
    owner.name = validateString(data.name, 'O campo nome é obrigatório') || oldOwner.name;
    owner.password = validatePassword(data.password) || oldOwner.password;
    owner.phone = validatePhone(data.phone) || oldOwner.phone;
    owner.cpf = validateCpf(data.cpf) || oldOwner.cpf;
    owner.rg = validateString(data.rg, 'O campo RG é obrigatório') || oldOwner.rg;
    owner.address = validateString(data.address, 'O campo endereço é obrigatório') || oldOwner.address;
    owner.cep = validateCep(data.cep) || oldOwner.cep;
    owner.district = validateString(data.district, 'O campo bairro é obrigatório') || oldOwner.district;
    owner.city = validateString(data.city, 'O campo cidade é obrigatório') || oldOwner.city;
    owner.state = validateUF(data.state) || oldOwner.state;

    return await Owner.update(owner, { where: { validatedEmail } });
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

    return await Owner.destroy({ where: { validatedEmail } });
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

export { findAll, findByPk, create, update, destroy };
