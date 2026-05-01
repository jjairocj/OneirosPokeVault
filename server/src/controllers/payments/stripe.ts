// Stripe integration — mock until API keys are configured

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

export async function createStripeCheckout(paymentId: number, amount: number, currency: string): Promise<string> {
  if (!STRIPE_SECRET_KEY) {
    // Mock: return a local redirect URL until Stripe is configured
    return `${APP_URL}/payment/pending?paymentId=${paymentId}&provider=stripe`;
  }

  const params = new URLSearchParams({
    'payment_method_types[]': 'card',
    'line_items[0][price_data][currency]': currency.toLowerCase(),
    'line_items[0][price_data][unit_amount]': String(amount),
    'line_items[0][price_data][product_data][name]': 'TCGVault Pro Plan',
    'line_items[0][quantity]': '1',
    'mode': 'payment',
    'success_url': `${APP_URL}/payment/callback?paymentId=${paymentId}&provider=stripe&result=success`,
    'cancel_url': `${APP_URL}/payment/callback?paymentId=${paymentId}&provider=stripe&result=cancel`,
    'metadata[paymentId]': String(paymentId),
  });

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) throw new Error(`Stripe API error: ${response.status}`);
  const data = await response.json();
  return data.url;
}
