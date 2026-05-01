import { useState, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export interface Deck {
  id: number;
  userId: number;
  name: string;
  format: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeckCard {
  id: number;
  deckId: number;
  cardId: string;
  cardName: string;
  cardImage: string | null;
  quantity: number;
  isBasicEnergy: number;
}

export interface DeckDetail extends Deck {
  cards: DeckCard[];
}

export interface ValidationResult {
  valid: boolean;
  totalCards: number;
  format: string;
  errors: { type: string; message: string; details?: Record<string, number> }[];
}

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDecks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/decks');
      if (!res.ok) throw new Error('Failed to fetch decks');
      setDecks(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDeck = useCallback(async (name: string, format: string, description?: string): Promise<Deck | null> => {
    try {
      const res = await apiFetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, format, description }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create deck');
      }
      const deck = await res.json();
      setDecks((prev) => [...prev, deck]);
      return deck;
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  }, []);

  const deleteDeck = useCallback(async (id: number): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/decks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete deck');
      setDecks((prev) => prev.filter((d) => d.id !== id));
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    }
  }, []);

  return { decks, loading, error, fetchDecks, createDeck, deleteDeck };
}

export function useDeckDetail(deckId: number | null) {
  const [deck, setDeck] = useState<DeckDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeck = useCallback(async () => {
    if (!deckId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/decks/${deckId}`);
      if (!res.ok) throw new Error('Failed to fetch deck');
      setDeck(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  const addCard = useCallback(async (cardId: string, cardName: string, cardImage: string, quantity: number, isBasicEnergy: boolean) => {
    if (!deckId) return;
    const res = await apiFetch(`/api/decks/${deckId}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId, cardName, cardImage, quantity, isBasicEnergy: isBasicEnergy ? 1 : 0 }),
    });
    if (res.ok) await fetchDeck();
  }, [deckId, fetchDeck]);

  const removeCard = useCallback(async (cardId: string) => {
    if (!deckId) return;
    const res = await apiFetch(`/api/decks/${deckId}/cards/${cardId}`, { method: 'DELETE' });
    if (res.ok) await fetchDeck();
  }, [deckId, fetchDeck]);

  const validateDeck = useCallback(async (): Promise<ValidationResult | null> => {
    if (!deckId) return null;
    const res = await apiFetch(`/api/decks/${deckId}/validate`);
    if (!res.ok) return null;
    return res.json();
  }, [deckId]);

  const exportDeck = useCallback(async (): Promise<string | null> => {
    if (!deckId) return null;
    const res = await apiFetch(`/api/decks/${deckId}/export`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.text;
  }, [deckId]);

  const importDeck = useCallback(async (deckId: number, text: string) => {
    const res = await apiFetch(`/api/decks/${deckId}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ptcgLiveText: text }),
    });
    if (res.ok) await fetchDeck();
    return res.ok;
  }, [fetchDeck]);

  const simulateHand = useCallback(async () => {
    if (!deckId) return null;
    const res = await apiFetch(`/api/decks/${deckId}/simulate`, { method: 'POST' });
    if (!res.ok) return null;
    return res.json();
  }, [deckId]);

  return { deck, loading, error, fetchDeck, addCard, removeCard, validateDeck, exportDeck, importDeck, simulateHand };
}
