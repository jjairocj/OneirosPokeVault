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
    console.log('Processing owned cards for pricing...');

    for (const ownedCard of owned) {
      try {
        console.log(`Fetching card data for: ${ownedCard.cardId}`);
        const cardData = await sdk.card.get(ownedCard.cardId);
        console.log(`Card data received for ${ownedCard.cardId}:`, {
          name: cardData?.name,
          hasPricing: !!(cardData && (cardData as any).pricing),
          pricingKeys: cardData ? Object.keys((cardData as any).pricing || {}) : []
        });
        if (cardData) {
          const price = (cardData as any).pricing?.cardmarket?.avg || (cardData as any).pricing?.tcgplayer?.normal?.midPrice || 0;
          console.log(`Card ${ownedCard.cardId} final price: ${price}`);

          // Find corresponding masterdex slot for additional info
          const slotInfo = masterdexCards.find(slot => slot.cardId === ownedCard.cardId);

          existingCards.push({
            cardId: ownedCard.cardId,
            name: slotInfo?.cardName || cardData.name,
            image: slotInfo?.cardImage || (cardData as any).image,
            price: price,
            slotType: slotInfo?.slotType || 'unknown',
            slotKey: slotInfo?.slotKey || 'unknown'
          });
          totalValue += price;
        } else {
          console.log(`No card data found for ${ownedCard.cardId}`);
        }
      } catch (error) {
        console.error(`Error fetching card ${ownedCard.cardId}:`, error);
      }
    }

    console.log(`Processed ${existingCards.length} existing cards, total value: ${totalValue}`);

    // Sort existing cards by price descending
    existingCards.sort((a, b) => b.price - a.price);

    // Get all available Pokemon from pokemonDex
    const allPokemon = await db.select().from(pokemonDex);
    console.log(`Total Pokemon in dex: ${allPokemon.length}`);

    // Get owned Pokemon dexIds from owned cards
    const ownedDexIds = new Set();
    for (const ownedCard of owned) {
      try {
        const cardData = await sdk.card.get(ownedCard.cardId);
        if (cardData && (cardData as any).dexId && Array.isArray((cardData as any).dexId)) {
          ownedDexIds.add((cardData as any).dexId[0]);
        }
      } catch (error) {
        console.error(`Error getting dexId for card ${ownedCard.cardId}:`, error);
      }
    }
    console.log(`User owns Pokemon with dexIds:`, Array.from(ownedDexIds));

    // Find missing Pokemon
    const missingPokemon: any[] = [];
    for (const pokemon of allPokemon) {
      if (!ownedDexIds.has(pokemon.dexId)) {
        try {
          // Get Pokemon data from PokeAPI
          const pokeResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.dexId}`);
          const pokeData = await pokeResponse.json();
          const sprite = pokeData.sprites?.front_default || pokeData.sprites?.other?.['official-artwork']?.front_default;

          missingPokemon.push({
            dexId: pokemon.dexId,
            name: pokemon.name,
            image: sprite
          });
        } catch (error) {
          console.error(`Error fetching PokeAPI data for dexId ${pokemon.dexId}:`, error);
          // Fallback without image
          missingPokemon.push({
            dexId: pokemon.dexId,
            name: pokemon.name,
            image: null
          });
        }
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
