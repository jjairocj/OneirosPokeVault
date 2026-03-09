import { Router } from 'express';
import { authGuard } from '../middleware/authGuard';
import { adminGuard } from '../middleware/adminGuard';
import { getAllPokemon, addPokemon, updatePokemon } from '../controllers/pokemonDex';

const router = Router();

// Public: anyone can fetch the dex names (used by client for MasterDex)
router.get('/', getAllPokemon);

// Admin only: add or edit entries
router.post('/', authGuard, adminGuard, addPokemon);
router.patch('/:dexId', authGuard, adminGuard, updatePokemon);

export default router;
