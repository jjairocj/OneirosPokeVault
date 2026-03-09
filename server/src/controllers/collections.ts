import { Response } from 'express';
import { db } from '../db';
import { collections, users } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { AuthRequest } from '../middleware/authGuard';

const FREE_LIMIT = 5;

export async function getCollections(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await db
      .select()
      .from(collections)
      .where(eq(collections.userId, req.userId!))
      .orderBy(collections.createdAt);

    res.json(result);
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createCollection(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { entry_name } = req.body;

    if (!entry_name || typeof entry_name !== 'string' || entry_name.trim().length === 0) {
      res.status(400).json({ error: 'entry_name is required' });
      return;
    }

    // Check plan limits
    const [user] = await db.select().from(users).where(eq(users.id, req.userId!)).limit(1);
    if (user.plan === 'free') {
      const existing = await db
        .select()
        .from(collections)
        .where(eq(collections.userId, req.userId!));

      if (existing.length >= FREE_LIMIT) {
        res.status(403).json({
          error: 'Free plan limit reached',
          code: 'PLAN_LIMIT',
          limit: FREE_LIMIT,
        });
        return;
      }
    }

    const [collection] = await db
      .insert(collections)
      .values({ userId: req.userId!, entryName: entry_name.trim() })
      .returning();

    res.status(201).json(collection);
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'Collection entry already exists' });
      return;
    }
    console.error('Create collection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteCollection(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid collection id' });
      return;
    }

    const result = await db
      .delete(collections)
      .where(and(eq(collections.id, id), eq(collections.userId, req.userId!)))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
