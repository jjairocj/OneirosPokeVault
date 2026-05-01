import { Response } from 'express';
import { db } from '../../db/index.js';
import { lists, listCards } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { AuthRequest } from '../../middleware/authGuard.js';
import { nanoid } from 'nanoid';

const LIST_TYPES = ['wishlist', 'trade_binder', 'custom', 'pokemon_binder', 'graded_collection'] as const;

export async function getLists(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await db.select().from(lists)
      .where(eq(lists.userId, req.userId!))
      .orderBy(lists.createdAt);
    res.json(result);
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createList(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, listType, visibility } = req.body;
    if (!name?.trim() || !listType) {
      res.status(400).json({ error: 'name and listType are required' });
      return;
    }
    if (!LIST_TYPES.includes(listType)) {
      res.status(400).json({ error: `listType must be one of: ${LIST_TYPES.join(', ')}` });
      return;
    }
    const vis = visibility === 'public' ? 'public' : 'private';
    const shareSlug = vis === 'public' ? nanoid(10) : null;

    const [list] = await db.insert(lists)
      .values({ userId: req.userId!, name: name.trim(), listType, visibility: vis, shareSlug })
      .returning();
    res.status(201).json(list);
  } catch (error: any) {
    if (error.code === '23505') { res.status(409).json({ error: 'List with this name already exists' }); return; }
    console.error('Create list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getList(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid list id' }); return; }

    const [list] = await db.select().from(lists)
      .where(and(eq(lists.id, id), eq(lists.userId, req.userId!))).limit(1);
    if (!list) { res.status(404).json({ error: 'List not found' }); return; }

    const cards = await db.select().from(listCards).where(eq(listCards.listId, id));
    res.json({ ...list, cards });
  } catch (error) {
    console.error('Get list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateList(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid list id' }); return; }

    const { name, visibility } = req.body;
    const updates: Record<string, any> = {};
    if (name?.trim()) updates.name = name.trim();
    if (visibility !== undefined) {
      updates.visibility = visibility === 'public' ? 'public' : 'private';
      if (updates.visibility === 'public') updates.shareSlug = nanoid(10);
      else updates.shareSlug = null;
    }

    const result = await db.update(lists).set(updates)
      .where(and(eq(lists.id, id), eq(lists.userId, req.userId!))).returning();
    if (!result.length) { res.status(404).json({ error: 'List not found' }); return; }
    res.json(result[0]);
  } catch (error: any) {
    if (error.code === '23505') { res.status(409).json({ error: 'List name already exists' }); return; }
    console.error('Update list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteList(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid list id' }); return; }

    const result = await db.delete(lists)
      .where(and(eq(lists.id, id), eq(lists.userId, req.userId!))).returning();
    if (!result.length) { res.status(404).json({ error: 'List not found' }); return; }
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPublicList(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const [list] = await db.select().from(lists)
      .where(and(eq(lists.shareSlug, slug as string), eq(lists.visibility, 'public'))).limit(1);
    if (!list) { res.status(404).json({ error: 'List not found' }); return; }

    const cards = await db.select().from(listCards).where(eq(listCards.listId, list.id));
    res.json({ ...list, cards });
  } catch (error) {
    console.error('Get public list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
