import { useState, useEffect } from 'react';
import TCGdex from '@tcgdex/sdk';
import { useLanguage } from '../hooks/useLanguage';
import { FullCard, CARD_LANGUAGES } from './card-detail/types';
import CardBasicInfo from './card-detail/CardBasicInfo';
import CardAbilities from './card-detail/CardAbilities';
import CardAttacks from './card-detail/CardAttacks';
import CardCombatInfo from './card-detail/CardCombatInfo';
import CardVariantsLegal from './card-detail/CardVariantsLegal';
import CardPricing from './card-detail/CardPricing';
import PriceTrendPanel from './prices/PriceTrendPanel';
import CardNoteEditor from './pro/CardNoteEditor';

interface CardDetailModalProps {
  cardId: string;
  onClose: () => void;
}

export default function CardDetailModal({ cardId, onClose }: CardDetailModalProps) {
  const { t, lang } = useLanguage();
  const [card, setCard] = useState<FullCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardLang, setCardLang] = useState<string>(lang);

  useEffect(() => {
    let cancelled = false;
    async function fetchCard() {
      setLoading(true); setError(null);
      try {
        const sdk = new TCGdex(cardLang as any);
        const result = await sdk.card.get(cardId);
        if (cancelled) return;
        if (!result) { setError('Card not found'); setCard(null); }
        else setCard(result as unknown as FullCard);
      } catch (err: any) {
        if (!cancelled) setError(`Failed to load card: ${err?.message || 'Unknown error'}`);
      } finally { if (!cancelled) setLoading(false); }
    }
    fetchCard();
    return () => { cancelled = true; };
  }, [cardId, cardLang]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 p-0 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-gray-900 sm:rounded-2xl w-full max-w-2xl sm:my-8 min-h-screen sm:min-h-0 border-0 sm:border border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-base sm:text-lg font-bold">{t('detail.title')}</h2>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 hidden sm:inline">{t('detail.cardLang')}:</span>
              <select value={cardLang} onChange={(e) => setCardLang(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-vault-500">
                {CARD_LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-white text-2xl leading-none px-1 py-1">&times;</button>
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
            <CardBasicInfo card={card} />
            {card.abilities?.length ? <CardAbilities abilities={card.abilities} /> : null}
            {card.attacks?.length ? <CardAttacks attacks={card.attacks} /> : null}
            <CardCombatInfo card={card} />
            <CardVariantsLegal card={card} />
            {card.pricing && <CardPricing pricing={card.pricing} />}
            <PriceTrendPanel cardId={cardId} />
            <CardNoteEditor cardId={cardId} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
