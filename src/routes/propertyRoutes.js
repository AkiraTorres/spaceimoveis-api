import Express from 'express';
import multer from 'multer';

import * as controller from '../controllers/propertyController.js';
import matchSellerEmail from '../middlewares/matchSellerEmail.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', controller.findAll);
router.get('/recommended', controller.recommendedProperties);
router.get('/seller/:email', controller.findBySellerEmail);
router.get('/get/ids', verifyJwt, controller.getAllPropertiesIds);
router.get('/get/cities', verifyJwt, controller.getAllPropertiesCities);
router.get('/limits', verifyJwt, controller.checkLimits);
router.get('/:id', controller.findByPk);
router.put('/filter', controller.filter);

router.put('/highlight/:id', verifyJwt, matchSellerEmail, controller.highlightProperty);
router.put('/publish/:id', verifyJwt, matchSellerEmail, controller.publishProperty);
router.put('/unpublish/:id', verifyJwt, matchSellerEmail, controller.unpublishProperty);

router.get('/times-seen/:id', controller.getTimesSeen);
router.get('/time-seen/monthly/:id', controller.getTimesSeenByMonth);
router.get('/most-seen/:email', controller.getMostSeenPropertiesBySeller);
router.post('/times-seen/:id', controller.addTimesSeen);

router.post('/', verifyJwt, upload.any(), controller.create);
router.put('/:id', verifyJwt, matchSellerEmail, upload.any(), controller.update);
router.delete('/:id', verifyJwt, matchSellerEmail, controller.destroy);

router.put('/share/:id', verifyGoogleToken, verifyJwt, controller.shareProperty);
router.get('/shared/find/:id', verifyGoogleToken, verifyJwt, controller.getSharedProperties);
router.get('/shared/find/', verifyGoogleToken, verifyJwt, controller.getSharedProperties);
router.post('/share/confirm/:id', verifyGoogleToken, verifyJwt, controller.confirmSharedProperty);
router.post('/share/negate/:id', verifyGoogleToken, verifyJwt, controller.negateSharedProperty);

export default router;
