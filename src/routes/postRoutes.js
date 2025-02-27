import Express from 'express';
import multer from 'multer';

import * as controller from '../controllers/postController.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /posts/{email}:
 *   get:
 *     summary: Get posts by user email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's email
 *     responses:
 *       200:
 *         description: A list of posts
 *       404:
 *         description: User not found
 */
router.get('/:email', controller.getPostsByUserEmail);

/**
 * @swagger
 * /posts/id/{id}:
 *   get:
 *     summary: Get post by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: A post object
 *       404:
 *         description: Post not found
 */
router.get('/id/:id', controller.getPostById);

/**
 * @swagger
 * /posts/followed/user:
 *   get:
 *     summary: Get posts by followed users
 *     security:
 *       - googleAuth: []
 *       - jwtAuth: []
 *     responses:
 *       200:
 *         description: A list of posts
 *       401:
 *         description: Unauthorized
 */
router.get('/followed/user', verifyGoogleToken, verifyJwt, controller.getPostsByFollowed);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     security:
 *       - googleAuth: []
 *       - jwtAuth: []
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
 *         description: Post created
 *       401:
 *         description: Unauthorized
 */
router.post('/', verifyGoogleToken, verifyJwt, upload.any(), controller.createPost);

/**
 * @swagger
 * /posts/like/{id}:
 *   post:
 *     summary: Like a post
 *     security:
 *       - googleAuth: []
 *       - jwtAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post liked
 *       401:
 *         description: Unauthorized
 */
router.post('/like/:id', verifyGoogleToken, verifyJwt, controller.likePost);

/**
 * @swagger
 * /posts/comment/{id}:
 *   post:
 *     summary: Comment on a post
 *     security:
 *       - googleAuth: []
 *       - jwtAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment added
 *       401:
 *         description: Unauthorized
 */
router.post('/comment/:id', verifyGoogleToken, verifyJwt, controller.commentPost);

/**
 * @swagger
 * /posts/comment/like/{id}:
 *   post:
 *     summary: Like a comment
 *     security:
 *       - googleAuth: []
 *       - jwtAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment liked
 *       401:
 *         description: Unauthorized
 */
router.post('/comment/like/:id', verifyGoogleToken, verifyJwt, controller.likeComment);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     security:
 *       - googleAuth: []
 *       - jwtAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post deleted
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', verifyGoogleToken, verifyJwt, controller.deletePost);

/**
 * @swagger
 * /posts/comment/{id}:
 *   delete:
 *     summary: Delete a comment
 *     security:
 *       - googleAuth: []
 *       - jwtAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment deleted
 *       401:
 *         description: Unauthorized
 */
router.delete('/comment/:id', verifyGoogleToken, verifyJwt, controller.deleteComment);

export default router;
