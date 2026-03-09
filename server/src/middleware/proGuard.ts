import { Response, NextFunction } from 'express';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { AuthRequest } from './authGuard.js';

export async function proGuard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  if (!req.userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const [user] = await db
    .select({ plan: users.plan, role: users.role })
    .from(users)
    .where(eq(users.id, req.userId))
    .limit(1);

  if (!user || (user.plan !== 'pro' && user.role !== 'admin')) {
    res.status(403).json({ error: 'Pro plan required', code: 'PRO_REQUIRED' });
    return;
  }

  next();
}
