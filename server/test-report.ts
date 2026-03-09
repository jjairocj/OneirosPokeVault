import { db } from './src/db/index.js';
import { users, masterdexSlots, ownedCards } from './src/db/schema.js';
import { eq } from 'drizzle-orm';
import TCGdex from '@tcgdex/sdk';

async function testCollectionReport() {
  console.log('Testing collection report function locally...');

  try {
    // Get admin user
    const adminUsers = await db.select().from(users).where(eq(users.role, 'admin'));
    console.log('Admin users found:', adminUsers.length);

    if (adminUsers.length === 0) {
      console.log('No admin users found');
      return;
    }

    const userId = adminUsers[0].id;
    console.log('Using user ID:', userId);

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

    // Analyze slots
    console.log('\nAnalyzing masterdex slots:');
    const ownedDexIds = new Set();
    const allDexIds = new Set();

    for (const slot of masterdexCards) {
      const dexId = parseInt(slot.slotKey);
      const isOwned = slot.cardId && ownedCardIds.has(slot.cardId);

      console.log(`Slot ${slot.id}: type=${slot.slotType}, key=${slot.slotKey}, cardId=${slot.cardId}, owned=${isOwned}, dexId=${dexId}`);

      if (!isNaN(dexId)) {
        allDexIds.add(dexId);
        if (isOwned) {
          ownedDexIds.add(dexId);
        }
      }
    }

    console.log('\nOwned dex IDs:', Array.from(ownedDexIds));
    console.log('All dex IDs:', Array.from(allDexIds));

    const missingDexIds = Array.from(allDexIds).filter(id => !ownedDexIds.has(id));
    console.log('Missing dex IDs:', missingDexIds);

    // Test TCGdex pricing
    console.log('\nTesting TCGdex pricing...');
    const sdk = new TCGdex('en');

    let totalValue = 0;
    let processedCards = 0;

    for (const slot of masterdexCards.slice(0, 5)) { // Test with first 5 cards
      if (slot.cardId && ownedCardIds.has(slot.cardId)) {
        try {
          console.log(`Fetching card data for: ${slot.cardId}`);
          const cardData = await sdk.card.get(slot.cardId);
          console.log(`Card data received for ${slot.cardId}:`, {
            name: cardData?.name,
            hasPricing: !!(cardData && (cardData as any).pricing),
            pricingKeys: cardData ? Object.keys((cardData as any).pricing || {}) : []
          });
          if (cardData) {
            const price = (cardData as any).pricing?.cardmarket?.avg || (cardData as any).pricing?.tcgplayer?.normal?.midPrice || 0;
            console.log(`Card ${slot.cardId} final price: ${price}`);
            totalValue += price;
            processedCards++;
          }
        } catch (error) {
          console.error(`Error fetching card ${slot.cardId}:`, error);
        }
      }
    }

    console.log(`\nProcessed ${processedCards} cards, total value: ${totalValue}`);

  } catch (error) {
    console.error('Error testing collection report:', error);
  }
}

testCollectionReport();