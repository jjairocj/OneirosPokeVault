import { useState, useRef } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import ConfirmModal from './ConfirmModal';

interface CardItemProps {
  id: string;
  name: string;
  image: string;
  owned: boolean;
  onToggle: (id: string) => void;
  onDetails: (id: string) => void;
}

export default function CardItem({ id, name, image, owned, onToggle, onDetails }: CardItemProps) {
  const { t } = useLanguage();
  const [tapped, setTapped] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const isTouchRef = useRef(false);

  const handleTouchStart = () => {
    isTouchRef.current = true;
  };

  const handleClick = () => {
    if (owned) {
      setShowConfirm(true);
      return;
    }

    if (isTouchRef.current) {
      // Touch device: first tap shows overlay, second tap toggles
      isTouchRef.current = false;
      if (tapped) {
        onToggle(id);
        setTapped(false);
      } else {
        setTapped(true);
      }
    } else {
      // Mouse click: toggle directly
      onToggle(id);
    }
  };

  return (
    <div
      className={`relative group rounded-xl overflow-hidden transition-all duration-300 ${
        owned ? 'ring-2 ring-vault-500 shadow-lg shadow-vault-500/20' : ''
      }`}
      onBlur={() => setTapped(false)}
    >
      <img
        src={image}
        alt={name}
        loading="lazy"
        className={`w-full aspect-[2.5/3.5] object-cover transition-all duration-300 cursor-pointer ${
          owned ? '' : 'grayscale brightness-[0.55]'
        }`}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/card-back.svg';
        }}
      />

      {/* Desktop hover overlay */}
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity flex flex-col items-center justify-center gap-2 pointer-events-none
          ${tapped ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (owned) {
              setShowConfirm(true);
            } else {
              onToggle(id);
            }
            setTapped(false);
          }}
          className="pointer-events-auto text-white font-bold text-sm bg-vault-600 hover:bg-vault-700 active:bg-vault-800 px-4 py-2 rounded-lg transition-colors"
        >
          {owned ? t('card.owned') : t('card.notOwned')}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDetails(id);
            setTapped(false);
          }}
          className="pointer-events-auto text-gray-300 hover:text-white text-xs underline underline-offset-2 transition-colors"
        >
          {t('card.details')}
        </button>
      </div>

      {/* Owned badge */}
      {owned && (
        <div className="absolute top-1.5 right-1.5 bg-green-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-lg">
          &#10003;
        </div>
      )}

      {/* Mobile details button — always visible on touch */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDetails(id);
        }}
        className="absolute top-1.5 left-1.5 sm:hidden bg-black/60 text-gray-200 active:bg-black/80 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold shadow-lg backdrop-blur-sm border border-white/10"
        aria-label={t('card.details')}
      >
        i
      </button>

      {/* Card name */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 sm:p-2 pt-5 sm:pt-6">
        <p className="text-[10px] sm:text-xs text-white font-medium truncate">{name}</p>
        <p className="text-[9px] sm:text-[10px] text-gray-400">{id}</p>
      </div>

      {showConfirm && (
        <ConfirmModal
          message={t('card.confirmDelete')}
          onConfirm={() => {
            onToggle(id);
            setShowConfirm(false);
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
