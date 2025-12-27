import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { createRequest, listRequests, getRequest, updateRequest } from '../controllers/requestsController.js';

const router = Router();

router.post('/', authenticate, createRequest);
router.get('/', authenticate, listRequests);
router.get('/:id', authenticate, getRequest);
router.put('/:id', authenticate, updateRequest);

export default router;
