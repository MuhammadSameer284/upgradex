import express from 'express';
import { getStudentDashboard, getInstructorDashboard } from '../controllers/dashboardController.js';
import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/student', verifyToken, getStudentDashboard);
router.get('/instructor', verifyToken, getInstructorDashboard);

export default router;
