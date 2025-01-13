import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const blacklist = [];
const { JWT_SECRET } = process.env;

export default function verifyJwt(req, res, next) {
  if (req.email) return next();

  try {
    const accessToken = req.headers['x-access-token'];
    const refreshToken = req.headers['x-refresh-token'];

    if (!accessToken && !refreshToken) return res.status(401).json({ message: 'Token not provided' }).end();
    const isBlacklisted = blacklist.includes(accessToken);

    if (isBlacklisted) return res.status(401).json({ message: 'Unauthorized' }).end();

    jwt.verify(accessToken, JWT_SECRET);

    req.email = jwt.decode(accessToken).email;
    next();
    return jwt.decode(accessToken);
  } catch (error) {
    next(error);
    return res.status(error.status).json(error.message).end();
  }
}

export { blacklist };
