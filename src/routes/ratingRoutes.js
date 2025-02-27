import Express from 'express';

import * as controller from '../controllers/ratingController.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

/**
 * @swagger
 * /rating/{receiverEmail}:
 *   get:
 *     summary: Get all rates by receiver
 *     description: Retrieve all ratings for a specific receiver by their email.
 *     parameters:
 *       - in: path
 *         name: receiverEmail
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the receiver
 *     responses:
 *       200:
 *         description: A list of ratings
 *       404:
 *         description: Receiver not found
 */
router.get('/:receiverEmail', controller.getAllRatesByReceiver);

/**
 * @swagger
 * /rating/avg/{receiverEmail}:
 *   get:
 *     summary: Get average rate by receiver
 *     description: Retrieve the average rating for a specific receiver by their email.
 *     parameters:
 *       - in: path
 *         name: receiverEmail
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the receiver
 *     responses:
 *       200:
 *         description: The average rating
 *       404:
 *         description: Receiver not found
 */
router.get('/avg/:receiverEmail', controller.getAvgRateByReceiver);

/**
 * @swagger
 * /rating/sender/{senderEmail}:
 *   get:
 *     summary: Get all rates by sender
 *     description: Retrieve all ratings given by a specific sender by their email.
 *     parameters:
 *       - in: path
 *         name: senderEmail
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the sender
 *     responses:
 *       200:
 *         description: A list of ratings
 *       404:
 *         description: Sender not found
 */
router.get('/sender/:senderEmail', controller.getAllRatesBySender);

/**
 * @swagger
 * /rating/filter:
 *   put:
 *     summary: Filter ratings
 *     description: Filter ratings based on specific criteria.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               criteria:
 *                 type: string
 *                 description: The criteria to filter ratings
 *     responses:
 *       200:
 *         description: A list of filtered ratings
 */
router.put('/filter', controller.filter);

/**
 * @swagger
 * /rating:
 *   post:
 *     summary: Set a new rate
 *     description: Create a new rating.
 *     security:
 *       - googleAuth: []
 *       - jwtAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiverEmail:
 *                 type: string
 *                 description: Email of the receiver
 *               senderEmail:
 *                 type: string
 *                 description: Email of the sender
 *               rate:
 *                 type: number
 *                 description: The rating value
 *     responses:
 *       201:
 *         description: Rating created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', verifyGoogleToken, verifyJwt, controller.setRate);

/**
 * @swagger
 * /rating/{id}:
 *   delete:
 *     summary: Delete a rate
 *     description: Delete a rating by its ID.
 *     security:
 *       - googleAuth: []
 *       - jwtAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the rating to delete
 *     responses:
 *       200:
 *         description: Rating deleted successfully
 *       404:
 *         description: Rating not found
 */
router.delete('/:id', verifyGoogleToken, verifyJwt, controller.deleteRate);

export default router;
