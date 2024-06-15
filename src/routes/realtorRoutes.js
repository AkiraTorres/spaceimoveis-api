import Express from 'express';
import multer from 'multer';
import * as controller from '../controllers/realtorController.js';
import verifyJwt from '../middlewares/verifyJwt.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import matchEmail from '../middlewares/matchEmail.js';

const router = Express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', controller.findAll);
router.get('/:email', controller.findByPk);
router.post('/', upload.single('photo'), controller.create);
router.put('/filter', controller.filter);
router.put('/:email', verifyJwt, matchEmail, upload.single('photo'), controller.update);
router.put('/elevate/:email', verifyGoogleToken, verifyJwt, matchEmail, upload.single('photo'), controller.elevate);
router.delete('/:email', verifyJwt, matchEmail, controller.destroy);

router.get('/dashboard/likes', verifyJwt, controller.totalPropertiesLikes);

export default router;
