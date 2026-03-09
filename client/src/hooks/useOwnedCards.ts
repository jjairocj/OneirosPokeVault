import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from './useAuth';

export interface OwnedCard {
  id: number;
  userId: number;
  cardId: string;
  createdAt: string;
}

export function useOwnedCards() {
  const { user } = useAuth();
  const [ownedCards, setOwnedCards] = useState<OwnedCard[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOwnedCards = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await apiFetch('/api/owned-cards');
      if (res.ok) {
        const data = await res.json();
        setOwnedCards(
          data.map((c: any) => ({
            id: c.id,
            userId: c.userId,
            cardId: c.cardId,
            createdAt: c.createdAt,
          }))
        );
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOwnedCards();
  }, [fetchOwnedCards]);

  const isOwned = useCallback(
    (cardId: string) => ownedCards.some((c) => c.cardId === cardId),
    [ownedCards]
  );

  const toggleOwned = useCallback(
    async (cardId: string) => {
      if (isOwned(cardId)) {
        const res = await apiFetch(`/api/owned-cards/${cardId}`, { method: 'DELETE' });
        if (res.ok) {
          setOwnedCards((prev) => prev.filter((c) => c.cardId !== cardId));
        }
      } else {
        const res = await apiFetch('/api/owned-cards', {
          method: 'POST',
          body: JSON.stringify({ card_id: cardId }),
        });
        if (res.ok) {
          const data = await res.json();
          setOwnedCards((prev) => [
            ...prev,
            {
              id: data.id,
              userId: data.userId,
              cardId: data.cardId,
              createdAt: data.createdAt,
            },
          ]);
        }
      }
    },
    [isOwned]
  );

  return { ownedCards, loading, isOwned, toggleOwned, refetch: fetchOwnedCards };
}
