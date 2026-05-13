import { useState } from 'react'

export function useRegistro() {
  const [cargando, setCargando] = useState(false)
  const [exito,    setExito]    = useState(false)

  const registrar = async (datos) => {
    setCargando(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      console.log('Datos de registro:', datos)
      setExito(true)
    } finally {
      setCargando(false)
    }
  }

  return { registrar, cargando, exito }
}