import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translation files
import translationEN from './locales/en/translation.json';
import translationES from './locales/es/translation.json';
import translationDE from './locales/de/translation.json';
import translationFR from './locales/fr/translation.json';
import translationZH from './locales/zh/translation.json';
import translationJA from './locales/ja/translation.json';
import translationHI from './locales/hi/translation.json';
import translationKO from './locales/ko/translation.json';
import translationVI from './locales/vi/translation.json';
import translationTR from './locales/tr/translation.json';
import translationPL from './locales/pl/translation.json';
import translationUK from './locales/uk/translation.json';
import translationAR from './locales/ar/translation.json';
import translationIT from './locales/it/translation.json';

// Resources object with all translations
const resources = {
  en: {
    translation: translationEN
  },
  es: {
    translation: translationES
  },
  de: {
    translation: translationDE
  },
  fr: {
    translation: translationFR
  },
  zh: {
    translation: translationZH
  },
  ja: {
    translation: translationJA
  },
  hi: {
    translation: translationHI
  },
  ko: {
    translation: translationKO
  },
  vi: {
    translation: translationVI
  },
  tr: {
    translation: translationTR
  },
  pl: {
    translation: translationPL
  },
  uk: {
    translation: translationUK
  },
  ar: {
    translation: translationAR
  },
  it: {
    translation: translationIT
  }
};

// Language names for the selector
export const languageOptions = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ko', name: '한국어' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'pl', name: 'Polski' },
  { code: 'uk', name: 'Українська' },
  { code: 'ar', name: 'العربية' },
  { code: 'it', name: 'Italiano' }
];

i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n; 