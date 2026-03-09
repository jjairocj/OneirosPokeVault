import { Router } from 'express';
import { authGuard } from '../middleware/authGuard';
import { proGuard } from '../middleware/proGuard';
import { getSlots, assignSlot, unassignSlot } from '../controllers/masterdex';

const router = Router();

router.use(authGuard);
router.use(proGuard);

router.get('/', getSlots);
router.post('/', assignSlot);
router.delete('/:slotType/:slotKey', unassignSlot);

export default router;
