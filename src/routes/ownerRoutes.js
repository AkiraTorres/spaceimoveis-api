import Express from 'express';
import multer from 'multer';

import * as controller from '../controllers/ownerController.js';
import matchEmail from '../middlewares/matchEmail.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /owners:
 *   get:
 *     summary: Retrieve a list of owners
 *     description: Retrieve a list of all owners.
 *     responses:
 *       200:
 *         description: A list of owners.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Owner'
 */
router.get('/', controller.findAll);

/**
 * @swagger
 * /owners/{email}:
 *   get:
 *     summary: Retrieve an owner by email
 *     description: Retrieve an owner by their email address.
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The owner's email address.
 *     responses:
 *       200:
 *         description: An owner object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Owner'
 *       404:
 *         description: Owner not found.
 */
router.get('/:email', controller.findByPk);

/**
 * @swagger
 * /owners:
 *   post:
 *     summary: Create a new owner
 *     description: Create a new owner with the provided data.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Owner'
 *     responses:
 *       201:
 *         description: Owner created successfully.
 *       400:
 *         description: Invalid input.
 */
router.post('/', upload.any(), controller.create);

/**
 * @swagger
 * /owners/{email}:
 *   put:
 *     summary: Update an owner
 *     description: Update an existing owner by their email address.
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The owner's email address.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Owner'
 *     responses:
 *       200:
 *         description: Owner updated successfully.
 *       400:
 *         description: Invalid input.
 *       404:
 *         description: Owner not found.
 */
router.put('/:email', verifyJwt, matchEmail, upload.any(), controller.update);

/**
 * @swagger
 * /owners/elevate/{email}:
 *   put:
 *     summary: Elevate an owner's privileges
 *     description: Elevate an owner's privileges by their email address.
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The owner's email address.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Owner'
 *     responses:
 *       200:
 *         description: Owner's privileges elevated successfully.
 *       400:
 *         description: Invalid input.
 *       404:
 *         description: Owner not found.
 */
router.put('/elevate/:email', verifyGoogleToken, verifyJwt, matchEmail, upload.any(), controller.elevate);

/**
 * @swagger
 * /owners/{email}:
 *   delete:
 *     summary: Delete an owner
 *     description: Delete an owner by their email address.
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The owner's email address.
 *     responses:
 *       200:
 *         description: Owner deleted successfully.
 *       404:
 *         description: Owner not found.
 */
router.delete('/:email', verifyJwt, matchEmail, controller.destroy);

export default router;
