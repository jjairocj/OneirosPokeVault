import { useState, useEffect, useCallback } from 'react';
import tcgdex from '../../lib/tcgdex';
import { Query } from '@tcgdex/sdk';

type SearchMode = 'pokemon' | 'set' | 'artist';

interface SetSuggestion { id: string; name: string; cardCount?: { total: number }; }
interface Suggestion { label: string; value: string; }

export function useAddBarSearch(mode: SearchMode) {
  const [allSets, setAllSets] = useState<SetSuggestion[]>([]);
  const [allIllustrators, setAllIllustrators] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    tcgdex.set.list().then((sets) => { if (sets) setAllSets(sets as unknown as SetSuggestion[]); }).catch(() => {});
  }, []);

  useEffect(() => {
    (tcgdex as any).fetch('illustrators').then((list: string[]) => { if (list) setAllIllustrators(list.sort()); }).catch(() => {});
  }, []);

  const search = useCallback(async (query: string) => {
    if (mode === 'pokemon') {
      if (query.length < 2) { setSuggestions([]); return; }
      try {
        const normalizedQ = query.trim().replace(/^Mega\s/i, 'M ');
        const results = await tcgdex.card.list(Query.create().like('name', normalizedQ).paginate(1, 100));
        if (!results) { setSuggestions([]); return; }
        const names = new Set<string>();
        results.filter((c) => !c.image?.includes('/tcgp/')).forEach((c) => names.add(c.name));
        setSuggestions(Array.from(names).filter((n) => n.toLowerCase().includes(normalizedQ.toLowerCase()) || n.toLowerCase().includes(query.trim().toLowerCase())).sort().slice(0, 8).map((n) => ({ label: n, value: n })));
      } catch { setSuggestions([]); }
    } else if (mode === 'set') {
      if (query.length < 1) { setSuggestions([]); return; }
      const q = query.toLowerCase();
      setSuggestions(allSets.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 8).map((s) => ({ label: `${s.name}${s.cardCount ? ` (${s.cardCount.total})` : ''}`, value: `set:${s.id}:${s.name}` })));
    } else {
      if (query.length < 1) { setSuggestions([]); return; }
      const q = query.toLowerCase();
      setSuggestions(allIllustrators.filter((n) => n.toLowerCase().includes(q)).slice(0, 8).map((n) => ({ label: n, value: `artist:${n}` })));
    }
  }, [mode, allSets, allIllustrators]);

  const resolveSubmit = useCallback((value: string): string => {
    if (mode === 'set') {
      const match = allSets.find((s) => s.name.toLowerCase() === value.toLowerCase());
      return match ? `set:${match.id}:${match.name}` : value;
    }
    if (mode === 'artist') {
      const match = allIllustrators.find((n) => n.toLowerCase() === value.toLowerCase());
      return `artist:${match ?? value}`;
    }
    return value;
  }, [mode, allSets, allIllustrators]);

  return { suggestions, setSuggestions, search, resolveSubmit };
}
