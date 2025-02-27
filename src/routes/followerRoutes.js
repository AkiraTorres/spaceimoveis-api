import Express from 'express';

import * as followerController from '../controllers/followerController.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

/**
 * @swagger
 * /following/{email}:
 *   get:
 *     summary: Get the list of users that the specified user is following
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The email of the user
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     example: user@example.com
 *                   name:
 *                     type: string
 *                     example: John Doe
 */
router.get('/following/:email', followerController.getFollowing);

/**
 * @swagger
 * /followers/{email}:
 *   get:
 *     summary: Get the list of users that are following the specified user
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The email of the user
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     example: user@example.com
 *                   name:
 *                     type: string
 *                     example: John Doe
 */
router.get('/followers/:email', followerController.getFollowers);

/**
 * @swagger
 * /following/{email}/count:
 *   get:
 *     summary: Get the total number of users that the specified user is following
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The email of the user
 *     responses:
 *       200:
 *         description: The total number of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 42
 */
router.get('/following/:email/count', followerController.getTotalFollowing);

/**
 * @swagger
 * /followers/{email}/count:
 *   get:
 *     summary: Get the total number of users that are following the specified user
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The email of the user
 *     responses:
 *       200:
 *         description: The total number of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 42
 */
router.get('/followers/:email/count', followerController.getTotalFollowers);

/**
 * @swagger
 * /{targetEmail}/:
 *   get:
 *     summary: Check if the authenticated user is following the specified user
 *     parameters:
 *       - in: path
 *         name: targetEmail
 *         required: true
 *         schema:
 *           type: string
 *         description: The email of the target user
 *     responses:
 *       200:
 *         description: Following status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isFollowing:
 *                   type: boolean
 *                   example: true
 */
router.get('/:targetEmail/', followerController.isFollowing);

/**
 * @swagger
 * /mutual/{targetEmail}:
 *   get:
 *     summary: Check if the authenticated user and the specified user are following each other
 *     parameters:
 *       - in: path
 *         name: targetEmail
 *         required: true
 *         schema:
 *           type: string
 *         description: The email of the target user
 *     responses:
 *       200:
 *         description: Mutual following status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isMutual:
 *                   type: boolean
 *                   example: true
 */
router.get('/mutual/:targetEmail', followerController.isMutual);

/**
 * @swagger
 * /{followedEmail}:
 *   post:
 *     summary: Follow the specified user
 *     parameters:
 *       - in: path
 *         name: followedEmail
 *         required: true
 *         schema:
 *           type: string
 *         description: The email of the user to follow
 *     responses:
 *       200:
 *         description: Followed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Followed successfully
 *     security:
 *       - googleAuth: []
 *       - jwtAuth: []
 */
router.post('/:followedEmail', verifyGoogleToken, verifyJwt, followerController.follow);

/**
 * @swagger
 * /{followedEmail}:
 *   delete:
 *     summary: Unfollow the specified user
 *     parameters:
 *       - in: path
 *         name: followedEmail
 *         required: true
 *         schema:
 *           type: string
 *         description: The email of the user to unfollow
 *     responses:
 *       200:
 *         description: Unfollowed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unfollowed successfully
 *     security:
 *       - googleAuth: []
 *       - jwtAuth: []
 */
router.delete('/:followedEmail', verifyGoogleToken, verifyJwt, followerController.unfollow);

export default router;
