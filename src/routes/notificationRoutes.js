import Express from 'express';

import * as notificationController from '../controllers/notificationController.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

router.get('/', notificationController.getNotifications);
router.get('/unread', verifyGoogleToken, verifyJwt, notificationController.getUnreadNotifications);
router.post('/:id', verifyGoogleToken, verifyJwt, notificationController.markAsRead);
router.post('/chat/:chatId', verifyGoogleToken, verifyJwt, notificationController.markAllAsReadByChatId);

export default router;
