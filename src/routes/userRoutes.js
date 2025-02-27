import Express from 'express';
import * as controller from '../controllers/userController.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

/**
 * @swagger
 * /find/{email}:
 *   get:
 *     summary: Find user by email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the user to find
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get('/find/:email', controller.find);

/**
 * @swagger
 * /find:
 *   get:
 *     summary: Find all users
 *     responses:
 *       200:
 *         description: A list of users
 */
router.get('/find', controller.findAll);

/**
 * @swagger
 * /appointments/details/{id}:
 *   get:
 *     summary: Find appointment by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the appointment to find
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointment details
 *       404:
 *         description: Appointment not found
 */
router.get('/appointments/details/:id', verifyJwt, controller.findAppointmentById);

/**
 * @swagger
 * /appointments/{email}:
 *   get:
 *     summary: Find all appointments for a user
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the user to find appointments for
 *     responses:
 *       200:
 *         description: A list of appointments
 */
router.get('/appointments/:email', controller.findAllAppointments);

/**
 * @swagger
 * /sellers:
 *   get:
 *     summary: Get random sellers
 *     responses:
 *       200:
 *         description: A list of random sellers
 */
router.get('/sellers', controller.returnRandomSellers);

/**
 * @swagger
 * /change/password:
 *   post:
 *     summary: Change user password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid request
 */
router.post('/change/password', verifyGoogleToken, verifyJwt, controller.changePassword);

/**
 * @swagger
 * /rescue/password:
 *   post:
 *     summary: Rescue user password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password rescue instructions sent
 *       400:
 *         description: Invalid request
 */
router.post('/rescue/password', controller.rescuePassword);

/**
 * @swagger
 * /reset/password:
 *   post:
 *     summary: Reset user password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid request
 */
router.post('/reset/password', controller.resetPassword);

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Contact support
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid request
 */
router.post('/contact', controller.contact);

export default router;
