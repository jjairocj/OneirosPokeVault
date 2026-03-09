import { generateCollectionReport } from './src/controllers/admin.js';
import { db } from './src/db/index.js';
import { users } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function testRealFunction() {
  console.log('Testing real generateCollectionReport function...');

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

    // Create a mock request/response to test the function
    const mockReq = {
      userId: userId
    };

    const mockRes = {
      json: (data: any) => {
        console.log('Function returned:', {
          existingCardsCount: data.existingCards?.length || 0,
          missingPokemonCount: data.missingPokemon?.length || 0,
          totalValue: data.totalValue
        });
        return data;
      },
      status: (code: number) => ({
        json: (error: any) => {
          console.error('Function error:', code, error);
          return error;
        }
      })
    };

    // Call the real function
    await generateCollectionReport(mockReq as any, mockRes as any);

  } catch (error) {
    console.error('Test error:', error);
  }
}

testRealFunction();