import { Response } from 'express';
import { db } from '../db/index.js';
import { users, pokemonDex, ownedCards, collectionReports, masterdexSlots } from '../db/schema.js';
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
    console.log('Generating collection report for user:', userId);

    // Test basic database connectivity
    console.log('Testing database connectivity...');
    const testQuery = await db.select().from(users).limit(1);
    console.log('Database test successful, found users:', testQuery.length);

    // Get all masterdex slots for user
    console.log('Fetching masterdex slots...');
    const masterdexCards = await db
      .select()
      .from(masterdexSlots)
      .where(eq(masterdexSlots.userId, userId));
    console.log('Found masterdex slots:', masterdexCards.length);

    // Get owned cards
    console.log('Fetching owned cards...');
    const owned = await db
      .select({ cardId: ownedCards.cardId })
      .from(ownedCards)
      .where(eq(ownedCards.userId, userId));
    console.log('Found owned cards:', owned.length);

    const ownedCardIds = new Set(owned.map(o => o.cardId));
    console.log('Owned card IDs:', Array.from(ownedCardIds));

    // Initialize TCGdex
    console.log('Initializing TCGdex...');
    const sdk = new TCGdex('en');

    // Calculate prices for owned cards
    const existingCards: any[] = [];
    let totalValue = 0;
    console.log('Processing cards for pricing...');

    for (const slot of masterdexCards) {
      if (slot.cardId && ownedCardIds.has(slot.cardId)) {
        try {
          console.log(`Fetching card data for: ${slot.cardId}`);
          const cardData = await sdk.card.get(slot.cardId);
          if (cardData) {
            const price = (cardData as any).pricing?.cardmarket?.avg || (cardData as any).pricing?.tcgplayer?.normal?.midPrice || 0;
            console.log(`Card ${slot.cardId} price: ${price}`);
            existingCards.push({
              cardId: slot.cardId,
              name: slot.cardName || cardData.name,
              image: slot.cardImage || (cardData as any).image,
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

    console.log(`Processed ${existingCards.length} existing cards, total value: ${totalValue}`);

    // Sort existing cards by price descending
    existingCards.sort((a, b) => b.price - a.price);

    // Find missing cards - get dexIds from masterdex that don't have owned cards
    const ownedDexIds = new Set(
      masterdexCards
        .filter(slot => slot.cardId && ownedCardIds.has(slot.cardId))
        .map(slot => parseInt(slot.slotKey))
        .filter(id => !isNaN(id))
    );

    const allDexIds = new Set(
      masterdexCards
        .map(slot => parseInt(slot.slotKey))
        .filter(id => !isNaN(id))
    );

    const missingDexIds = Array.from(allDexIds).filter(id => !ownedDexIds.has(id));
    console.log('Missing dex IDs:', missingDexIds);

    // Fetch missing Pokemon data from PokeAPI GraphQL
    const missingPokemon: any[] = [];

    if (missingDexIds.length > 0) {
      console.log('Fetching missing Pokemon data from PokeAPI...');
      try {
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

        console.log('PokeAPI response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('PokeAPI data received:', data.data?.pokemon_v2_pokemon?.length || 0, 'pokemon');
          for (const pokemon of data.data.pokemon_v2_pokemon || []) {
            const sprites = pokemon.pokemon_v2_pokemonsprites?.[0]?.sprites;
            const image = sprites ? JSON.parse(sprites).front_default : null;
            missingPokemon.push({
              dexId: pokemon.id,
              name: pokemon.name,
              image: image
            });
          }
        } else {
          console.error('PokeAPI request failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching from PokeAPI:', error);
      }
    }

    console.log(`Found ${missingPokemon.length} missing Pokemon`);

    // Create report data
    const reportData = {
      existingCards,
      missingPokemon,
      totalValue,
      generatedAt: new Date().toISOString()
    };
    console.log('Report data created:', {
      existingCardsCount: existingCards.length,
      missingPokemonCount: missingPokemon.length,
      totalValue
    });

    // Delete previous report
    console.log('Deleting previous reports...');
    await db.delete(collectionReports).where(eq(collectionReports.userId, userId));

    // Save new report
    console.log('Saving new report...');
    await db.insert(collectionReports).values({
      userId,
      reportData: JSON.stringify(reportData)
    });

    console.log('Report generated successfully');
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
