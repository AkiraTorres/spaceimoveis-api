import Express from 'express';

import * as notificationController from '../controllers/notificationController.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

router.get('/notifications', verifyGoogleToken, verifyJwt, notificationController.getNotifications);
router.get('/notifications/unread', verifyGoogleToken, verifyJwt, notificationController.getUnreadNotifications);
router.post('/notifications/:id', verifyGoogleToken, verifyJwt, notificationController.markAsRead);
router.post('/notifications/chat/:chatId', verifyGoogleToken, verifyJwt, notificationController.markAllAsReadByChatId);
