import { Router } from 'express';
import { getCollections, createCollection, deleteCollection } from '../controllers/collections';
import { authGuard } from '../middleware/authGuard';
import { collectionsLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authGuard);
router.use(collectionsLimiter);

router.get('/', getCollections);
router.post('/', createCollection);
router.delete('/:id', deleteCollection);

export default router;
