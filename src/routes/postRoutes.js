import Express from 'express';
import multer from 'multer';

import * as controller from '../controllers/postController.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/:email', controller.getPostsByUserEmail);
router.get('/id/:id', controller.getPostById);
router.get('/followed/user', verifyGoogleToken, verifyJwt, controller.getPostsByFollowed);

router.post('/', verifyGoogleToken, verifyJwt, upload.any(), controller.createPost);
router.post('/like/:id', verifyGoogleToken, verifyJwt, controller.likePost);
router.post('/comment/:id', verifyGoogleToken, verifyJwt, controller.commentPost);
router.post('/comment/like/:id', verifyGoogleToken, verifyJwt, controller.likeComment);

router.delete('/:id', verifyGoogleToken, verifyJwt, controller.deletePost);
router.delete('/comment/:id', verifyGoogleToken, verifyJwt, controller.deleteComment);

export default router;
