import { useState, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export interface PriceSnapshot {
  id: number;
  cardId: string;
  source: string;
  price: number;
  currency: string;
  snapshotDate: string;
}

export interface PriceHistory {
  cardId: string;
  snapshots: PriceSnapshot[];
  latest: PriceSnapshot | null;
  days: number;
}

export interface LatestPrice {
  price: number;
  currency: string;
  source: string;
  date: string;
}

export function usePriceHistory(cardId: string | null) {
  const [history, setHistory] = useState<PriceHistory | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async (days = 30, source?: string) => {
    if (!cardId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ days: String(days) });
      if (source) params.set('source', source);
      const res = await apiFetch(`/api/prices/${encodeURIComponent(cardId)}?${params}`);
      if (res.ok) setHistory(await res.json());
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  const recordPrice = useCallback(async (source: string, price: number, currency: string) => {
    if (!cardId) return false;
    const res = await apiFetch('/api/prices/snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId, source, price, currency }),
    });
    return res.ok;
  }, [cardId]);

  return { history, loading, fetchHistory, recordPrice };
}

export function useLatestPrices() {
  const [prices, setPrices] = useState<Record<string, LatestPrice | null>>({});
  const [loading, setLoading] = useState(false);

  const fetchLatest = useCallback(async (cardIds: string[]) => {
    if (!cardIds.length) return;
    setLoading(true);
    try {
      const res = await apiFetch('/api/prices/latest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardIds }),
      });
      if (res.ok) setPrices(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  return { prices, loading, fetchLatest };
}
