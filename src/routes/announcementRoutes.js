import Express from 'express';
import multer from 'multer';

import * as controller from '../controllers/announcementController.js';
import verifyAdmin from '../middlewares/verifyAdmin.js';
import verifyJwt from '../middlewares/verifyJwt.js';

const router = Express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/valid', controller.getValidAnnouncements);
router.get('/:id', controller.getAnnouncement);
router.get('/', verifyJwt, verifyAdmin, controller.getAnnouncements);
router.put('/view/:id', controller.addViewAnnouncement);
router.post('/', verifyJwt, verifyAdmin, upload.single('photo'), controller.createAnnouncement);
router.delete('/:id', verifyJwt, verifyAdmin, controller.deleteAnnouncement);

// router.use(bodyParser.json({ verify: (req, res, buf) => { req.rawBody = buf.toString(); } }));
router.post('/payment/webhook', controller.handlePayment);

export default router;
