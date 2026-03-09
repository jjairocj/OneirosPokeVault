import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMasterDex, MasterDexSlot } from '../hooks/useMasterDex';
import { usePokemonDex } from '../hooks/usePokemonDex';
import { useLanguage } from '../hooks/useLanguage';
import tcgdex from '../lib/tcgdex';
import { Query } from '@tcgdex/sdk';
import CardDetailModal from '../components/CardDetailModal';
import ConfirmModal from '../components/ConfirmModal';
import { downloadCSV } from '../lib/reports';

// --- Variant detection ---
export function isVariantCardName(name: string): boolean {
  if (/^Mega\s/i.test(name)) return true;
  if (/^M\s/i.test(name)) return true; // Mega evolutions in TCGdex
  if (/\sVMAX$/i.test(name)) return true;
  if (/\sVSTAR$/i.test(name)) return true;
  if (/^Radiant\s/i.test(name)) return true;
  if (/^(Hisuian|Galarian|Alolan|Paldean)\s/i.test(name)) return true;
  if (/\s&\s/.test(name)) return true; // TAG TEAM e.g. "Pikachu & Zekrom-GX"
  return false;
}

// --- Card Picker Modal ---
interface CardPickerProps {
  initialSearch: string;
  slotType: 'base' | 'variant';
  onAssign: (cardId: string, cardName: string, cardImage: string) => void;
  onClose: () => void;
}

function CardPickerModal({ initialSearch, slotType, onAssign, onClose }: CardPickerProps) {
  const { t } = useLanguage();
  const { entries: pokemonEntries } = usePokemonDex();
  const [query, setQuery] = useState(initialSearch);
  const [results, setResults] = useState<{ id: string; name: string; image: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper to get clean Pokemon name
  const getCleanPokemonName = useCallback((card: any) => {
    if (slotType === 'base' && card.dexId && Array.isArray(card.dexId) && card.dexId.length > 0) {
      // For base cards, use the clean name from pokemonDex
      const dexId = card.dexId[0];
      const pokemonEntry = pokemonEntries.find((p: { dexId: number; name: string }) => p.dexId === dexId);
      if (pokemonEntry) {
        return pokemonEntry.name;
      }
    }
    // For variants or fallback, clean the TCGdex name
    return card.name
      .replace(/^Galarian\s+/i, '') // Remove Galarian prefix
      .replace(/^Hisuian\s+/i, '') // Remove Hisuian prefix
      .replace(/^Alolan\s+/i, '') // Remove Alolan prefix
      .replace(/^Paldean\s+/i, ''); // Remove Paldean prefix
  }, [slotType, pokemonEntries]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const normalizedQ = q.trim().replace(/^Mega\s/i, 'M ');
      // Try exact match first if it's the initial search
      let cards = await tcgdex.card.list(
        Query.create().like('name', normalizedQ)
      );

      if (!cards || cards.length === 0) {
        // Fallback for case sensitivity or partials
        cards = await tcgdex.card.list(
          Query.create().like('name', normalizedQ.toLowerCase())
        );
      }
      if (!cards) { setResults([]); return; }

      const filtered = cards
        .filter((c) => !c.image?.includes('/tcgp/')) // Exclude TCG Pocket
        .filter((c) => slotType === 'variant' ? isVariantCardName(c.name) : true)
        .map((c) => ({
          id: c.id,
          name: getCleanPokemonName(c),
          image: c.image ? c.getImageURL('low', 'webp') : '/card-back.svg',
        }));

      setResults(filtered.slice(0, 40));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [slotType, getCleanPokemonName]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  // Trigger initial search
  useEffect(() => {
    if (pokemonEntries.length > 0) {
      search(initialSearch);
    }
  }, [pokemonEntries.length, initialSearch, search]); // eslint-disable-line

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-gray-800">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('masterdex.searchCard')}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-vault-500"
          />
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">✕</button>
        </div>

        <div className="p-3 text-xs text-gray-500 flex items-center gap-2">
          {slotType === 'base' ? (
            <span>{t('masterdex.pickerHintBase')}</span>
          ) : (
            <span>{t('masterdex.pickerHintVariant')}</span>
          )}
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
              <button
                key={card.id}
                type="button"
                onClick={() => onAssign(card.id, card.name, card.image)}
                className="group relative rounded-lg overflow-hidden aspect-[2.5/3.5] bg-gray-800 hover:ring-2 hover:ring-vault-500 transition-all"
              >
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/card-back.svg'; }}
                />
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

// --- Pokemon Slot Component (Base) ---
interface PokemonSlotProps {
  dexId: number;
  name: string;
  slot?: MasterDexSlot;
  onOpenPicker: (dexId: number, name: string) => void;
  onClear: (dexId: number) => void;
  onShowDetails: (cardId: string) => void;
  t: (key: any) => string;
}

function PokemonSlot({ dexId, name, slot, onOpenPicker, onClear, onShowDetails, t }: PokemonSlotProps) {
  const isFilled = !!slot;

  return (
    <div className="group relative flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => isFilled ? onShowDetails(slot.cardId) : onOpenPicker(dexId, name)}
        className={`relative w-full aspect-[2.5/3.5] rounded-lg overflow-hidden border-2 transition-all ${isFilled
            ? 'border-vault-500 shadow-md shadow-vault-500/20'
            : 'border-gray-700 hover:border-gray-500'
          }`}
      >
        {isFilled && slot.cardImage ? (
          <img
            src={slot.cardImage}
            alt={slot.cardName ?? ''}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = '/card-back.svg'; }}
          />
        ) : isFilled ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800/60 p-2 text-center">
            <span className="text-amber-500 text-xl font-bold mb-1">!</span>
            <span className="text-[8px] text-amber-500/80 leading-tight">Missing info</span>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 opacity-40">
            <span className="text-gray-600 text-2xl">?</span>
          </div>
        )}
        {isFilled && slot.cardImage && (
          <div className="absolute top-1 right-1 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center text-[8px] text-white font-bold">
            ✓
          </div>
        )}
      </button>
      <div className="text-center w-full">
        <p className="text-[9px] text-gray-500">#{String(dexId).padStart(4, '0')}</p>
        <p className={`text-[10px] truncate ${isFilled ? 'text-gray-200' : 'text-gray-500'}`}>
          {name}
        </p>
      </div>
      {isFilled && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClear(dexId);
          }}
          className="absolute -top-1 -left-1 bg-red-500/80 text-white rounded-full w-4 h-4 text-[8px] items-center justify-center hidden group-hover:flex"
        >
          ✕
        </button>
      )}
    </div>
  );
}

