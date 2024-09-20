import Express from 'express';

import * as controller from '../controllers/clientController.js';
import matchEmail from '../middlewares/matchEmail.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

router.get('/', controller.findAll);
router.get('/:email', controller.find);
router.post('/', controller.create);
router.put('/:email', verifyGoogleToken, verifyJwt, matchEmail, controller.update);
router.put('/:email/elevate', verifyGoogleToken, verifyJwt, matchEmail, controller.elevate);
router.delete('/:email', verifyGoogleToken, verifyJwt, matchEmail, controller.destroy);

export default router;
