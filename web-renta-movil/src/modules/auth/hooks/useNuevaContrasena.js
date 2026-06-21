import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authService } from '../../../services/authService'

const REGLAS_BASE = [
  { id: 'longitud',  key: 'nuevaContrasena.checklist.min8',     test: (v) => v.length >= 8 },
  { id: 'mayuscula', key: 'nuevaContrasena.checklist.uppercase', test: (v) => /[A-Z]/.test(v) },
  { id: 'numero',    key: 'nuevaContrasena.checklist.number',    test: (v) => /[0-9]/.test(v) },
  { id: 'especial',  key: 'nuevaContrasena.checklist.special',   test: (v) => /[^A-Za-z0-9]/.test(v) },
]

export function useNuevaContrasena() {
  const { t } = useTranslation()
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

  const fortaleza = REGLAS_BASE.map((r) => ({ ...r, label: t(r.key), cumple: r.test(contrasena) }))
  const esValida  = fortaleza.every((r) => r.cumple) && contrasena === confirmar && confirmar !== ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setTokenInvalido(true)
      return
    }
    if (!fortaleza.every(r => r.cumple)) {
      setError(t('nuevaContrasena.errors.passwordWeak'))
      return
    }
    if (contrasena !== confirmar) {
      setError(t('nuevaContrasena.errors.confirmMismatch'))
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
        setError(msg || t('nuevaContrasena.errors.genericError'))
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