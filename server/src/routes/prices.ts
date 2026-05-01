import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import { getPriceHistory, recordSnapshot, getLatestPrices } from '../controllers/prices.js';

const router = Router();

router.use(authGuard as any);

router.get('/:cardId', getPriceHistory as any);
router.post('/snapshot', recordSnapshot as any);
router.post('/latest', getLatestPrices as any);

export default router;
