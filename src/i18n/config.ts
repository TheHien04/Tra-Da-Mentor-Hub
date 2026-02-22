// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import viTranslations from './locales/vi.json';
import jpTranslations from './locales/jp.json';
import krTranslations from './locales/kr.json';
import cnTranslations from './locales/cn.json';

const resources = {
  en: { translation: enTranslations },
  vi: { translation: viTranslations },
  jp: { translation: jpTranslations },
  kr: { translation: krTranslations },
  cn: { translation: cnTranslations },
};

i18n
  .use(LanguageDetector) // Auto-detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Fallback to English if language not available
    debug: true, // Enable for development debugging
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false, // Disable suspense for immediate language changes
    },
  });

export default i18n;
