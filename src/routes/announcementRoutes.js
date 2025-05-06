import Express from 'express';
import multer from 'multer';

import * as controller from '../controllers/announcementController.js';
import verifyAdmin from '../middlewares/verifyAdmin.js';
import verifyJwt, { verifyIfLogged } from '../middlewares/verifyJwt.js';

const router = Express.Router();

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /valid:
 *   get:
 *     summary: Get valid announcements
 *     description: Retrieve a list of all valid announcements.
 *     responses:
 *       200:
 *         description: A list of valid announcements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Announcement'
 */
router.get('/valid', controller.getValidAnnouncements);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all announcements
 *     description: Retrieve a list of all announcements. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of announcements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Announcement'
 */
router.get('/', verifyJwt, verifyAdmin, controller.getAnnouncements);

/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Get an announcement by ID
 *     description: Retrieve a specific announcement by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: An announcement object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 */
router.get('/:id', controller.getAnnouncement);

/**
 * @swagger
 * /view/{id}:
 *   put:
 *     summary: Add a visualization to an announcement
 *     description: Increment the view count of a specific announcement by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: View added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 views:
 *                   type: integer
 *                   description: The updated number of views
 */
router.put('/view/:id', controller.addViewAnnouncement);

/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new announcement
 *     description: Create a new announcement. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *               announcerName:
 *                 type: string
 *               announcerEmail:
 *                 type: string
 *               announcerCpf:
 *                 type: string
 *               siteUrl:
 *                 type: string
 *               type:
 *                 type: string
 *               pending:
 *                 type: boolean
 *               transactionAmount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Announcement created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 */
router.post('/', verifyIfLogged, upload.single('photo'), controller.createAnnouncement);

router.get('/user/:email', verifyJwt, controller.getUserAnnouncements);
router.post('/payment', verifyJwt, verifyAdmin, controller.generatePayment);
router.post('/approve/:id', verifyJwt, verifyAdmin, controller.approveAnnouncement);
router.post('/deny/:id', verifyJwt, verifyAdmin, controller.denyAnnouncement);

/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete an announcement by ID
 *     description: Delete a specific announcement by its ID. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Announcement deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 */
router.delete('/:id', verifyJwt, controller.deleteAnnouncement);

/**
 * @swagger
 * /payment/webhook:
 *   post:
 *     summary: Handle payment webhook
 *     description: Handle payment notifications from the payment provider.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook handled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 */
router.post('/payment/webhook', controller.handlePayment);

export default router;
