import { useState, useCallback } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { usePokemonDex } from '../../hooks/usePokemonDex';
import { MasterDexSlot } from '../../hooks/useMasterDex';
import PokemonSlot from './PokemonSlot';

const PAGE_SIZE = 60;

interface BaseDexTabProps {
  allDexIds: number[];
  getBaseSlot: (dexId: number) => MasterDexSlot | undefined;
  onOpenPicker: (dexId: number, name: string) => void;
  onClearSlot: (dexId: number) => void;
  onShowDetails: (cardId: string) => void;
}

export default function BaseDexTab({ allDexIds, getBaseSlot, onOpenPicker, onClearSlot, onShowDetails }: BaseDexTabProps) {
  const { t } = useLanguage();
  const { loading: dexLoading, getPokemonName } = usePokemonDex();
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'dex' | 'alpha'>('dex');
  const [dexSearch, setDexSearch] = useState('');

  const handleSortChange = useCallback((order: 'dex' | 'alpha') => {
    setSortOrder(order);
    setPage(1);
    window.scrollTo(0, 0);
  }, []);

  const sortedIds = sortOrder === 'dex'
    ? allDexIds
    : [...allDexIds].sort((a, b) => {
        const na = getPokemonName(a) ?? `\uFFFF${a}`;
        const nb = getPokemonName(b) ?? `\uFFFF${b}`;
        return na.localeCompare(nb);
      });

  const q = dexSearch.trim().toLowerCase();
  const filteredIds = q
    ? sortedIds.filter((id) => {
        const name = getPokemonName(id) ?? '';
        return name.toLowerCase().includes(q) || String(id).includes(q);
      })
    : sortedIds;

  const isSearching = q.length > 0;
  const pageIds = isSearching ? filteredIds : filteredIds.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filteredIds.length / PAGE_SIZE);

  return (
    <>
      <div className="mb-4 p-3 bg-gray-900/60 border border-gray-800 rounded-xl text-xs text-gray-400">
        {t('masterdex.baseInfo')}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-xs text-gray-500">{t('masterdex.sortBy')}:</span>
        <div className="flex bg-gray-800 rounded-lg p-0.5">
          {(['dex', 'alpha'] as const).map((order) => (
            <button key={order} type="button" onClick={() => handleSortChange(order)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${sortOrder === order ? 'bg-vault-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {order === 'dex' ? `# ${t('masterdex.sortDex')}` : `A–Z ${t('masterdex.sortAlpha')}`}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <input type="text" value={dexSearch} onChange={(e) => { setDexSearch(e.target.value); setPage(1); }}
            placeholder={t('masterdex.searchPokemon')}
            className="bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-vault-500 w-44" />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">🔍</span>
          {dexSearch && (
            <button type="button" onClick={() => setDexSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs">✕</button>
          )}
        </div>
        {dexLoading && (
          <span className="text-xs text-gray-500 flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 border border-vault-500 border-t-transparent rounded-full animate-spin" />
            {t('masterdex.loadingNames')}
          </span>
        )}
      </div>

      {isSearching && (
        <p className="text-xs text-gray-500 mb-3">
          {filteredIds.length} {filteredIds.length === 1 ? 'result' : 'results'} for "{dexSearch.trim()}"
        </p>
      )}

      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 sm:gap-3">
        {pageIds.map((dexId) => (
          <PokemonSlot key={dexId} dexId={dexId} name={getPokemonName(dexId) ?? `#${dexId}`}
            slot={getBaseSlot(dexId)} onOpenPicker={onOpenPicker} onClear={onClearSlot} onShowDetails={onShowDetails} />
        ))}
      </div>

      {!isSearching && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button type="button" disabled={page === 1}
            onClick={() => { setPage(page - 1); window.scrollTo(0, 0); }}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded-lg text-sm transition-colors">←</button>
          {Array.from({ length: Math.min(totalPages, 18) }, (_, i) => {
            const mid = Math.min(Math.max(page, 9), totalPages - 8);
            const p = i + mid - 8;
            if (p < 1 || p > totalPages) return null;
            return (
              <button key={p} type="button" onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === page ? 'bg-vault-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                {p}
              </button>
            );
          })}
          <button type="button" disabled={page === totalPages}
            onClick={() => { setPage(page + 1); window.scrollTo(0, 0); }}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded-lg text-sm transition-colors">→</button>
        </div>
      )}
    </>
  );
}
