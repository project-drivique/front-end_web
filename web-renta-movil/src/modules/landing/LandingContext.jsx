// src/modules/landing/LandingContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const LandingContext = createContext(null)

export function LandingProvider({ children }) {
  const [tema, setTema] = useState(
    () => sessionStorage.getItem('rm_tema') || 'claro'
  )
  const [idioma, setIdioma] = useState(
    () => sessionStorage.getItem('rm_idioma') || 'es'
  )

  // Aplica clase "dark" en <html> y guarda en sesión
  useEffect(() => {
    sessionStorage.setItem('rm_tema', tema)
    document.documentElement.classList.toggle('dark', tema === 'oscuro')
  }, [tema])

  useEffect(() => {
    sessionStorage.setItem('rm_idioma', idioma)
  }, [idioma])

  const toggleTema = () => setTema(prev => prev === 'claro' ? 'oscuro' : 'claro')

  return (
    <LandingContext.Provider value={{ tema, toggleTema, idioma, setIdioma }}>
      {children}
    </LandingContext.Provider>
  )
}

export const useLanding = () => useContext(LandingContext)