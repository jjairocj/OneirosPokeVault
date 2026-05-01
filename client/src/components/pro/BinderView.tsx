import { useState } from 'react';

interface BinderCard {
  cardId: string;
  cardName: string;
  image?: string;
  quantity: number;
}

interface Props {
  cards: BinderCard[];
  onCardClick?: (cardId: string) => void;
}

const FALLBACK = '/card-back.svg';
const PAGE_SIZE = 9;

export default function BinderView({ cards, onCardClick }: Props) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(cards.length / PAGE_SIZE);
  const pageCards = cards.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const slots = Array.from({ length: PAGE_SIZE }, (_, i) => pageCards[i] ?? null);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-gray-800 rounded-xl p-4 shadow-inner" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #374151 1px, transparent 0)', backgroundSize: '24px 24px' }}>
        <div className="grid grid-cols-3 gap-3">
          {slots.map((card, i) => (
            <div
              key={i}
              onClick={() => card && onCardClick?.(card.cardId)}
              className={`relative aspect-[2.5/3.5] rounded-lg overflow-hidden border ${
                card ? 'border-gray-600 cursor-pointer hover:border-blue-400 hover:scale-105 transition-transform' : 'border-dashed border-gray-700'
              }`}
            >
              {card ? (
                <>
                  <img
                    src={card.image || FALLBACK}
                    alt={card.cardName}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
                  />
                  {card.quantity > 1 && (
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                      ×{card.quantity}
                    </span>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gray-900/50 flex items-center justify-center">
                  <span className="text-gray-600 text-2xl">+</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-white px-3 py-1.5 rounded"
          >
            ← Prev
          </button>
          <span className="text-xs text-gray-400">Page {page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-white px-3 py-1.5 rounded"
          >
            Next →
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500">{cards.length} cards · {totalPages} {totalPages === 1 ? 'page' : 'pages'}</p>
    </div>
  );
}
