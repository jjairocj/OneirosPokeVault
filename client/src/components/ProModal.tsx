import { useLanguage } from '../hooks/useLanguage';

interface ProModalProps {
  onClose: () => void;
}

export default function ProModal({ onClose }: ProModalProps) {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-2xl p-8 w-full max-w-md border border-amber-500/30 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-4xl mb-4">&#9733;</div>
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          {t('pro.title')}
        </h2>
        <p className="text-gray-400 mb-6">{t('pro.description')}</p>

        <div className="space-y-3 text-left mb-6">
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-green-400">&#10003;</span>
            <span>{t('pro.unlimited')}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-green-400">&#10003;</span>
            <span>{t('pro.support')}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-green-400">&#10003;</span>
            <span>{t('pro.export')}</span>
          </div>
        </div>

        <button
          type="button"
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 rounded-lg font-bold transition-all"
        >
          {t('pro.cta')}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full text-gray-500 hover:text-gray-300 py-2 text-sm mt-2 transition-colors"
        >
          {t('pro.later')}
        </button>
      </div>
    </div>
  );
}
