import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import es from './locales/es.json' with { type: 'json' }
import en from './locales/en.json' with { type: 'json' }
import fr from './locales/fr.json' with { type: 'json' }
import pt from './locales/pt.json' with { type: 'json' }
import br from './locales/br.json' with { type: 'json' }

const idiomaGuardado =
  (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rm_idioma')) || 'es'

const brandNameProcessor = {
  type: 'postProcessor',
  name: 'brandName',
  process(value) {
    const brandName =
      (typeof document !== 'undefined' && document.documentElement?.dataset?.brand) || 'Drivique'
    return typeof value === 'string'
      ? value.replace(/Drivique/gi, (match) =>
          match === match.toUpperCase() ? brandName.toUpperCase() : brandName
        )
      : value
  },
}

i18n
  .use(brandNameProcessor)
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
    postProcess: ['brandName'],
  })

export default i18n
