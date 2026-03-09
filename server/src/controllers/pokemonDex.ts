import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { pokemonDex } from '../db/schema.js';
import { eq, asc } from 'drizzle-orm';
import { AuthRequest } from '../middleware/authGuard.js';

export async function getAllPokemon(_req: Request, res: Response): Promise<void> {
  const rows = await db.select().from(pokemonDex).orderBy(asc(pokemonDex.dexId));
  res.json(rows);
}

export async function addPokemon(req: AuthRequest, res: Response): Promise<void> {
  const { dexId, name } = req.body;

  if (!dexId || !name || typeof dexId !== 'number' || typeof name !== 'string') {
    res.status(400).json({ error: 'Missing or invalid fields: dexId (number), name (string)' });
    return;
  }

  try {
    const [created] = await db
      .insert(pokemonDex)
      .values({ dexId, name: name.trim() })
      .returning();
    res.status(201).json(created);
  } catch {
    res.status(409).json({ error: 'Pokemon with this dexId already exists' });
  }
}

export async function updatePokemon(req: AuthRequest, res: Response): Promise<void> {
  const dexId = parseInt(String(req.params.dexId), 10);
  const { name } = req.body;

  if (isNaN(dexId) || !name || typeof name !== 'string') {
    res.status(400).json({ error: 'Missing or invalid fields: name (string)' });
    return;
  }

  const [updated] = await db
    .update(pokemonDex)
    .set({ name: name.trim() })
    .where(eq(pokemonDex.dexId, dexId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: 'Pokemon not found' });
    return;
  }

  res.json(updated);
}
