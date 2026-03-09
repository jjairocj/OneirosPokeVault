import { Response } from 'express';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { AuthRequest } from '../middleware/authGuard.js';

export async function listUsers(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        plan: users.plan,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt);

    res.json(allUsers);
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateUserPlan(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = parseInt(req.params.id as string, 10);
    const { plan } = req.body;

    if (!plan || !['free', 'pro'].includes(plan)) {
      res.status(400).json({ error: 'Plan must be "free" or "pro"' });
      return;
    }

    const [updated] = await db
      .update(users)
      .set({ plan })
      .where(eq(users.id, userId))
      .returning({ id: users.id, email: users.email, plan: users.plan, role: users.role });

    if (!updated) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(updated);
  } catch (error) {
    console.error('Update user plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
