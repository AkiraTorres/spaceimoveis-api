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
    client_email: validatedEmail,
    property_id: validatedPropertyId,
  } });
  if (favorite) return favorite;

  return Favorite.create({ id: uuid(), [`${user.type}_email`]: validatedEmail, property_id: validatedPropertyId });
}

async function getFavorites(clientEmail) {
  const validatedEmail = validateString(clientEmail);

  const user = await find(Favorite, { client_email: clientEmail });

  const favorites = await Favorite.findAll({ where: { [`${user.type}_email`]: validatedEmail } });

  const favoritesIds = favorites.map((favorite) => favorite.property_id);
  return favoritesIds;
}

async function removeFavorite(clientEmail, propertyId) {
  const validatedEmail = validateString(clientEmail);
  const validatedPropertyId = validateString(propertyId);

  return Favorite.destroy({ where: {
    client_email: validatedEmail,
    property_id: validatedPropertyId,
  } });
}

export { setFavorite, getFavorites, removeFavorite };
