import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import { getLists, createList, getList, updateList, deleteList, getPublicList } from '../controllers/lists/index.js';
import { addCardToList, removeCardFromList } from '../controllers/lists/cards.js';

const router = Router();

router.get('/public/:slug', getPublicList as any);

router.use(authGuard as any);

router.get('/', getLists as any);
router.post('/', createList as any);
router.get('/:id', getList as any);
router.put('/:id', updateList as any);
router.delete('/:id', deleteList as any);
router.post('/:id/cards', addCardToList as any);
router.delete('/:id/cards/:cardId', removeCardFromList as any);

export default router;
