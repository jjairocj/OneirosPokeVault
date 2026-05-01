export interface FullCard {
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
  set?: { id: string; name: string; logo?: string; symbol?: string };
  variants?: { normal?: boolean; holo?: boolean; reverse?: boolean; firstEdition?: boolean; wPromo?: boolean };
  abilities?: Array<{ name: string; effect: string; type?: string }>;
  attacks?: Array<{ name: string; cost?: string[]; damage?: number | string; effect?: string }>;
  weaknesses?: Array<{ type: string; value: string }>;
  resistances?: Array<{ type: string; value: string }>;
  retreat?: number;
  legal?: { standard?: boolean; expanded?: boolean };
  dexId?: number[];
  pricing?: {
    cardmarket?: { avg?: number; avg1?: number; avg7?: number; avg30?: number; 'avg-holo'?: number; unit?: string; updated?: string };
    tcgplayer?: {
      normal?: { lowPrice?: number; midPrice?: number; highPrice?: number; marketPrice?: number };
      'reverse-holofoil'?: { lowPrice?: number; midPrice?: number; highPrice?: number; marketPrice?: number };
      unit?: string; updated?: string;
    };
  };
}

export const CARD_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Espanol' },
  { code: 'fr', label: 'Francais' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Portugues' },
  { code: 'de', label: 'Deutsch' },
] as const;
