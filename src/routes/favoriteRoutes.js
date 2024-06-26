import Express from 'express';

import * as controller from '../controllers/favoriteController.js';
import verifyJwt from '../middlewares/verifyJwt.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';

const router = Express.Router();

router.get('/total/:id', controller.getPropertyTotalFavorites);
router.get('/:email', verifyGoogleToken, verifyJwt, controller.getFavorites);
router.post('/', verifyGoogleToken, verifyJwt, controller.setFavorite);
router.delete('/:email/:propertyId', verifyGoogleToken, verifyJwt, controller.removeFavorite);

export default router;
