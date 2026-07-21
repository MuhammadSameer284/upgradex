import express from 'express';
import { getPortfolios, createPortfolio, updatePortfolio, deletePortfolio } from '../controllers/portfolioController.js';
import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getPortfolios);
router.post('/', verifyToken, createPortfolio);
router.put('/:id', verifyToken, updatePortfolio);
router.delete('/:id', verifyToken, deletePortfolio);

export default router;
