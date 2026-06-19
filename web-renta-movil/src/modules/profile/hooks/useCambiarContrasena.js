import { useState } from 'react'
import { userService } from '../../../services/userService'

export const REGLAS = [
  { id: 'len',     label: 'Mínimo 8 caracteres',   test: (p) => p.length >= 8 },
  { id: 'upper',   label: 'Una letra mayúscula',    test: (p) => /[A-Z]/.test(p) },
  { id: 'num',     label: 'Un número',              test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'Un carácter especial',   test: (p) => /[^A-Za-z0-9]/.test(p) },
]

export function useCambiarContrasena() {
  const [modoEdicion, setModoEdicion] = useState(false)
  const [form, setForm] = useState({ actual: '', nueva: '', confirmar: '' })
  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState(false)

  const actualizarCampo = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores(prev => { const n = { ...prev }; delete n[campo]; return n })
  }

  const reglasCumplidas = REGLAS.map(r => ({ ...r, ok: r.test(form.nueva) }))
  const fortaleza = reglasCumplidas.filter(r => r.ok).length

  const validar = () => {
    const e = {}
    if (!form.actual.trim()) e.actual = 'Ingresa tu contraseña actual'
    if (fortaleza < 4)       e.nueva = 'La contraseña no cumple todos los requisitos'
    if (!form.confirmar)     e.confirmar = 'Confirma tu nueva contraseña'
    else if (form.nueva !== form.confirmar) e.confirmar = 'Las contraseñas no coinciden'
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
      const msg = err?.response?.data?.mensaje || err?.message || 'Contraseña actual incorrecta'
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
