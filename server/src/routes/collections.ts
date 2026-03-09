import { Router } from 'express';
import { getCollections, createCollection, deleteCollection } from '../controllers/collections.js';
import { authGuard } from '../middleware/authGuard.js';
import { collectionsLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authGuard);
router.use(collectionsLimiter);

router.get('/', getCollections);
router.post('/', createCollection);
router.delete('/:id', deleteCollection);

export default router;