// --- Variant Slot Component ---
interface VariantSlotProps {
  slot: MasterDexSlot;
  onClear: (slot: MasterDexSlot) => void;
  onShowDetails: (cardId: string) => void;
  t: (key: any) => string;
}

function VariantSlot({ slot, onClear, onShowDetails, t }: VariantSlotProps) {
  return (
    <div className="group relative flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => onShowDetails(slot.cardId)}
        className="relative w-full aspect-[2.5/3.5] rounded-lg overflow-hidden border-2 border-amber-500/50 shadow-md shadow-amber-500/10"
      >
        {slot.cardImage ? (
          <img
            src={slot.cardImage}
            alt={slot.cardName ?? ''}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = '/card-back.svg'; }}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <span className="text-amber-400 text-2xl">★</span>
          </div>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClear(slot);
          }}
          className="absolute -top-1 -left-1 bg-red-500/80 text-white rounded-full w-4 h-4 text-[8px] items-center justify-center hidden group-hover:flex"
        >
          ✕
        </button>
      </button>
      <p className="text-[10px] text-amber-400/80 truncate w-full text-center">{slot.cardName}</p>
    </div>
  );
}

// --- Main MasterDex Page ---
const PAGE_SIZE = 60;
const ALL_DEX_IDS = Array.from({ length: 1025 }, (_, i) => i + 1);

