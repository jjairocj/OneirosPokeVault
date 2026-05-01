import { useLanguage } from '../../hooks/useLanguage';
import { FullCard } from './types';

function PriceRow({ label, value }: { label: string; value?: number }) {
  if (value == null) return null;
  return <div><span className="text-gray-600">{label}</span><p className="text-gray-200">${value.toFixed(2)}</p></div>;
}

export default function CardPricing({ pricing }: { pricing: NonNullable<FullCard['pricing']> }) {
  const { t } = useLanguage();
  if (!pricing.cardmarket && !pricing.tcgplayer) return null;

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-400 mb-2">{t('detail.pricing')}</h4>
      <div className="space-y-3">
        {pricing.cardmarket && (
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-800">
            <div className="text-xs font-medium text-gray-300 mb-2">CardMarket (EUR)</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {pricing.cardmarket.avg != null && <div><span className="text-gray-500">Avg</span><p className="text-gray-200">€{pricing.cardmarket.avg.toFixed(2)}</p></div>}
              {pricing.cardmarket['avg-holo'] != null && <div><span className="text-gray-500">Avg Holo</span><p className="text-gray-200">€{pricing.cardmarket['avg-holo'].toFixed(2)}</p></div>}
              {pricing.cardmarket.avg30 != null && <div><span className="text-gray-500">30d Avg</span><p className="text-gray-200">€{pricing.cardmarket.avg30.toFixed(2)}</p></div>}
            </div>
          </div>
        )}
        {pricing.tcgplayer && (
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-800">
            <div className="text-xs font-medium text-gray-300 mb-2">TCGPlayer (USD)</div>
            <div className="space-y-2">
              {pricing.tcgplayer.normal && (
                <div>
                  <span className="text-gray-500 text-xs">Normal</span>
                  <div className="grid grid-cols-3 gap-2 text-xs mt-1">
                    <PriceRow label="Low" value={pricing.tcgplayer.normal.lowPrice} />
                    <PriceRow label="Mid" value={pricing.tcgplayer.normal.midPrice} />
                    <PriceRow label="High" value={pricing.tcgplayer.normal.highPrice} />
                  </div>
                </div>
              )}
              {pricing.tcgplayer['reverse-holofoil'] && (
                <div>
                  <span className="text-gray-500 text-xs">Reverse Holo</span>
                  <div className="grid grid-cols-3 gap-2 text-xs mt-1">
                    <PriceRow label="Low" value={pricing.tcgplayer['reverse-holofoil'].lowPrice} />
                    <PriceRow label="Mid" value={pricing.tcgplayer['reverse-holofoil'].midPrice} />
                    <PriceRow label="High" value={pricing.tcgplayer['reverse-holofoil'].highPrice} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
