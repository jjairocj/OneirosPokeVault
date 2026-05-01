import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';

interface MasterDexHeaderProps {
  baseCount: number;
  totalCount: number;
  variantCount: number;
  onDownloadOwned: () => void;
  onDownloadMissing: () => void;
}

export default function MasterDexHeader({ baseCount, totalCount, variantCount, onDownloadOwned, onDownloadMissing }: MasterDexHeaderProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const progressPct = totalCount > 0 ? (baseCount / totalCount) * 100 : 0;

  return (
    <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <button type="button" onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors text-sm">
          ← {t('masterdex.back')}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">MasterDex</h1>
          <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">PRO</span>
        </div>
        <div className="ml-auto flex items-center gap-4 text-sm text-gray-400">
          <span><span className="text-vault-400 font-semibold">{baseCount}</span>/{totalCount} {t('masterdex.baseFilled')}</span>
          <span><span className="text-amber-400 font-semibold">{variantCount}</span> {t('masterdex.variantsCollected')}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-vault-600 to-vault-400 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onDownloadOwned} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition-colors flex items-center gap-1.5">
            📥 {t('report.downloadOwned')}
          </button>
          <button onClick={onDownloadMissing} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition-colors flex items-center gap-1.5">
            📥 {t('report.downloadMissing')}
          </button>
        </div>
      </div>
    </div>
  );
}
