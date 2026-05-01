import { useLanguage } from '../../hooks/useLanguage';
import { FullCard } from './types';

export default function CardBasicInfo({ card }: { card: FullCard }) {
  const { t } = useLanguage();
  const imageUrl = card.image ? `${card.image}/high.webp` : '/card-back.svg';

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
      <div className="sm:w-48 flex-shrink-0 flex justify-center">
        <img src={imageUrl} alt={card.name} className="w-48 sm:w-full rounded-xl shadow-lg"
          onError={(e) => { (e.target as HTMLImageElement).src = '/card-back.svg'; }} />
      </div>
      <div className="flex-1 space-y-3">
        <div>
          <h3 className="text-xl font-bold">{card.name}</h3>
          <p className="text-sm text-gray-500">{card.id}</p>
          {card.pricing?.cardmarket?.avg != null && (
            <p className="text-xs text-gray-400 mt-1">
              €{card.pricing.cardmarket.avg.toFixed(2)}
              {card.pricing?.tcgplayer?.normal?.midPrice != null && <> / ${card.pricing.tcgplayer.normal.midPrice.toFixed(2)}</>}
            </p>
          )}
          {card.set && (
            <div>
              <span className="text-gray-500">{t('detail.set')}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {card.set.symbol && <img src={card.set.symbol} alt="" className="w-4 h-4" />}
                <span className="text-gray-200">{card.set.name}</span>
              </div>
            </div>
          )}
          {card.rarity && <div><span className="text-gray-500">{t('detail.rarity')}</span><p className="text-gray-200">{card.rarity}</p></div>}
          {card.category && <div><span className="text-gray-500">{t('detail.category')}</span><p className="text-gray-200">{card.category}</p></div>}
          {card.illustrator && <div><span className="text-gray-500">{t('detail.artist')}</span><p className="text-gray-200">{card.illustrator}</p></div>}
          {card.hp != null && <div><span className="text-gray-500">{t('detail.hp')}</span><p className="text-gray-200">{card.hp}</p></div>}
          {card.types?.length ? <div><span className="text-gray-500">{t('detail.types')}</span><p className="text-gray-200">{card.types.join(', ')}</p></div> : null}
          {card.stage && <div><span className="text-gray-500">{t('detail.stage')}</span><p className="text-gray-200">{card.stage}</p></div>}
          {card.dexId?.length ? <div><span className="text-gray-500">{t('detail.dexId')}</span><p className="text-gray-200">#{card.dexId.join(', #')}</p></div> : null}
        </div>
      </div>
    </div>
  );
}
