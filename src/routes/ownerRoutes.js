import Express from 'express';

import * as controller from '../controllers/ownerController.js';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

router.get('/', controller.findAll);
router.get('/:email', controller.findByPk);
router.post('/', controller.create);
router.put('/:email', verifyJwt, controller.update);
router.delete('/:email', verifyJwt, controller.destroy);

export default router;
