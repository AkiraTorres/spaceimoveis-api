import Express from 'express';
import * as controller from '../controllers/userController.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

router.get('/find/:email', controller.find);
router.get('/find', controller.findAll);

router.post('/change/password', verifyGoogleToken, verifyJwt, controller.changePassword);
router.post('/rescue/password', controller.rescuePassword);
router.post('/reset/password', controller.resetPassword);

router.post('/contact', controller.contact);

export default router;
