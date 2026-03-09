import { useState, useCallback } from 'react';
import tcgdex from '../lib/tcgdex';
import { Query } from '@tcgdex/sdk';

export interface CardSummary {
  id: string;
  localId: string;
  name: string;
  image?: string;
}

export interface CardDetail {
  id: string;
  localId: string;
  name: string;
  image?: string;
  set?: { id: string; name: string };
  rarity?: string;
  hp?: number;
  types?: string[];
}

const FALLBACK_IMAGE = '/card-back.svg';

export function useCards() {
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchByName = useCallback(async (name: string) => {
    if (!name.trim()) {
      setCards([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const normalizedQ = name.trim().replace(/^Mega\s/i, 'M ');
      const results = await tcgdex.card.list(
        Query.create()
          .like('name', normalizedQ)
          .sort('localId', 'ASC')
      );

      if (!results || results.length === 0) {
        setCards([]);
        return;
      }

      // Filter by word boundary so "Mew" doesn't match "Mewtwo"
      const pattern = new RegExp(`\\b${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      const filtered = results.filter((c) => pattern.test(c.name));

      const mapped: CardSummary[] = filtered.map((c) => ({
        id: c.id,
        localId: c.localId,
        name: c.name,
        image: c.image ? c.getImageURL('low', 'webp') : FALLBACK_IMAGE,
      }));

      setCards(mapped);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cards');
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCardDetail = useCallback(async (cardId: string): Promise<CardDetail | null> => {
    try {
      const card = await tcgdex.card.get(cardId);
      if (!card) return null;

      return {
        id: card.id,
        localId: card.localId,
        name: card.name,
        image: card.image ? card.getImageURL('low', 'webp') : FALLBACK_IMAGE,
        set: card.set ? { id: card.set.id, name: card.set.name } : undefined,
        rarity: card.rarity,
        hp: card.hp,
        types: card.types,
      };
    } catch {
      return null;
    }
  }, []);

  const searchBySet = useCallback(async (setId: string) => {
    if (!setId.trim()) {
      setCards([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const setData = await tcgdex.set.get(setId.trim());
      if (!setData || !setData.cards || setData.cards.length === 0) {
        setCards([]);
        return;
      }

      const mapped: CardSummary[] = setData.cards.map((c: any) => ({
        id: c.id,
        localId: c.localId,
        name: c.name,
        image: c.image ? `${c.image}/low.webp` : FALLBACK_IMAGE,
      }));

      setCards(mapped);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch set');
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { cards, loading, error, searchByName, searchBySet, getCardDetail };
}
