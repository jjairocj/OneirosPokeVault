import { Response } from 'express';
import { db } from '../db/index.js';
import { users, pokemonDex, ownedCards, collectionReports } from '../db/schema.js';
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
    const userId = req.user!.id;

    // Get all masterdex slots for user
    const masterdexCards = await db
      .select()
      .from(masterdexSlots)
      .where(eq(masterdexSlots.userId, userId));

    // Get owned cards
    const owned = await db
      .select({ cardId: ownedCards.cardId })
      .from(ownedCards)
      .where(eq(ownedCards.userId, userId));

    const ownedCardIds = new Set(owned.map(o => o.cardId));

    // Initialize TCGdex
    const sdk = new TCGdex('en');

    // Calculate prices for owned cards
    const existingCards: any[] = [];
    let totalValue = 0;

    for (const slot of masterdexCards) {
      if (ownedCardIds.has(slot.cardId)) {
        try {
          const cardData = await sdk.card.get(slot.cardId);
          if (cardData) {
            const price = cardData.pricing?.cardmarket?.avg || cardData.pricing?.tcgplayer?.normal?.midPrice || 0;
            existingCards.push({
              cardId: slot.cardId,
              name: slot.cardName || cardData.name,
              image: slot.cardImage || cardData.image,
              price: price,
              slotType: slot.slotType,
              slotKey: slot.slotKey
            });
            totalValue += price;
          }
        } catch (error) {
          console.error(`Error fetching card ${slot.cardId}:`, error);
        }
      }
    }

    // Sort existing cards by price descending
    existingCards.sort((a, b) => b.price - a.price);

    // Find missing cards - get dexIds from masterdex that don't have owned cards
    const ownedDexIds = new Set(
      masterdexCards
        .filter(slot => ownedCardIds.has(slot.cardId))
        .map(slot => parseInt(slot.slotKey))
        .filter(id => !isNaN(id))
    );

    const allDexIds = new Set(
      masterdexCards
        .map(slot => parseInt(slot.slotKey))
        .filter(id => !isNaN(id))
    );

    const missingDexIds = Array.from(allDexIds).filter(id => !ownedDexIds.has(id));

    // Fetch missing Pokemon data from PokeAPI GraphQL
    const missingPokemon: any[] = [];

    if (missingDexIds.length > 0) {
      const query = `
        query GetPokemon($ids: [Int!]!) {
          pokemon_v2_pokemon(where: {id: {_in: $ids}}) {
            id
            name
            pokemon_v2_pokemonsprites {
              sprites
            }
          }
        }
      `;

      const response = await fetch('https://beta.pokeapi.co/graphql/v1beta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { ids: missingDexIds }
        })
      });

      if (response.ok) {
        const data = await response.json();
        for (const pokemon of data.data.pokemon_v2_pokemon || []) {
          const sprites = pokemon.pokemon_v2_pokemonsprites?.[0]?.sprites;
          const image = sprites ? JSON.parse(sprites).front_default : null;
          missingPokemon.push({
            dexId: pokemon.id,
            name: pokemon.name,
            image: image
          });
        }
      }
    }

    // Create report data
    const reportData = {
      existingCards,
      missingPokemon,
      totalValue,
      generatedAt: new Date().toISOString()
    };

    // Delete previous report
    await db.delete(collectionReports).where(eq(collectionReports.userId, userId));

    // Save new report
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
    const userId = req.user!.id;

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
