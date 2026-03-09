import { Router } from 'express';
import { getOwnedCards, addOwnedCard, removeOwnedCard } from '../controllers/ownedCards';
import { authGuard } from '../middleware/authGuard';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authGuard);
router.use(apiLimiter);

router.get('/', getOwnedCards);
router.post('/', addOwnedCard);
router.delete('/:card_id', removeOwnedCard);

export default router;
