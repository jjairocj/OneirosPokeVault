import { Response } from 'express';
import { db } from '../../db/index.js';
import { lists, listCards } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { AuthRequest } from '../../middleware/authGuard.js';

export async function addCardToList(req: AuthRequest, res: Response): Promise<void> {
  try {
    const listId = parseInt(req.params.id as string, 10);
    if (isNaN(listId)) { res.status(400).json({ error: 'Invalid list id' }); return; }

    const [list] = await db.select().from(lists)
      .where(and(eq(lists.id, listId), eq(lists.userId, req.userId!))).limit(1);
    if (!list) { res.status(404).json({ error: 'List not found' }); return; }

    const { cardId, cardName, cardImage, quantity, notes } = req.body;
    if (!cardId) { res.status(400).json({ error: 'cardId is required' }); return; }
    const qty = Math.max(1, parseInt(quantity) || 1);

    const [card] = await db.insert(listCards)
      .values({ listId, cardId, cardName, cardImage, quantity: qty, notes: notes || null })
      .onConflictDoUpdate({
        target: [listCards.listId, listCards.cardId],
        set: { quantity: qty, notes: notes || null },
      })
      .returning();
    res.status(201).json(card);
  } catch (error) {
    console.error('Add card to list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function removeCardFromList(req: AuthRequest, res: Response): Promise<void> {
  try {
    const listId = parseInt(req.params.id as string, 10);
    if (isNaN(listId)) { res.status(400).json({ error: 'Invalid list id' }); return; }

    const [list] = await db.select().from(lists)
      .where(and(eq(lists.id, listId), eq(lists.userId, req.userId!))).limit(1);
    if (!list) { res.status(404).json({ error: 'List not found' }); return; }

    const { cardId } = req.params;
    const result = await db.delete(listCards)
      .where(and(eq(listCards.listId, listId), eq(listCards.cardId, cardId as string))).returning();
    if (!result.length) { res.status(404).json({ error: 'Card not in list' }); return; }
    res.json({ message: 'Removed' });
  } catch (error) {
    console.error('Remove card from list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
