import Express from 'express';
import * as controller from '../controllers/userController.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

router.get('/find/:email', controller.find);
router.get('/find', controller.findAll);
router.get('/appointments/details/:id', verifyJwt, controller.findAppointmentById);
router.get('/appointments/:email', controller.findAllAppointments);
router.get('/sellers', controller.returnRandomSellers);

router.post('/change/password', verifyGoogleToken, verifyJwt, controller.changePassword);
router.post('/rescue/password', controller.rescuePassword);
router.post('/reset/password', controller.resetPassword);

router.post('/contact', controller.contact);

export default router;
