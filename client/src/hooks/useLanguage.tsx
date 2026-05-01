import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { en } from '../lib/translations';
import { es } from '../lib/translations.es';

export type UILanguage = 'en' | 'es';
export type TranslationKey = keyof typeof en;

const translations = { en, es } as const;

interface LanguageContextType {
  lang: UILanguage;
  setLang: (lang: UILanguage) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function getInitialLang(): UILanguage {
  const stored = localStorage.getItem('oneiros-pokevault-lang');
  if (stored === 'es' || stored === 'en') return stored;
  return navigator.language.startsWith('es') ? 'es' : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<UILanguage>(getInitialLang);

  const setLang = useCallback((newLang: UILanguage) => {
    setLangState(newLang);
    localStorage.setItem('oneiros-pokevault-lang', newLang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[lang][key] || translations.en[key] || key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
