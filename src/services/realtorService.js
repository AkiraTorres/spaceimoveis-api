import { initializeApp } from 'firebase/app';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { v4 as uuid } from 'uuid';
import { Op } from 'sequelize';

import Client from '../db/models/Client.js';
import Realtor from '../db/models/Realtor.js';
import Property from '../db/models/Property.js';
import RealtorPhoto from '../db/models/RealtorPhoto.js';

import RealtorNotFound from '../errors/realtorErrors/realtorNotFound.js';
import NoRealtorsFound from '../errors/realtorErrors/noRealtorsFound.js';
import ClientNotFound from '../errors/clientErrors/clientNotFound.js';
import {
  validateCep,
  validateCpf,
  validateCreci,
  validateEmail,
  validateIfUniqueCpf,
  validateIfUniqueCreci,
  validateIfUniqueEmail,
  validateIfUniqueRg,
  validatePassword,
  validatePhone,
  validateString,
  validateUF,
} from '../validators/inputValidators.js';

import firebaseConfig from '../config/firebase.js';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function findAll(page) {
  try {
    const attributes = { exclude: ['otp', 'otp_ttl', 'password'] };
    if (page < 1) {
      return await Realtor.findAll({
        attributes,
        order: [['name', 'ASC']],
      });
    }

    const limit = 6;
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

    const result = await Promise.all(realtors.map(async (realtor) => {
      const editedRealtor = realtor.dataValues;

      editedRealtor.totalProperties = await Property.count({ where: { realtor_email: realtor.email } });
      const profile = await RealtorPhoto.findOne({ where: { email: realtor.email } });

      return { ...realtor.dataValues, profile };
    }));

    const pagination = {
      path: '/realtors',
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
    if (!otp) attributes.exclude.push('otp', 'otp_ttl');
    if (!password) attributes.exclude.push('password');

    const realtor = await Realtor.findByPk(validatedEmail, {
      attributes,
    });

    if (!realtor) {
      throw new RealtorNotFound();
    }

    realtor.totalProperties = await Property.count({ where: { realtor_email: realtor.email } });

    const properties = await Property.findAll({ where: { realtor_email: realtor.email } });
    const profile = await RealtorPhoto.findOne({ where: { email: realtor.email } });

    return { ...realtor.dataValues, properties, profile };
  } catch (error) {
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
    throw error;
  }
}

async function findByCpf(cpf, password = false, otp = false) {
  try {
    const validatedCpf = validateCpf(cpf);
    const attributes = { exclude: [] };
    if (!otp) attributes.exclude.push('otp', 'otp_ttl');
    if (!password) attributes.exclude.push('password');

    const realtor = await Realtor.findOne(
      { where: { cpf: validatedCpf } },
      attributes,
    );

    if (!realtor) {
      throw new RealtorNotFound();
    }

    realtor.totalProperties = await Property.count({ where: { realtor_email: realtor.email } });

    const properties = await Property.findAll({ where: { realtor_email: realtor.email } });
    const profile = await RealtorPhoto.findOne({ where: { email: realtor.email } });

    return { ...realtor.dataValues, properties, profile };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function findByRg(rg, password = false, otp = false) {
  try {
    const validatedRg = validateString(rg);
    const attributes = { exclude: [] };
    if (!otp) attributes.exclude.push('otp', 'otp_ttl');
    if (!password) attributes.exclude.push('password');

    const realtor = await Realtor.findOne({ where: { rg: validatedRg } }, {
      attributes,
    });

    if (!realtor) {
      throw new RealtorNotFound();
    }

    realtor.totalProperties = await Property.count({ where: { realtor_email: realtor.email } });

    const properties = await Property.findAll({ where: { realtor_email: realtor.email } });
    const profile = await RealtorPhoto.findOne({ where: { email: realtor.email } });

    return { ...realtor.dataValues, properties, profile };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function create(data, photo) {
  try {
    console.log(data);
    const realtor = {
      email: validateEmail(data.email),
      name: validateString(data.name, 'O campo nome é obrigatório'),
      password: validatePassword(data.password),
      phone: validatePhone(data.phone),
      cpf: validateCpf(data.cpf),
      rg: validateString(data.rg, 'O campo RG é obrigatório'),
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
      subscription: data.subscription ? validateString(data.subscription) : 'free',
    };

    await validateIfUniqueEmail(realtor.email);
    await validateIfUniqueCpf(realtor.cpf);
    await validateIfUniqueRg(realtor.rg);
    await validateIfUniqueCreci(realtor.creci);

    const newRealtor = await Realtor.create(realtor);

    let profile = null;
    if (photo) {
      const storageRef = ref(storage, `images/realtors/${newRealtor.email}/${photo.originalname}`);
      const metadata = { contentType: photo.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, photo.buffer, metadata);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      profile = await RealtorPhoto.create({
        id: uuid(),
        email: newRealtor.email,
        url: downloadUrl,
        name: photo.originalname,
        type: 'profile',
      });
    }

    return { ...newRealtor.dataValues, profile };
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

    const oldRealtor = await Realtor.findByPk(validatedEmail);
    if (!oldRealtor) {
      throw new RealtorNotFound();
    }

    let updatedRealtor = oldRealtor.dataValues;
    if (data) {
      const realtor = {
        email: data.email ? validateEmail(data.email) : oldRealtor.email,
        name: data.name ? validateString(data.name, 'O campo nome é obrigatório') : oldRealtor.name,
        phone: data.phone ? validatePhone(data.phone) : oldRealtor.phone,
        cpf: data.cpf ? validateCpf(data.cpf) : oldRealtor.cpf,
        rg: data.rg ? validateString(data.rg, 'O campo RG é obrigatório') : oldRealtor.rg,
        creci: data.creci ? validateCreci(data.creci) : oldRealtor.creci,
        cep: data.cep ? validateCep(data.cep) : oldRealtor.cep,
        address: data.address ? validateString(data.address, 'O campo endereço é obrigatório') : oldRealtor.address,
        district: data.district ? validateString(data.district, 'O campo bairro é obrigatório') : oldRealtor.district,
        house_number: data.house_number ? validateString(data.house_number, 'O campo número é obrigatório') : oldRealtor.house_number,
        city: data.city ? validateString(data.city, 'O campo cidade é obrigatório') : oldRealtor.city,
        state: data.state ? validateUF(data.state) : oldRealtor.state,
        bio: data.bio ? validateString(data.bio) : oldRealtor.bio,
        social_one: data.socialOne ? validateString(data.socialOne) : oldRealtor.social_one,
        social_two: data.socialTwo ? validateString(data.socialTwo) : oldRealtor.social_two,
        subscription: data.subscription ? validateString(data.subscription) : oldRealtor.subscription,
      };

      if (realtor.email !== oldRealtor.email) await validateIfUniqueEmail(realtor.email);
      if (realtor.cpf !== oldRealtor.cpf) await validateIfUniqueCpf(realtor.cpf);
      if (realtor.rg !== oldRealtor.rg) await validateIfUniqueRg(realtor.rg);
      if (realtor.creci !== oldRealtor.creci) await validateIfUniqueCreci(realtor.creci);

      await Realtor.update(realtor, { where: { email: realtor.email } });
      updatedRealtor = realtor;
    }

    let profile = await RealtorPhoto.findOne({ where: { email: updatedRealtor.email } });
    if (photo) {
      if (profile) {
        const storageRef = ref(storage, `images/realtors/${updatedRealtor.email}/${profile.name}`);
        await RealtorPhoto.destroy({ where: { email: updatedRealtor.email } });
        await deleteObject(storageRef);
      }

      const storageRef = ref(storage, `images/realtors/${updatedRealtor.email}/${photo.originalname}`);
      const metadata = { contentType: photo.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, photo.buffer, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);

      profile = await RealtorPhoto.create({
        id: uuid(),
        email: updatedRealtor.email,
        url: downloadURL,
        name: photo.originalname,
        type: 'profile',
      });
    }

    return { ...updatedRealtor, profile };
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

    const realtor = {
      email: validateEmail(client.email),
      name: validateString(client.name, 'O campo nome é obrigatório'),
      phone: validatePhone(client.phone || data.phone),
      password: validatePassword(data.password),
      cpf: validateCpf(data.cpf),
      rg: validateString(data.rg, 'O campo RG é obrigatório'),
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
      subscription: data.subscription ? validateString(data.subscription) : 'free',
    };

    await validateIfUniqueRg(realtor.rg);
    await validateIfUniqueCpf(realtor.cpf);
    await validateIfUniqueCreci(realtor.creci);

    const newRealtor = await Realtor.create(realtor);
    await Client.destroy({ where: { email: validatedEmail } });

    let profile = null;
    if (photo) {
      const storageRef = ref(storage, `images/realtors/${newRealtor.email}/${photo.originalname}`);
      const metadata = { contentType: photo.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, photo.buffer, metadata);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      profile = await RealtorPhoto.create({
        id: uuid(),
        email: newRealtor.email,
        url: downloadUrl,
        name: photo.originalname,
        type: 'profile',
      });
    }

    return { ...newRealtor.dataValues, profile };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function filter(data, page = 1) {
  const limit = 6;
  const offset = Number(limit * (page - 1));
  const ordering = [['name', 'ASC']];
  const where = {};

  if (data) {
    const { name, email, city, state, order, orderType } = data;
    if (name) where.name = { [Op.substring]: validateString(name) };
    if (email) where.email = validateEmail(email);
    if (city) where.city = validateString(city);
    if (state) where.state = validateUF(state);
    if (order) order[0][0] = validateString(order);
    if (orderType) order[0][1] = validateString(orderType);
  }
  const total = await Realtor.count({ where });
  const lastPage = Math.ceil(total / limit);

  const pagination = {
    path: '/realtors/filter',
    page,
    prev_page_url: page - 1 >= 1 ? page - 1 : null,
    next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
    lastPage,
    total,
  };

  const realtors = await Realtor.findAll({ where, order: ordering, offset, limit, raw: true, exclude: ['password'] });
  if (realtors.length === 0) {
    throw new NoRealtorsFound();
  }

  const result = await Promise.all(realtors.map(async (realtor) => {
    const filteredRealtor = realtor;

    filteredRealtor.profile = await RealtorPhoto.findOne({ where: { email: realtor.email } });
    filteredRealtor.totalProperties = await Property.count({ where: { realtor_email: realtor.email } });

    return filteredRealtor;
  }));

  return { result, pagination };
}

async function destroy(email) {
  try {
    const validatedEmail = validateEmail(email);

    if (!await Realtor.findByPk(validatedEmail)) {
      throw new RealtorNotFound();
    }

    const profile = await RealtorPhoto.findOne({ where: { email: validatedEmail } });
    if (profile) {
      const storageRef = ref(storage, `images/realtors/${validatedEmail}/${profile.name}`);
      await deleteObject(storageRef);
      await RealtorPhoto.destroy({ where: { email: validatedEmail } });
    }

    await Realtor.destroy({ where: { email: validatedEmail } });
    return { message: 'Usuário apagado com sucesso' };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

export { findAll, findByPk, findByCpf, findByRg, create, update, elevate, filter, destroy };
