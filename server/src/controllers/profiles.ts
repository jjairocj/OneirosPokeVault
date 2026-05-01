import { Response } from 'express';
import { db } from '../db/index.js';
import { userProfiles } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { AuthRequest } from '../middleware/authGuard.js';

const MAX_FEATURED_CARDS = 8;

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
    res.json(profile ?? { userId, displayName: null, bannerImage: null, featuredCards: null });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function upsertProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { displayName, bannerImage, featuredCards } = req.body;

    if (displayName !== undefined && typeof displayName !== 'string') {
      res.status(400).json({ error: 'displayName must be a string' });
      return;
    }
    if (featuredCards !== undefined) {
      if (!Array.isArray(featuredCards) || featuredCards.length > MAX_FEATURED_CARDS) {
        res.status(400).json({ error: `featuredCards must be an array of at most ${MAX_FEATURED_CARDS} card IDs` });
        return;
      }
    }

    const updates = {
      userId,
      displayName: displayName?.trim() || null,
      bannerImage: bannerImage?.trim() || null,
      featuredCards: featuredCards ? JSON.stringify(featuredCards) : null,
      updatedAt: new Date(),
    };

    const [profile] = await db.insert(userProfiles)
      .values(updates)
      .onConflictDoUpdate({ target: userProfiles.userId, set: updates })
      .returning();
    res.json(profile);
  } catch (error) {
    console.error('Upsert profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
