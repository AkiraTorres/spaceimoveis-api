import { v4 as uuid } from 'uuid';

import Favorite from '../db/models/Favorite.js';
import { find } from './globalService.js';
import { validateString } from '../validators/inputValidators.js';

async function setFavorite(clientEmail, propertyId) {
  const validatedEmail = validateString(clientEmail);
  const validatedPropertyId = validateString(propertyId);

  const user = await find(validatedEmail);
  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    throw error;
  }

  const favorite = await Favorite.findOne({ where: {
    [`${user.type}_email`]: validatedEmail,
    property_id: validatedPropertyId,
  } });
  if (favorite) {
    const error = new Error('Imóvel já favoritado');
    error.status = 400;
    throw error;
  }

  return Favorite.create({ id: uuid(), [`${user.type}_email`]: validatedEmail, property_id: validatedPropertyId });
}

async function getFavorites(clientEmail) {
  const validatedEmail = validateString(clientEmail);

  const user = await find(validatedEmail);
  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    throw error;
  }

  const favorites = await Favorite.findAll({ where: { [`${user.type}_email`]: validatedEmail } });

  const favoritesIds = favorites.map((favorite) => favorite.property_id);
  return favoritesIds;
}

async function getPropertyTotalFavorites(propertyId) {
  const validatedId = validateString(propertyId);

  const totalFavorites = await Favorite.count({ where: { property_id: validatedId } });

  return totalFavorites;
}

async function removeFavorite(clientEmail, propertyId) {
  const validatedEmail = validateString(clientEmail);
  const validatedPropertyId = validateString(propertyId);

  const user = await find(validatedEmail);
  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    throw error;
  }

  const destroyed = await Favorite.destroy({ where: {
    [`${user.type}_email`]: validatedEmail,
    property_id: validatedPropertyId,
  } });

  if (!destroyed) {
    const error = new Error('Imóvel não encontrado');
    error.status = 404;
    throw error;
  }

  return destroyed;
}

export { setFavorite, getFavorites, getPropertyTotalFavorites, removeFavorite };
