// Bold PSE integration — mock until API keys are configured

const BOLD_API_URL = process.env.BOLD_API_URL || 'https://api.bold.co';
const BOLD_API_KEY = process.env.BOLD_API_KEY;
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

export async function createBoldCheckout(paymentId: number, amount: number, currency: string): Promise<string> {
  if (!BOLD_API_KEY) {
    // Mock: return a local redirect URL until Bold is configured
    return `${APP_URL}/payment/pending?paymentId=${paymentId}&provider=bold`;
  }

  const response = await fetch(`${BOLD_API_URL}/v1/checkout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BOLD_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: { total: amount, currency },
      reference: `tcgvault-${paymentId}`,
      redirectionUrl: `${APP_URL}/payment/callback?paymentId=${paymentId}&provider=bold`,
      description: 'TCGVault Pro Plan',
      paymentMethods: ['PSE', 'BANCOLOMBIA_TRANSFER', 'CARD'],
    }),
  });

  if (!response.ok) throw new Error(`Bold API error: ${response.status}`);
  const data = await response.json();
  return data.checkoutUrl;
}
