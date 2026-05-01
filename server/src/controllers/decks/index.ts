import { Response } from 'express';
import { db } from '../../db/index.js';
import { decks, deckCards, users } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { AuthRequest } from '../../middleware/authGuard.js';

const FREE_DECK_LIMIT = 3;

export async function getDecks(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await db.select().from(decks)
      .where(eq(decks.userId, req.userId!))
      .orderBy(decks.createdAt);
    res.json(result);
  } catch (error) {
    console.error('Get decks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createDeck(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, format, description } = req.body;
    if (!name?.trim() || !format?.trim()) {
      res.status(400).json({ error: 'name and format are required' });
      return;
    }
    const validFormats = ['standard', 'expanded', 'unlimited'];
    if (!validFormats.includes(format)) {
      res.status(400).json({ error: `format must be one of: ${validFormats.join(', ')}` });
      return;
    }

    const [user] = await db.select().from(users).where(eq(users.id, req.userId!)).limit(1);
    if (user.plan === 'free') {
      const existing = await db.select().from(decks).where(eq(decks.userId, req.userId!));
      if (existing.length >= FREE_DECK_LIMIT) {
        res.status(403).json({ error: 'Free plan limit reached', code: 'PLAN_LIMIT', limit: FREE_DECK_LIMIT });
        return;
      }
    }

    const [deck] = await db.insert(decks)
      .values({ userId: req.userId!, name: name.trim(), format, description: description?.trim() || null })
      .returning();
    res.status(201).json(deck);
  } catch (error: any) {
    if (error.code === '23505') { res.status(409).json({ error: 'Deck with this name already exists' }); return; }
    console.error('Create deck error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getDeck(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid deck id' }); return; }

    const [deck] = await db.select().from(decks)
      .where(and(eq(decks.id, id), eq(decks.userId, req.userId!))).limit(1);
    if (!deck) { res.status(404).json({ error: 'Deck not found' }); return; }

    const cards = await db.select().from(deckCards).where(eq(deckCards.deckId, id));
    res.json({ ...deck, cards });
  } catch (error) {
    console.error('Get deck error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateDeck(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid deck id' }); return; }

    const { name, format, description } = req.body;
    const updates: Record<string, any> = { updatedAt: new Date() };
    if (name?.trim()) updates.name = name.trim();
    if (format) {
      const validFormats = ['standard', 'expanded', 'unlimited'];
      if (!validFormats.includes(format)) { res.status(400).json({ error: 'Invalid format' }); return; }
      updates.format = format;
    }
    if (description !== undefined) updates.description = description?.trim() || null;

    const result = await db.update(decks).set(updates)
      .where(and(eq(decks.id, id), eq(decks.userId, req.userId!))).returning();
    if (!result.length) { res.status(404).json({ error: 'Deck not found' }); return; }
    res.json(result[0]);
  } catch (error: any) {
    if (error.code === '23505') { res.status(409).json({ error: 'Deck name already exists' }); return; }
    console.error('Update deck error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteDeck(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid deck id' }); return; }

    const result = await db.delete(decks)
      .where(and(eq(decks.id, id), eq(decks.userId, req.userId!))).returning();
    if (!result.length) { res.status(404).json({ error: 'Deck not found' }); return; }
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Delete deck error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
