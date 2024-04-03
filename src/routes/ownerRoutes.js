import Express from 'express';

import * as controller from '../controllers/ownerController.js';

const router = Express.Router();

router.get('/', controller.findAll);
router.get('/:email', controller.findByPk);
router.post('/', controller.create);
router.put('/:email', controller.update);
router.delete('/:email', controller.destroy);

export default router;
