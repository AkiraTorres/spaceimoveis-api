import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { Op } from 'sequelize';
import { v4 as uuid } from 'uuid';

import Admin from '../db/models/Admin.js';
import AdminPhoto from '../db/models/AdminPhoto.js';
import Client from '../db/models/Client.js';
import Owner from '../db/models/Owner.js';
import OwnerPhoto from '../db/models/OwnerPhoto.js';
import Photo from '../db/models/Photo.js';
import Property from '../db/models/Property.js';
import Realstate from '../db/models/Realstate.js';
import RealstatePhoto from '../db/models/RealstatePhoto.js';
import Realtor from '../db/models/Realtor.js';
import RealtorPhoto from '../db/models/RealtorPhoto.js';

import { validateCpf, validateEmail, validatePassword, validateString } from '../validators/inputValidators.js';
import { find } from './globalService.js';

import firebaseConfig from '../config/firebase.js';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function findByPk(email, password = false, otp = false) {
  const validatedEmail = validateEmail(email);
  const attributes = { exclude: [] };
  if (!otp) attributes.exclude.push('otp', 'otp_ttl');
  if (!password) attributes.exclude.push('password');

  const admin = await Admin.findByPk(validatedEmail, {
    attributes,
    raw: true,
  });

  if (!admin) {
    const error = new Error('Administrador não encontrado com o email informado.');
    error.status = 404;
    throw error;
  }

  admin.profile = await AdminPhoto.findOne({ where: { email: admin.email } });

  return admin;
}

export async function findAll(page = 1) {
  try {
    const attributes = { exclude: ['otp', 'otp_ttl', 'password'] };
    if (page < 1) {
      return await Admin.findAll({
        attributes,
        order: [['name', 'ASC']],
      });
    }

    const limit = 6;
    const countTotal = await Admin.count();

    if (countTotal === 0) {
      const error = new Error('Não existe nenhum Administrador cadastrado.');
      error.status = 404;
      throw error;
    }

    const lastPage = Math.ceil(countTotal / limit);
    const offset = Number(limit * (page - 1));

    const admins = await Admin.findAll({
      attributes,
      order: [['name', 'ASC']],
      offset,
      limit,
    });

    if (admins.length === 0) {
      const error = new Error('Não existe nenhum Administrador cadastrado.');
      error.status = 404;
      throw error;
    }

    const result = await Promise.all(admins.map(async (admin) => {
      const editedAdmin = admin.dataValues;

      editedAdmin.profile = await AdminPhoto.findOne({ where: { email: admin.email } });

      return editedAdmin;
    }));

    const pagination = {
      path: '/admin',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total: countTotal,
    };

    return { result, pagination };
  } catch (error) {
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
    throw error;
  }
}

export async function findByCpf(cpf, password = false, otp = false) {
  const validatedCpf = validateCpf(cpf);
  const attributes = { exclude: [] };
  if (!otp) attributes.exclude.push('otp', 'otp_ttl');
  if (!password) attributes.exclude.push('password');

  const admin = await Admin.findByPk(validatedCpf, {
    attributes,
    raw: true,
  });

  if (!admin) {
    const error = new Error('Administrador não encontrado com o cpf informado.');
    error.status = 404;
    throw error;
  }

  admin.profile = await AdminPhoto.findOne({ where: { email: admin.email } });

  return admin;
}

