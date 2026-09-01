import i18n from 'i18next' // Importa la instancia principal de i18next, que administra los idiomas y traducciones.
import { initReactI18next } from 'react-i18next' // Importa el conector para integrar i18next con React.

import es from './locales/es.json' // Importa las traducciones en español.
import en from './locales/en.json' // Importa las traducciones en inglés.
import fr from './locales/fr.json' // Importa las traducciones en francés.
import pt from './locales/pt.json' // Importa las traducciones en portugués.
import br from './locales/br.json' // Importa las traducciones en portugués brasileño o variante que definiste.

const idiomaGuardado = sessionStorage.getItem('rm_idioma') || 'es' 
// Busca en sessionStorage el idioma guardado anteriormente.
// Si no existe, usa 'es' como idioma inicial.

const brandNameProcessor = {
  type: 'postProcessor',
  name: 'brandName',
  process(value) {
    const brandName = document.documentElement.dataset.brand || 'Drivique'
    return typeof value === 'string'
      ? value.replace(/Drivique/gi, (match) => match === match.toUpperCase() ? brandName.toUpperCase() : brandName)
      : value
  },
}

i18n
  .use(brandNameProcessor)
  .use(initReactI18next) 
  // Le dice a i18next que se conecte con React mediante react-i18next.

  .init({
    resources: {
      es: { translation: es }, 
      // Registra el archivo es.json bajo el código de idioma "es".

      en: { translation: en }, 
      // Registra el archivo en.json bajo el código "en".

      fr: { translation: fr }, 
      // Registra el archivo fr.json bajo el código "fr".

      pt: { translation: pt }, 
      // Registra el archivo pt.json bajo el código "pt".

      br: { translation: br }, 
      // Registra el archivo br.json bajo el código "br".
    },

    lng: idiomaGuardado, 
    // Define el idioma actual de la app usando el valor guardado en sessionStorage.

    fallbackLng: 'es', 
    // Si una traducción no existe en el idioma actual, usa español como respaldo.

    interpolation: { escapeValue: false }, 
    postProcess: ['brandName'],
    // Indica que React ya escapa contenido automáticamente, así que i18next no necesita hacerlo.
  })

export default i18n 
// Exporta la configuración para usarla en toda la aplicación.
