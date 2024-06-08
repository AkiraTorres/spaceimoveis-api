import { initializeApp } from 'firebase/app';
import { deleteObject, getStorage, ref } from 'firebase/storage';
import { Op } from 'sequelize';

import Client from '../db/models/Client.js';
import Owner from '../db/models/Owner.js';
import OwnerPhoto from '../db/models/OwnerPhoto.js';
import Photo from '../db/models/Photo.js';
import Property from '../db/models/Property.js';
import Realstate from '../db/models/Realstate.js';
import RealstatePhoto from '../db/models/RealstatePhoto.js';
import Realtor from '../db/models/Realtor.js';
import RealtorPhoto from '../db/models/RealtorPhoto.js';

import { validateString } from '../validators/inputValidators.js';
import { find } from './globalService.js';

import firebaseConfig from '../config/firebase.js';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

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
    path: '/admin/new/properties',
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
    path: '/admin/new/users',
    page,
    prev_page_url: page - 1 >= 1 ? page - 1 : null,
    next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
    lastPage,
    total,
  };

  return { users, pagination };
}

export async function denyProperty(id) {
  const validatedId = validateString(id);
  const property = await Property.findByPk(validatedId);

  if (!property) {
    const error = new Error('Property not found');
    error.status = 404;
    throw error;
  }

  const photos = await Photo.findAll({ where: { property_id: validatedId }, raw: true });

  if (photos.length > 0) {
    await Promise.all(photos.map(async (photo) => {
      const storageRef = ref(storage, `images/properties/${validatedId}/${photo.name}`);
      await deleteObject(storageRef);
    }));
  }

  await Photo.destroy({ where: { property_id: validatedId } });
  await Property.destroy({ where: { id: validatedId } });
}

export async function denyUser(id) {
  const validatedId = validateString(id);

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

  return { message: 'Usuário apagado com sucesso' };
}
