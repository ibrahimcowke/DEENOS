import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from '../locales/en.json';
import soTranslation from '../locales/so.json';
import arTranslation from '../locales/ar.json';

const resources = {
  en: { translation: enTranslation },
  so: { translation: soTranslation },
  ar: { translation: arTranslation }
};

const savedLanguage = localStorage.getItem('deenos_language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

// Apply document language attributes on load
const applyLanguageSettings = (lang: string) => {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  localStorage.setItem('deenos_language', lang);
};

applyLanguageSettings(savedLanguage);

// Expose language switching helper
export const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
  applyLanguageSettings(lang);
};

export default i18n;
