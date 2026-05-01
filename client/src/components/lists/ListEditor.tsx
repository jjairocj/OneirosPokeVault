import { useEffect, useState } from 'react';
import { useListDetail, LIST_TYPE_LABELS } from '../../hooks/useLists';
import tcgdex from '../../lib/tcgdex';
import { Query } from '@tcgdex/sdk';

interface Props {
  listId: number;
}

const FALLBACK = '/card-back.svg';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ListEditor({ listId }: Props) {
  const { list, loading, fetchList, addCard, removeCard, updateVisibility } = useListDetail(listId);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; image?: string }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [shareMsg, setShareMsg] = useState('');

  useEffect(() => { fetchList(); }, [fetchList]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!search.trim()) { setSearchResults([]); return; }
      setSearchLoading(true);
      try {
        const results = await tcgdex.card.list(Query.create().like('name', search.trim()).sort('localId', 'ASC'));
        setSearchResults((results || []).slice(0, 8).map((c) => ({
          id: c.id,
          name: c.name,
          image: c.image ? c.getImageURL('low', 'webp') : undefined,
        })));
      } catch { setSearchResults([]); }
      setSearchLoading(false);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  async function handleToggleVisibility() {
    if (!list) return;
    const next = list.visibility === 'public' ? 'private' : 'public';
    await updateVisibility(next);
  }

  function handleCopyShareLink() {
    if (!list?.shareSlug) return;
    const url = `${window.location.origin}/lists/shared/${list.shareSlug}`;
    navigator.clipboard.writeText(url);
    setShareMsg('Copied!');
    setTimeout(() => setShareMsg(''), 2000);
  }

  if (loading) return <div className="flex-1 flex items-center justify-center text-gray-500">Loading...</div>;
  if (!list) return <div className="flex-1 flex items-center justify-center text-gray-500">List not found</div>;

  const totalCards = list.cards.reduce((s, c) => s + c.quantity, 0);

  return (
    <div className="flex-1 flex flex-col gap-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{list.name}</h2>
          <span className="text-xs text-gray-400">{LIST_TYPE_LABELS[list.listType]} · {totalCards} cards</span>
        </div>
        <div className="flex items-center gap-2">
          {list.visibility === 'public' && list.shareSlug && (
            <button onClick={handleCopyShareLink} className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded">
              {shareMsg || 'Copy Link'}
            </button>
          )}
          <button
            onClick={handleToggleVisibility}
            className={`text-xs px-3 py-1.5 rounded ${
              list.visibility === 'public'
                ? 'bg-green-700 hover:bg-green-600 text-white'
                : 'bg-gray-600 hover:bg-gray-500 text-white'
            }`}
          >
            {list.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
          </button>
        </div>
      </div>

      <div className="relative">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search card to add..."
          className="w-full bg-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none"
        />
        {searchLoading && <span className="absolute right-3 top-2 text-xs text-gray-400">...</span>}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-10 bg-gray-800 rounded-b shadow-lg max-h-64 overflow-y-auto">
            {searchResults.map((card) => (
              <div
                key={card.id}
                onClick={() => { addCard(card.id, card.name, card.image || ''); setSearch(''); setSearchResults([]); }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 cursor-pointer text-sm text-gray-200"
              >
                {card.image && <img src={card.image} alt={card.name} className="w-7 h-10 object-cover rounded" />}
                {card.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 overflow-y-auto flex-1">
        {list.cards.map((card) => (
          <div key={card.cardId} className="flex items-center gap-2 bg-gray-800 rounded px-2 py-1.5">
            <img
              src={card.cardImage || FALLBACK}
              alt={card.cardName || ''}
              className="w-8 h-11 object-cover rounded"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
            />
            <span className="flex-1 text-sm text-gray-200 truncate">{card.cardName}</span>
            <span className="text-xs text-gray-500 mr-2">×{card.quantity}</span>
            {card.notes && <span className="text-xs text-gray-400 italic truncate max-w-32">{card.notes}</span>}
            <button
              onClick={() => removeCard(card.cardId)}
              className="text-red-400 hover:text-red-300 text-sm ml-1"
            >
              ×
            </button>
          </div>
        ))}
        {list.cards.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">Search above to add cards</p>
        )}
      </div>
    </div>
  );
}
