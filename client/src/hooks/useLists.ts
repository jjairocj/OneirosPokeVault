import { useState, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export const LIST_TYPES = ['wishlist', 'trade_binder', 'custom', 'pokemon_binder', 'graded_collection'] as const;
export type ListType = typeof LIST_TYPES[number];

export const LIST_TYPE_LABELS: Record<ListType, string> = {
  wishlist: 'Wishlist',
  trade_binder: 'Trade Binder',
  custom: 'Custom List',
  pokemon_binder: 'Pokémon Binder',
  graded_collection: 'Graded Collection',
};

export interface CardList {
  id: number;
  userId: number;
  name: string;
  listType: ListType;
  visibility: 'public' | 'private';
  shareSlug: string | null;
  createdAt: string;
}

export interface ListCard {
  id: number;
  listId: number;
  cardId: string;
  cardName: string | null;
  cardImage: string | null;
  quantity: number;
  notes: string | null;
}

export interface CardListDetail extends CardList {
  cards: ListCard[];
}

export function useLists() {
  const [lists, setLists] = useState<CardList[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/lists');
      if (!res.ok) throw new Error('Failed to fetch lists');
      setLists(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createList = useCallback(async (name: string, listType: ListType, visibility: 'public' | 'private' = 'private'): Promise<CardList | null> => {
    try {
      const res = await apiFetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, listType, visibility }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create list');
      }
      const list = await res.json();
      setLists((prev) => [...prev, list]);
      return list;
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  }, []);

  const deleteList = useCallback(async (id: number): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/lists/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete list');
      setLists((prev) => prev.filter((l) => l.id !== id));
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    }
  }, []);

  return { lists, loading, error, fetchLists, createList, deleteList };
}

export function useListDetail(listId: number | null) {
  const [list, setList] = useState<CardListDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    if (!listId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/lists/${listId}`);
      if (!res.ok) throw new Error('Failed to fetch list');
      setList(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [listId]);

  const addCard = useCallback(async (cardId: string, cardName: string, cardImage: string, quantity = 1, notes?: string) => {
    if (!listId) return;
    const res = await apiFetch(`/api/lists/${listId}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId, cardName, cardImage, quantity, notes }),
    });
    if (res.ok) await fetchList();
  }, [listId, fetchList]);

  const removeCard = useCallback(async (cardId: string) => {
    if (!listId) return;
    const res = await apiFetch(`/api/lists/${listId}/cards/${cardId}`, { method: 'DELETE' });
    if (res.ok) await fetchList();
  }, [listId, fetchList]);

  const updateVisibility = useCallback(async (visibility: 'public' | 'private') => {
    if (!listId) return null;
    const res = await apiFetch(`/api/lists/${listId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility }),
    });
    if (res.ok) {
      const updated = await res.json();
      setList((prev) => prev ? { ...prev, ...updated } : prev);
      return updated;
    }
    return null;
  }, [listId]);

  return { list, loading, error, fetchList, addCard, removeCard, updateVisibility };
}
