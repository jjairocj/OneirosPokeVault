import { Response } from 'express';
import { db } from '../../db/index.js';
import { decks, deckCards } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { AuthRequest } from '../../middleware/authGuard.js';

export async function exportDeck(req: AuthRequest, res: Response): Promise<void> {
  try {
    const deckId = parseInt(req.params.id as string, 10);
    if (isNaN(deckId)) { res.status(400).json({ error: 'Invalid deck id' }); return; }

    const [deck] = await db.select().from(decks)
      .where(and(eq(decks.id, deckId), eq(decks.userId, req.userId!))).limit(1);
    if (!deck) { res.status(404).json({ error: 'Deck not found' }); return; }

    const cards = await db.select().from(deckCards).where(eq(deckCards.deckId, deckId));

    const lines = cards.map((c) => {
      const setId = c.cardId.split('-')[0] || '';
      const localId = c.cardId.split('-').slice(1).join('-') || '';
      return `${c.quantity} ${c.cardName} ${setId.toUpperCase()} ${localId}`;
    });

    res.json({ name: deck.name, format: deck.format, text: lines.join('\n') });
  } catch (error) {
    console.error('Export deck error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function parsePTCGLiveText(text: string): { quantity: number; name: string; setCode: string; number: string }[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const cards: { quantity: number; name: string; setCode: string; number: string }[] = [];

  for (const line of lines) {
    const match = line.match(/^(\d+)\s+(.+?)\s+([A-Z0-9]+)\s+(\S+)$/);
    if (match) {
      cards.push({ quantity: parseInt(match[1], 10), name: match[2], setCode: match[3], number: match[4] });
    }
  }
  return cards;
}

export async function importDeck(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, format, text } = req.body;
    if (!name?.trim() || !format || !text?.trim()) {
      res.status(400).json({ error: 'name, format, and text are required' });
      return;
    }

    const parsed = parsePTCGLiveText(text);
    if (parsed.length === 0) {
      res.status(400).json({ error: 'Could not parse any cards from the text' });
      return;
    }

    const [deck] = await db.insert(decks)
      .values({ userId: req.userId!, name: name.trim(), format })
      .returning();

    const cardValues = parsed.map((c) => ({
      deckId: deck.id,
      cardId: `${c.setCode.toLowerCase()}-${c.number}`,
      cardName: c.name,
      quantity: c.quantity,
      isBasicEnergy: isBasicEnergyName(c.name) ? 1 : 0,
    }));

    if (cardValues.length > 0) {
      await db.insert(deckCards).values(cardValues);
    }

    const cards = await db.select().from(deckCards).where(eq(deckCards.deckId, deck.id));
    res.status(201).json({ ...deck, cards });
  } catch (error: any) {
    if (error.code === '23505') { res.status(409).json({ error: 'Deck with this name already exists' }); return; }
    console.error('Import deck error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function isBasicEnergyName(name: string): boolean {
  const basicEnergies = ['grass energy', 'fire energy', 'water energy', 'lightning energy',
    'psychic energy', 'fighting energy', 'darkness energy', 'metal energy', 'fairy energy'];
  return basicEnergies.includes(name.toLowerCase());
}
