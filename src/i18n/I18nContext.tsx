import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLocale, TranslationDictionary } from './types';
import { ptBR } from './pt-BR';
import { enUS } from './en-US';
import { esES } from './es-ES';

const STORAGE_LOCALE_KEY = 'speedjobs_user_locale_v1';

const DICTIONARIES: Record<SupportedLocale, TranslationDictionary> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES,
};

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  dict: TranslationDictionary;
  t: (keyPath: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

function detectInitialLocale(): SupportedLocale {
  try {
    const saved = localStorage.getItem(STORAGE_LOCALE_KEY);
    if (saved && (saved === 'pt-BR' || saved === 'en-US' || saved === 'es-ES')) {
      return saved as SupportedLocale;
    }
  } catch {}

  // STRICT REQUIREMENT: Portuguese (pt-BR) is the absolute default language
  return 'pt-BR';
}

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(detectInitialLocale);

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_LOCALE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    } catch {}
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const dict = DICTIONARIES[locale] || DICTIONARIES['pt-BR'];

  const t = (keyPath: string, params?: Record<string, string | number>): string => {
    const parts = keyPath.split('.');
    let current: any = dict;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return keyPath;
      }
    }

    if (typeof current !== 'string') {
      return keyPath;
    }

    if (!params) return current;

    return Object.entries(params).reduce((str, [k, v]) => {
      return str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }, current);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, dict, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
