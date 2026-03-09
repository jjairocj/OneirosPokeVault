import { Response } from 'express';
import { db } from '../db';
import { masterdexSlots } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { AuthRequest } from '../middleware/authGuard';

export async function getSlots(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId!;
  const slots = await db
    .select()
    .from(masterdexSlots)
    .where(eq(masterdexSlots.userId, userId));
  res.json(slots);
}

export async function assignSlot(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId!;
  const { slotType, slotKey, cardId, cardName, cardImage } = req.body;

  if (!slotType || !slotKey || !cardId) {
    res.status(400).json({ error: 'Missing required fields: slotType, slotKey, cardId' });
    return;
  }

  try {
    const existing = await db
      .select({ id: masterdexSlots.id })
      .from(masterdexSlots)
      .where(
        and(
          eq(masterdexSlots.userId, userId),
          eq(masterdexSlots.slotType, slotType),
          eq(masterdexSlots.slotKey, slotKey)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(masterdexSlots)
        .set({ cardId, cardName: cardName ?? null, cardImage: cardImage ?? null })
        .where(
          and(
            eq(masterdexSlots.userId, userId),
            eq(masterdexSlots.slotType, slotType),
            eq(masterdexSlots.slotKey, slotKey)
          )
        )
        .returning();
      res.json(updated);
    } else {
      const [created] = await db
        .insert(masterdexSlots)
        .values({ userId, slotType, slotKey, cardId, cardName: cardName ?? null, cardImage: cardImage ?? null })
        .returning();
      res.status(201).json(created);
    }
  } catch {
    res.status(500).json({ error: 'Database error' });
  }
}

export async function unassignSlot(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId!;
  const slotType = String(req.params.slotType);
  const slotKey = decodeURIComponent(String(req.params.slotKey));

  await db
    .delete(masterdexSlots)
    .where(
      and(
        eq(masterdexSlots.userId, userId),
        eq(masterdexSlots.slotType, slotType),
        eq(masterdexSlots.slotKey, slotKey)
      )
    );

  res.status(204).send();
}
