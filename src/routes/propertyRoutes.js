import Express from 'express';
import multer from 'multer';

import * as controller from '../controllers/propertyController.js';
import verifyJwt from '../middlewares/verifyJwt.js';
import matchSellerEmail from '../middlewares/matchSellerEmail.js';

const router = Express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', controller.findAll);
router.get('/:id', controller.findByPk);
router.get('/seller/:email', controller.findBySellerEmail);
router.post('/', verifyJwt, upload.any(), controller.create);
router.put('/:id', verifyJwt, matchSellerEmail, upload.any(), controller.update);
router.put('/filter', controller.filter);
router.delete('/:id', verifyJwt, matchSellerEmail, controller.destroy);

export default router;
