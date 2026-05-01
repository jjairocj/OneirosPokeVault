import { useLanguage } from '../../hooks/useLanguage';

interface Ability { name: string; effect: string; type?: string; }

export default function CardAbilities({ abilities }: { abilities: Ability[] }) {
  const { t } = useLanguage();
  if (!abilities.length) return null;

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-400 mb-2">{t('detail.abilities')}</h4>
      <div className="space-y-2">
        {abilities.map((ability, i) => (
          <div key={i} className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="font-medium text-sm text-gray-200">{ability.name}</span>
                {ability.type && <span className="text-xs text-gray-500 ml-2">({ability.type})</span>}
              </div>
            </div>
            {ability.effect && <p className="text-xs text-gray-400 mt-1">{ability.effect}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
