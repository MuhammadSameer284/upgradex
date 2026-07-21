import express from 'express';
import { getTasks, createTask, updateTask, updateKanbanDrag, deleteTask } from '../controllers/taskController.js';
import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getTasks);
router.post('/', verifyToken, createTask);
router.put('/kanban/drag', verifyToken, updateKanbanDrag);
router.put('/:id', verifyToken, updateTask);
router.delete('/:id', verifyToken, deleteTask);

export default router;
