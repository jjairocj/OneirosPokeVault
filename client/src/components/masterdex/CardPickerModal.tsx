import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { usePokemonDex } from '../../hooks/usePokemonDex';
import tcgdex from '../../lib/tcgdex';
import { Query } from '@tcgdex/sdk';
import { isVariantCardName } from './variantDetection';

interface CardPickerProps {
  initialSearch: string;
  slotType: 'base' | 'variant';
  onAssign: (cardId: string, cardName: string, cardImage: string) => void;
  onClose: () => void;
}

function useCardSearch(slotType: 'base' | 'variant', pokemonEntries: { dexId: number; name: string }[]) {
  const getCleanPokemonName = useCallback((card: any) => {
    if (slotType === 'base' && card.dexId?.length > 0) {
      const entry = pokemonEntries.find((p) => p.dexId === card.dexId[0]);
      if (entry) return entry.name;
    }
    return card.name
      .replace(/^(Galarian|Hisuian|Alolan|Paldean)\s+/i, '');
  }, [slotType, pokemonEntries]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return [];
    const normalizedQ = q.trim().replace(/^Mega\s/i, 'M ');
    let cards = await tcgdex.card.list(Query.create().like('name', normalizedQ));
    if (!cards?.length) {
      cards = await tcgdex.card.list(Query.create().like('name', normalizedQ.toLowerCase()));
    }
    if (!cards) return [];

    return cards
      .filter((c) => !c.image?.includes('/tcgp/'))
      .filter((c) => slotType === 'variant' ? isVariantCardName(c.name) : true)
      .map((c) => ({
        id: c.id,
        name: getCleanPokemonName(c),
        image: c.image ? c.getImageURL('low', 'webp') : '/card-back.svg',
      }))
      .slice(0, 40);
  }, [slotType, getCleanPokemonName]);

  return search;
}

export default function CardPickerModal({ initialSearch, slotType, onAssign, onClose }: CardPickerProps) {
  const { t } = useLanguage();
  const { entries: pokemonEntries } = usePokemonDex();
  const [query, setQuery] = useState(initialSearch);
  const [results, setResults] = useState<{ id: string; name: string; image: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const search = useCardSearch(slotType, pokemonEntries);

  const doSearch = useCallback(async (q: string) => {
    setSearching(true);
    try {
      setResults(await search(q));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [search]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);

  useEffect(() => {
    if (pokemonEntries.length > 0) doSearch(initialSearch);
  }, [pokemonEntries.length, initialSearch, doSearch]); // eslint-disable-line

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-800">
          <input autoFocus type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={t('masterdex.searchCard')}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-vault-500" />
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">✕</button>
        </div>
        <div className="p-3 text-xs text-gray-500">
          {slotType === 'base' ? t('masterdex.pickerHintBase') : t('masterdex.pickerHintVariant')}
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {searching && (
            <div className="text-center text-gray-500 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-vault-500 border-t-transparent mx-auto" />
            </div>
          )}
          {!searching && results.length === 0 && query.trim() && (
            <p className="text-center text-gray-500 py-8 text-sm">{t('masterdex.noResults')}</p>
          )}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {results.map((card) => (
              <button key={card.id} type="button" onClick={() => onAssign(card.id, card.name, card.image)}
                className="group relative rounded-lg overflow-hidden aspect-[2.5/3.5] bg-gray-800 hover:ring-2 hover:ring-vault-500 transition-all">
                <img src={card.image} alt={card.name} className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/card-back.svg'; }} />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                  <p className="w-full text-[8px] text-white p-1 truncate text-center">{card.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
