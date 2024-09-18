import Express from 'express';

import verifyJwt, { blacklist } from '../middlewares/verifyJwt.js';
import * as loginService from '../services/loginService.js';

const router = Express.Router();

router.post('/login', async (req, res) => {
  try {
    res.json(await loginService.login(req.body));
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json(error.message).end();
  }
});

router.post('/google', async (req, res) => {
  try {
    res.json(await loginService.loginGoogle(req.body));
  } catch (error) {
    const status = error.status || error.code || 500;
    const message = error.message || 'Erro ao se conectar com o banco de dados';
    res.status(status).json(message).end();
  }
});

router.post('/login/admin', async (req, res) => {
  try {
    res.json(loginService.loginAdmin(req.body));
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json(error.message).end();
  }
});

router.post('/logout', verifyJwt, (req, res) => {
  blacklist.push(req.headers['x-access-token']);
  res.end();
});

router.post('/refresh', (req, res) => {
  const refreshToken = req.headers['x-refresh-token'];

  try {
    res.json(loginService.refresh({ refreshToken }));
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json(error.message).end();
  }
});

export default router;
