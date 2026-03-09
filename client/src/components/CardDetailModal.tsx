import { useState, useEffect } from 'react';
import TCGdex from '@tcgdex/sdk';
import { useLanguage } from '../hooks/useLanguage';
import EnergyIcon from './EnergyIcon';

interface CardDetailModalProps {
  cardId: string;
  onClose: () => void;
}

interface FullCard {
  id: string;
  name: string;
  image?: string;
  localId: string;
  category?: string;
  illustrator?: string;
  rarity?: string;
  hp?: number;
  types?: string[];
  stage?: string;
  suffix?: string;
  evolveFrom?: string;
  set?: {
    id: string;
    name: string;
    logo?: string;
    symbol?: string;
  };
  variants?: {
    normal?: boolean;
    holo?: boolean;
    reverse?: boolean;
    firstEdition?: boolean;
    wPromo?: boolean;
  };
  variants_detailed?: Array<{
    type: string;
    size?: string;
  }>;
  abilities?: Array<{
    name: string;
    effect: string;
    type?: string;
  }>;
  attacks?: Array<{
    name: string;
    cost?: string[];
    damage?: number | string;
    effect?: string;
  }>;
  weaknesses?: Array<{ type: string; value: string }>;
  resistances?: Array<{ type: string; value: string }>;
  retreat?: number;
  legal?: { standard?: boolean; expanded?: boolean };
  dexId?: number[];
  pricing?: {
    cardmarket?: {
      avg?: number;
      avg1?: number;
      avg7?: number;
      avg30?: number;
      'avg-holo'?: number;
      unit?: string;
      updated?: string;
    };
    tcgplayer?: {
      normal?: {
        lowPrice?: number;
        midPrice?: number;
        highPrice?: number;
        marketPrice?: number;
      };
      'reverse-holofoil'?: {
        lowPrice?: number;
        midPrice?: number;
        highPrice?: number;
        marketPrice?: number;
      };
      unit?: string;
      updated?: string;
    };
  };
}

const CARD_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Espanol' },
  { code: 'fr', label: 'Francais' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Portugues' },
  { code: 'de', label: 'Deutsch' },
] as const;

