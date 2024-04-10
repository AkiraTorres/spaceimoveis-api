import Express from 'express';

import * as controller from '../controllers/clientController.js';
import verifyJwt from '../middlewares/verifyJwt.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import matchEmail from '../middlewares/matchEmail.js';

const router = Express.Router();

router.get('/', controller.findAll);
router.get('/:email', controller.findByPk);
router.post('/', controller.create);
router.put('/:email', verifyGoogleToken, verifyJwt, matchEmail, controller.update);
router.delete('/:email', verifyGoogleToken, verifyJwt, matchEmail, controller.destroy);

export default router;
