import Express from 'express';

import * as controller from '../controllers/adminController.js';
// import verifyJwt from '../middlewares/verifyJwt.js';
// import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';

const router = Express.Router();

router.get('/new/properties', controller.getLastPublishedProperties);
router.get('/new/users', controller.getLastRegisteredUsers);
router.post('/deny/property/:id', controller.denyProperty);
router.post('/deny/user/:id', controller.denyUser);
export default router;
