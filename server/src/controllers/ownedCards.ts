import { Response } from 'express';
import { db } from '../db';
import { ownedCards } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { AuthRequest } from '../middleware/authGuard';

export async function getOwnedCards(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await db
      .select()
      .from(ownedCards)
      .where(eq(ownedCards.userId, req.userId!))
      .orderBy(ownedCards.createdAt);

    res.json(result);
  } catch (error) {
    console.error('Get owned cards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function addOwnedCard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { card_id } = req.body;

    if (!card_id || typeof card_id !== 'string') {
      res.status(400).json({ error: 'card_id is required' });
      return;
    }

    const [card] = await db
      .insert(ownedCards)
      .values({ userId: req.userId!, cardId: card_id })
      .returning();

    res.status(201).json(card);
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'Card already owned' });
      return;
    }
    console.error('Add owned card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function removeOwnedCard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const card_id = req.params.card_id as string;

    if (!card_id) {
      res.status(400).json({ error: 'card_id is required' });
      return;
    }

    const result = await db
      .delete(ownedCards)
      .where(and(eq(ownedCards.cardId, card_id), eq(ownedCards.userId, req.userId!)))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Card not found in collection' });
      return;
    }

    res.json({ message: 'Removed' });
  } catch (error) {
    console.error('Remove owned card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
