import express from 'express';
import { getProfile, updateProfile, getStudents, getInstructors, getMyStudents } from '../controllers/userController.js';
import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.get('/students', verifyToken, getStudents);
router.get('/instructors', getInstructors);
router.get('/my-students', verifyToken, getMyStudents);

export default router;
