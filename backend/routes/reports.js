import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getRequestsByTeam, getRequestsByCategory, getRequestsByType } from '../controllers/reportsController.js';

const router = Router();

router.get('/by-team', authenticate, getRequestsByTeam);
router.get('/by-category', authenticate, getRequestsByCategory);
router.get('/by-type', authenticate, getRequestsByType);

export default router;
