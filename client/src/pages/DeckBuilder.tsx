import { useEffect, useState } from 'react';
import { useDecks } from '../hooks/useDecks';
import DeckList from '../components/deck/DeckList';
import DeckEditor from '../components/deck/DeckEditor';

export default function DeckBuilder() {
  const { decks, loading, error, fetchDecks, createDeck, deleteDeck } = useDecks();
  const [activeDeckId, setActiveDeckId] = useState<number | null>(null);

  useEffect(() => { fetchDecks(); }, [fetchDecks]);

  async function handleNewDeck(name: string, format: string) {
    const deck = await createDeck(name, format);
    if (deck) setActiveDeckId(deck.id);
  }

  async function handleDeleteDeck(id: number) {
    if (!confirm('Delete this deck?')) return;
    await deleteDeck(id);
    if (activeDeckId === id) setActiveDeckId(null);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Deck Builder</h1>

      {error && (
        <div className="bg-red-900 text-red-300 rounded p-3 text-sm mb-4">{error}</div>
      )}

      <div className="flex gap-6 h-[calc(100vh-10rem)]">
        {loading ? (
          <div className="flex items-center justify-center w-64 text-gray-500">Loading decks...</div>
        ) : (
          <DeckList
            decks={decks}
            activeDeckId={activeDeckId}
            onSelect={setActiveDeckId}
            onDelete={handleDeleteDeck}
            onNew={handleNewDeck}
          />
        )}

        <div className="flex-1 overflow-hidden flex flex-col">
          {activeDeckId ? (
            <DeckEditor deckId={activeDeckId} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-3">🃏</div>
                <p>Select a deck or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
