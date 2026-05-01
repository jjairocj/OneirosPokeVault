import { useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMasterDex, MasterDexSlot } from '../hooks/useMasterDex';
import { usePokemonDex } from '../hooks/usePokemonDex';
import { useLanguage } from '../hooks/useLanguage';
import { downloadCSV } from '../lib/reports';
import CardDetailModal from '../components/CardDetailModal';
import ConfirmModal from '../components/ConfirmModal';
import MasterDexHeader from '../components/masterdex/MasterDexHeader';
import AppShell from '../components/AppShell';
import BaseDexTab from '../components/masterdex/BaseDexTab';
import VariantsTab from '../components/masterdex/VariantsTab';
import CardPickerModal from '../components/masterdex/CardPickerModal';

const ALL_DEX_IDS = Array.from({ length: 1025 }, (_, i) => i + 1);

type PickerState = { dexId?: number; type: 'base' | 'variant'; initialSearch?: string } | null;
type DeleteState = { type: 'base' | 'variant'; key: string; dexId?: number } | null;

export default function MasterDex() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { assignSlot, unassignSlot, getBaseSlot, baseCount, variantCount, variantSlots, isPro } = useMasterDex();
  const { entries: pokemonEntries, loading: dexLoading, getPokemonName } = usePokemonDex();

  const [activeTab, setActiveTab] = useState<'base' | 'variants'>('base');
  const [picker, setPicker] = useState<PickerState>(null);
  const [viewingCard, setViewingCard] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DeleteState>(null);

  const handleBaseAssign = useCallback(async (cardId: string, cardName: string, cardImage: string) => {
    if (!picker?.dexId) return;
    await assignSlot('base', String(picker.dexId), cardId, cardName, cardImage);
    setPicker(null);
  }, [picker, assignSlot]);

  const handleVariantAssign = useCallback(async (cardId: string, cardName: string, cardImage: string) => {
    await assignSlot('variant', cardId, cardId, cardName, cardImage);
    setPicker(null);
  }, [assignSlot]);

  const handleDownloadOwned = useCallback(() => {
    const owned = ALL_DEX_IDS.map(id => ({ id, slot: getBaseSlot(id) })).filter(item => !!item.slot)
      .map(item => ({ name: item.slot?.cardName || getPokemonName(item.id) || '', expansion: item.slot?.cardId.split('-')[0] || '' }));
    downloadCSV(t('report.filename.owned'), owned, [
      { key: 'name', label: t('report.csvHeader.name') }, { key: 'expansion', label: t('report.csvHeader.expansion') }
    ]);
  }, [getBaseSlot, getPokemonName, t]);

  const handleDownloadMissing = useCallback(() => {
    const missing = ALL_DEX_IDS.filter(id => !getBaseSlot(id)).map(id => ({ name: getPokemonName(id) || `#${id}` }));
    downloadCSV(t('report.filename.missing'), missing, [{ key: 'name', label: t('report.csvHeader.name') }]);
  }, [getBaseSlot, getPokemonName, t]);

  if (!user || !isPro) return null;

  const topBar = (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-amber-400">🏆 MasterDex</span>
      <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">PRO</span>
      <span className="text-xs text-gray-500 hidden sm:inline">
        {baseCount}/{ALL_DEX_IDS.length} base · {variantCount} variants
      </span>
    </div>
  );

  return (
    <AppShell topBar={topBar}>
      <div className="bg-gray-950 min-h-full">
        <MasterDexHeader baseCount={baseCount} totalCount={ALL_DEX_IDS.length} variantCount={variantCount}
          onDownloadOwned={handleDownloadOwned} onDownloadMissing={handleDownloadMissing} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          {(['base', 'variants'] as const).map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? tab === 'base' ? 'bg-vault-600 text-white' : 'bg-amber-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}>
              {tab === 'base' ? `🔵 ${t('masterdex.tabBase')}` : `⭐ ${t('masterdex.tabVariants')}`}
              <span className="ml-2 text-xs opacity-70">
                {tab === 'base' ? `${baseCount}/${ALL_DEX_IDS.length}` : variantCount}
              </span>
            </button>
          ))}
        </div>

        {activeTab === 'base' && (
          <BaseDexTab allDexIds={ALL_DEX_IDS} getBaseSlot={getBaseSlot}
            onOpenPicker={(id, name) => setPicker({ dexId: id, type: 'base', initialSearch: name })}
            onClearSlot={(id) => setConfirmDelete({ type: 'base', key: String(id), dexId: id })}
            onShowDetails={setViewingCard} />
        )}

        {activeTab === 'variants' && (
          <VariantsTab variantSlots={variantSlots}
            onAddVariant={() => setPicker({ type: 'variant', initialSearch: '' })}
            onClearSlot={(s) => setConfirmDelete({ type: 'variant', key: s.slotKey })}
            onShowDetails={setViewingCard} />
        )}
      </div>

      {confirmDelete && (
        <ConfirmModal message={t('card.confirmDelete')}
          onConfirm={async () => { await unassignSlot(confirmDelete.type, confirmDelete.key); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)} />
      )}

      {viewingCard && <CardDetailModal cardId={viewingCard} onClose={() => setViewingCard(null)} />}

      {picker && (
        <CardPickerModal key={`${picker.type}-${picker.dexId ?? 'variant'}`}
          initialSearch={picker.initialSearch ?? ''} slotType={picker.type}
          onAssign={picker.type === 'base' ? handleBaseAssign : handleVariantAssign}
          onClose={() => setPicker(null)} />
      )}

      {dexLoading && pokemonEntries.length === 0 && (
        <div className="fixed inset-0 bg-gray-950/80 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-vault-500 border-t-transparent" />
        </div>
      )}
      </div>
    </AppShell>
  );
}
