import { useState, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export interface CardNote {
  id: number;
  userId: number;
  cardId: string;
  note: string;
  updatedAt: string;
}

export function useCardNote(cardId: string | null) {
  const [note, setNote] = useState<CardNote | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchNote = useCallback(async () => {
    if (!cardId) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/pro/notes/${encodeURIComponent(cardId)}`);
      if (res.ok) setNote(await res.json());
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  const saveNote = useCallback(async (text: string): Promise<boolean> => {
    if (!cardId) return false;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/pro/notes/${encodeURIComponent(cardId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: text }),
      });
      if (res.ok) { setNote(await res.json()); return true; }
      return false;
    } finally {
      setSaving(false);
    }
  }, [cardId]);

  const deleteNote = useCallback(async (): Promise<boolean> => {
    if (!cardId) return false;
    const res = await apiFetch(`/api/pro/notes/${encodeURIComponent(cardId)}`, { method: 'DELETE' });
    if (res.ok) { setNote(null); return true; }
    return false;
  }, [cardId]);

  return { note, loading, saving, fetchNote, saveNote, deleteNote };
}
