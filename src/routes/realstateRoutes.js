import Express from 'express';
import multer from 'multer';

import * as controller from '../controllers/realstateController.js';
import matchEmail from '../middlewares/matchEmail.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', controller.findAll);
router.get('/:email', controller.findByPk);
router.post('/', upload.any(), controller.create);
router.put('/filter', controller.filter);
router.put('/:email', verifyJwt, matchEmail, upload.any(), controller.update);
router.put('/elevate/:email', verifyGoogleToken, verifyJwt, matchEmail, upload.any(), controller.elevate);
router.delete('/:email', verifyJwt, matchEmail, controller.destroy);

export default router;
