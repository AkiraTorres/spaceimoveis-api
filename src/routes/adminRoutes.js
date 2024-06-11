import Express from 'express';
import multer from 'multer';

import * as controller from '../controllers/adminController.js';

const router = Express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', controller.findAll);
router.get('/:email', controller.findByPk);
router.get('/cpf/:cpf', controller.findByCpf);
router.post('/', upload.single('photo'), controller.create);
router.put('/:email', upload.single('photo'), controller.update);
router.delete('/:email', controller.destroy);

router.get('/properties/new', controller.getLastPublishedProperties);
router.get('/users/new', controller.getLastRegisteredUsers);
router.post('/property/deny/:id', controller.denyProperty);
router.post('/user/deny/:id', controller.denyUser);
router.put('/properties/filter', controller.filterProperties);
router.put('/users/filter', controller.filterUsers);
export default router;
