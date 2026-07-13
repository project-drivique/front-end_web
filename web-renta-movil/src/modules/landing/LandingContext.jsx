// src/modules/landing/LandingContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import i18n from '../../i18n/index.js'
import { showAlert } from '../../utils/swalConfig'
import {
  obtenerTasaSincrona,
  suscribirseATasa,
  iniciarActualizacionAutomatica,
} from '../../services/exchangeRateService'

const LandingContext = createContext(null)

export function LandingProvider({ children }) {
  const [tema, setTema] = useState(
    () => sessionStorage.getItem('rm_tema') || 'claro'
  )
  const [idioma, setIdioma] = useState(
    () => sessionStorage.getItem('rm_idioma') || 'es'
  )
  const [moneda, setMonedaState] = useState(
    () => localStorage.getItem('rm_moneda') || 'COP'
  )
  // Tasa USD -> COP en tiempo real (se actualiza sola, ver useEffect abajo).
  const [tasaUSD, setTasaUSD] = useState(() => obtenerTasaSincrona())

  // Aplica clase "dark" en <html> y guarda en sesión
  useEffect(() => {
    sessionStorage.setItem('rm_tema', tema)
    document.documentElement.classList.toggle('dark', tema === 'oscuro')
  }, [tema])

  useEffect(() => {
    sessionStorage.setItem('rm_idioma', idioma)
    i18n.changeLanguage(idioma)
  }, [idioma])

  useEffect(() => {
    localStorage.setItem('rm_moneda', moneda)
  }, [moneda])

  // Arranca las peticiones periódicas a la API de tasas de cambio (una sola
  // vez para toda la app) y se suscribe para re-renderizar cuando llegue un
  // valor nuevo, de forma que formatCurrency() siempre use la tasa vigente.
  useEffect(() => {
    const detener = iniciarActualizacionAutomatica()
    const cancelarSuscripcion = suscribirseATasa((nuevaTasa) => setTasaUSD(nuevaTasa))
    return () => {
      detener()
      cancelarSuscripcion()
    }
  }, [])

  const toggleTema = () => setTema(prev => prev === 'claro' ? 'oscuro' : 'claro')

  // Envuelve setMoneda: si el usuario activa USD, se le avisa con SweetAlert
  // que el cobro real (Wompi) siempre se hace en pesos colombianos y que el
  // valor en dólares es solo una conversión visual de referencia.
  const setMoneda = useCallback((nuevaMoneda) => {
    setMonedaState(nuevaMoneda)
    if (nuevaMoneda === 'USD') {
      const textoIdioma = {
        es: {
          title: 'El cobro siempre es en COP',
          html: 'Estás viendo los precios en <b>dólares (USD)</b> solo como referencia visual.<br/>El cobro real a través de Wompi siempre se realiza en <b>pesos colombianos (COP)</b>, según la tasa de cambio del momento.',
          confirm: 'Entendido',
        },
        en: {
          title: 'You will always be charged in COP',
          html: 'You are viewing prices in <b>US Dollars (USD)</b> as a visual reference only.<br/>The actual charge through Wompi is always made in <b>Colombian Pesos (COP)</b>, using the exchange rate at the time of payment.',
          confirm: 'Got it',
        },
      }
      const t = textoIdioma[idioma] || textoIdioma.es
      showAlert({
        icon: 'info',
        title: t.title,
        html: t.html,
        confirmButtonText: t.confirm,
      })
    }
  }, [idioma])

  return (
    <LandingContext.Provider value={{ tema, toggleTema, idioma, setIdioma, moneda, setMoneda, tasaUSD }}>
      {children}
    </LandingContext.Provider>
  )
}

export const useLanding = () => useContext(LandingContext)
