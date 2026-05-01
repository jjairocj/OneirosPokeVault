import { useEffect, useState } from 'react';
import { useDeckDetail, ValidationResult } from '../../hooks/useDecks';
import DeckCardItem from './DeckCardItem';
import HandSimulator from './HandSimulator';
import DeckImportExport from './DeckImportExport';
import { apiFetch } from '../../lib/api';
import tcgdex from '../../lib/tcgdex';
import { Query } from '@tcgdex/sdk';

interface Props {
  deckId: number;
}

export default function DeckEditor({ deckId }: Props) {
  const { deck, loading, fetchDeck, addCard, removeCard, validateDeck, exportDeck, importDeck, simulateHand } = useDeckDetail(deckId);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; image?: string }[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => { fetchDeck(); }, [fetchDeck]);

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

  async function handleAddCard(cardId: string, cardName: string, cardImage: string) {
    const isBasicEnergy = cardName.toLowerCase().includes('energy') && !cardName.toLowerCase().includes('special');
    await addCard(cardId, cardName, cardImage, 1, isBasicEnergy);
    setSearch('');
    setSearchResults([]);
  }

  async function handleValidate() {
    const result = await validateDeck();
    setValidation(result);
  }

  const totalCards = deck?.cards.reduce((s, c) => s + c.quantity, 0) ?? 0;

  if (loading) return <div className="flex-1 flex items-center justify-center text-gray-500">Loading...</div>;
  if (!deck) return <div className="flex-1 flex items-center justify-center text-gray-500">Deck not found</div>;

  return (
    <div className="flex-1 flex gap-4 overflow-hidden">
      <div className="flex flex-col flex-1 gap-3 overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{deck.name}</h2>
            <span className="text-xs text-gray-400">{deck.format} · {totalCards}/60 cards</span>
          </div>
          <button
            onClick={handleValidate}
            className="text-xs bg-yellow-700 hover:bg-yellow-600 text-white px-3 py-1.5 rounded"
          >
            Validate
          </button>
        </div>

        {validation && (
          <div className={`rounded p-2 text-xs ${validation.valid ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
            {validation.valid ? '✓ Valid deck' : validation.errors.map((e) => e.message).join(' · ')}
          </div>
        )}

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
                  onClick={() => handleAddCard(card.id, card.name, card.image || '')}
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
          {deck.cards.map((card) => (
            <DeckCardItem
              key={card.cardId}
              card={card}
              onAdd={(id) => addCard(id, card.cardName, card.cardImage || '', 1, !!card.isBasicEnergy)}
              onRemove={(id) => removeCard(id)}
            />
          ))}
          {deck.cards.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">Search above to add cards</p>
          )}
        </div>
      </div>

      <div className="w-64 flex flex-col gap-3 overflow-y-auto">
        <HandSimulator onSimulate={simulateHand} />
        <DeckImportExport
          deckId={deckId}
          onExport={exportDeck}
          onImport={importDeck}
          onImportDone={fetchDeck}
        />
      </div>
    </div>
  );
}
