import Express from 'express';
import verifyJwt from '../middlewares/verifyJwt.js';

import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';

import * as controller from '../controllers/sellerDashboardController.js';

const router = Express.Router();

router.get('/likes', verifyGoogleToken, verifyJwt, controller.totalPropertiesLikes);
router.get('/views', verifyGoogleToken, verifyJwt, controller.totalPropertiesViews);
router.get('/top/properties', verifyGoogleToken, verifyJwt, controller.topProperties);
router.get('/properties/data/monthly', verifyGoogleToken, verifyJwt, controller.propertiesData);
router.get('/properties/proportions', verifyGoogleToken, verifyJwt, controller.propertiesProportions);
router.put('/properties/filter', verifyGoogleToken, verifyJwt, controller.propertiesFilter);

export default router;
