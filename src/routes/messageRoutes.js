import Express from 'express';

import * as messageController from '../controllers/messageController.js';
import verifyJwt from '../middlewares/verifyJwt.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';

const router = Express.Router();

router.post('/:chatId', verifyGoogleToken, verifyJwt, messageController.createMessage);
router.get('/:chatId', verifyGoogleToken, verifyJwt, messageController.findMessages);
router.delete('/:id', verifyGoogleToken, verifyJwt, messageController.deleteMessage);

export default router;
