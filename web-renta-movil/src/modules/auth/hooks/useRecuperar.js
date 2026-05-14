import { useState } from 'react'

export function useRecuperar() {
  const [correo, setCorreo]     = useState('')
  const [cargando, setCargando] = useState(false)
  const [enviado, setEnviado]   = useState(false)
  const [error, setError]       = useState('')

  const validarCorreo = (valor) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!valor) return 'El correo es obligatorio'
    if (!regex.test(valor)) return 'Formato de correo inválido'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validarCorreo(correo)
    if (err) { setError(err); return }

    setCargando(true)
    setError('')

    // ── Correos registrados para simulación frontend ──
    // 'demo@rentamovil.com' es el dato quemado principal (mismo del login)
    const correosRegistrados = [
      'demo@rentamovil.com',
      'usuario@correo.com',
      'admin@rentamovil.com',
      'prueba@test.com',
    ]

    setTimeout(() => {
      setCargando(false)
      if (!correosRegistrados.includes(correo.toLowerCase())) {
        setError('Este correo no está registrado en la plataforma.')
        return
      }
      setEnviado(true)
    }, 1500)
  }

  return { correo, setCorreo, cargando, enviado, error, handleSubmit }
}