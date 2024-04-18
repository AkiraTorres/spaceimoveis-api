import Property from '../db/models/Property.js';
import EmailDontMatch from '../errors/emailDontMatch.js';
import PropertyNotFound from '../errors/propertyErrors/properyNotFound.js';

export default async function matchEmail(req, res, next) {
  try {
    const { id } = req.params;

    const property = await Property.findByPk(id);

    if (!property) {
      throw new PropertyNotFound();
    }

    if (
      property.owner_email !== req.email
      || property.realtor_email !== req.email
      || property.realstate_email !== req.email) {
      throw new EmailDontMatch();
    }

    next();
    return true;
  } catch (error) {
    const status = error.status || 401;
    const message = error.message || 'Unauthorized';
    return res.status(status).json(message).end();
  }
}
