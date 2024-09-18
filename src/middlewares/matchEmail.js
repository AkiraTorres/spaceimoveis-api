import ConfigurableError from '../errors/ConfigurableError';

export default function matchEmail(req, res, next) {
  try {
    const { email } = req.params;

    if (email !== req.email) throw new ConfigurableError('Unauthorized', 401);

    next();
    return true;
  } catch (error) {
    const status = error.status || 401;
    const message = error.message || 'Unauthorized';
    return res.status(status).json(message).end();
  }
}
