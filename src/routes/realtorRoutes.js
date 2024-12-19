import Express from 'express';
import multer from 'multer';
import * as controller from '../controllers/realtorController.js';
import matchEmail from '../middlewares/matchEmail.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', controller.findAll);
router.get('/:email', controller.findByPk);
router.get('/availability/:email', controller.getAvailability);
router.post('/', upload.any(), controller.create);
router.post('/availability', verifyJwt, controller.setAvailability);
router.post('/appointment/approve/:id', verifyJwt, controller.approveAppointment);
router.post('/appointment/reject/:id', verifyJwt, controller.rejectAppointment);
router.put('/filter', controller.filter);
router.put('/:email', verifyJwt, matchEmail, upload.any(), controller.update);
router.put('/elevate/:email', verifyGoogleToken, verifyJwt, matchEmail, upload.any(), controller.elevate);
router.delete('/:email', verifyJwt, matchEmail, controller.destroy);

export default router;
