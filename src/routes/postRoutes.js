import Express from 'express';
import multer from 'multer';

import * as controller from '../controllers/postController.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/:email', verifyGoogleToken, verifyJwt, controller.getPostsByUserEmail);
router.get('/id/:id', verifyGoogleToken, verifyJwt, controller.getPostById);
router.get('/followed', verifyGoogleToken, verifyJwt, controller.getPostsByFollowed);
router.post('/', verifyGoogleToken, verifyJwt, upload.any(), controller.createPost);
router.post('/like/:id', verifyGoogleToken, verifyJwt, controller.likePost);
router.post('/comment/:id', verifyGoogleToken, verifyJwt, controller.commentPost);
router.delete('/:id', verifyGoogleToken, verifyJwt, controller.deletePost);

export default router;
