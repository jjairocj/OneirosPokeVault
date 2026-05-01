import { DeckCard } from '../../hooks/useDecks';

interface Props {
  card: DeckCard;
  onAdd: (cardId: string) => void;
  onRemove: (cardId: string) => void;
}

const FALLBACK = '/card-back.svg';

export default function DeckCardItem({ card, onAdd, onRemove }: Props) {
  return (
    <div className="flex items-center gap-2 bg-gray-800 rounded px-2 py-1.5 group">
      <img
        src={card.cardImage || FALLBACK}
        alt={card.cardName}
        className="w-8 h-11 object-cover rounded"
        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
      />
      <span className="flex-1 text-sm text-gray-200 truncate">{card.cardName}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onRemove(card.cardId)}
          className="w-5 h-5 bg-red-700 hover:bg-red-600 text-white rounded text-xs flex items-center justify-center"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-semibold text-white">{card.quantity}</span>
        <button
          onClick={() => onAdd(card.cardId)}
          className="w-5 h-5 bg-green-700 hover:bg-green-600 text-white rounded text-xs flex items-center justify-center"
        >
          +
        </button>
      </div>
      {/* Always visible quantity when not hovering */}
      <span className="group-hover:hidden w-6 text-center text-sm font-semibold text-white">{card.quantity}</span>
    </div>
  );
}
