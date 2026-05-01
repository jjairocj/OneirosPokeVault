import { useLanguage } from '../../hooks/useLanguage';
import EnergyIcon from '../EnergyIcon';
import { FullCard } from './types';

export default function CardCombatInfo({ card }: { card: FullCard }) {
  const { t } = useLanguage();
  if (!card.weaknesses && !card.resistances && card.retreat == null) return null;

  return (
    <div className="flex flex-wrap gap-3 sm:gap-4 text-sm">
      {card.weaknesses?.length ? (
        <div>
          <span className="text-gray-500">{t('detail.weakness')}</span>
          <div className="flex items-center gap-1 mt-0.5">
            {card.weaknesses.map((w, i) => (
              <span key={i} className="flex items-center gap-0.5">
                <EnergyIcon type={w.type} /><span className="text-gray-200 text-xs">{w.value}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {card.resistances?.length ? (
        <div>
          <span className="text-gray-500">{t('detail.resistance')}</span>
          <div className="flex items-center gap-1 mt-0.5">
            {card.resistances.map((r, i) => (
              <span key={i} className="flex items-center gap-0.5">
                <EnergyIcon type={r.type} /><span className="text-gray-200 text-xs">{r.value}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {card.retreat != null && (
        <div>
          <span className="text-gray-500">{t('detail.retreat')}</span>
          <div className="flex items-center gap-0.5 mt-0.5">
            {Array.from({ length: card.retreat }).map((_, i) => <EnergyIcon key={i} type="Colorless" />)}
          </div>
        </div>
      )}
    </div>
  );
}
