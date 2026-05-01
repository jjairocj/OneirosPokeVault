import { useLanguage } from '../../hooks/useLanguage';
import EnergyIcon from '../EnergyIcon';

interface Attack { name: string; cost?: string[]; damage?: number | string; effect?: string; }

export default function CardAttacks({ attacks }: { attacks: Attack[] }) {
  const { t } = useLanguage();
  if (!attacks.length) return null;

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-400 mb-2">{t('detail.attacks')}</h4>
      <div className="space-y-2">
        {attacks.map((atk, i) => (
          <div key={i} className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {atk.cost?.length ? (
                  <div className="flex items-center gap-0.5">
                    {atk.cost.map((c, j) => <EnergyIcon key={j} type={c} />)}
                  </div>
                ) : null}
                <span className="font-medium text-sm">{atk.name}</span>
              </div>
              {atk.damage != null && <span className="text-vault-400 font-bold text-sm">{atk.damage}</span>}
            </div>
            {atk.effect && <p className="text-xs text-gray-400 mt-1">{atk.effect}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
