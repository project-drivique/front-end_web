import { apiConfigurada } from './apiConfig'

// Si el despliegue no tiene la URL del backend, se explica en pantalla en lugar de dejar la página en blanco
if (!apiConfigurada) {
  const raiz = document.getElementById('root')
  if (raiz) {
    raiz.innerHTML = '<div style="font-family:system-ui,sans-serif;max-width:520px;margin:12vh auto;padding:24px;border-radius:16px;background:#fff;color:#0f172a;box-shadow:0 8px 30px rgba(0,0,0,.08)">'
      + '<h1 style="font-size:20px;margin:0 0 8px">Configuración incompleta</h1>'
      + '<p style="margin:0;line-height:1.5;color:#475569">Falta la variable <strong>VITE_API_URL</strong> con la dirección pública del servidor. '
      + 'Defínela en la configuración del despliegue (Netlify, Site configuration, Environment variables) y vuelve a publicar.</p></div>'
  }
  throw new Error('VITE_API_URL no está configurada: no se puede iniciar la aplicación.')
}
