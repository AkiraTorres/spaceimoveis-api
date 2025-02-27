import Express from 'express';

import * as messageController from '../controllers/messageController.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

/**
 * @swagger
 * /:chatId:
 *   post:
 *     summary: Create a new message
 *     description: Creates a new message in the specified chat.
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         description: ID of the chat to create a message in.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: The content of the message.
 *     responses:
 *       201:
 *         description: Message created successfully.
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.post('/:chatId', verifyGoogleToken, verifyJwt, messageController.createMessage);

/**
 * @swagger
 * /:chatId:
 *   get:
 *     summary: Get messages
 *     description: Retrieves messages from the specified chat.
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         description: ID of the chat to retrieve messages from.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages retrieved successfully.
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.get('/:chatId', verifyGoogleToken, verifyJwt, messageController.findMessages);

/**
 * @swagger
 * /:id:
 *   delete:
 *     summary: Delete a message
 *     description: Deletes a message with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the message to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted successfully.
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.delete('/:id', verifyGoogleToken, verifyJwt, messageController.deleteMessage);

export default router;
