import express from 'express';
import { getReviews, createReview, updateReviewStatus, addComment, resolveComment } from '../controllers/codeReviewController.js';
import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getReviews);
router.post('/', verifyToken, createReview);
router.put('/:id/status', verifyToken, updateReviewStatus);
router.post('/:id/comments', verifyToken, addComment);
router.put('/:id/comments/:commentId/resolve', verifyToken, resolveComment);

export default router;
