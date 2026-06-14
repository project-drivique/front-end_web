import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../../../services/authService'

const REGLAS = [
  { id: 'longitud',  label: 'Mínimo 8 caracteres',          test: (v) => v.length >= 8 },
  { id: 'mayuscula', label: 'Al menos una mayúscula',        test: (v) => /[A-Z]/.test(v) },
  { id: 'numero',    label: 'Al menos un número',            test: (v) => /[0-9]/.test(v) },
  { id: 'especial',  label: 'Al menos un carácter especial', test: (v) => /[^A-Za-z0-9]/.test(v) },
]

export function useNuevaContrasena() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [contrasena,   setContrasena]   = useState('')
  const [confirmar,    setConfirmar]    = useState('')
  const [mostrarPass,  setMostrarPass]  = useState(false)
  const [mostrarConf,  setMostrarConf]  = useState(false)
  const [cargando,     setCargando]     = useState(false)
  const [exito,        setExito]        = useState(false)
  const [error,        setError]        = useState('')
  const [tokenInvalido, setTokenInvalido] = useState(!token)

  const fortaleza = REGLAS.map((r) => ({ ...r, cumple: r.test(contrasena) }))
  const esValida  = fortaleza.every((r) => r.cumple) && contrasena === confirmar && confirmar !== ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setTokenInvalido(true)
      return
    }
    if (!fortaleza.every(r => r.cumple)) {
      setError('La contraseña no cumple los requisitos de seguridad.')
      return
    }
    if (contrasena !== confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setCargando(true)

    try {
      await authService.resetearContrasena(token, contrasena)
      setExito(true)
    } catch (err) {
      const msg = err?.response?.data?.mensaje || ''
      if (msg.toLowerCase().includes('expir') || msg.toLowerCase().includes('inválido')) {
        setTokenInvalido(true)
      } else {
        setError(msg || 'Ocurrió un error. Intenta de nuevo.')
      }
    } finally {
      setCargando(false)
    }
  }

  return {
    contrasena, setContrasena,
    confirmar,  setConfirmar,
    mostrarPass, setMostrarPass,
    mostrarConf, setMostrarConf,
    cargando, exito, error,
    tokenInvalido,
    fortaleza, esValida,
    navigate,
    handleSubmit,
  }
}