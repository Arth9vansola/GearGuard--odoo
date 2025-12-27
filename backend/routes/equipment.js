import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { createEquipment, listEquipment, getEquipment, updateEquipment } from '../controllers/equipmentController.js';

const router = Router();

router.post('/', authenticate, createEquipment);
router.get('/', authenticate, listEquipment);
router.get('/:id', authenticate, getEquipment);
router.put('/:id', authenticate, updateEquipment);

export default router;
