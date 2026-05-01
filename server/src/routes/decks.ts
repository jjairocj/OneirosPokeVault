import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import { getDecks, createDeck, getDeck, updateDeck, deleteDeck } from '../controllers/decks/index.js';
import { addCardToDeck, removeCardFromDeck } from '../controllers/decks/cards.js';
import { validateDeck } from '../controllers/decks/validate.js';
import { exportDeck, importDeck } from '../controllers/decks/exportImport.js';
import { simulateHand } from '../controllers/decks/simulate.js';

const router = Router();
router.use(authGuard);

router.get('/', getDecks);
router.post('/', createDeck);
router.post('/import', importDeck);
router.get('/:id', getDeck);
router.put('/:id', updateDeck);
router.delete('/:id', deleteDeck);
router.post('/:id/cards', addCardToDeck);
router.delete('/:id/cards/:cardId', removeCardFromDeck);
router.post('/:id/validate', validateDeck);
router.get('/:id/export', exportDeck);
router.post('/:id/simulate', simulateHand);

export default router;
