import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector'
import {initReactI18next} from "react-i18next";
import {ru} from './locales/ru';
import {en} from './locales/en';


i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        debug: true, //temporary for dev purposes
        resources: {en, ru},
        detection: {
            order: ['localStorage'],
            caches: ['localStorage'],
        },
        interpolation: {
            escapeValue: false,
        },
        supportedLngs: ['en', 'ru'],
        fallbackLng: ['en', 'ru']
    })
    .catch(err => console.error(err))

export default i18next
