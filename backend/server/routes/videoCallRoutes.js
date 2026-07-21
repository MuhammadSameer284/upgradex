import express from 'express';
import { getCalls, scheduleCall, startCall, endCall } from '../controllers/videoCallController.js';
import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getCalls);
router.post('/', verifyToken, scheduleCall);
router.put('/:id/start', verifyToken, startCall);
router.put('/:id/end', verifyToken, endCall);

export default router;
