import Express from 'express';
import * as controller from '../controllers/sellerDashboardController.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

/**
 * @swagger
 * /likes:
 *   get:
 *     summary: Get total properties likes
 *     description: Retrieve the total number of likes for all properties.
 *     tags: [Seller Dashboard]
 *     responses:
 *       200:
 *         description: Successfully retrieved total properties likes.
 *       401:
 *         description: Unauthorized access.
 */
router.get('/likes', verifyGoogleToken, verifyJwt, controller.totalPropertiesLikes);

/**
 * @swagger
 * /views:
 *   get:
 *     summary: Get total properties views
 *     description: Retrieve the total number of views for all properties.
 *     tags: [Seller Dashboard]
 *     responses:
 *       200:
 *         description: Successfully retrieved total properties views.
 *       401:
 *         description: Unauthorized access.
 */
router.get('/views', verifyGoogleToken, verifyJwt, controller.totalPropertiesViews);

/**
 * @swagger
 * /top/properties:
 *   get:
 *     summary: Get top properties
 *     description: Retrieve the top properties based on certain criteria.
 *     tags: [Seller Dashboard]
 *     responses:
 *       200:
 *         description: Successfully retrieved top properties.
 *       401:
 *         description: Unauthorized access.
 */
router.get('/top/properties', verifyGoogleToken, verifyJwt, controller.topProperties);

/**
 * @swagger
 * /properties/data/monthly:
 *   get:
 *     summary: Get monthly properties data
 *     description: Retrieve monthly data for properties.
 *     tags: [Seller Dashboard]
 *     responses:
 *       200:
 *         description: Successfully retrieved monthly properties data.
 *       401:
 *         description: Unauthorized access.
 */
router.get('/properties/data/monthly', verifyGoogleToken, verifyJwt, controller.propertiesData);

/**
 * @swagger
 * /properties/proportions:
 *   get:
 *     summary: Get properties proportions
 *     description: Retrieve the proportions of different properties.
 *     tags: [Seller Dashboard]
 *     responses:
 *       200:
 *         description: Successfully retrieved properties proportions.
 *       401:
 *         description: Unauthorized access.
 */
router.get('/properties/proportions', verifyGoogleToken, verifyJwt, controller.propertiesProportions);

/**
 * @swagger
 * /properties/filter:
 *   put:
 *     summary: Filter properties
 *     description: Apply filters to properties and retrieve the filtered results.
 *     tags: [Seller Dashboard]
 *     responses:
 *       200:
 *         description: Successfully filtered properties.
 *       401:
 *         description: Unauthorized access.
 */
router.put('/properties/filter', verifyGoogleToken, verifyJwt, controller.propertiesFilter);

export default router;
