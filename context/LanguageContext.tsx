import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Lang, T } from '../lib/i18n';

const LanguageContext = createContext<any>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    AsyncStorage.getItem('app_lang').then((saved) => {
      if (saved === 'ta' || saved === 'en') setLang(saved as Lang);
    });
  }, []);

  const toggleLang = async () => {
    const next = lang === 'en' ? 'ta' : 'en';
    setLang(next);
    await AsyncStorage.setItem('app_lang', next);
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t: T[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);