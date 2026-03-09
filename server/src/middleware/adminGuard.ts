import { Response, NextFunction } from 'express';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { AuthRequest } from './authGuard.js';

export async function adminGuard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  console.log('Admin guard check for userId:', req.userId);

  if (!req.userId) {
    console.log('No userId in request');
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, req.userId)).limit(1);
  console.log('User found:', user ? 'yes' : 'no', 'role:', user?.role);

  if (!user || user.role !== 'admin') {
    console.log('User not admin or not found');
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  console.log('Admin access granted');
  next();
}
