import { Router } from 'express';
import { authGuard } from '../middleware/authGuard.js';
import { getProfile, upsertProfile } from '../controllers/profiles.js';
import { getNote, upsertNote, deleteNote, getAllNotes } from '../controllers/cardNotes.js';

const router = Router();
router.use(authGuard as any);

router.get('/profile', getProfile as any);
router.put('/profile', upsertProfile as any);

router.get('/notes', getAllNotes as any);
router.get('/notes/:cardId', getNote as any);
router.put('/notes/:cardId', upsertNote as any);
router.delete('/notes/:cardId', deleteNote as any);

export default router;
