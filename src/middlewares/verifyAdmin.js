import Admin from '../db/models/Admin.js';

export default async function verifyAdmin(req, res, next) {
  try {
    const { email } = req;

    const admin = await Admin.findByPk(email);
    if (!admin) {
      const error = new Error('O e-mail informado não pertence a um administrador');
      error.status = 401;
      throw error;
    }

    next();
    return true;
  } catch (error) {
    const status = error.status || 401;
    const message = error.message || 'Unauthorized';
    return res.status(status).json(message).end();
  }
}
