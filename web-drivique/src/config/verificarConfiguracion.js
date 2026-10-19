import { apiConfigurada } from './apiConfig'

// Si el despliegue no tiene la URL del backend, se explica en pantalla en lugar de dejar la página en blanco
// Textos de la pantalla de error (se muestra antes de que cargue i18n)
const TEXTOS = {
  es: ['Configuración incompleta', 'Falta la variable', 'con la dirección pública del servidor.', 'Defínela en la configuración del despliegue (Netlify, Site configuration, Environment variables) y vuelve a publicar.'],
  en: ['Incomplete configuration', 'The variable', 'with the public server address is missing.', 'Define it in the deployment settings (Netlify, Site configuration, Environment variables) and publish again.'],
  pt: ['Configuração incompleta', 'Falta a variável', 'com o endereço público do servidor.', 'Defina-a na configuração da implementação (Netlify, Site configuration, Environment variables) e publique novamente.'],
  fr: ['Configuration incomplète', 'La variable', 'avec l’adresse publique du serveur est manquante.', 'Définissez-la dans la configuration du déploiement (Netlify, Site configuration, Environment variables) puis publiez à nouveau.'],
}

// Si el despliegue no tiene la URL del backend, se explica en pantalla en lugar de dejar la página en blanco
if (!apiConfigurada) {
  const idioma = (typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'es').slice(0, 2).toLowerCase()
  const tx = TEXTOS[idioma] || TEXTOS.es
  const raiz = document.getElementById('root')
  if (raiz) {
    raiz.innerHTML = '<div style="font-family:system-ui,sans-serif;max-width:520px;margin:12vh auto;padding:24px;border-radius:16px;background:#fff;color:#0f172a;box-shadow:0 8px 30px rgba(0,0,0,.08)">'
      + '<h1 style="font-size:20px;margin:0 0 8px">' + tx[0] + '</h1>'
      + '<p style="margin:0;line-height:1.5;color:#475569">' + tx[1] + ' <strong>VITE_API_URL</strong> ' + tx[2] + ' '
      + tx[3] + '</p></div>'
  }
  throw new Error('VITE_API_URL no está configurada: no se puede iniciar la aplicación.')
}
