import { MasterDexSlot } from '../../hooks/useMasterDex';

interface PokemonSlotProps {
  dexId: number;
  name: string;
  slot?: MasterDexSlot;
  onOpenPicker: (dexId: number, name: string) => void;
  onClear: (dexId: number) => void;
  onShowDetails: (cardId: string) => void;
}

export default function PokemonSlot({ dexId, name, slot, onOpenPicker, onClear, onShowDetails }: PokemonSlotProps) {
  const isFilled = !!slot;

  return (
    <div className="group relative flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => isFilled ? onShowDetails(slot.cardId) : onOpenPicker(dexId, name)}
        className={`relative w-full aspect-[2.5/3.5] rounded-lg overflow-hidden border-2 transition-all ${
          isFilled ? 'border-vault-500 shadow-md shadow-vault-500/20' : 'border-gray-700 hover:border-gray-500'
        }`}
      >
        {isFilled && slot.cardImage ? (
          <img src={slot.cardImage} alt={slot.cardName ?? ''} className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = '/card-back.svg'; }} />
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
        <p className={`text-[10px] truncate ${isFilled ? 'text-gray-200' : 'text-gray-500'}`}>{name}</p>
      </div>
      {isFilled && (
        <button type="button"
          onClick={(e) => { e.stopPropagation(); onClear(dexId); }}
          className="absolute -top-1 -left-1 bg-red-500/80 text-white rounded-full w-4 h-4 text-[8px] items-center justify-center hidden group-hover:flex">
          ✕
        </button>
      )}
    </div>
  );
}
