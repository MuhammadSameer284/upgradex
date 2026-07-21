import express from 'express';
import { getProjects, createProject, updateProject, deleteProject } from '../controllers/projectController.js';
import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getProjects);
router.post('/', verifyToken, createProject);
router.put('/:id', verifyToken, updateProject);
router.delete('/:id', verifyToken, deleteProject);

export default router;
