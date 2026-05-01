import { Response } from 'express';
import { db } from '../db/index.js';
import { cardNotes } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { AuthRequest } from '../middleware/authGuard.js';

const MAX_NOTE_LENGTH = 1000;

export async function getNote(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { cardId } = req.params;
    const [note] = await db.select().from(cardNotes)
      .where(and(eq(cardNotes.userId, req.userId!), eq(cardNotes.cardId, cardId as string))).limit(1);
    res.json(note ?? null);
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function upsertNote(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { cardId } = req.params;
    const { note } = req.body;

    if (!note?.trim()) { res.status(400).json({ error: 'note is required' }); return; }
    if (note.length > MAX_NOTE_LENGTH) {
      res.status(400).json({ error: `note must be at most ${MAX_NOTE_LENGTH} characters` });
      return;
    }

    const values = { userId: req.userId!, cardId: cardId as string, note: note.trim(), updatedAt: new Date() };
    const [saved] = await db.insert(cardNotes)
      .values(values)
      .onConflictDoUpdate({ target: [cardNotes.userId, cardNotes.cardId], set: { note: values.note, updatedAt: values.updatedAt } })
      .returning();
    res.json(saved);
  } catch (error) {
    console.error('Upsert note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteNote(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { cardId } = req.params;
    const result = await db.delete(cardNotes)
      .where(and(eq(cardNotes.userId, req.userId!), eq(cardNotes.cardId, cardId as string))).returning();
    if (!result.length) { res.status(404).json({ error: 'Note not found' }); return; }
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllNotes(req: AuthRequest, res: Response): Promise<void> {
  try {
    const notes = await db.select().from(cardNotes).where(eq(cardNotes.userId, req.userId!));
    res.json(notes);
  } catch (error) {
    console.error('Get all notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
