import { Response } from 'express';
import { db } from '../../db/index.js';
import { decks, deckCards } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { AuthRequest } from '../../middleware/authGuard.js';

const HAND_SIZE = 7;
const BASIC_POKEMON_STAGES = ['basic'];

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function expandDeck(cards: { cardId: string; cardName: string; cardImage: string | null; quantity: number }[]) {
  const expanded: { cardId: string; cardName: string; cardImage: string | null }[] = [];
  for (const card of cards) {
    for (let i = 0; i < card.quantity; i++) {
      expanded.push({ cardId: card.cardId, cardName: card.cardName, cardImage: card.cardImage });
    }
  }
  return expanded;
}

function hasBasicPokemon(hand: { cardName: string }[]): boolean {
  return hand.some((c) => {
    const name = c.cardName.toLowerCase();
    return !name.includes('energy') && !name.includes('trainer') &&
      !name.includes(' v') && !name.includes(' ex') && !name.includes(' gx') &&
      !name.includes('vmax') && !name.includes('vstar') && !name.includes('mega');
  });
}

export async function simulateHand(req: AuthRequest, res: Response): Promise<void> {
  try {
    const deckId = parseInt(req.params.id as string, 10);
    if (isNaN(deckId)) { res.status(400).json({ error: 'Invalid deck id' }); return; }

    const [deck] = await db.select().from(decks)
      .where(and(eq(decks.id, deckId), eq(decks.userId, req.userId!))).limit(1);
    if (!deck) { res.status(404).json({ error: 'Deck not found' }); return; }

    const cards = await db.select().from(deckCards).where(eq(deckCards.deckId, deckId));
    const expanded = expandDeck(cards);

    if (expanded.length < HAND_SIZE) {
      res.status(400).json({ error: `Deck needs at least ${HAND_SIZE} cards for simulation` });
      return;
    }

    const shuffled = fisherYatesShuffle(expanded);
    const hand = shuffled.slice(0, HAND_SIZE);
    const isMulligan = !hasBasicPokemon(hand);

    res.json({ hand, isMulligan, deckSize: expanded.length });
  } catch (error) {
    console.error('Simulate hand error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
