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
      select: { id: true, createdAt: true, timesSeen: true },
    });

    const propertiesIds = properties.map((property) => property.id);
    const months = [];

    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1);
      const month = properties.filter(
        (property) => property.createdAt >= targetDate && property.createdAt < nextMonth,
      );

      const views = month.reduce((acc, property) => acc + property.timesSeen, 0);
      months.push({ month: targetDate.getMonth(), year: targetDate.getFullYear(), views });
    }

    return Promise.all(months.map(async (month) => {
      const start = new Date(month.year, month.month, 1);
      const end = new Date(month.year, month.month + 1, 1);

      const likes = await prisma.favorite.count({
        where: {
          propertyId: { in: propertiesIds },
          createdAt: { gte: start, lt: end },
        },
      });

      return { ...month, likes };
    }));
  }

  static async propertiesLikesMonthly(email) {
    const dataset = await this.propertiesData(email);

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

  static async propertiesViewsMonthly(email) {
    const dataset = await this.propertiesData(email);

    console.log(dataset);

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
