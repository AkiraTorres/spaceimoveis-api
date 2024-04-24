import Express from 'express';

import * as controller from '../controllers/ratingController.js';
import verifyJwt from '../middlewares/verifyJwt.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';

const router = Express.Router();

router.get('/:receiverEmail', controller.getAllRatesByReceiver);
router.get('/avg/:receiverEmail', controller.getAvgRateByReceiver);
router.get('/sender/:senderEmail', controller.getAllRatesBySender);
router.post('/', verifyGoogleToken, verifyJwt, controller.setRate);
router.delete('/:id', verifyGoogleToken, verifyJwt, controller.deleteRate);

export default router;
