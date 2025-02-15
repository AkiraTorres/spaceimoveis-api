import Express from 'express';
import multer from 'multer';

import * as controller from '../controllers/announcementController.js';
import verifyAdmin from '../middlewares/verifyAdmin.js';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/valid', controller.getValidAnnouncements);
router.put('/view/:id', controller.addViewAnnouncement);
router.get('/', verifyJwt, verifyAdmin, controller.getAnnouncements);
router.post('/', verifyJwt, verifyAdmin, upload.single('photo'), controller.createAnnouncement);

// router.use(bodyParser.json({ verify: (req, res, buf) => { req.rawBody = buf.toString(); } }));
router.post('/payment/webhook', controller.handlePayment);

export default router;
