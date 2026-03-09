import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from './useAuth';

export interface Collection {
  id: number;
  userId: number;
  entryName: string;
  createdAt: string;
}

export function useCollections() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCollections = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await apiFetch('/api/collections');
      if (res.ok) {
        const data = await res.json();
        setCollections(
          data.map((c: any) => ({
            id: c.id,
            userId: c.userId,
            entryName: c.entryName,
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
    fetchCollections();
  }, [fetchCollections]);

  const addCollection = useCallback(
    async (entryName: string): Promise<{ success: boolean; planLimit?: boolean }> => {
      const res = await apiFetch('/api/collections', {
        method: 'POST',
        body: JSON.stringify({ entry_name: entryName }),
      });

      if (res.ok) {
        await fetchCollections();
        return { success: true };
      }

      const data = await res.json();
      if (data.code === 'PLAN_LIMIT') {
        return { success: false, planLimit: true };
      }

      throw new Error(data.error || 'Failed to add collection');
    },
    [fetchCollections]
  );

  const removeCollection = useCallback(
    async (id: number) => {
      const res = await apiFetch(`/api/collections/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchCollections();
      }
    },
    [fetchCollections]
  );

  return { collections, loading, addCollection, removeCollection, refetch: fetchCollections };
}
