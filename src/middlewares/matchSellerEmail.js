import prisma from '../config/prisma.js';
import ConfigurableError from '../errors/ConfigurableError.js';
import { validateString } from '../validators/inputValidators.js';

export default async function matchEmail(req, res, next) {
  try {
    const { id } = req.params;

    const property = await prisma.property.findFirst({ where: { id: validateString(id, 'O id da propriedade não foi informado') } });

    if (!property) throw new ConfigurableError('Unauthorized', 401);

    if (property.advertiserEmail !== req.email) throw new ConfigurableError('Unauthorized', 401);

    next();
    return true;
  } catch (error) {
    const status = error.status || 401;
    const message = error.message || 'Unauthorized';
    return res.status(status).json(message).end();
  }
}
