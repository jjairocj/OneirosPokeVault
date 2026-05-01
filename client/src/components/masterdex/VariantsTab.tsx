import { useLanguage } from '../../hooks/useLanguage';
import { MasterDexSlot } from '../../hooks/useMasterDex';
import VariantSlot from './VariantSlot';

interface VariantsTabProps {
  variantSlots: MasterDexSlot[];
  onAddVariant: () => void;
  onClearSlot: (slot: MasterDexSlot) => void;
  onShowDetails: (cardId: string) => void;
}

export default function VariantsTab({ variantSlots, onAddVariant, onClearSlot, onShowDetails }: VariantsTabProps) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="mb-4 p-3 bg-gray-900/60 border border-gray-800 rounded-xl text-xs text-gray-400">
        {t('masterdex.variantInfo')}
      </div>

      <div className="mb-6">
        <button type="button" onClick={onAddVariant}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all">
          <span className="text-lg">+</span>
          {t('masterdex.addVariant')}
        </button>
      </div>

      {variantSlots.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">⭐</p>
          <p className="text-lg font-medium">{t('masterdex.noVariants')}</p>
          <p className="text-sm mt-1">{t('masterdex.noVariantsSubtitle')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 sm:gap-3">
          {variantSlots.map((slot) => (
            <VariantSlot key={slot.slotKey} slot={slot} onClear={onClearSlot} onShowDetails={onShowDetails} />
          ))}
        </div>
      )}
    </div>
  );
}
