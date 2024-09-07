import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import verify from '../middlewares/verifyGoogle.cjs';
import { findByPk } from './adminService.js';
import { find } from './globalService.js';

dotenv.config();
const { JWT_SECRET } = process.env;

export async function login({ email, password }) {
  const error = new Error('Email ou senha incorretos');
  error.status = 404;

  if (email === '' || password === '') throw error;

  const user = await find(email, true);
  if (!user) throw error;

  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) throw error;

  const accessToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '21d' });

  const loggedUser = { user, accessToken, refreshToken };
  return loggedUser;
}

export async function loginGoogle({ googleToken }) {
  const error = new Error('Email ou senha incorretos');
  error.status = 404;

  const { email } = await verify.validateGoogleToken(googleToken).catch();

  if (!email) throw error;

  const user = await find(email, false);
  if (!user) throw error;

  return { user, token: googleToken };
}

export async function loginAdmin({ email, password }) {
  const error = new Error('Email ou senha incorretos');
  error.status = 404;

  if (email === '' || password === '') throw error;

  const user = await findByPk(email, true);
  if (!user) throw error;

  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) throw error;

  const accessToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '21d' });

  return { user, accessToken, refreshToken };
}

export function refresh({ refreshToken }) {
  if (!refreshToken) throw new Error('Token not provided', 401);

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const accessToken = jwt.sign({ email: decoded.email }, JWT_SECRET, { expiresIn: '1h' });

    return { accessToken };
  } catch (error) {
    throw new Error('Token invalid', 401);
  }
}
