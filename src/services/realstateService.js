import { initializeApp } from 'firebase/app';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { Op } from 'sequelize';
import { v4 as uuid } from 'uuid';

import Client from '../db/models/Client.js';
import Realstate from '../db/models/Realstate.js';
import RealstatePhoto from '../db/models/RealstatePhoto.js';
import RealstateRating from '../db/models/RealstateRating.js';

import ClientNotFound from '../errors/clientErrors/clientNotFound.js';
import NoRealstatesFound from '../errors/realstateErrors/noRealstatesFound.js';
import RealstateNotFound from '../errors/realstateErrors/realstateNotFound.js';
import {
  validateCep,
  validateCnpj,
  validateCreci,
  validateEmail,
  validateIfUniqueCnpj, validateIfUniqueCreci,
  validateIfUniqueEmail,
  validatePassword, validatePhone,
  validateString,
  validateUF,
} from '../validators/inputValidators.js';

import firebaseConfig from '../config/firebase.js';
import Property from '../db/models/Property.js';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export async function getAvgRateByRealstate(receiverEmail) {
  const validatedReceiverEmail = validateEmail(receiverEmail);

  const receiver = await Realstate.findByPk(validatedReceiverEmail);
  if (!receiver) {
    const error = new Error('Usuário não encontrado.');
    error.status = 404;
    throw error;
  }

  if (receiver.type !== 'realstate') {
    const error = new Error('Usuário a receber a avaliação deve ser uma imobiliária.');
    error.status = 400;
    throw error;
  }

  const where = { receiver_email: validatedReceiverEmail };
  const order = [['createdAt', 'DESC']];

  const ratings = await RealstateRating.findAll({ where, order });

  if (ratings === 0) {
    return 0;
  }

  const total = ratings.length;
  const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
  const avg = ((sum / total) / 2).toFixed(2);
  return avg;
}

async function findByPk(email, password = false, otp = false) {
  try {
    const validatedEmail = validateEmail(email);
    const attributes = { exclude: [] };
    if (!otp) attributes.exclude.push(['otp', 'otp_ttl']);
    if (!password) attributes.exclude.push('password');

    const realstate = await Realstate.findByPk(validatedEmail, {
      attributes,
      raw: true,
    });

    if (!realstate) {
      throw new RealstateNotFound();
    }

    realstate.totalProperties = await Property.count({
      where: { realstate_email: realstate.email },
    });

    realstate.avgRate = await getAvgRateByRealstate(realstate.email);
    realstate.properties = await Property.findAll({ where: { realstate_email: realstate.email } });
    realstate.profile = await RealstatePhoto.findOne({ where: { email: realstate.email } });
    realstate.totalRatings = await RealstateRating.count({
      where: { receiver_email: realstate.email },
    });

    return realstate;
  } catch (error) {
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
    throw error;
  }
}

async function findAll(page) {
  const attributes = { exclude: ['password', 'otp', 'otp_ttl'] };
  if (page < 1) {
    return Realstate.findAll({
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
    raw: true,
  });

  if (realstates.length === 0) {
    throw new NoRealstatesFound();
  }

  const result = await Promise.all(realstates.map(async (realstate) => {
    const editedRealstate = realstate;

    editedRealstate.profile = await RealstatePhoto.findOne({ where: { email: realstate.email } });
    editedRealstate.totalProperties = await Property.count({
      where: { realstate_email: realstate.email },
    });
    editedRealstate.avgRate = await getAvgRateByRealstate(realstate.email);
    editedRealstate.properties = await Property.findAll({
      where: { realstate_email: realstate.email },
    });
    editedRealstate.totalRatings = await RealstateRating.count({
      where: { receiver_email: realstate.email },
    });

    return editedRealstate;
  }));

  const pagination = {
    path: '/realstates',
    page,
    prev_page_url: page - 1 >= 1 ? page - 1 : null,
    next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
    lastPage,
    total: countTotal,
  };

  result.sort(async (a, b) => (
    await getAvgRateByRealstate(a.email) < await getAvgRateByRealstate(b.email) ? 1 : -1
  ));

  return { result, pagination };
}

async function findByCnpj(cnpj, password = false, otp = false) {
  try {
    const validatedCnpj = validateCnpj(cnpj);
    const attributes = { exclude: [] };
    if (!otp) attributes.exclude.push('email');
    if (!password) attributes.exclude.push('password');

    const realstate = await Realstate.findOne({ where: { cnpj: validatedCnpj } }, {
      attributes,
      raw: true,
    });

    if (!realstate) {
      throw new RealstateNotFound();
    }

    realstate.totalProperties = await Property.count({
      where: { realstate_email: realstate.email },
    });

    realstate.profile = await RealstatePhoto.findOne({ where: { email: realstate.email } });
    realstate.properties = await Property.findAll({ where: { realstate_email: realstate.email } });
    realstate.avgRate = await getAvgRateByRealstate(realstate.email);
    realstate.totalRatings = await RealstateRating.count({
      where: { receiver_email: realstate.email },
    });

    return realstate;
  } catch (error) {
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
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
      raw: true,
    });

    if (!realstate) {
      throw new RealstateNotFound();
    }

    realstate.totalProperties = await Property.count({
      where: { realstate_email: realstate.email },
    });

    realstate.profile = await RealstatePhoto.findOne({ where: { email: realstate.email } });
    realstate.properties = await Property.findAll({ where: { realstate_email: realstate.email } });
    realstate.avgRate = await getAvgRateByRealstate(realstate.email);
    realstate.totalRatings = await RealstateRating.count({
      where: { receiver_email: realstate.email },
    });

    return realstate;
  } catch (error) {
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
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
      subscription: data.subscription ? validateString(data.subscription) : 'free',
    };

    await validateIfUniqueEmail(userData.email);
    await validateIfUniqueCnpj(userData.cnpj);
    await validateIfUniqueCreci(userData.creci);

    const newRealstate = await Realstate.create(userData);
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
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
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

        subscription: data.subscription
          ? validateString(data.subscription)
          : oldRealstate.subscription,
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
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
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
      subscription: data.subscription ? validateString(data.subscription) : 'free',
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
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
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
    if (name) where.company_name = { [Op.iLike]: `%${validateString(name)}%` };
    if (email) where.email = validateEmail(email);
    if (city) where.city = { [Op.iLike]: `%${validateString(city)}%` };
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
    const filteredRealstate = realstate;

    filteredRealstate.profile = await RealstatePhoto.findOne({
      where: { email: filteredRealstate.email },
    });
    filteredRealstate.totalProperties = await Property.count();
    filteredRealstate.avgRate = await getAvgRateByRealstate(filteredRealstate.email);
    filteredRealstate.properties = await Property.findAll({
      where: { realstate_email: filteredRealstate.email },
    });
    filteredRealstate.totalRatings = await RealstateRating.count({
      where: { receiver_email: realstate.email },
    });

    return filteredRealstate;
  }));

  result.sort(async (a, b) => (
    await getAvgRateByRealstate(a.email) < await getAvgRateByRealstate(b.email) ? 1 : -1
  ));

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
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
    throw error;
  }
}

export { create, destroy, elevate, filter, findAll, findByCnpj, findByCreci, findByPk, update };