export default function CardDetailModal({ cardId, onClose }: CardDetailModalProps) {
  const { t, lang } = useLanguage();
  const [card, setCard] = useState<FullCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardLang, setCardLang] = useState<string>(lang);

  useEffect(() => {
    let cancelled = false;

    async function fetchCard() {
      setLoading(true);
      setError(null);
      try {
        const sdk = new TCGdex(cardLang as any);
        const result = await sdk.card.get(cardId);
        if (cancelled) return;
        if (!result) {
          setError('Card not found');
          setCard(null);
        } else {
          setCard(result as unknown as FullCard);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to load card:', err);
          setError(`Failed to load card: ${err?.message || 'Unknown error'}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCard();
    return () => { cancelled = true; };
  }, [cardId, cardLang]);

  const imageUrl = card?.image
    ? `${card.image}/high.webp`
    : '/card-back.svg';

  return (
    <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 p-0 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-gray-900 sm:rounded-2xl w-full max-w-2xl sm:my-8 min-h-screen sm:min-h-0 border-0 sm:border border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-base sm:text-lg font-bold">{t('detail.title')}</h2>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Card language switcher */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 hidden sm:inline">{t('detail.cardLang')}:</span>
              <select
                value={cardLang}
                onChange={(e) => setCardLang(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-vault-500"
              >
                {CARD_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-white text-2xl leading-none px-1 py-1"
            >
              &times;
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-vault-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">{error}</div>
        ) : card ? (
          <div className="p-3 sm:p-4 space-y-4 sm:space-y-5">
            {/* Top: image + basic info */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
              <div className="sm:w-48 flex-shrink-0 flex justify-center">
                <img
                  src={imageUrl}
                  alt={card.name}
                  className="w-48 sm:w-full rounded-xl shadow-lg"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/card-back.svg'; }}
                />
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-xl font-bold">{card.name}</h3>
                  <p className="text-sm text-gray-500">{card.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  {card.set && (
                    <div>
                      <span className="text-gray-500">{t('detail.set')}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {card.set.symbol && (
                          <img src={card.set.symbol} alt="" className="w-4 h-4" />
                        )}
                        <span className="text-gray-200">{card.set.name}</span>
                      </div>
                    </div>
                  )}
                  {card.rarity && (
                    <div>
                      <span className="text-gray-500">{t('detail.rarity')}</span>
                      <p className="text-gray-200">{card.rarity}</p>
                    </div>
                  )}
                  {card.category && (
                    <div>
                      <span className="text-gray-500">{t('detail.category')}</span>
                      <p className="text-gray-200">{card.category}</p>
                    </div>
                  )}
                  {card.illustrator && (
                    <div>
                      <span className="text-gray-500">{t('detail.artist')}</span>
                      <p className="text-gray-200">{card.illustrator}</p>
                    </div>
                  )}
                  {card.hp != null && (
                    <div>
                      <span className="text-gray-500">{t('detail.hp')}</span>
                      <p className="text-gray-200">{card.hp}</p>
                    </div>
                  )}
                  {card.types && card.types.length > 0 && (
                    <div>
                      <span className="text-gray-500">{t('detail.types')}</span>
                      <p className="text-gray-200">{card.types.join(', ')}</p>
                    </div>
                  )}
                  {card.stage && (
                    <div>
                      <span className="text-gray-500">{t('detail.stage')}</span>
                      <p className="text-gray-200">{card.stage}</p>
                    </div>
                  )}
                  {card.dexId && card.dexId.length > 0 && (
                    <div>
                      <span className="text-gray-500">{t('detail.dexId')}</span>
                      <p className="text-gray-200">#{card.dexId.join(', #')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Abilities */}
            {card.abilities && card.abilities.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">{t('detail.abilities')}</h4>
                <div className="space-y-2">
                  {card.abilities.map((ability, i) => (
                    <div key={i} className="bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="font-medium text-sm text-gray-200">{ability.name}</span>
                          {ability.type && (
                            <span className="text-xs text-gray-500 ml-2">({ability.type})</span>
                          )}
                        </div>
                      </div>
                      {ability.effect && (
                        <p className="text-xs text-gray-400 mt-1">{ability.effect}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attacks */}
            {card.attacks && card.attacks.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">{t('detail.attacks')}</h4>
                <div className="space-y-2">
                  {card.attacks.map((atk, i) => (
                    <div key={i} className="bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {atk.cost && atk.cost.length > 0 && (
                            <div className="flex items-center gap-0.5">
                              {atk.cost.map((c, j) => (
                                <EnergyIcon key={j} type={c} />
                              ))}
                            </div>
                          )}
                          <span className="font-medium text-sm">{atk.name}</span>
                        </div>
                        {atk.damage != null && (
                          <span className="text-vault-400 font-bold text-sm">{atk.damage}</span>
                        )}
                      </div>
                      {atk.effect && (
                        <p className="text-xs text-gray-400 mt-1">{atk.effect}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weakness / Resistance / Retreat */}
            {(card.weaknesses || card.resistances || card.retreat != null) && (
              <div className="flex flex-wrap gap-3 sm:gap-4 text-sm">
                {card.weaknesses && card.weaknesses.length > 0 && (
                  <div>
                    <span className="text-gray-500">{t('detail.weakness')}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      {card.weaknesses.map((w, i) => (
                        <span key={i} className="flex items-center gap-0.5">
                          <EnergyIcon type={w.type} />
                          <span className="text-gray-200 text-xs">{w.value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {card.resistances && card.resistances.length > 0 && (
                  <div>
                    <span className="text-gray-500">{t('detail.resistance')}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      {card.resistances.map((r, i) => (
                        <span key={i} className="flex items-center gap-0.5">
                          <EnergyIcon type={r.type} />
                          <span className="text-gray-200 text-xs">{r.value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {card.retreat != null && (
                  <div>
                    <span className="text-gray-500">{t('detail.retreat')}</span>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {Array.from({ length: card.retreat }).map((_, i) => (
                        <EnergyIcon key={i} type="Colorless" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Variants */}
            {card.variants && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">{t('detail.variants')}</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(card.variants).map(([key, available]) => {
                    const labelKey = `variant.${key}` as any;
                    return (
                      <span
                        key={key}
                        className={`text-xs px-2.5 py-1 rounded-full border ${available
                          ? 'bg-vault-600/20 border-vault-500/40 text-vault-300'
                          : 'bg-gray-800/50 border-gray-700/50 text-gray-600'
                          }`}
                      >
                        {t(labelKey)}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Legality */}
            {card.legal && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">{t('detail.legal')}</h4>
                <div className="flex gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${card.legal.standard
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/10 text-red-400/60 border border-red-500/20'
                    }`}>
                    {t('detail.standard')}: {card.legal.standard ? t('detail.legal.yes') : t('detail.legal.no')}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${card.legal.expanded
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/10 text-red-400/60 border border-red-500/20'
                    }`}>
                    {t('detail.expanded')}: {card.legal.expanded ? t('detail.legal.yes') : t('detail.legal.no')}
                  </span>
                </div>
              </div>
            )}

            {/* Pricing */}
            {card.pricing && (card.pricing.cardmarket || card.pricing.tcgplayer) && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">{t('detail.pricing')}</h4>
                <div className="space-y-3">
                  {card.pricing.cardmarket && (
                    <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-800">
                      <div className="text-xs font-medium text-gray-300 mb-2">CardMarket (EUR)</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {card.pricing.cardmarket.avg != null && (
                          <div>
                            <span className="text-gray-500">Avg</span>
                            <p className="text-gray-200">€{card.pricing.cardmarket.avg.toFixed(2)}</p>
                          </div>
                        )}
                        {card.pricing.cardmarket['avg-holo'] != null && (
                          <div>
                            <span className="text-gray-500">Avg Holo</span>
                            <p className="text-gray-200">€{card.pricing.cardmarket['avg-holo'].toFixed(2)}</p>
                          </div>
                        )}
                        {card.pricing.cardmarket.avg30 != null && (
                          <div>
                            <span className="text-gray-500">30d Avg</span>
                            <p className="text-gray-200">€{card.pricing.cardmarket.avg30.toFixed(2)}</p>
                          </div>
                        )}
                        {card.pricing.cardmarket.trend != null && (
                          <div>
                            <span className="text-gray-500">Trend</span>
                            <p className="text-gray-200">€{(card.pricing.cardmarket as any).trend?.toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {card.pricing.tcgplayer && (
                    <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-800">
                      <div className="text-xs font-medium text-gray-300 mb-2">TCGPlayer (USD)</div>
                      <div className="space-y-2">
                        {card.pricing.tcgplayer.normal && (
                          <div>
                            <span className="text-gray-500 text-xs">Normal</span>
                            <div className="grid grid-cols-3 gap-2 text-xs mt-1">
                              {card.pricing.tcgplayer.normal.lowPrice != null && (
                                <div>
                                  <span className="text-gray-600">Low</span>
                                  <p className="text-gray-200">${card.pricing.tcgplayer.normal.lowPrice.toFixed(2)}</p>
                                </div>
                              )}
                              {card.pricing.tcgplayer.normal.midPrice != null && (
                                <div>
                                  <span className="text-gray-600">Mid</span>
                                  <p className="text-gray-200">${card.pricing.tcgplayer.normal.midPrice.toFixed(2)}</p>
                                </div>
                              )}
                              {card.pricing.tcgplayer.normal.highPrice != null && (
                                <div>
                                  <span className="text-gray-600">High</span>
                                  <p className="text-gray-200">${card.pricing.tcgplayer.normal.highPrice.toFixed(2)}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {card.pricing.tcgplayer['reverse-holofoil'] && (
                          <div>
                            <span className="text-gray-500 text-xs">Reverse Holo</span>
                            <div className="grid grid-cols-3 gap-2 text-xs mt-1">
                              {card.pricing.tcgplayer['reverse-holofoil'].lowPrice != null && (
                                <div>
                                  <span className="text-gray-600">Low</span>
                                  <p className="text-gray-200">${card.pricing.tcgplayer['reverse-holofoil'].lowPrice.toFixed(2)}</p>
                                </div>
                              )}
                              {card.pricing.tcgplayer['reverse-holofoil'].midPrice != null && (
                                <div>
                                  <span className="text-gray-600">Mid</span>
                                  <p className="text-gray-200">${card.pricing.tcgplayer['reverse-holofoil'].midPrice.toFixed(2)}</p>
                                </div>
                              )}
                              {card.pricing.tcgplayer['reverse-holofoil'].highPrice != null && (
                                <div>
                                  <span className="text-gray-600">High</span>
                                  <p className="text-gray-200">${card.pricing.tcgplayer['reverse-holofoil'].highPrice.toFixed(2)}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