export async function create(data, photo) {
  const admin = {
    email: validateEmail(data.email, "O campo 'email' é obrigatório"),
    name: validateString(data.name, "O campo 'nome' é obrigatório"),
    password: validatePassword(data.password, "O campo 'senha' é obrigatório"),
    cpf: validateCpf(data.cpf, "O campo 'cpf' é obrigatório"),
  };

  // await validateIfUniqueEmail(admin.email);
  // await validateIfUniqueCpf(admin.cpf);

  const newAdmin = await Admin.create(admin);

  let profile = null;
  if (photo) {
    const storageRef = ref(storage, `images/admins/${newAdmin.email}/${photo.originalname}`);
    const metadata = { contentType: photo.mimetype };
    const snapshot = await uploadBytesResumable(storageRef, photo.buffer, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    profile = await AdminPhoto.create({
      id: uuid(),
      email: newAdmin.email,
      url: downloadUrl,
      name: photo.originalname,
      type: 'profile',
    });
  }

  return { ...newAdmin.dataValues, profile };
}

export async function update(email, data, photo) {
  const validatedEmail = validateEmail(email);

  if ((!data && !photo) || (Object.keys(data).length === 0 && !photo)) {
    throw new Error('Nenhum dado foi informado para atualização');
  }

  const oldAdmin = await Admin.findByPk(validatedEmail);
  if (!oldAdmin) {
    const error = new Error('Administrador não encontrado');
    error.status = 404;
    throw error;
  }

  let updatedAdmin = oldAdmin.dataValues;
  if (data) {
    const admin = {
      email: data.email ? validateEmail(data.email) : oldAdmin.email,
      name: data.name ? validateString(data.name, 'O campo nome é obrigatório') : oldAdmin.name,
      cpf: data.cpf ? validateCpf(data.cpf) : oldAdmin.cpf,
    };

    // if (admin.email !== oldAdmin.email) await validateIfUniqueEmail(admin.email);
    // if (admin.cpf !== oldAdmin.cpf) await validateIfUniqueCpf(admin.cpf);

    await Admin.update(admin, { where: { email: admin.email } });
    updatedAdmin = admin;
  }

  let profile = await AdminPhoto.findOne({ where: { email: updatedAdmin.email } });
  if (photo) {
    if (profile) {
      const storageRef = ref(storage, `images/admins/${updatedAdmin.email}/${profile.name}`);
      await AdminPhoto.destroy({ where: { email: updatedAdmin.email } });
      await deleteObject(storageRef);
    }

    const storageRef = ref(storage, `images/admins/${updatedAdmin.email}/${photo.originalname}`);
    const metadata = { contentType: photo.mimetype };
    const snapshot = await uploadBytesResumable(storageRef, photo.buffer, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);

    profile = await AdminPhoto.create({
      id: uuid(),
      email: updatedAdmin.email,
      url: downloadURL,
      name: photo.originalname,
      type: 'profile',
    });
  }

  return { ...updatedAdmin, profile };
}

export async function destroy(email) {
  const validatedEmail = validateEmail(email);

  if (!await Admin.findByPk(validatedEmail)) {
    const error = new Error('Administrador não encontrado');
    error.status = 404;
    throw error;
  }

  const profile = await AdminPhoto.findOne({ where: { email: validatedEmail } });
  if (profile) {
    const storageRef = ref(storage, `images/admins/${validatedEmail}/${profile.name}`);
    await deleteObject(storageRef);
    await AdminPhoto.destroy({ where: { email: validatedEmail } });
  }

  await Admin.destroy({ where: { email: validatedEmail } });
  return { message: 'Usuário apagado com sucesso' };
}

export async function getLastPublishedProperties(page = 1, limit = 10) {
  const date = new Date();
  date.setDate(date.getDate() - 3);

  const total = await Property.count({ where: { createdAt: { [Op.gte]: date } }, raw: true });

  if (total === 0) {
    const error = new Error('No properties found');
    error.status = 404;
    throw error;
  }

  const lastPage = Math.ceil(total / limit);
  const offset = Number(limit * (page - 1));

  const props = await Property.findAll({
    where: { createdAt: { [Op.gte]: date } },
    limit,
    offset,
    raw: true,
  });

  if (props.length === 0) {
    const error = new Error('No properties found');
    error.status = 404;
    throw error;
  }

  const pagination = {
    path: '/admin/properties/new',
    page,
    prev_page_url: page - 1 >= 1 ? page - 1 : null,
    next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
    lastPage,
    total,
  };

  const properties = await Promise.all(props.map(async (property) => {
    const editedProperty = property.dataValues;
    if (property.owner_email) editedProperty.email = editedProperty.owner_email;
    if (property.realstate_email) editedProperty.email = editedProperty.realstate_email;
    if (property.realtor_email) editedProperty.email = editedProperty.realtor_email;

    if ((property.owner_email && property.realtor_email)
      || (property.owner_email && property.realstate_email)) {
      editedProperty.shared = true;
    } else {
      editedProperty.shared = false;
    }

    const seller = await find(editedProperty.email);

    const pictures = await Photo.findAll({ where: { property_id: property.id }, order: [['type', 'ASC']] });

    return { ...editedProperty, pictures, seller };
  }));

  return { properties, pagination };
}

export async function getLastRegisteredUsers(page = 1, limit = 10) {
  const date = new Date();
  date.setDate(date.getDate() - 3);
  const attributes = { exclude: ['otp', 'otp_ttl', 'password'] };

  let total = 0;

  total += await Client.count({ where: { createdAt: { [Op.gte]: date } }, raw: true });
  total += await Owner.count({ where: { createdAt: { [Op.gte]: date } }, raw: true });
  total += await Realtor.count({ where: { createdAt: { [Op.gte]: date } }, raw: true });
  total += await Realstate.count({ where: { createdAt: { [Op.gte]: date } }, raw: true });

  if (total === 0) {
    const error = new Error('No users found');
    error.status = 404;
    throw error;
  }

  const lastPage = Math.ceil(total / limit);
  const offset = Number(limit * (page - 1));

  const [clients, owners, realtors, realstates] = await Promise.all([
    Client.findAll({ where: { createdAt: { [Op.gte]: date } }, attributes, limit, offset, raw: true }),
    Owner.findAll({ where: { createdAt: { [Op.gte]: date } }, attributes, limit, offset, raw: true }),
    Realtor.findAll({ where: { createdAt: { [Op.gte]: date } }, attributes, limit, offset, raw: true }),
    Realstate.findAll({ where: { createdAt: { [Op.gte]: date } }, attributes, limit, offset, raw: true }),
  ]);

  const users = await Promise.all([
    ...clients,
    ...owners.map(async (owner) => {
      const edited = owner;
      edited.picture = await OwnerPhoto.findAll({ where: { email: owner.email }, raw: true });
      return edited;
    }),
    ...realtors.map(async (realtor) => {
      const edited = realtor;
      edited.picture = await RealtorPhoto.findAll({ where: { email: realtor.email }, raw: true });
      return edited;
    }),
    ...realstates.map(async (realstate) => {
      const edited = realstate;
      edited.picture = await RealstatePhoto.findAll({ where: { email: realstate.email }, raw: true });
      return edited;
    }),
  ]);

  if (users.length === 0) {
    const error = new Error('No users found');
    error.status = 404;
    throw error;
  }

  const pagination = {
    path: '/admin/users/new',
    page,
    prev_page_url: page - 1 >= 1 ? page - 1 : null,
    next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
    lastPage,
    total,
  };

  return { users, pagination };
}

export async function denyProperty(id, reason = false) {
  const validatedId = validateString(id);
  const validatedReason = reason ? ` \n Motivo: ${validateString(reason)}.` : '';
  const property = await Property.findByPk(validatedId);

  const emailBody = reason
    ? `Sua conta foi recusada pela administração.${validatedReason}`
    : 'Sua conta foi recusada pela administração.';

  if (!property) {
    const error = new Error('Property not found');
    error.status = 404;
    throw error;
  }

  const seller = await find(property.owner_email || property.realtor_email || property.realstate_email);

  const photos = await Photo.findAll({ where: { property_id: validatedId }, raw: true });

  if (photos.length > 0) {
    await Promise.all(photos.map(async (photo) => {
      const storageRef = ref(storage, `images/properties/${validatedId}/${photo.name}`);
      await deleteObject(storageRef);
    }));
  }

  await Photo.destroy({ where: { property_id: validatedId } });
  await Property.destroy({ where: { id: validatedId } });

  let message = 'Usuário apagado com sucesso.';

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: seller.email,
    subject: 'Anúncio de imóvel negado.',
    text: emailBody,
  };

  sgMail
    .send(mailOptions)
    .catch(() => { message += ' Mas o email não pode ser enviado.'; });

  return { message };
}

