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
router.get('/times-seen/get/:id', controller.getTimesSeen);
router.post('/times-seen/add/:id', controller.addTimesSeen);
router.put('/filter', controller.filter);
router.get('/recomended', controller.recomendedProperties);
router.get('/get/ids', verifyJwt, controller.getAllPropertiesIds);
router.get('/get/cities', verifyJwt, controller.getAllPropertiesCities);
router.post('/', verifyJwt, upload.any(), controller.create);
router.put('/:id', verifyJwt, matchSellerEmail, upload.any(), controller.update);
router.delete('/:id', verifyJwt, matchSellerEmail, controller.destroy);

export default router;
