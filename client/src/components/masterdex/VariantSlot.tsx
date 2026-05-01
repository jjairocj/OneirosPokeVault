import { MasterDexSlot } from '../../hooks/useMasterDex';

interface VariantSlotProps {
  slot: MasterDexSlot;
  onClear: (slot: MasterDexSlot) => void;
  onShowDetails: (cardId: string) => void;
}

export default function VariantSlot({ slot, onClear, onShowDetails }: VariantSlotProps) {
  return (
    <div className="group relative flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => onShowDetails(slot.cardId)}
        className="relative w-full aspect-[2.5/3.5] rounded-lg overflow-hidden border-2 border-amber-500/50 shadow-md shadow-amber-500/10"
      >
        {slot.cardImage ? (
          <img src={slot.cardImage} alt={slot.cardName ?? ''} className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = '/card-back.svg'; }} />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <span className="text-amber-400 text-2xl">★</span>
          </div>
        )}
        <button type="button"
          onClick={(e) => { e.stopPropagation(); onClear(slot); }}
          className="absolute -top-1 -left-1 bg-red-500/80 text-white rounded-full w-4 h-4 text-[8px] items-center justify-center hidden group-hover:flex">
          ✕
        </button>
      </button>
      <p className="text-[10px] text-amber-400/80 truncate w-full text-center">{slot.cardName}</p>
    </div>
  );
}
