import { useState } from 'react';

interface Card { cardId: string; name: string; image?: string; price: number; }

export default function ExistingCardsTab({ cards }: { cards: Card[] }) {
  const [search, setSearch] = useState('');

  const filtered = cards.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.cardId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or card ID..."
        className="w-full max-w-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-vault-500" />
      {filtered.length === 0 ? (
        <p className="text-gray-500 py-4">No existing cards found.</p>
      ) : (
        filtered.map((card, index) => (
          <div key={card.cardId} className="flex items-center gap-4 bg-gray-800/30 rounded-lg p-4">
            <span className="text-sm text-gray-500 w-8">#{index + 1}</span>
            <img src={card.image ? `${card.image}/low.webp` : '/card-back.svg'} alt={card.name}
              className="w-12 h-16 object-cover rounded"
              onError={(e) => { (e.target as HTMLImageElement).src = '/card-back.svg'; }} />
            <div className="flex-1">
              <p className="font-medium text-gray-200">{card.name}</p>
              <p className="text-xs text-gray-500">{card.cardId}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-vault-400">${card.price.toFixed(2)}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
