import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import es from './locales/es.json'
import en from './locales/en.json'
import fr from './locales/fr.json'
import pt from './locales/pt.json'
import br from './locales/br.json'

const idiomaGuardado = sessionStorage.getItem('rm_idioma') || 'es'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      fr: { translation: fr },
      pt: { translation: pt },
      br: { translation: br },
    },
    lng: idiomaGuardado,
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
  })

export default i18n
