import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const blacklist = [];
const { JWT_SECRET } = process.env;

export default function verifyJwt(req, res, next) {
  try {
    const token = req.headers['x-access-token'];
    const isBlacklisted = blacklist.includes(token);

    if (isBlacklisted) return res.status(401).json({ message: 'Unauthorized' }).end();

    jwt.verify(token, JWT_SECRET);
    req.email = jwt.decode(token).email;
    next();
    return jwt.decode(token);
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' }).end();
  }
}

export function generateJwt(email) {
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: 300 });
  return token;
}

export { blacklist };
