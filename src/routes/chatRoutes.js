import Express from 'express';

import * as chatController from '../controllers/chatController.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Chat:
 *       type: object
 *       required:
 *         - id
 *         - participants
 *         - messages
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the chat
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           description: The emails of the participants in the chat
 *         messages:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               sender:
 *                 type: string
 *                 description: The email of the sender
 *               content:
 *                 type: string
 *                 description: The content of the message
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: The time the message was sent
 *       example:
 *         id: d5fE_asz
 *         participants: [ "user1@example.com", "user2@example.com" ]
 *         messages:
 *           - sender: "user1@example.com"
 *             content: "Hello!"
 *             timestamp: "2023-10-01T12:34:56Z"
 */

/**
 * @swagger
 * /chat/{targetEmail}:
 *   post:
 *     summary: Create a new chat
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: targetEmail
 *         schema:
 *           type: string
 *         required: true
 *         description: The target user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The initial message to send
 *             example:
 *               message: "Hello!"
 *     responses:
 *       200:
 *         description: Chat created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/:targetEmail', verifyGoogleToken, verifyJwt, chatController.createChat);

/**
 * @swagger
 * /chat:
 *   get:
 *     summary: Get all user chats
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: A list of user chats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chat'
 *       401:
 *         description: Unauthorized
 */
router.get('/', verifyGoogleToken, verifyJwt, chatController.findUserChats);

/**
 * @swagger
 * /chat/{targetEmail}:
 *   get:
 *     summary: Get a specific chat by target email
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: targetEmail
 *         schema:
 *           type: string
 *         required: true
 *         description: The target user's email
 *     responses:
 *       200:
 *         description: Chat found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found
 */
router.get('/:targetEmail', verifyGoogleToken, verifyJwt, chatController.findChat);

export default router;
