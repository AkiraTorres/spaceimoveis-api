import Express from 'express';
import multer from 'multer';

import * as controller from '../controllers/realstateController.js';
import matchEmail from '../middlewares/matchEmail.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /:
 *   get:
 *     summary: Retrieve a list of all real estate entries
 *     responses:
 *       200:
 *         description: A list of real estate entries
 */
router.get('/', controller.findAll);

/**
 * @swagger
 * /{email}:
 *   get:
 *     summary: Retrieve a real estate entry by email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The email of the real estate entry
 *     responses:
 *       200:
 *         description: A real estate entry
 */
router.get('/:email', controller.findByPk);

/**
 * @swagger
 * /availability/{email}:
 *   get:
 *     summary: Retrieve availability of a real estate entry by email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The email of the real estate entry
 *     responses:
 *       200:
 *         description: Availability of the real estate entry
 */
router.get('/availability/:email', controller.getAvailability);

/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new real estate entry
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: The created real estate entry
 */
router.post('/', upload.any(), controller.create);

/**
 * @swagger
 * /availability:
 *   post:
 *     summary: Set availability for a real estate entry
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               availability:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Availability set successfully
 */
router.post('/availability', verifyJwt, controller.setAvailability);

/**
 * @swagger
 * /appointment/approve/{id}:
 *   post:
 *     summary: Approve an appointment by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the appointment
 *     responses:
 *       200:
 *         description: Appointment approved successfully
 */
router.post('/appointment/approve/:id', verifyJwt, controller.approveAppointment);

/**
 * @swagger
 * /appointment/reject/{id}:
 *   post:
 *     summary: Reject an appointment by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the appointment
 *     responses:
 *       200:
 *         description: Appointment rejected successfully
 */
router.post('/appointment/reject/:id', verifyJwt, controller.rejectAppointment);

/**
 * @swagger
 * /filter:
 *   put:
 *     summary: Filter real estate entries
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filter:
 *                 type: object
 *     responses:
 *       200:
 *         description: Filtered real estate entries
 */
router.put('/filter', controller.filter);

/**
 * @swagger
 * /{email}:
 *   put:
 *     summary: Update a real estate entry by email
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The email of the real estate entry
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: The updated real estate entry
 */
router.put('/:email', verifyJwt, matchEmail, upload.any(), controller.update);

/**
 * @swagger
 * /elevate/{email}:
 *   put:
 *     summary: Elevate a real estate entry by email
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The email of the real estate entry
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: The elevated real estate entry
 */
router.put('/elevate/:email', verifyGoogleToken, verifyJwt, matchEmail, upload.any(), controller.elevate);

/**
 * @swagger
 * /{email}:
 *   delete:
 *     summary: Delete a real estate entry by email
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The email of the real estate entry
 *     responses:
 *       200:
 *         description: The deleted real estate entry
 */
router.delete('/:email', verifyJwt, matchEmail, controller.destroy);

export default router;
