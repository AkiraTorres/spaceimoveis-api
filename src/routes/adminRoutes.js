import Express from 'express';
import multer from 'multer';

import * as controller from '../controllers/adminController.js';
import verifyAdmin from '../middlewares/verifyAdmin.js';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Retrieve all admins
 *     security:
 *       - jwtAuth: []
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: A list of admins
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', verifyJwt, verifyAdmin, controller.findAll);

/**
 * @swagger
 * /admin/contact:
 *   get:
 *     summary: Retrieve all contact messages
 *     security:
 *       - jwtAuth: []
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: A list of contact messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ContactMessage'
 */
router.get('/contact', verifyJwt, verifyAdmin, controller.getContactMessages);

/**
 * @swagger
 * /admin/{email}:
 *   get:
 *     summary: Retrieve an admin by email
 *     security:
 *       - jwtAuth: []
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The admin email
 *     responses:
 *       200:
 *         description: An admin object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/:email', verifyJwt, verifyAdmin, controller.findByPk);

/**
 * @swagger
 * /admin/cpf/{cpf}:
 *   get:
 *     summary: Retrieve an admin by CPF
 *     security:
 *       - jwtAuth: []
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: cpf
 *         required: true
 *         schema:
 *           type: string
 *         description: The admin CPF
 *     responses:
 *       200:
 *         description: An admin object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/cpf/:cpf', verifyJwt, verifyAdmin, controller.findByCpf);

/**
 * @swagger
 * /admin/properties/new:
 *   get:
 *     summary: Retrieve the last published properties
 *     security:
 *       - jwtAuth: []
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: A list of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 */
router.get('/properties/new', verifyJwt, verifyAdmin, controller.getLastPublishedProperties);

/**
 * @swagger
 * /admin/users/new:
 *   get:
 *     summary: Retrieve the last registered users
 *     security:
 *       - jwtAuth: []
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/users/new', verifyJwt, verifyAdmin, controller.getLastRegisteredUsers);

/**
 * @swagger
 * /admin/users/monthly:
 *   get:
 *     summary: Retrieve users registered monthly
 *     security:
 *       - jwtAuth: []
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: A list of users registered monthly
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/users/monthly', verifyJwt, verifyAdmin, controller.usersRegisteredMonthly);

/**
 * @swagger
 * /admin/properties/monthly:
 *   get:
 *     summary: Retrieve properties registered monthly
 *     security:
 *       - jwtAuth: []
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: A list of properties registered monthly
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 */
router.get('/properties/monthly', verifyJwt, verifyAdmin, controller.propertiesRegisteredMonthly);

/**
 * @swagger
 * /admin:
 *   post:
 *     summary: Create a new admin
 *     security:
 *       - jwtAuth: []
 *     tags: [Admin]
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: The created admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.post('/', verifyJwt, verifyAdmin, upload.single('photo'), controller.create);

/**
 * @swagger
 * /admin/property/approve/{id}:
 *   post:
 *     summary: Approve a property
 *     security:
 *       - jwtAuth: []
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The property ID
 *     responses:
 *       200:
 *         description: The approved property
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 */
router.post('/property/approve/:id', verifyJwt, verifyAdmin, controller.approveProperty);

/**
 * @swagger
 * /admin/property/deny/{id}:
 *   post:
 *     summary: Deny a property
 *     security:
 *       - jwtAuth: []
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The property ID
 *     responses:
 *       200:
 *         description: The denied property
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 */
router.post('/property/deny/:id', verifyJwt, verifyAdmin, controller.denyProperty);

/**
 * @swagger
 * /admin/users/deny/{email}:
 *   post:
 *     summary: Deny a user
 *     security:
 *       - jwtAuth: []
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The user email
 *     responses:
 *       200:
 *         description: The denied user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.post('/users/deny/:email', verifyJwt, verifyAdmin, controller.denyUser);

/**
 * @swagger
 * /admin/contact/{id}:
 *   post:
 *     summary: Answer a contact message
 *     security:
 *       - jwtAuth: []
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The contact message ID
 *     responses:
 *       200:
 *         description: The answered contact message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContactMessage'
 */
router.post('/contact/:id', verifyJwt, verifyAdmin, controller.answerContactMessage);

/**
 * @swagger
 * /admin/properties/filter:
 *   put:
 *     summary: Filter properties
 *     security:
 *       - jwtAuth: []
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filterCriteria:
 *                 type: object
 *     responses:
 *       200:
 *         description: The filtered properties
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 */
router.put('/properties/filter', verifyJwt, verifyAdmin, controller.filterProperties);

/**
 * @swagger
 * /admin/users/filter:
 *   put:
 *     summary: Filter users
 *     security:
 *       - jwtAuth: []
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filterCriteria:
 *                 type: object
 *     responses:
 *       200:
 *         description: The filtered users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.put('/users/filter', verifyJwt, verifyAdmin, controller.filterUsers);

/**
 * @swagger
 * /admin/{email}:
 *   put:
 *     summary: Update an admin
 *     security:
 *       - jwtAuth: []
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The admin email
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
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.put('/:email', verifyJwt, verifyAdmin, upload.single('photo'), controller.update);

/**
 * @swagger
 * /admin/{email}:
 *   delete:
 *     summary: Delete an admin
 *     security:
 *       - jwtAuth: []
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The admin email
 *     responses:
 *       200:
 *         description: The deleted admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.delete('/:email', verifyJwt, verifyAdmin, controller.destroy);

export default router;
