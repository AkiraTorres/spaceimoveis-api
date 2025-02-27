import Express from 'express';
import multer from 'multer';
import * as controller from '../controllers/realtorController.js';
import matchEmail from '../middlewares/matchEmail.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /:
 *   get:
 *     summary: Retrieve a list of all realtors
 *     responses:
 *       200:
 *         description: A list of realtors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Realtor'
 */

/**
 * @swagger
 * /{email}:
 *   get:
 *     summary: Retrieve a realtor by email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The realtor's email
 *     responses:
 *       200:
 *         description: A single realtor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Realtor'
 */

/**
 * @swagger
 * /availability/{email}:
 *   get:
 *     summary: Retrieve availability of a realtor by email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The realtor's email
 *     responses:
 *       200:
 *         description: Availability of the realtor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Availability'
 */

/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new realtor
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Realtor'
 *     responses:
 *       201:
 *         description: The created realtor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Realtor'
 */

/**
 * @swagger
 * /availability:
 *   post:
 *     summary: Set availability for a realtor
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Availability'
 *     responses:
 *       200:
 *         description: Availability set successfully
 */

/**
 * @swagger
 * /appointment/approve/{id}:
 *   post:
 *     summary: Approve an appointment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The appointment ID
 *     responses:
 *       200:
 *         description: Appointment approved successfully
 */

/**
 * @swagger
 * /appointment/reject/{id}:
 *   post:
 *     summary: Reject an appointment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The appointment ID
 *     responses:
 *       200:
 *         description: Appointment rejected successfully
 */

/**
 * @swagger
 * /filter:
 *   put:
 *     summary: Filter realtors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Filter'
 *     responses:
 *       200:
 *         description: Filtered realtors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Realtor'
 */

/**
 * @swagger
 * /{email}:
 *   put:
 *     summary: Update a realtor by email
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The realtor's email
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Realtor'
 *     responses:
 *       200:
 *         description: The updated realtor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Realtor'
 */

/**
 * @swagger
 * /elevate/{email}:
 *   put:
 *     summary: Elevate a realtor's privileges
 *     security:
 *       - bearerAuth: []
 *       - googleAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The realtor's email
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Realtor'
 *     responses:
 *       200:
 *         description: The elevated realtor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Realtor'
 */

/**
 * @swagger
 * /{email}:
 *   delete:
 *     summary: Delete a realtor by email
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The realtor's email
 *     responses:
 *       200:
 *         description: Realtor deleted successfully
 */

router.get('/', controller.findAll);
router.get('/:email', controller.findByPk);
router.get('/availability/:email', controller.getAvailability);
router.post('/', upload.any(), controller.create);
router.post('/availability', verifyJwt, controller.setAvailability);
router.post('/appointment/approve/:id', verifyJwt, controller.approveAppointment);
router.post('/appointment/reject/:id', verifyJwt, controller.rejectAppointment);
router.put('/filter', controller.filter);
router.put('/:email', verifyJwt, matchEmail, upload.any(), controller.update);
router.put('/elevate/:email', verifyGoogleToken, verifyJwt, matchEmail, upload.any(), controller.elevate);
router.delete('/:email', verifyJwt, matchEmail, controller.destroy);

export default router;
