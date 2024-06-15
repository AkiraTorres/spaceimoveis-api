import { Op } from 'sequelize';
import Favorite from '../db/models/Favorite.js';
import Photo from '../db/models/Photo.js';
import Property from '../db/models/Property.js';

import { validateEmail } from '../validators/inputValidators.js';
import { find } from './globalService.js';

export async function totalPropertiesLikes(email) {
  const validatedEmail = validateEmail(email);

  const user = await find(validatedEmail);

  if (!user) {
    const error = new Error('Usuário não encontrado com o email informado');
    error.status = 404;
    throw error;
  }

  const ids = await Property.findAll({ where: { [`${user.type}_email`]: validatedEmail }, attributes: ['id'], raw: true });

  const propertiesIds = ids.map((id) => id.id);

  const total = await Favorite.count({
    where: {
      property_id: { [Op.in]: propertiesIds },
    },
  });

  return { total };
}

export async function totalPropertiesViews(email) {
  const validatedEmail = validateEmail(email);

  const user = await find(validatedEmail);

  if (!user) {
    const error = new Error('Usuário não encontrado com o email informado');
    error.status = 404;
    throw error;
  }

  const total = await Property.findAll({ where: { [`${user.type}_email`]: validatedEmail }, attributes: ['id', 'times_seen'], raw: true })
    .then((properties) => properties.reduce((acc, property) => acc + property.times_seen, 0));

  return { total };
}

async function propertiesData(email) {
  const validatedEmail = validateEmail(email);
  const now = new Date();
  const beginYear = new Date(now.getFullYear() - 1, 11, 31);

  const user = await find(validatedEmail);
  if (!user) {
    const error = new Error('Usuário não encontrado com o email informado');
    error.status = 404;
    throw error;
  }

  const properties = await Property.findAll({
    where: {
      createdAt: { [Op.between]: [beginYear, now] },
      [`${user.type}_email`]: email,
    },
    attributes: ['id', 'createdAt', 'times_seen'],
    raw: true,
  });

  const propertiesIds = properties.map((property) => property.id);
  let months = [];

  for (let i = 0; i < now.getMonth(); i++) {
    const month = properties.filter((property) => property.createdAt.getMonth() === i);
    const views = month.reduce((acc, property) => acc + property.times_seen, 0);

    months = [...months, { month: i, views }];
  }

  return Promise.all(months.map(async (month) => {
    const likes = await Favorite.count({
      where: {
        property_id: { [Op.in]: propertiesIds },
        createdAt: { [Op.between]: [new Date(now.getFullYear(), month.month, 1), new Date(now.getFullYear(), month.month + 1, 0)] },
      },
    });

    return { ...month, likes };
  }));
}

export async function propertiesLikesMonthly(email) {
  const dataset = await propertiesData(email);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  return dataset.map((data) => {
    const m = data.month;
    const value = data.likes;

    return { month: monthNames[m], value };
  });
}

export async function propertiesViewsMonthly(email) {
  const dataset = await propertiesData(email);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  return dataset.map((data) => {
    const m = data.month;
    const value = data.views;

    return { month: monthNames[m], value };
  });
}

export async function topProperties(email) {
  const validatedEmail = validateEmail(email);

  const user = await find(validatedEmail);
  if (!user) {
    const error = new Error('Usuário não encontrado com o email informado');
    error.status = 404;
    throw error;
  }

  const properties = await Property.findAll({
    where: { [`${user.type}_email`]: validatedEmail },
    raw: true,
  });

  const sorted = properties.sort((a, b) => b.times_seen - a.times_seen);

  return Promise.all(sorted.slice(0, 5).map(async (property) => {
    const editedProperty = property;
    if (property.owner_email) editedProperty.email = editedProperty.owner_email;
    if (property.realstate_email) editedProperty.email = editedProperty.realstate_email;
    if (property.realtor_email) editedProperty.email = editedProperty.realtor_email;

    editedProperty.shared = !!((property.owner_email && property.realtor_email)
        || (property.owner_email && property.realstate_email));

    const seller = await find(editedProperty.email);

    const pictures = await Photo.findAll({ where: { property_id: property.id }, order: [['type', 'ASC']] });

    return { ...editedProperty, pictures, seller };
  }));
}
