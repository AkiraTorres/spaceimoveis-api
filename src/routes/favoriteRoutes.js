import Express from 'express';

import * as controller from '../controllers/favoriteController.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

/**
 * @swagger
 * /total/{id}:
 *   get:
 *     summary: Get total favorites for a property
 *     description: Retrieve the total number of favorites for a specific property by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The property ID
 *     responses:
 *       200:
 *         description: Total favorites retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalFavorites:
 *                   type: integer
 *                   description: The total number of favorites
 *       404:
 *         description: Property not found
 */
router.get('/total/:id', controller.getPropertyTotalFavorites);

/**
 * @swagger
 * /{email}:
 *   get:
 *     summary: Get favorites for a user
 *     description: Retrieve the list of favorite properties for a specific user by their email.
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's email
 *     responses:
 *       200:
 *         description: Favorites retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   propertyId:
 *                     type: string
 *                   propertyName:
 *                     type: string
 *                   propertyLocation:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/:email', verifyGoogleToken, verifyJwt, controller.getFavorites);

/**
 * @swagger
 * /:
 *   post:
 *     summary: Set a favorite for a user
 *     description: Add a property to the list of favorites for a specific user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               propertyId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Favorite set successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', verifyGoogleToken, verifyJwt, controller.setFavorite);

/**
 * @swagger
 * /{email}/{propertyId}:
 *   delete:
 *     summary: Remove a favorite for a user
 *     description: Remove a property from the list of favorites for a specific user.
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's email
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The property ID
 *     responses:
 *       200:
 *         description: Favorite removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Favorite not found
 */
router.delete('/:email/:propertyId', verifyGoogleToken, verifyJwt, controller.removeFavorite);

export default router;
