import Express from 'express';

import * as followerController from '../controllers/followerController.js';
import verifyJwt from '../middlewares/verifyJwt.js';
import { verifyGoogleToken } from '../middlewares/verifyGoogle.cjs';

const router = Express.Router();

router.get('/following/:email', followerController.getFollowing);
router.get('/followers/:email', followerController.getFollowers);

router.get('/following/:email/count', followerController.getTotalFollowing);
router.get('/followers/:email/count', followerController.getTotalFollowers);

router.get('/:targetEmail/', followerController.isFollowing);
router.get('/mutual/:targetEmail', followerController.isMutual);

router.post('/:followedEmail', verifyGoogleToken, verifyJwt, followerController.follow);
router.delete('/:followedEmail', verifyGoogleToken, verifyJwt, followerController.unfollow);

export default router;
