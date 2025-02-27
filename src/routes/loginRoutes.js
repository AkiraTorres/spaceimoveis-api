import Express from 'express';

import verifyJwt, { blacklist } from '../middlewares/verifyJwt.js';
import * as loginService from '../services/loginService.js';

const router = Express.Router();

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       500:
 *         description: Internal server error
 */
router.post('/login', async (req, res) => {
  try {
    res.json(await loginService.login(req.body));
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json(error.message).end();
  }
});

/**
 * @swagger
 * /google:
 *   post:
 *     summary: Google login
 *     description: Authenticate user with Google account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       500:
 *         description: Internal server error
 */
router.post('/google', async (req, res) => {
  try {
    res.json(await loginService.loginGoogle(req.body));
  } catch (error) {
    const status = error.status || error.code || 500;
    const message = error.message || 'Erro ao se conectar com o banco de dados';
    res.status(status).json(message).end();
  }
});

/**
 * @swagger
 * /login/admin:
 *   post:
 *     summary: Admin login
 *     description: Authenticate admin user with email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       500:
 *         description: Internal server error
 */
router.post('/login/admin', async (req, res) => {
  try {
    res.json(await loginService.loginAdmin(req.body));
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json(error.message).end();
  }
});

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: User logout
 *     description: Logout user and blacklist the token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful logout
 */
router.post('/logout', verifyJwt, (req, res) => {
  blacklist.push(req.headers['x-access-token']);
  res.end();
});

/**
 * @swagger
 * /refresh:
 *   post:
 *     summary: Refresh token
 *     description: Refresh the authentication token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful token refresh
 *       500:
 *         description: Internal server error
 */
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
