import prisma from '../config/prisma.js';
import ConfigurableError from '../errors/ConfigurableError.js';
import { validateEmail } from '../validators/inputValidators.js';
import PropertyService from './propertyService.js';
import UserService from './userService.js';

export default class SellerDashboardService {
  static async totalPropertiesLikes(email) {
    const validatedEmail = validateEmail(email);

    const user = await UserService.find({ email: validatedEmail });
    if (!user) throw new ConfigurableError('Usuário não encontrado com o email informado', 404);

    const ids = await prisma.property.findMany({ where: { advertiserEmail: validatedEmail }, select: { id: true } });

    const propertiesIds = ids.map((id) => id.id);
    const total = await prisma.favorite.count({ where: { propertyId: { in: propertiesIds } } });

    return { total };
  }

  static async totalPropertiesViews(email) {
    const validatedEmail = validateEmail(email);

    const user = await UserService.find({ email: validatedEmail });
    if (!user) throw new ConfigurableError('Usuário não encontrado com o email informado', 404);

    const total = await prisma.property.findMany({ where: { advertiserEmail: validatedEmail }, select: { id: true, timesSeen: true } })
      .then((properties) => properties.reduce((acc, property) => acc + property.timesSeen, 0));

    return { total };
  }

  static async propertiesData(email) {
    const validatedEmail = validateEmail(email);
    const now = new Date();
    const beginYear = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const user = await UserService.find({ email: validatedEmail });
    if (!user) throw new ConfigurableError('Usuário não encontrado com o email informado', 404);

    const properties = await prisma.property.findMany({
      where: { createdAt: { gte: beginYear, lte: now }, advertiserEmail: email },
      select: { id: true, createdAt: true },
    });

    const propertiesIds = properties.map((property) => property.id);

    const months = await Promise.all(
      Array.from({ length: 12 }, async (_, i) => {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        const nextMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1);

        const views = await prisma.visualization.count({
          where: {
            propertyId: { in: propertiesIds },
            createdAt: { gte: targetDate, lt: nextMonth },
          },
        });

        return { month: targetDate.getMonth(), year: targetDate.getFullYear(), views };
      }),
    );

    return Promise.all(
      months.map(async (month) => {
        const start = new Date(month.year, month.month, 1);
        const end = new Date(month.year, month.month + 1, 1);

        const likes = await prisma.favorite.count({
          where: {
            propertyId: { in: propertiesIds },
            createdAt: { gte: start, lt: end },
          },
        });

        return { ...month, likes };
      }),
    );
  }

  static async topProperties(email) {
    const validatedEmail = validateEmail(email);

    const user = await UserService.find({ email: validatedEmail });
    if (!user) throw new ConfigurableError('Usuário não encontrado com o email informado', 404);

    const properties = await prisma.property.findMany({ where: { advertiserEmail: validatedEmail } });

    const sorted = properties.sort((a, b) => b.timesSeen - a.timesSeen);

    return Promise.all(sorted.slice(0, 5).map(async (property) => PropertyService.getPropertyDetails(property.id)));
  }

  static async propertiesProportions(email) {
    const validatedEmail = validateEmail(email);

    const user = await UserService.find({ email: validatedEmail });
    if (!user) throw new ConfigurableError('Usuário não encontrado com o email informado', 404);

    const properties = await prisma.property.findMany({ where: { advertiserEmail: validatedEmail } });

    const total = properties.length;
    const house = properties.filter((property) => property.propertyType === 'house').length;
    const apartment = properties.filter((property) => property.propertyType === 'apartment').length;
    const land = properties.filter((property) => property.propertyType === 'land').length;
    const farm = properties.filter((property) => property.propertyType === 'farm').length;

    return { total, house, apartment, land, farm };
  }
}
