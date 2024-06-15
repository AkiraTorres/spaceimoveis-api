import Express from 'express';
import multer from 'multer';

import * as controller from '../controllers/adminController.js';
import verifyAdmin from '../middlewares/verifyAdmin.js';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', verifyJwt, verifyAdmin, controller.findAll);
router.get('/:email', verifyJwt, verifyAdmin, controller.findByPk);
router.get('/cpf/:cpf', verifyJwt, verifyAdmin, controller.findByCpf);
router.post('/', verifyJwt, verifyAdmin, upload.single('photo'), controller.create);
router.put('/:email', verifyJwt, verifyAdmin, upload.single('photo'), controller.update);
router.delete('/:email', verifyJwt, verifyAdmin, controller.destroy);

router.get('/properties/new', verifyJwt, verifyAdmin, controller.getLastPublishedProperties);
router.get('/users/new', verifyJwt, verifyAdmin, controller.getLastRegisteredUsers);
router.post('/property/deny/:id', verifyJwt, verifyAdmin, controller.denyProperty);
router.post('/users/deny/:email', verifyJwt, verifyAdmin, controller.denyUser);
router.put('/properties/filter', verifyJwt, verifyAdmin, controller.filterProperties);
router.put('/users/filter', verifyJwt, verifyAdmin, controller.filterUsers);
export default router;
