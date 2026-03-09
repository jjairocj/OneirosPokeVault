import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

export interface PokemonDexEntry {
  dexId: number;
  name: string;
}

const CACHE_KEY = 'pokemon-dex-v1';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

interface CacheEntry {
  ts: number;
  data: PokemonDexEntry[];
}

function loadCache(): PokemonDexEntry[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.ts > CACHE_TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function saveCache(data: PokemonDexEntry[]) {
  try {
    const entry: CacheEntry = { ts: Date.now(), data };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // ignore storage errors
  }
}

// Module-level cache so all hook instances share the same data
let moduleCache: PokemonDexEntry[] | null = loadCache();
let fetchPromise: Promise<PokemonDexEntry[]> | null = null;

async function fetchPokemonDex(): Promise<PokemonDexEntry[]> {
  if (moduleCache) return moduleCache;
  if (!fetchPromise) {
    fetchPromise = apiFetch('/api/pokemon-dex')
      .then((res) => res.json() as Promise<PokemonDexEntry[]>)
      .then((data) => {
        moduleCache = data;
        saveCache(data);
        fetchPromise = null;
        return data;
      })
      .catch(() => {
        fetchPromise = null;
        return [];
      });
  }
  return fetchPromise;
}

export function usePokemonDex() {
  const [entries, setEntries] = useState<PokemonDexEntry[]>(moduleCache ?? []);
  const [loading, setLoading] = useState(!moduleCache);

  useEffect(() => {
    if (moduleCache) {
      setEntries(moduleCache);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchPokemonDex().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const getPokemonName = (dexId: number): string | undefined =>
    entries.find((e) => e.dexId === dexId)?.name;

  return { entries, loading, getPokemonName };
}
