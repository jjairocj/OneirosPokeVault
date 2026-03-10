import { Response } from 'express';
import { db } from '../db/index.js';
import { users, pokemonDex, collectionReports, masterdexSlots } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { AuthRequest } from '../middleware/authGuard.js';
import TCGdex from '@tcgdex/sdk';

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

export async function generateCollectionReport(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;

    // Get all masterdex slots for user
    const masterdexCards = await db
      .select()
      .from(masterdexSlots)
      .where(eq(masterdexSlots.userId, userId));

    const sdk = new TCGdex('en');

    // existingCards = base slots with a card assigned
    const filledBaseSlots = masterdexCards.filter(
      slot => slot.slotType === 'base' && slot.cardId
    );

    const existingCards: any[] = [];
    let totalValue = 0;

    for (const slot of filledBaseSlots) {
      try {
        const cardData = await sdk.card.get(slot.cardId!);
        if (cardData) {
          const price = (cardData as any).pricing?.cardmarket?.avg
                     || (cardData as any).pricing?.tcgplayer?.normal?.midPrice
                     || 0;
          existingCards.push({
            cardId: slot.cardId!,
            name: slot.cardName || cardData.name,
            image: slot.cardImage || (cardData as any).image,
            price,
            slotType: slot.slotType,
            slotKey: slot.slotKey,
          });
          totalValue += price;
        }
      } catch (error) {
        console.error(`Error fetching card ${slot.cardId}:`, error);
      }
    }

    existingCards.sort((a, b) => b.price - a.price);

    // missingPokemon = dex entries NOT covered by a filled base slot
    const coveredDexIds = new Set(
      filledBaseSlots.map(slot => parseInt(slot.slotKey, 10))
    );

    const allPokemon = await db.select().from(pokemonDex);
    const missingPokemon: any[] = [];

    for (const pokemon of allPokemon) {
      if (!coveredDexIds.has(pokemon.dexId)) {
        try {
          const pokeResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.dexId}`);
          const pokeData = await pokeResponse.json();
          const sprite = pokeData.sprites?.front_default
                      || pokeData.sprites?.other?.['official-artwork']?.front_default;
          missingPokemon.push({ dexId: pokemon.dexId, name: pokemon.name, image: sprite });
        } catch (error) {
          console.error(`Error fetching PokeAPI data for dexId ${pokemon.dexId}:`, error);
          missingPokemon.push({ dexId: pokemon.dexId, name: pokemon.name, image: null });
        }
      }
    }

    const reportData = {
      existingCards,
      missingPokemon,
      totalValue,
      generatedAt: new Date().toISOString()
    };

    await db.delete(collectionReports).where(eq(collectionReports.userId, userId));
    await db.insert(collectionReports).values({
      userId,
      reportData: JSON.stringify(reportData)
    });

    res.json(reportData);
  } catch (error) {
    console.error('Generate collection report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getCollectionReport(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;

    const reports = await db
      .select()
      .from(collectionReports)
      .where(eq(collectionReports.userId, userId))
      .orderBy(desc(collectionReports.createdAt))
      .limit(1);

    if (reports.length === 0) {
      res.status(404).json({ error: 'No report found' });
      return;
    }

    const report = reports[0];
    res.json(JSON.parse(report.reportData));
  } catch (error) {
    console.error('Get collection report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
