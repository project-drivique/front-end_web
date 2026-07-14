// src/main.jsx
import { StrictMode } from 'react'
// Importa StrictMode de React.
// Sirve para activar verificaciones adicionales en desarrollo.

import { createRoot } from 'react-dom/client'
// Importa createRoot para montar la aplicación React
// usando la API moderna de React 18+.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// Importa React Query:
// - QueryClient: crea el cliente global de consultas.
// - QueryClientProvider: lo inyecta en toda la aplicación.

import './index.css'
// Importa los estilos globales de la aplicación.

import './styles/responsive.css'
// Importa las media queries responsive (tablet / celular).
// Solo actúan por debajo de 1024px, en escritorio no cambia nada.

import './i18n/index.js'
// Importa la configuración de internacionalización.
// Solo con importarlo ya se inicializa i18n en la app.

import App from './App.jsx'
// Importa el componente principal de la aplicación.

import { LandingProvider } from './modules/landing/LandingContext.jsx'
// Importa un provider personalizado para manejar
// estado o contexto relacionado con la landing page.

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
})
// Crea una instancia global de React Query.
// Configuración:
// - retry: 1 → si una consulta falla, la reintenta solo una vez.
// - staleTime: 1000 * 60 * 5 → los datos se consideran "frescos"
//   durante 5 minutos antes de quedar stale.

createRoot(document.getElementById('root')).render(
  // Busca el elemento con id="root" en el HTML
  // y monta ahí toda la aplicación React.

  <StrictMode>
    {/* Activa comprobaciones extra en desarrollo */}

    <QueryClientProvider client={queryClient}>
      {/* Hace disponible React Query en toda la app */}

      <LandingProvider>
        {/* Hace disponible el contexto de landing a todos los hijos */}

        <App />
        {/* Componente raíz de la aplicación */}

      </LandingProvider>
    </QueryClientProvider>
  </StrictMode>,
)