export async function denyUser(id, reason = false) {
  const validatedId = validateString(id);
  const validatedReason = reason ? ` \n Motivo: ${validateString(reason)}.` : '';

  const emailBody = reason
    ? `Sua conta foi recusada pela administração.${validatedReason}`
    : 'Sua conta foi recusada pela administração.';

  const user = await find(validatedId);

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  let picture;
  if (user.type === 'owner') picture = await OwnerPhoto.findAll({ where: { email: user.email }, raw: true });
  if (user.type === 'realtor') picture = await RealtorPhoto.findAll({ where: { email: user.email }, raw: true });
  if (user.type === 'realstate') picture = await RealstatePhoto.findAll({ where: { email: user.email }, raw: true });

  if (picture) {
    await Promise.all(picture.map(async (photo) => {
      const storageRef = ref(storage, `images/${user.type}s/${user.email}/${photo.name}`);
      await deleteObject(storageRef);
    }));
  }

  if (user.type === 'client') {
    Client.destroy({ where: { email: user.email } });
  } else if (user.type === 'owner') {
    picture = await OwnerPhoto.destroy({ where: { email: user.email } });
    Owner.destroy({ where: { email: user.email } });
  } else if (user.type === 'realtor') {
    picture = await RealtorPhoto.destroy({ where: { email: user.email } });
    Realtor.destroy({ where: { email: user.email } });
  } else if (user.type === 'realstate') {
    picture = await RealstatePhoto.destroy({ where: { email: user.email } });
    Realstate.destroy({ where: { email: user.email } });
  }

  let message = 'Usuário apagado com sucesso.';

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: user.email,
    subject: 'Cadastro de usuário negado.',
    text: emailBody,
  };

  sgMail
    .send(mailOptions)
    .catch(() => { message += ' Mas o email não pode ser enviado.'; });

  return { message };
}

