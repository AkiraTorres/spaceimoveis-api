import Express from 'express';
import multer from 'multer';

import * as controller from '../controllers/clientController.js';
import matchEmail from '../middlewares/matchEmail.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Client management and retrieval
 */

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Retrieve a list of clients
 *     tags: [Clients]
 *     responses:
 *       200:
 *         description: A list of clients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Client'
 */
router.get('/', controller.findAll);

/**
 * @swagger
 * /clients/{email}:
 *   get:
 *     summary: Retrieve a single client by email
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The client's email
 *     responses:
 *       200:
 *         description: A single client
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 */
router.get('/:email', controller.find);

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Create a new client
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Client created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 */
router.post('/', upload.any(), controller.create);

/**
 * @swagger
 * /clients/appointment:
 *   post:
 *     summary: Make an appointment
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Appointment made
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 */
router.post('/appointment', verifyJwt, controller.MakeAnAppointment);

/**
 * @swagger
 * /clients/{email}:
 *   put:
 *     summary: Update a client by email
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The client's email
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Client updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 */
router.put('/:email', verifyGoogleToken, verifyJwt, upload.any(), matchEmail, controller.update);

/**
 * @swagger
 * /clients/{email}/elevate:
 *   put:
 *     summary: Elevate a client by email
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The client's email
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Client elevated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 */
router.put('/:email/elevate', verifyGoogleToken, verifyJwt, matchEmail, controller.elevate);

/**
 * @swagger
 * /clients/{email}:
 *   delete:
 *     summary: Delete a client by email
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The client's email
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Client deleted
 */
router.delete('/:email', verifyGoogleToken, verifyJwt, matchEmail, controller.destroy);

export default router;
