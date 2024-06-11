import Admin from '../db/models/Admin.js';
import EmailDontMatch from '../errors/emailDontMatch.js';

export default async function verifyAdmin(req, res, next) {
  try {
    const { email } = req;

    const admin = await Admin.findByPk(email);
    if (!admin) throw new EmailDontMatch();

    next();
    return true;
  } catch (error) {
    const status = error.status || 401;
    const message = error.message || 'Unauthorized';
    return res.status(status).json(message).end();
  }
}
