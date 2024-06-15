import { Op } from 'sequelize';
import Favorite from '../db/models/Favorite.js';
// import Owner from '../db/models/Owner.js';
// import Realtor from '../db/models/Realtor.js';
// import Realstate from '../db/models/Realstate.js';
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
