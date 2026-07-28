import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { userService } from '../../../services/userService'

const REGLAS_BASE = [
  { id: 'len',     key: 'perfil.rules.min8',     test: (p) => p.length >= 8 },
  { id: 'upper',   key: 'perfil.rules.uppercase', test: (p) => /[A-Z]/.test(p) },
  { id: 'num',     key: 'perfil.rules.number',    test: (p) => /[0-9]/.test(p) },
  { id: 'special', key: 'perfil.rules.special',   test: (p) => /[^A-Za-z0-9]/.test(p) },
]

export function useCambiarContrasena() {
  const { t } = useTranslation()
  const [modoEdicion, setModoEdicion] = useState(false)
  const [form, setForm] = useState({ actual: '', nueva: '', confirmar: '' })
  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState(false)

  const actualizarCampo = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores(prev => { const n = { ...prev }; delete n[campo]; return n })
  }

  const reglasCumplidas = REGLAS_BASE.map(r => ({ ...r, label: t(r.key), ok: r.test(form.nueva) }))
  const fortaleza = reglasCumplidas.filter(r => r.ok).length

  const validar = () => {
    const e = {}
    if (!form.actual.trim()) e.actual = t('perfil.errors.currentPasswordRequired')
    if (fortaleza < 4)       e.nueva = t('perfil.errors.passwordWeak')
    if (!form.confirmar)     e.confirmar = t('perfil.errors.confirmRequired')
    else if (form.nueva !== form.confirmar) e.confirmar = t('perfil.errors.confirmMismatch')
    return e
  }

  const handleGuardar = async () => {
    const e = validar()
    if (Object.keys(e).length > 0) { setErrores(e); return }

    setCargando(true)
    setErrores({})
    try {
      await userService.cambiarContrasena(form.actual, form.nueva)
      setExito(true)
      setModoEdicion(false)
      setForm({ actual: '', nueva: '', confirmar: '' })
      setTimeout(() => setExito(false), 4000)
    } catch (err) {
      const msg = err?.response?.data?.mensaje || err?.message || t('perfil.errors.currentPasswordWrong')
      setErrores({ actual: msg })
    } finally {
      setCargando(false)
    }
  }

  const handleCancelar = () => {
    setForm({ actual: '', nueva: '', confirmar: '' })
    setErrores({})
    setModoEdicion(false)
  }

  return {
    form, errores, cargando, exito,
    modoEdicion, setModoEdicion,
    fortaleza, reglasCumplidas,
    actualizarCampo, handleGuardar, handleCancelar,
  }
}
