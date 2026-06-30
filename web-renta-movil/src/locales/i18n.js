import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import es from './es.json';
import en from './en.json';
import fr from './fr.json';
import pt from './pt.json';
import ptBR from './pt-BR.json';

const resources = {
  es: { translation: es },
  en: { translation: en },
  fr: { translation: fr },
  pt: { translation: pt },
  'pt-BR': { translation: ptBR }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'es',
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false, 
    },
  });

export default i18n;
