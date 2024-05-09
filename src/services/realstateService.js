import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL, uploadBytesResumable, deleteObject } from 'firebase/storage';
import { v4 as uuid } from 'uuid';
import { Op } from 'sequelize';

import Client from '../db/models/Client.js';
import Realstate from '../db/models/Realstate.js';
import RealstatePhoto from '../db/models/RealstatePhoto.js';

import RealstateNotFound from '../errors/realstateErrors/realstateNotFound.js';
import NoRealstatesFound from '../errors/realstateErrors/noRealstatesFound.js';
import ClientNotFound from '../errors/clientErrors/clientNotFound.js';
import {
  validateEmail, validateString, validatePassword, validatePhone, validateCnpj, validateUF,
  validateCep, validateCreci, validateIfUniqueEmail, validateIfUniqueCnpj, validateIfUniqueCreci,
} from '../validators/inputValidators.js';

import firebaseConfig from '../config/firebase.js';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function findAll(page) {
  try {
    const attributes = { exclude: ['password', 'otp', 'otp_ttl'] };
    if (page < 1) {
      return await Realstate.findAll({
        attributes,
        order: [['company_name', 'ASC']],
      });
    }

    const limit = 6;
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

    const result = await Promise.all(realstates.map(async (realstate) => {
      const profile = await RealstatePhoto.findOne({ where: { email: realstate.email } });
      return { ...realstate.dataValues, profile };
    }));

    const pagination = {
      path: '/realstates',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total: countTotal,
    };

    return { result, pagination };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function findByPk(email, password = false, otp = false) {
  try {
    const validatedEmail = validateEmail(email);
    const attributes = { exclude: [] };
    if (!otp) attributes.exclude.push('email');
    if (!password) attributes.exclude.push('password');

    const realstate = await Realstate.findByPk(validatedEmail, {
      attributes,
    });

    if (!realstate) {
      throw new RealstateNotFound();
    }

    const profile = await RealstatePhoto.findOne({ where: { email: realstate.email } });
    return { ...realstate.dataValues, profile };
  } catch (error) {
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
    throw error;
  }
}

async function findByCnpj(cnpj, password = false, otp = false) {
  try {
    const validatedCnpj = validateCnpj(cnpj);
    const attributes = { exclude: [] };
    if (!otp) attributes.exclude.push('email');
    if (!password) attributes.exclude.push('password');

    const realstate = await Realstate.findOne({ where: { cnpj: validatedCnpj } }, {
      attributes,
    });

    if (!realstate) {
      throw new RealstateNotFound();
    }

    const profile = await RealstatePhoto.findOne({ where: { email: realstate.email } });
    return { ...realstate.dataValues, profile };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function findByCreci(creci, password = false, otp = false) {
  try {
    const validatedCreci = validateCreci(creci);
    const attributes = { exclude: [] };
    if (!otp) attributes.exclude.push('email');
    if (!password) attributes.exclude.push('password');

    const realstate = await Realstate.findOne({ where: { creci: validatedCreci } }, {
      attributes,
    });

    if (!realstate) {
      throw new RealstateNotFound();
    }

    const profile = await RealstatePhoto.findOne({ where: { email: realstate.email } });
    return { ...realstate.dataValues, profile };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function create(data, photo) {
  try {
    const userData = {
      email: validateEmail(data.email),
      company_name: validateString(data.company_name, 'O campo razão social é obrigatório'),
      password: validatePassword(data.password),
      phone: validatePhone(data.phone),
      cnpj: validateCnpj(data.cnpj),
      creci: validateCreci(data.creci),
      cep: validateCep(data.cep),
      address: validateString(data.address, 'O campo endereço é obrigatório'),
      district: validateString(data.district, 'O campo bairro é obrigatório'),
      house_number: validateString(data.house_number, 'O campo número é obrigatório'),
      city: validateString(data.city, 'O campo cidade é obrigatório'),
      state: validateUF(data.state),
      social_one: data.socialOne ? validateString(data.socialOne) : null,
      social_two: data.socialTwo ? validateString(data.socialTwo) : null,
      bio: data.bio ? validateString(data.bio) : null,
    };

    await validateIfUniqueEmail(userData.email);
    await validateIfUniqueCnpj(userData.cnpj);
    await validateIfUniqueCreci(userData.creci);

    const realstate = userData;

    const newRealstate = await Realstate.create(realstate);
    let profile = null;

    if (photo) {
      const storageRef = ref(storage, `images/realstates/${newRealstate.email}/${photo.originalname}`);
      const metadata = { contentType: photo.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, photo.buffer, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);

      profile = await RealstatePhoto.create({
        id: uuid(),
        email: newRealstate.email,
        url: downloadURL,
        name: photo.originalname,
        type: 'profile',
      });
    }

    return { ...newRealstate.dataValues, profile };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function update(email, data, photo) {
  try {
    const validatedEmail = validateEmail(email);

    if ((!data && !photo) || (Object.keys(data).length === 0 && !photo)) {
      throw new Error('Nenhum dado foi informado para atualização');
    }

    const oldRealstate = await Realstate.findByPk(validatedEmail);
    if (!oldRealstate) {
      throw new RealstateNotFound();
    }

    let updatedRealstate = oldRealstate;
    if (data) {
      const realstate = {
        email: data.email ? validateEmail(data.email) : oldRealstate.email,
        company_name: data.company_name ? validateString(data.company_name, 'O campo razão social é obrigatório') : oldRealstate.company_name,
        phone: data.phone ? validatePhone(data.phone) : oldRealstate.phone,
        cnpj: data.cnpj ? validateCnpj(data.cnpj) : oldRealstate.cnpj,
        creci: data.creci ? validateCreci(data.creci) : oldRealstate.creci,
        cep: data.cep ? validateCep(data.cep) : oldRealstate.cep,
        address: data.address ? validateString(data.address, 'O campo endereço é obrigatório') : oldRealstate.address,
        district: data.district ? validateString(data.district, 'O campo bairro é obrigatório') : oldRealstate.district,
        house_number: data.house_number ? validateString(data.house_number, 'O campo número é obrigatório') : oldRealstate.house_number,
        city: data.city ? validateString(data.city, 'O campo cidade é obrigatório') : oldRealstate.city,
        state: data.state ? validateUF(data.state) : oldRealstate.state,
        bio: data.bio ? validateString(data.bio) : oldRealstate.bio,
        social_one: data.socialOne ? validateString(data.socialOne) : oldRealstate.social_one,
        social_two: data.socialTwo ? validateString(data.socialTwo) : oldRealstate.social_two,
      };

      if (realstate.email !== oldRealstate.email) await validateIfUniqueEmail(realstate.email);
      if (realstate.cnpj !== oldRealstate.cnpj) await validateIfUniqueCnpj(realstate.cnpj);
      if (realstate.creci !== oldRealstate.creci) await validateIfUniqueCreci(realstate.creci);

      Realstate.update(realstate, { where: { email: validatedEmail } });
      updatedRealstate = realstate;
    }

    let profile = await RealstatePhoto.findOne({ where: { email: updatedRealstate.email } });
    if (photo) {
      if (profile) {
        const storageRef = ref(storage, `images/realstates/${updatedRealstate.email}/${profile.name}`);
        await RealstatePhoto.destroy({ where: { email: updatedRealstate.email } });
        await deleteObject(storageRef);
      }

      const storageRef = ref(storage, `images/realstates/${updatedRealstate.email}/${photo.originalname}`);
      const metadata = { contentType: photo.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, photo.buffer, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);

      profile = await RealstatePhoto.create({
        id: uuid(),
        email: updatedRealstate.email,
        url: downloadURL,
        name: photo.originalname,
        type: 'profile',
      });
    }

    return { ...updatedRealstate.dataValues, profile };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function elevate(email, data, photo) {
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
      password: validatePassword(data.password),
      cnpj: validateCnpj(data.cnpj),
      creci: validateCreci(data.creci),
      cep: validateCep(data.cep),
      address: validateString(data.address, 'O campo endereço é obrigatório'),
      district: validateString(data.district, 'O campo bairro é obrigatório'),
      house_number: validateString(data.house_number, 'O campo número é obrigatório'),
      city: validateString(data.city, 'O campo cidade é obrigatório'),
      state: validateUF(data.state),
      bio: data.bio ? validateString(data.bio) : null,
      social_one: data.socialOne ? validateString(data.socialOne) : null,
      social_two: data.socialTwo ? validateString(data.socialTwo) : null,
    };

    await validateIfUniqueCnpj(realstate.cnpj);
    await validateIfUniqueCreci(realstate.creci);

    const newRealstate = await Realstate.create(realstate);
    await Client.destroy({ where: { email: validatedEmail } });

    let profile = null;
    if (photo) {
      const storageRef = ref(storage, `images/realstates/${newRealstate.email}/${photo.originalname}`);
      const metadata = { contentType: photo.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, photo.buffer, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);

      profile = await RealstatePhoto.create({
        id: uuid(),
        email: newRealstate.email,
        url: downloadURL,
        name: photo.originalname,
        type: 'profile',
      });
    }

    return { ...newRealstate.dataValues, profile };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function filter(data, page = 1) {
  const limit = 6;
  const offset = Number(limit * (page - 1));
  const ordering = [['company_name', 'ASC']];
  const where = {};

  if (data) {
    const { name, email, city, state, order, orderType } = data;
    if (name) where.company_name = { [Op.substring]: validateString(name) };
    if (email) where.email = validateEmail(email);
    if (city) where.city = validateString(city);
    if (state) where.state = validateUF(state);
    if (order) order[0][0] = validateString(order);
    if (orderType) order[0][1] = validateString(orderType);
  }

  const total = await Realstate.count({ where });
  const lastPage = Math.ceil(total / limit);

  const pagination = {
    path: '/realstate/filter',
    page,
    prev_page_url: page - 1 >= 1 ? page - 1 : null,
    next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
    lastPage,
    total,
  };

  const realstates = await Realstate.findAll({ where, order: ordering, offset, limit, raw: true, exclude: ['password'] });
  if (realstates.length === 0) {
    throw new NoRealstatesFound();
  }

  const result = await Promise.all(realstates.map(async (realstate) => {
    const profile = await RealstatePhoto.findOne({ where: { email: realstate.email } });

    return { ...realstate, profile };
  }));

  return { result, pagination };
}

async function destroy(email) {
  try {
    const validatedEmail = validateEmail(email);

    if (!await Realstate.findByPk(validatedEmail)) {
      throw new RealstateNotFound();
    }

    const profile = await RealstatePhoto.findOne({ where: { email: validatedEmail } });
    if (profile) {
      const storageRef = ref(storage, `images/realstates/${validatedEmail}/${profile.name}`);
      await deleteObject(storageRef);
      await RealstatePhoto.destroy({ where: { email: validatedEmail } });
    }

    await Realstate.destroy({ where: { email: validatedEmail } });
    return { message: 'Usuário apagado com sucesso' };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

export { findAll, findByPk, findByCnpj, findByCreci, create, update, elevate, filter, destroy };
