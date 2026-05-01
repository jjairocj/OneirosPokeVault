import { useState, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export type PlanKey = 'pro_monthly_cop' | 'pro_monthly_usd' | 'pro_yearly_cop' | 'pro_yearly_usd';

export const PLAN_INFO: Record<PlanKey, { label: string; price: string; currency: string; period: string; provider: string; savings?: string }> = {
  pro_monthly_cop: { label: 'Pro Mensual', price: '$19.900', currency: 'COP', period: 'mes', provider: 'Bold PSE' },
  pro_monthly_usd: { label: 'Pro Monthly', price: '$4.99', currency: 'USD', period: 'month', provider: 'Stripe' },
  pro_yearly_cop: { label: 'Pro Anual', price: '$189.000', currency: 'COP', period: 'año', provider: 'Bold PSE', savings: 'Ahorra 2 meses' },
  pro_yearly_usd: { label: 'Pro Yearly', price: '$39.99', currency: 'USD', period: 'year', provider: 'Stripe', savings: 'Save 2 months' },
};

export interface Payment {
  id: number;
  userId: number;
  amount: number;
  currency: string;
  provider: string;
  status: 'pending' | 'completed' | 'failed';
  externalId: string | null;
  createdAt: string;
}

export function usePayments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiate = useCallback(async (plan: PlanKey): Promise<{ paymentId: number; checkoutUrl: string; provider: string } | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Payment initiation failed');
      }
      return res.json();
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkStatus = useCallback(async (paymentId: number): Promise<Payment | null> => {
    try {
      const res = await apiFetch(`/api/payments/${paymentId}`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }, []);

  return { loading, error, initiate, checkStatus };
}
