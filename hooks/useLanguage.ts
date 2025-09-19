
import { useState, useEffect } from 'react';
import type { Language } from '../types';

export const useLanguage = (): [Language, (language: Language) => void] => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
        const storedLang = localStorage.getItem('language') as Language;
        return storedLang || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  return [language, setLanguage];
};
