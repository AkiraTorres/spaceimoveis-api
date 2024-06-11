import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Express from 'express';

import verify from '../middlewares/verifyGoogle.cjs';
import verifyJwt, { blacklist, generateJwt } from '../middlewares/verifyJwt.js';
import { findByPk } from '../services/adminService.js';
import { find } from '../services/globalService.js';

dotenv.config();

const router = Express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const error = new Error('Email ou senha incorretos');
    error.status = 404;

    if (email === '' || password === '') throw error;

    const user = await find(email, true);
    if (!user) throw error;

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) throw error;

    const token = generateJwt(email);
    const loggedUser = { user, token };
    res.json(loggedUser);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json(error.message).end();
  }
});

router.post('/google', async (req, res) => {
  try {
    const { googleToken } = req.body;
    const error = new Error('Email ou senha incorretos');
    error.status = 404;
    const { email } = await verify.validateGoogleToken(googleToken).catch();

    if (!email) throw error;

    const user = await find(email, false);
    if (!user) throw error;

    const loggedUser = { user, token: googleToken };
    res.json(loggedUser);
  } catch (error) {
    const status = error.status || error.code || 500;
    const message = error.message || 'Erro ao se conectar com o banco de dados';
    res.status(status).json(message).end();
  }
});

router.post('/login/admin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const error = new Error('Email ou senha incorretos');
    error.status = 404;

    if (email === '' || password === '') throw error;

    const user = await findByPk(email, true);
    if (!user) throw error;

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) throw error;

    const token = generateJwt(email);
    const loggedUser = { user, token };
    res.json(loggedUser);
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json(error.message).end();
  }
});

router.post('/logout', verifyJwt, (req, res) => {
  blacklist.push(req.headers['x-access-token']);
  res.end();
});

export default router;
