import Express from 'express';
import verifyJwt from '../middlewares/verifyJwt.js';

import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';

import * as controller from '../controllers/sellerDashboardController.js';

const router = Express.Router();

router.get('/likes', verifyGoogleToken, verifyJwt, controller.totalPropertiesLikes);
router.get('/views', verifyGoogleToken, verifyJwt, controller.totalPropertiesViews);

export default router;
