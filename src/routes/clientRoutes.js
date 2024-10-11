import Express from 'express';
import multer from 'multer';

import * as controller from '../controllers/clientController.js';
import matchEmail from '../middlewares/matchEmail.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', controller.findAll);
router.get('/:email', controller.find);
router.post('/', upload.any(), controller.create);
router.put('/:email', verifyGoogleToken, verifyJwt, upload.any(), matchEmail, controller.update);
router.put('/:email/elevate', verifyGoogleToken, verifyJwt, matchEmail, controller.elevate);
router.delete('/:email', verifyGoogleToken, verifyJwt, matchEmail, controller.destroy);

export default router;
