import { Response } from 'express';
import { db } from '../db/index.js';
import { priceSnapshots } from '../db/schema.js';
import { eq, and, gte, desc } from 'drizzle-orm';
import { AuthRequest } from '../middleware/authGuard.js';

const VALID_SOURCES = ['tcgplayer', 'cardmarket'] as const;
const VALID_CURRENCIES = ['USD', 'EUR'] as const;
const MAX_HISTORY_DAYS = 90;

export async function getPriceHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { cardId } = req.params;
    if (!cardId) { res.status(400).json({ error: 'cardId is required' }); return; }

    const { source, days } = req.query;
    const daysNum = Math.min(parseInt(days as string) || 30, MAX_HISTORY_DAYS);
    const since = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);

    const conditions = [eq(priceSnapshots.cardId, cardId as string), gte(priceSnapshots.snapshotDate, since)];
    if (source && VALID_SOURCES.includes(source as any)) {
      conditions.push(eq(priceSnapshots.source, source as string));
    }

    const snapshots = await db.select().from(priceSnapshots)
      .where(and(...conditions))
      .orderBy(priceSnapshots.snapshotDate);

    const latest = snapshots.at(-1) ?? null;
    res.json({ cardId, snapshots, latest, days: daysNum });
  } catch (error) {
    console.error('Get price history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function recordSnapshot(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { cardId, source, price, currency } = req.body;
    if (!cardId || !source || price == null || !currency) {
      res.status(400).json({ error: 'cardId, source, price, and currency are required' });
      return;
    }
    if (!VALID_SOURCES.includes(source)) {
      res.status(400).json({ error: `source must be one of: ${VALID_SOURCES.join(', ')}` });
      return;
    }
    if (!VALID_CURRENCIES.includes(currency)) {
      res.status(400).json({ error: `currency must be one of: ${VALID_CURRENCIES.join(', ')}` });
      return;
    }
    const priceInt = Math.round(parseFloat(price) * 100);
    if (isNaN(priceInt) || priceInt < 0) {
      res.status(400).json({ error: 'price must be a non-negative number' });
      return;
    }

    const [snapshot] = await db.insert(priceSnapshots)
      .values({ cardId, source, price: priceInt, currency })
      .returning();
    res.status(201).json(snapshot);
  } catch (error) {
    console.error('Record snapshot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getLatestPrices(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { cardIds } = req.body;
    if (!Array.isArray(cardIds) || cardIds.length === 0) {
      res.status(400).json({ error: 'cardIds array is required' });
      return;
    }
    if (cardIds.length > 50) {
      res.status(400).json({ error: 'Max 50 cardIds per request' });
      return;
    }

    const results: Record<string, { price: number; currency: string; source: string; date: Date } | null> = {};
    for (const cardId of cardIds) {
      const [latest] = await db.select().from(priceSnapshots)
        .where(eq(priceSnapshots.cardId, cardId))
        .orderBy(desc(priceSnapshots.snapshotDate))
        .limit(1);
      results[cardId] = latest
        ? { price: latest.price / 100, currency: latest.currency, source: latest.source, date: latest.snapshotDate }
        : null;
    }
    res.json(results);
  } catch (error) {
    console.error('Get latest prices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
