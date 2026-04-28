import { createContext, useContext, useState, useCallback } from 'react';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import mr from '../i18n/mr.json';
import ta from '../i18n/ta.json';
import bn from '../i18n/bn.json';

const translations = { en, hi, mr, ta, bn };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('fn-lang') || 'en';
  });

  const switchLang = useCallback((newLang) => {
    setLang(newLang);
    localStorage.setItem('fn-lang', newLang);
    document.documentElement.lang = newLang;
  }, []);

  const t = useCallback((key, replacements = {}) => {
    let text = translations[lang]?.[key] || translations.en[key] || key;
    Object.entries(replacements).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
    return text;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
