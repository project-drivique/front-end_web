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
  // Los textos vienen del sistema de idiomas (i18next), no están hardcodeados.
  const setMoneda = useCallback((nuevaMoneda) => {
    setMonedaState(nuevaMoneda)
    if (nuevaMoneda === 'USD') {
      showAlert({
        icon: 'info',
        title: i18n.t('common.usdChargeAlertTitle'),
        html: i18n.t('common.usdChargeAlertHtml'),
        confirmButtonText: i18n.t('common.usdChargeAlertConfirm'),
      })
    }
  }, [])

  return (
    <LandingContext.Provider value={{ tema, toggleTema, idioma, setIdioma, moneda, setMoneda, tasaUSD }}>
      {children}
    </LandingContext.Provider>
  )
}

export const useLanding = () => useContext(LandingContext)
