import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import { proGuard } from '../middleware/proGuard.js';
import { getSlots, assignSlot, unassignSlot } from '../controllers/masterdex.js';

const router = Router();

router.use(authGuard);
router.use(proGuard);

router.get('/', getSlots);
router.post('/', assignSlot);
router.delete('/:slotType/:slotKey', unassignSlot);

export default router;
