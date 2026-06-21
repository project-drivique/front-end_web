// src/modules/landing/LandingContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import i18n from '../../i18n/index.js'

const LandingContext = createContext(null)

export function LandingProvider({ children }) {
  const [tema, setTema] = useState(
    () => sessionStorage.getItem('rm_tema') || 'claro'
  )
  const [idioma, setIdioma] = useState(
    () => sessionStorage.getItem('rm_idioma') || 'es'
  )
  const [moneda, setMoneda] = useState(
    () => localStorage.getItem('rm_moneda') || 'COP'
  )

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

  const toggleTema = () => setTema(prev => prev === 'claro' ? 'oscuro' : 'claro')

  return (
    <LandingContext.Provider value={{ tema, toggleTema, idioma, setIdioma, moneda, setMoneda }}>
      {children}
    </LandingContext.Provider>
  )
}

export const useLanding = () => useContext(LandingContext)