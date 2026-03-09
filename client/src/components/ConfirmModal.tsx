import { useLanguage } from '../hooks/useLanguage';

interface ConfirmModalProps {
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ title, message, onConfirm, onCancel }: ConfirmModalProps) {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={onCancel}>
      <div 
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <h3 className="text-white font-bold text-lg mb-2">
            {title || t('common.warning')}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            {message}
          </p>
        </div>
        
        <div className="flex border-t border-gray-800">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors border-l border-gray-800"
          >
            {t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
