import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { users, refreshTokens } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const SALT_ROUNDS = 10;

function generateAccessToken(userId: number): string {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES || '15m') as string,
  } as jwt.SignOptions);
}

function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

async function saveRefreshToken(userId: number, token: string): Promise<void> {
  const hash = await bcrypt.hash(token, SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await db.insert(refreshTokens).values({ userId, token: hash, expiresAt });
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const [user] = await db.insert(users).values({ email, password: hashedPassword }).returning();

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken();
    await saveRefreshToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    res.status(201).json({
      accessToken,
      user: { id: user.id, email: user.email, plan: user.plan, role: user.role },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken();
    await saveRefreshToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    res.json({
      accessToken,
      user: { id: user.id, email: user.email, plan: user.plan, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      res.status(401).json({ error: 'No refresh token' });
      return;
    }

    // Find all non-expired refresh tokens
    const storedTokens = await db
      .select()
      .from(refreshTokens)
      .innerJoin(users, eq(refreshTokens.userId, users.id));

    let matchedEntry = null;
    for (const entry of storedTokens) {
      if (entry.refresh_tokens.expiresAt < new Date()) continue;
      const valid = await bcrypt.compare(token, entry.refresh_tokens.token);
      if (valid) {
        matchedEntry = entry;
        break;
      }
    }

    if (!matchedEntry) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Delete old token and create new one (rotation)
    await db.delete(refreshTokens).where(eq(refreshTokens.id, matchedEntry.refresh_tokens.id));

    const user = matchedEntry.users;
    const accessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken();
    await saveRefreshToken(user.id, newRefreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: { id: user.id, email: user.email, plan: user.plan, role: user.role },
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const storedTokens = await db.select().from(refreshTokens);
      for (const stored of storedTokens) {
        const valid = await bcrypt.compare(token, stored.token);
        if (valid) {
          await db.delete(refreshTokens).where(eq(refreshTokens.id, stored.id));
          break;
        }
      }
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.json({ message: 'Logged out' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
