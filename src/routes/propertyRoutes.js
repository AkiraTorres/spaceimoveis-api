import Express from 'express';
import multer from 'multer';

import * as controller from '../controllers/propertyController.js';
import matchSellerEmail from '../middlewares/matchSellerEmail.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /:
 *   get:
 *     summary: Retrieve a list of all properties
 *     responses:
 *       200:
 *         description: A list of properties
 */

/**
 * @swagger
 * /recommended:
 *   get:
 *     summary: Retrieve a list of recommended properties
 *     responses:
 *       200:
 *         description: A list of recommended properties
 */

/**
 * @swagger
 * /seller/{email}:
 *   get:
 *     summary: Retrieve properties by seller email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller's email
 *     responses:
 *       200:
 *         description: A list of properties by seller email
 */

/**
 * @swagger
 * /get/ids:
 *   get:
 *     summary: Retrieve all property IDs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of property IDs
 */

/**
 * @swagger
 * /get/cities:
 *   get:
 *     summary: Retrieve all property cities
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of property cities
 */

/**
 * @swagger
 * /limits:
 *   get:
 *     summary: Check property limits
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Property limits
 */

/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Retrieve a property by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: A property
 */

/**
 * @swagger
 * /filter:
 *   put:
 *     summary: Filter properties
 *     responses:
 *       200:
 *         description: Filtered properties
 */

/**
 * @swagger
 * /highlight/{id}:
 *   put:
 *     summary: Highlight a property
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property highlighted
 */

/**
 * @swagger
 * /publish/{id}:
 *   put:
 *     summary: Publish a property
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property published
 */

/**
 * @swagger
 * /unpublish/{id}:
 *   put:
 *     summary: Unpublish a property
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property unpublished
 */

/**
 * @swagger
 * /times-seen/{id}:
 *   get:
 *     summary: Get times a property has been seen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Times seen
 */

/**
 * @swagger
 * /times-seen/monthly/{id}:
 *   get:
 *     summary: Get times a property has been seen monthly
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Monthly times seen
 */

/**
 * @swagger
 * /most-seen/{email}:
 *   get:
 *     summary: Get most seen properties by seller email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller's email
 *     responses:
 *       200:
 *         description: Most seen properties by seller
 */

/**
 * @swagger
 * /times-seen/{id}:
 *   post:
 *     summary: Add times seen for a property
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Times seen added
 */

/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new property
 *     security:
 *       - bearerAuth: []
 *     requestBody:
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
 *         description: Property created
 */

/**
 * @swagger
 * /{id}:
 *   put:
 *     summary: Update a property
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     requestBody:
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
 *         description: Property updated
 */

/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete a property
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property deleted
 */

/**
 * @swagger
 * /share/{id}:
 *   put:
 *     summary: Share a property
 *     security:
 *       - bearerAuth: []
 *       - googleAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property shared
 */

/**
 * @swagger
 * /shared/find/{id}:
 *   get:
 *     summary: Get shared properties by ID
 *     security:
 *       - bearerAuth: []
 *       - googleAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Shared properties
 */

/**
 * @swagger
 * /shared/find/:
 *   get:
 *     summary: Get all shared properties
 *     security:
 *       - bearerAuth: []
 *       - googleAuth: []
 *     responses:
 *       200:
 *         description: Shared properties
 */

/**
 * @swagger
 * /share/confirm/{id}:
 *   post:
 *     summary: Confirm shared property
 *     security:
 *       - bearerAuth: []
 *       - googleAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Shared property confirmed
 */

/**
 * @swagger
 * /share/negate/{id}:
 *   post:
 *     summary: Negate shared property
 *     security:
 *       - bearerAuth: []
 *       - googleAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Shared property negated
 */

router.get('/', controller.findAll);
router.get('/recommended', controller.recommendedProperties);
router.get('/seller/:email', controller.findBySellerEmail);
router.get('/get/ids', verifyJwt, controller.getAllPropertiesIds);
router.get('/get/cities', verifyJwt, controller.getAllPropertiesCities);
router.get('/limits', verifyJwt, controller.checkLimits);
router.get('/:id', controller.findByPk);
router.put('/filter', controller.filter);

router.put('/highlight/:id', verifyJwt, matchSellerEmail, controller.highlightProperty);
router.put('/publish/:id', verifyJwt, matchSellerEmail, controller.publishProperty);
router.put('/unpublish/:id', verifyJwt, matchSellerEmail, controller.unpublishProperty);

router.get('/times-seen/:id', controller.getTimesSeen);
router.get('/times-seen/monthly/:id', controller.getTimesSeenByMonth);
router.get('/most-seen/:email', controller.getMostSeenPropertiesBySeller);
router.post('/times-seen/:id', controller.addTimesSeen);

router.post('/', verifyJwt, upload.any(), controller.create);
router.put('/:id', verifyJwt, matchSellerEmail, upload.any(), controller.update);
router.delete('/:id', verifyJwt, matchSellerEmail, controller.destroy);

router.put('/share/:id', verifyGoogleToken, verifyJwt, controller.shareProperty);
router.get('/shared/find/:id', verifyGoogleToken, verifyJwt, controller.getSharedProperties);
router.get('/shared/find/', verifyGoogleToken, verifyJwt, controller.getSharedProperties);
router.post('/share/confirm/:id', verifyGoogleToken, verifyJwt, controller.confirmSharedProperty);
router.post('/share/negate/:id', verifyGoogleToken, verifyJwt, controller.negateSharedProperty);

export default router;
