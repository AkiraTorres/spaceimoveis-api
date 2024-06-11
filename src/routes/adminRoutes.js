import Express from 'express';

import * as controller from '../controllers/adminController.js';
// import verifyJwt from '../middlewares/verifyJwt.js';
// import verifyAdmin from '../middlewares/verifyAdmin.js';

const router = Express.Router();

router.get('/', controller.findAll);
router.get('/:email', controller.findByPk);
router.get('/cpf/:cpf', controller.findByCpf);
router.post('/', controller.create);
router.put('/:email', controller.update);
router.delete('/:email', controller.destroy);

router.get('/properties/new', controller.getLastPublishedProperties);
router.get('/users/new', controller.getLastRegisteredUsers);
router.post('/property/deny/:id', controller.denyProperty);
router.post('/user/deny/:id', controller.denyUser);
router.put('/properties/filter', controller.filterProperties);
router.put('/users/filter', controller.filterUsers);
export default router;
