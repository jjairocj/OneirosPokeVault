import { Response } from 'express';
import { db } from '../../db/index.js';
import { payments, users } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { AuthRequest } from '../../middleware/authGuard.js';
import { createBoldCheckout } from './bold.js';
import { createStripeCheckout } from './stripe.js';

const PLANS = {
  pro_monthly_cop: { amount: 1990000, currency: 'COP', provider: 'bold' as const },
  pro_monthly_usd: { amount: 499, currency: 'USD', provider: 'stripe' as const },
  pro_yearly_cop: { amount: 18900000, currency: 'COP', provider: 'bold' as const },
  pro_yearly_usd: { amount: 3999, currency: 'USD', provider: 'stripe' as const },
};

export type PlanKey = keyof typeof PLANS;

export async function initiatePayment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { plan } = req.body;
    if (!plan || !(plan in PLANS)) {
      res.status(400).json({ error: `plan must be one of: ${Object.keys(PLANS).join(', ')}` });
      return;
    }

    const config = PLANS[plan as PlanKey];
    const [payment] = await db.insert(payments)
      .values({ userId: req.userId!, amount: config.amount, currency: config.currency, provider: config.provider, status: 'pending' })
      .returning();

    let checkoutUrl: string;
    if (config.provider === 'bold') {
      checkoutUrl = await createBoldCheckout(payment.id, config.amount, config.currency);
    } else {
      checkoutUrl = await createStripeCheckout(payment.id, config.amount, config.currency);
    }

    res.status(201).json({ paymentId: payment.id, checkoutUrl, provider: config.provider });
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPaymentStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid payment id' }); return; }

    const [payment] = await db.select().from(payments)
      .where(eq(payments.id, id)).limit(1);
    if (!payment || payment.userId !== req.userId!) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }
    res.json(payment);
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function handleWebhook(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { provider, paymentId, status, externalId } = req.body;
    if (!paymentId || !status) { res.status(400).json({ error: 'paymentId and status are required' }); return; }

    const id = parseInt(paymentId, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid paymentId' }); return; }

    const [payment] = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    if (!payment) { res.status(404).json({ error: 'Payment not found' }); return; }

    const validStatus = ['pending', 'completed', 'failed'];
    if (!validStatus.includes(status)) { res.status(400).json({ error: 'Invalid status' }); return; }

    await db.update(payments)
      .set({ status, externalId: externalId ?? payment.externalId })
      .where(eq(payments.id, id));

    if (status === 'completed') {
      await db.update(users).set({ plan: 'pro' }).where(eq(users.id, payment.userId));
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
