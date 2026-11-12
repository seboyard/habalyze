import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales-es';
import en from './locales-en';

// Detect user's preferred language from localStorage or browser
const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('habalyze-language') : null;
const defaultLanguage = savedLanguage || 'es';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en }
    },
    lng: defaultLanguage,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('habalyze-language', lng);
    document.documentElement.lang = lng;
  }
});

export default i18n;