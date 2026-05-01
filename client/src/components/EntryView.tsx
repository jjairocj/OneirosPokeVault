import { useEffect, useState, useMemo } from 'react';
import { useCards, CardSummary } from '../hooks/useCards';
import { useLanguage } from '../hooks/useLanguage';
import CardItem from './CardItem';
import CardDetailModal from './CardDetailModal';
import BinderView from './pro/BinderView';
import { useAuth } from '../hooks/useAuth';
import { downloadCSV } from '../lib/reports';

type ViewMode = 'grid' | 'binder';

type SourceFilter = 'all' | 'tcg' | 'pocket';

const POCKET_SET_PREFIXES = [
  'P-A', 'A1', 'A1a', 'A2', 'A2a', 'A2b', 'A3', 'A3a', 'A3b',
  'A4', 'A4a', 'B1', 'B1a', 'B2',
];

function isPocketCard(card: CardSummary): boolean {
  if (card.image?.includes('/tcgp/')) return true;
  const setId = card.id.substring(0, card.id.lastIndexOf('-'));
  return POCKET_SET_PREFIXES.includes(setId);
}

interface EntryViewProps {
  entryName: string;
  isOwned: (cardId: string) => boolean;
  onToggleOwned: (cardId: string) => void;
  onCardsLoaded: (entryName: string, cards: CardSummary[]) => void;
}

export default function EntryView({ entryName, isOwned, onToggleOwned, onCardsLoaded }: EntryViewProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { cards, loading, error, searchByName, searchBySet, searchByIllustrator } = useCards();
  const [source, setSource] = useState<SourceFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [detailCardId, setDetailCardId] = useState<string | null>(null);

  const isPro = user?.plan === 'pro' || user?.role === 'admin';

  const isSetEntry = entryName.startsWith('set:');
  const isArtistEntry = entryName.startsWith('artist:');
  const displayName = isSetEntry
    ? entryName.split(':')[2] || entryName
    : isArtistEntry
    ? entryName.split(':')[1] || entryName
    : entryName;

  useEffect(() => {
    if (isSetEntry) {
      const setId = entryName.split(':')[1];
      searchBySet(setId);
    } else if (isArtistEntry) {
      const artistName = entryName.split(':')[1];
      searchByIllustrator(artistName);
    } else {
      searchByName(entryName);
    }
  }, [entryName, searchByName, searchBySet, searchByIllustrator, isSetEntry, isArtistEntry]);

  useEffect(() => {
    onCardsLoaded(entryName, cards);
  }, [cards, entryName, onCardsLoaded]);

  const counts = useMemo(() => {
    const pocket = cards.filter(isPocketCard).length;
    return { all: cards.length, tcg: cards.length - pocket, pocket };
  }, [cards]);

  const filtered = useMemo(() => {
    if (source === 'all') return cards;
    if (source === 'pocket') return cards.filter(isPocketCard);
    return cards.filter((c) => !isPocketCard(c));
  }, [cards, source]);

  const ownedCount = filtered.filter((c) => isOwned(c.id)).length;
  const percentage = filtered.length > 0 ? Math.round((ownedCount / filtered.length) * 100) : 0;

  const handleDownloadOwned = () => {
    const owned = filtered
      .filter(c => isOwned(c.id))
      .map(c => ({
        name: c.name,
        expansion: c.id.substring(0, c.id.lastIndexOf('-'))
      }));

    downloadCSV(
      t('report.filename.owned'),
      owned,
      [
        { key: 'name', label: t('report.csvHeader.name') },
        { key: 'expansion', label: t('report.csvHeader.expansion') }
      ]
    );
  };

  const handleDownloadMissing = () => {
    const missing = filtered
      .filter(c => !isOwned(c.id))
      .map(c => ({ name: c.name }));

    downloadCSV(
      t('report.filename.missing'),
      missing,
      [{ key: 'name', label: t('report.csvHeader.name') }]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-vault-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-400">
        <p>{t('entry.error')}: {error}</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>{t('entry.noCards')} "{displayName}"</p>
      </div>
    );
  }

  const tabs: { key: SourceFilter; label: string; count: number }[] = [
    { key: 'all', label: t('entry.all'), count: counts.all },
    { key: 'tcg', label: t('entry.tcg'), count: counts.tcg },
    { key: 'pocket', label: t('entry.pocket'), count: counts.pocket },
  ];

  return (
    <div className="space-y-4">
      {/* Source filter tabs */}
      <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.key}
            onClick={() => setSource(tab.key)}
            disabled={tab.count === 0}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              source === tab.key
                ? 'bg-vault-600 text-white shadow-sm'
                : tab.count === 0
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">{tab.count}</span>
          </button>
        ))}

        {isPro && (
          <div className="flex items-center gap-2 ml-auto border-l border-gray-700 pl-4">
            <div className="flex items-center bg-gray-700/50 rounded-md p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-2 py-1 rounded text-xs transition-colors ${viewMode === 'grid' ? 'bg-vault-600 text-white' : 'text-gray-400 hover:text-white'}`}
                title="Grid view"
              >
                ▦
              </button>
              <button
                type="button"
                onClick={() => setViewMode('binder')}
                className={`px-2 py-1 rounded text-xs transition-colors ${viewMode === 'binder' ? 'bg-vault-600 text-white' : 'text-gray-400 hover:text-white'}`}
                title="Binder view"
              >
                📕
              </button>
            </div>
            <button
              onClick={handleDownloadOwned}
              className="text-gray-400 hover:text-white text-xs flex items-center gap-1 transition-colors"
              title={t('report.downloadOwned')}
            >
              📥 {t('report.downloadOwned')}
            </button>
            <button
              onClick={handleDownloadMissing}
              className="text-gray-400 hover:text-white text-xs flex items-center gap-1 transition-colors"
              title={t('report.downloadMissing')}
            >
              📥 {t('report.downloadMissing')}
            </button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-vault-500 to-vault-400 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-gray-400 whitespace-nowrap">
          {ownedCount}/{filtered.length} ({percentage}%)
        </span>
      </div>

      {/* Cards */}
      {viewMode === 'binder' ? (
        <BinderView
          cards={filtered.filter((c) => isOwned(c.id)).map((c) => ({
            cardId: c.id,
            cardName: c.name,
            image: c.image || '/card-back.svg',
            quantity: 1,
          }))}
          onCardClick={setDetailCardId}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((card) => (
            <CardItem
              key={card.id}
              id={card.id}
              name={card.name}
              image={card.image || '/card-back.svg'}
              owned={isOwned(card.id)}
              onToggle={onToggleOwned}
              onDetails={setDetailCardId}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {detailCardId && (
        <CardDetailModal
          cardId={detailCardId}
          onClose={() => setDetailCardId(null)}
        />
      )}
    </div>
  );
}
