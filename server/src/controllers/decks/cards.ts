import { Response } from 'express';
import { db } from '../../db/index.js';
import { decks, deckCards } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { AuthRequest } from '../../middleware/authGuard.js';

async function verifyDeckOwnership(deckId: number, userId: number): Promise<boolean> {
  const [deck] = await db.select().from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId))).limit(1);
  return !!deck;
}

export async function addCardToDeck(req: AuthRequest, res: Response): Promise<void> {
  try {
    const deckId = parseInt(req.params.id as string, 10);
    if (isNaN(deckId)) { res.status(400).json({ error: 'Invalid deck id' }); return; }

    const { cardId, cardName, cardImage, quantity, isBasicEnergy } = req.body;
    if (!cardId || !cardName) {
      res.status(400).json({ error: 'cardId and cardName are required' });
      return;
    }

    if (!await verifyDeckOwnership(deckId, req.userId!)) {
      res.status(404).json({ error: 'Deck not found' });
      return;
    }

    const qty = Math.max(1, Math.min(60, parseInt(quantity, 10) || 1));
    const energy = isBasicEnergy ? 1 : 0;

    const [card] = await db.insert(deckCards)
      .values({ deckId, cardId, cardName, cardImage: cardImage || null, quantity: qty, isBasicEnergy: energy })
      .onConflictDoUpdate({
        target: [deckCards.deckId, deckCards.cardId],
        set: { quantity: qty, cardName, cardImage: cardImage || null, isBasicEnergy: energy },
      })
      .returning();

    await db.update(decks).set({ updatedAt: new Date() }).where(eq(decks.id, deckId));
    res.status(201).json(card);
  } catch (error) {
    console.error('Add card to deck error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function removeCardFromDeck(req: AuthRequest, res: Response): Promise<void> {
  try {
    const deckId = parseInt(req.params.id as string, 10);
    const cardId = req.params.cardId as string;
    if (isNaN(deckId) || !cardId) { res.status(400).json({ error: 'Invalid parameters' }); return; }

    if (!await verifyDeckOwnership(deckId, req.userId!)) {
      res.status(404).json({ error: 'Deck not found' });
      return;
    }

    const result = await db.delete(deckCards)
      .where(and(eq(deckCards.deckId, deckId), eq(deckCards.cardId, cardId))).returning();
    if (!result.length) { res.status(404).json({ error: 'Card not found in deck' }); return; }

    await db.update(decks).set({ updatedAt: new Date() }).where(eq(decks.id, deckId));
    res.json({ message: 'Removed' });
  } catch (error) {
    console.error('Remove card from deck error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
