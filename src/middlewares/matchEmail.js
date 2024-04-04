import EmailDontMatch from '../errors/emailDontMatch.js';

export default function matchEmail(req, res, next) {
  try {
    const { email } = req.params;

    if (email !== req.email) {
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