export default function MasterDex() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { assignSlot, unassignSlot, getBaseSlot, baseCount, variantCount, variantSlots, isPro } = useMasterDex();
  const { entries: pokemonEntries, loading: dexLoading, getPokemonName } = usePokemonDex();

  const [activeTab, setActiveTab] = useState<'base' | 'variants'>('base');
  const [page, setPage] = useState(1);
  const [picker, setPicker] = useState<{ dexId?: number; type: 'base' | 'variant'; initialSearch?: string } | null>(null);
  const [viewingCard, setViewingCard] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'base' | 'variant'; key: string; dexId?: number } | null>(null);
  const [sortOrder, setSortOrder] = useState<'dex' | 'alpha'>('dex');
  const [dexSearch, setDexSearch] = useState('');

  // Guard: redirect if not PRO
  useEffect(() => {
    if (!user) { navigate('/'); return; }
    if (!isPro) { navigate('/'); }
  }, [user, isPro, navigate]);

  const sortedIds = (() => {
    if (sortOrder === 'dex') return ALL_DEX_IDS;
    return [...ALL_DEX_IDS].sort((a, b) => {
      const na = getPokemonName(a) ?? `\uFFFF${a}`;
      const nb = getPokemonName(b) ?? `\uFFFF${b}`;
      return na.localeCompare(nb);
    });
  })();

  const handleSortChange = useCallback((order: 'dex' | 'alpha') => {
    setSortOrder(order);
    setPage(1);
    window.scrollTo(0, 0);
  }, []);

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

  const handleBaseAssign = useCallback(
    async (cardId: string, cardName: string, cardImage: string) => {
      if (!picker?.dexId) return;
      await assignSlot('base', String(picker.dexId), cardId, cardName, cardImage);
      setPicker(null);
    },
    [picker, assignSlot]
  );

  const handleVariantAssign = useCallback(
    async (cardId: string, cardName: string, cardImage: string) => {
      await assignSlot('variant', cardId, cardId, cardName, cardImage);
      setPicker(null);
    },
    [assignSlot]
  );

  const handleDownloadOwned = useCallback(() => {
    // Only base slots for now as requested "expansion"
    const owned = ALL_DEX_IDS
      .map(id => ({ id, slot: getBaseSlot(id) }))
      .filter(item => !!item.slot)
      .map(item => ({
        name: item.slot?.cardName || getPokemonName(item.id) || '',
        expansion: item.slot?.cardId.split('-')[0] || '' // Set ID as fallback for "expansion"
      }));

    downloadCSV(
      t('report.filename.owned'),
      owned,
      [
        { key: 'name', label: t('report.csvHeader.name') },
        { key: 'expansion', label: t('report.csvHeader.expansion') }
      ]
    );
  }, [getBaseSlot, getPokemonName, t]);

  const handleDownloadMissing = useCallback(() => {
    const missing = ALL_DEX_IDS
      .filter(id => !getBaseSlot(id))
      .map(id => ({ name: getPokemonName(id) || `#${id}` }));

    downloadCSV(
      t('report.filename.missing'),
      missing,
      [{ key: 'name', label: t('report.csvHeader.name') }]
    );
  }, [getBaseSlot, getPokemonName, t]);

  if (!user || !isPro) return null;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← {t('masterdex.back')}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              MasterDex
            </h1>
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
              PRO
            </span>
          </div>
          <div className="ml-auto flex items-center gap-4 text-sm text-gray-400">
            <span>
              <span className="text-vault-400 font-semibold">{baseCount}</span>/{ALL_DEX_IDS.length} {t('masterdex.baseFilled')}
            </span>
            <span>
              <span className="text-amber-400 font-semibold">{variantCount}</span> {t('masterdex.variantsCollected')}
            </span>
          </div>
        </div>

        {/* PRO Reports and Progress */}
        <div className="max-w-7xl mx-auto px-4 pb-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-vault-600 to-vault-400 rounded-full transition-all duration-700"
                style={{ width: `${ALL_DEX_IDS.length > 0 ? (baseCount / ALL_DEX_IDS.length) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadOwned}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition-colors flex items-center gap-1.5"
            >
              📥 {t('report.downloadOwned')}
            </button>
            <button
              onClick={handleDownloadMissing}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition-colors flex items-center gap-1.5"
            >
              📥 {t('report.downloadMissing')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('base')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'base'
                ? 'bg-vault-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
          >
            🔵 {t('masterdex.tabBase')}
            <span className="ml-2 text-xs opacity-70">{baseCount}/{ALL_DEX_IDS.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('variants')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'variants'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
          >
            ⭐ {t('masterdex.tabVariants')}
            <span className="ml-2 text-xs opacity-70">{variantCount}</span>
          </button>
        </div>

        {/* Base Dex Tab */}
        {activeTab === 'base' && (
          <>
            {/* Info banner */}
            <div className="mb-4 p-3 bg-gray-900/60 border border-gray-800 rounded-xl text-xs text-gray-400">
              {t('masterdex.baseInfo')}
            </div>

            {/* Sort + Search controls */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs text-gray-500">{t('masterdex.sortBy')}:</span>
              <div className="flex bg-gray-800 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => handleSortChange('dex')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${sortOrder === 'dex' ? 'bg-vault-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  # {t('masterdex.sortDex')}
                </button>
                <button
                  type="button"
                  onClick={() => handleSortChange('alpha')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${sortOrder === 'alpha' ? 'bg-vault-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  A–Z {t('masterdex.sortAlpha')}
                </button>
              </div>

              <div className="relative ml-auto">
                <input
                  type="text"
                  value={dexSearch}
                  onChange={(e) => { setDexSearch(e.target.value); setPage(1); }}
                  placeholder={t('masterdex.searchPokemon')}
                  className="bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-vault-500 w-44"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">🔍</span>
                {dexSearch && (
                  <button
                    type="button"
                    onClick={() => setDexSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs"
                  >
                    ✕
                  </button>
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
                <PokemonSlot
                  key={dexId}
                  dexId={dexId}
                  name={getPokemonName(dexId) ?? `#${dexId}`}
                  slot={getBaseSlot(dexId)}
                  onOpenPicker={(id, name) => {
                    setPicker({ dexId: id, type: 'base', initialSearch: name });
                  }}
                  onClear={(id) => setConfirmDelete({ type: 'base', key: String(id), dexId: id })}
                  onShowDetails={setViewingCard}
                  t={t}
                />
              ))}
            </div>

            {/* Pagination */}
            {!isSearching && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => { setPage(page - 1); window.scrollTo(0, 0); }}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded-lg text-sm transition-colors"
                >
                  ←
                </button>
                {Array.from({ length: Math.min(totalPages, 18) }, (_, i) => {
                  const mid = Math.min(Math.max(page, 9), totalPages - 8);
                  const p = i + mid - 8;
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === page ? 'bg-vault-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => { setPage(page + 1); window.scrollTo(0, 0); }}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded-lg text-sm transition-colors"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}

        {/* Variants Tab */}
        {activeTab === 'variants' && (
          <div>
            <div className="mb-4 p-3 bg-gray-900/60 border border-gray-800 rounded-xl text-xs text-gray-400">
              {t('masterdex.variantInfo')}
            </div>

            <div className="mb-6">
              <button
                type="button"
                onClick={() => setPicker({ type: 'variant', initialSearch: '' })}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
              >
                <span className="text-lg">+</span>
                {t('masterdex.addVariant')}
              </button>
            </div>

            {variantSlots.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-4xl mb-3">⭐</p>
                <p className="text-lg font-medium">{t('masterdex.noVariants')}</p>
                <p className="text-sm mt-1">{t('masterdex.noVariantsSubtitle')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 sm:gap-3">
                {variantSlots.map((slot) => (
                  <VariantSlot
                    key={slot.slotKey}
                    slot={slot}
                    onClear={(s) => setConfirmDelete({ type: 'variant', key: s.slotKey })}
                    onShowDetails={setViewingCard}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmDelete && (
        <ConfirmModal
          message={t('card.confirmDelete')}
          onConfirm={async () => {
            const { type, key } = confirmDelete;
            await unassignSlot(type, key);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Card Details Modal */}
      {viewingCard && (
        <CardDetailModal
          cardId={viewingCard}
          onClose={() => setViewingCard(null)}
        />
      )}

      {/* Card Picker Modal */}
      {picker && (
        <CardPickerModal
          key={`${picker.type}-${picker.dexId ?? 'variant'}`}
          initialSearch={picker.initialSearch ?? ''}
          slotType={picker.type}
          onAssign={picker.type === 'base' ? handleBaseAssign : handleVariantAssign}
          onClose={() => setPicker(null)}
        />
      )}

      {/* Loading overlay for initial dex load */}
      {dexLoading && pokemonEntries.length === 0 && (
        <div className="fixed inset-0 bg-gray-950/80 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-vault-500 border-t-transparent" />
        </div>
      )}
    </div>
  );
}