export async function filterUsers(filter, page = 1, limit = 10) {
  const offset = Number(limit * (page - 1));
  const attributes = { exclude: ['otp', 'otp_ttl', 'password'] };
  const where = {};
  const order = [['createdAt', 'DESC']];

  if (filter) {
    if (filter.type) {
      if (filter.type === 'client') where.type = 'client';
      if (filter.type === 'owner') where.type = 'owner';
      if (filter.type === 'realtor') where.type = 'realtor';
      if (filter.type === 'realstate') where.type = 'realstate';
    }

    if (filter.email) where.email = { [Op.iLike]: `%${filter.email}%` };
    if (filter.name) where.name = { [Op.iLike]: `%${filter.name}%` };
  }

  const total = await Client.count({ where, raw: true })
    + await Owner.count({ where, raw: true })
    + await Realtor.count({ where, raw: true })
    + await Realstate.count({ where, raw: true });

  if (total === 0) {
    const error = new Error('No users found');
    error.status = 404;
    throw error;
  }

  const lastPage = Math.ceil(total / limit);

  const [clients, owners, realtors, realstates] = await Promise.all([
    Client.findAll({ where, attributes, limit, offset, order, raw: true }),
    Owner.findAll({ where, attributes, limit, offset, order, raw: true }),
    Realtor.findAll({ where, attributes, limit, offset, order, raw: true }),
    Realstate.findAll({ where, attributes, limit, offset, order, raw: true }),
  ]);

  const users = await Promise.all([
    ...clients,
    ...owners.map(async (owner) => {
      const edited = owner;
      edited.picture = await OwnerPhoto.findAll({ where: { email: owner.email }, raw: true });
      return edited;
    }),
    ...realtors.map(async (realtor) => {
      const edited = realtor;
      edited.picture = await RealtorPhoto.findAll({ where: { email: realtor.email }, raw: true });
      return edited;
    }),
    ...realstates.map(async (realstate) => {
      const edited = realstate;
      edited.picture = await RealstatePhoto.findAll({ where: { email: realstate.email }, raw: true });
      return edited;
    }),
  ]);

  const pagination = {
    path: '/admin/users/filter',
    page,
    prev_page_url: page - 1 >= 1 ? page - 1 : null,
    next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
    lastPage,
    total,
  };

  return { users, pagination };
}
