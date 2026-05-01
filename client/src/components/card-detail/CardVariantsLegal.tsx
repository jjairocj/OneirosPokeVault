import { useLanguage } from '../../hooks/useLanguage';
import { FullCard } from './types';

export default function CardVariantsLegal({ card }: { card: FullCard }) {
  const { t } = useLanguage();

  return (
    <>
      {card.variants && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-2">{t('detail.variants')}</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(card.variants).map(([key, available]) => (
              <span key={key}
                className={`text-xs px-2.5 py-1 rounded-full border ${available ? 'bg-vault-600/20 border-vault-500/40 text-vault-300' : 'bg-gray-800/50 border-gray-700/50 text-gray-600'}`}>
                {t(`variant.${key}` as any)}
              </span>
            ))}
          </div>
        </div>
      )}
      {card.legal && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-2">{t('detail.legal')}</h4>
          <div className="flex gap-3">
            <span className={`text-xs px-2.5 py-1 rounded-full ${card.legal.standard ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400/60 border border-red-500/20'}`}>
              {t('detail.standard')}: {card.legal.standard ? t('detail.legal.yes') : t('detail.legal.no')}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full ${card.legal.expanded ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400/60 border border-red-500/20'}`}>
              {t('detail.expanded')}: {card.legal.expanded ? t('detail.legal.yes') : t('detail.legal.no')}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
