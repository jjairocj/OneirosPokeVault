import { useState } from 'react';

interface SimCard {
  cardId: string;
  cardName: string;
  cardImage: string | null;
}

interface SimResult {
  hand: SimCard[];
  isMulligan: boolean;
  deckSize: number;
}

interface Props {
  onSimulate: () => Promise<SimResult | null>;
}

const FALLBACK = '/card-back.svg';

export default function HandSimulator({ onSimulate }: Props) {
  const [result, setResult] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDraw() {
    setLoading(true);
    const r = await onSimulate();
    setResult(r);
    setLoading(false);
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-200">Hand Simulator</h3>
        <button
          onClick={handleDraw}
          disabled={loading}
          className="text-xs bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white px-3 py-1 rounded"
        >
          {loading ? 'Drawing...' : 'Draw Hand'}
        </button>
      </div>

      {result && (
        <>
          {result.isMulligan && (
            <div className="text-xs text-red-400 mb-2 font-medium">Mulligan — no basic Pokémon!</div>
          )}
          <div className="flex gap-1 flex-wrap">
            {result.hand.map((card, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <img
                  src={card.cardImage || FALLBACK}
                  alt={card.cardName}
                  className="w-14 rounded"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
                />
                <span className="text-xs text-gray-400 text-center w-14 truncate">{card.cardName}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Deck: {result.deckSize} cards</p>
        </>
      )}
    </div>
  );
}
