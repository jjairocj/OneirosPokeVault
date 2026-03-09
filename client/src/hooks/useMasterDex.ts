import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from './useAuth';

export interface MasterDexSlot {
  id: number;
  userId: number;
  slotType: string;
  slotKey: string;
  cardId: string;
  cardName?: string;
  cardImage?: string;
  createdAt: string;
}

export function useMasterDex() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<MasterDexSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const isPro = user?.plan === 'pro' || user?.role === 'admin';

  const fetchSlots = useCallback(async () => {
    if (!user || !isPro) return;
    setLoading(true);
    try {
      const res = await apiFetch('/api/masterdex');
      if (res.ok) {
        setSlots(await res.json());
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user, isPro]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const assignSlot = useCallback(
    async (slotType: string, slotKey: string, cardId: string, cardName?: string, cardImage?: string) => {
      const res = await apiFetch('/api/masterdex', {
        method: 'POST',
        body: JSON.stringify({ slotType, slotKey, cardId, cardName, cardImage }),
      });
      if (res.ok) {
        const data = await res.json();
        setSlots((prev) => {
          const filtered = prev.filter((s) => !(s.slotType === slotType && s.slotKey === slotKey));
          return [...filtered, data];
        });
      }
    },
    []
  );

  const unassignSlot = useCallback(async (slotType: string, slotKey: string) => {
    const res = await apiFetch(`/api/masterdex/${slotType}/${encodeURIComponent(slotKey)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setSlots((prev) => prev.filter((s) => !(s.slotType === slotType && s.slotKey === slotKey)));
    }
  }, []);

  const getBaseSlot = useCallback(
    (dexId: number) => slots.find((s) => s.slotType === 'base' && s.slotKey === String(dexId)),
    [slots]
  );

  const getVariantSlot = useCallback(
    (cardId: string) => slots.find((s) => s.slotType === 'variant' && s.slotKey === cardId),
    [slots]
  );

  const baseCount = slots.filter((s) => s.slotType === 'base').length;
  const variantCount = slots.filter((s) => s.slotType === 'variant').length;
  const variantSlots = slots.filter((s) => s.slotType === 'variant');

  return {
    slots,
    loading,
    isPro,
    assignSlot,
    unassignSlot,
    getBaseSlot,
    getVariantSlot,
    baseCount,
    variantCount,
    variantSlots,
    refetch: fetchSlots,
  };
}
