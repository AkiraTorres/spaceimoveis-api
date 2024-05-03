import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const blacklist = [];
const { JWT_SECRET } = process.env;

export default function verifyJwt(req, res, next) {
  if (req.email) return next();

  try {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(401).json({ message: 'Token not provided' }).end();
    const isBlacklisted = blacklist.includes(token);

    if (isBlacklisted) return res.status(401).json({ message: 'Unauthorized' }).end();

    jwt.verify(token, JWT_SECRET);
    req.email = jwt.decode(token).email;
    next();
    return jwt.decode(token);
  } catch (error) {
    const status = error.status || error.code || 500;
    const message = error.message || 'Erro ao se conectar com o banco de dados';
    return res.status(status).json(message).end();
  }
}

export function generateJwt(email) {
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '336h' });
  return token;
}

export { blacklist };
