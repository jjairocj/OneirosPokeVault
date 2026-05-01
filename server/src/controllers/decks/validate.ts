import { Response } from 'express';
import { db } from '../../db/index.js';
import { decks, deckCards } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { AuthRequest } from '../../middleware/authGuard.js';

const REQUIRED_DECK_SIZE = 60;
const MAX_COPIES_PER_CARD = 4;

interface ValidationError {
  type: 'size' | 'copies';
  message: string;
  details?: Record<string, number>;
}

export function validateDeckCards(cards: { cardName: string; quantity: number; isBasicEnergy: number }[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const totalCards = cards.reduce((sum, c) => sum + c.quantity, 0);

  if (totalCards !== REQUIRED_DECK_SIZE) {
    errors.push({ type: 'size', message: `Deck must have exactly ${REQUIRED_DECK_SIZE} cards, currently has ${totalCards}` });
  }

  const nameCount: Record<string, number> = {};
  for (const card of cards) {
    if (card.isBasicEnergy) continue;
    nameCount[card.cardName] = (nameCount[card.cardName] || 0) + card.quantity;
  }

  const overLimit: Record<string, number> = {};
  for (const [name, count] of Object.entries(nameCount)) {
    if (count > MAX_COPIES_PER_CARD) overLimit[name] = count;
  }

  if (Object.keys(overLimit).length > 0) {
    errors.push({ type: 'copies', message: `Max ${MAX_COPIES_PER_CARD} copies per card (except Basic Energy)`, details: overLimit });
  }

  return errors;
}

export async function validateDeck(req: AuthRequest, res: Response): Promise<void> {
  try {
    const deckId = parseInt(req.params.id as string, 10);
    if (isNaN(deckId)) { res.status(400).json({ error: 'Invalid deck id' }); return; }

    const [deck] = await db.select().from(decks)
      .where(and(eq(decks.id, deckId), eq(decks.userId, req.userId!))).limit(1);
    if (!deck) { res.status(404).json({ error: 'Deck not found' }); return; }

    const cards = await db.select().from(deckCards).where(eq(deckCards.deckId, deckId));
    const errors = validateDeckCards(cards);
    const totalCards = cards.reduce((sum, c) => sum + c.quantity, 0);

    res.json({ valid: errors.length === 0, totalCards, errors, format: deck.format });
  } catch (error) {
    console.error('Validate deck error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
