'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Language = 'en' | 'zh';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: <T extends { en: string; zh: string }>(value: T) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const stored = window.localStorage.getItem('se-docs-language');
    if (stored === 'en' || stored === 'zh') setLanguageState(stored);
  }, []);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    window.localStorage.setItem('se-docs-language', next);
    document.documentElement.lang = next === 'zh' ? 'zh-TW' : 'en';
  };

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    t: (value) => value[language]
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
