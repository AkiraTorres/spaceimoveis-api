import { v4 as uuid } from 'uuid';
import prisma from '../config/prisma.js';

import ConfigurableError from '../errors/ConfigurableError.js';
import { validateString } from '../validators/inputValidators.js';
import UserService from './userService.js';

export default class FavoriteService {
  static async setFavorite(clientEmail, propertyId) {
    const validatedEmail = validateString(clientEmail);
    const validatedPropertyId = validateString(propertyId);

    const user = await UserService.find(validatedEmail);
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const favorite = await prisma.favorite.findFirst({ where: { userEmail: validatedEmail, propertyId: validatedPropertyId } });
    if (favorite) throw new ConfigurableError('Imóvel já favoritado', 409);

    return prisma.favorite.create({ id: uuid(), userEmail: validatedEmail, propertyId: validatedPropertyId });
  }

  static async getFavorites(clientEmail) {
    const validatedEmail = validateString(clientEmail);

    const user = await UserService.find(validatedEmail);
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const favorites = await prisma.favorite.findMany({ where: { userEmail: validatedEmail } });

    const favoritesIds = favorites.map((favorite) => favorite.propertyId);
    return favoritesIds;
  }

  static async getPropertyTotalFavorites(propertyId) {
    return prisma.favorite.count({ where: { propertyId: validateString(propertyId) } });
  }

  static async removeFavorite(clientEmail, propertyId) {
    const validatedEmail = validateString(clientEmail);
    const validatedPropertyId = validateString(propertyId);

    const user = await UserService.find(validatedEmail);
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const destroyed = await prisma.favorite.delete({ where: { userEmail: validatedEmail, propertyId: validatedPropertyId } });

    if (!destroyed) throw new ConfigurableError('Imóvel não encontrado', 404);

    return destroyed;
  }
}
