import Express from 'express';
import multer from 'multer';

import * as controller from '../controllers/propertyController.js';
import matchSellerEmail from '../middlewares/matchSellerEmail.js';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', controller.findAll);
router.get('/recommended', controller.recommendedProperties);
router.get('/:id', controller.findByPk);
router.get('/seller/:email', controller.findBySellerEmail);
router.get('/times-seen/:id', controller.getTimesSeen);
router.post('/times-seen/:id', controller.addTimesSeen);
router.get('/most-seen/:email', controller.getMostSeenPropertiesBySeller);
router.put('/filter', controller.filter);
router.get('/get/ids', verifyJwt, controller.getAllPropertiesIds);
router.get('/get/cities', verifyJwt, controller.getAllPropertiesCities);
router.post('/', verifyJwt, upload.any(), controller.create);
router.put('/:id', verifyJwt, matchSellerEmail, upload.any(), controller.update);
router.delete('/:id', verifyJwt, matchSellerEmail, controller.destroy);

export default router;
