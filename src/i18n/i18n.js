import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import fr from './locales/fr/common.json'
import en from './locales/en/common.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    interpolation: { escapeValue: false },
    detection: {
      order: ['querystring', 'localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
  })

export default i18n