import { Response, NextFunction } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { AuthRequest } from './authGuard';

export async function adminGuard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  if (!req.userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, req.userId)).limit(1);

  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  next();
}
