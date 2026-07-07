import { Router } from 'express';
import { generateDescription, getStylistAdvice } from '../controllers/ai.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Products AI copywriting
router.post('/products/generate-description', authenticateToken, generateDescription);

// Stylist advisor chatbot
router.post('/ai/stylist', getStylistAdvice);

export default router;
