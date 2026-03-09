import { Router } from 'express';
import { getOwnedCards, addOwnedCard, removeOwnedCard } from '../controllers/ownedCards.js';
import { authGuard } from '../middleware/authGuard.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authGuard);
router.use(apiLimiter);

router.get('/', getOwnedCards);
router.post('/', addOwnedCard);
router.delete('/:card_id', removeOwnedCard);

export default router;
