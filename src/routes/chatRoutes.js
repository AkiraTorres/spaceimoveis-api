import Express from 'express';

import * as chatController from '../controllers/chatController.js';
import verifyJwt from '../middlewares/verifyJwt.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';

const router = Express.Router();

router.post('/:targetEmail', verifyGoogleToken, verifyJwt, chatController.createChat);
router.get('/', verifyGoogleToken, verifyJwt, chatController.findUserChats);
router.get('/:targetEmail', verifyGoogleToken, verifyJwt, chatController.findChat);

export default router;
