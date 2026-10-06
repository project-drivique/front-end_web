import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authService } from '../../../services/authService'
import { useAuthStore } from '../../../store/authStore'

const REGLAS_BASE = [
  { id: 'longitud', key: 'registro.checklist.min12', test: (v) => v.length >= 12 },
  { id: 'mayuscula', key: 'registro.checklist.uppercase', test: (v) => /[A-Z]/.test(v) },
  { id: 'minuscula', key: 'registro.checklist.lowercase', test: (v) => /[a-z]/.test(v) },
  { id: 'numero', key: 'registro.checklist.number', test: (v) => /[0-9]/.test(v) },
  { id: 'especial', key: 'registro.checklist.symbol', test: (v) => /[^A-Za-z0-9\s]/.test(v) },
]

export function useNewPassword() {
  const { t } = useTranslation(); const navigate = useNavigate()
  const recuperacion = useAuthStore((s) => s.recuperacionCorreo); const correo = recuperacion?.correo; const codigo = recuperacion?.codigo
  const [contrasena, setContrasena] = useState(''); const [confirmar, setConfirmar] = useState(''); const [mostrarPass, setMostrarPass] = useState(false); const [mostrarConf, setMostrarConf] = useState(false); const [cargando, setCargando] = useState(false); const [exito, setExito] = useState(false); const [error, setError] = useState(''); const [tokenInvalido, setTokenInvalido] = useState(!correo || !codigo)
  const fortaleza = REGLAS_BASE.map((r) => ({ ...r, label: t(r.key), cumple: r.test(contrasena) })); const esValida = fortaleza.every((r) => r.cumple) && contrasena === confirmar && confirmar !== ''
  const handleSubmit = async (e) => { e.preventDefault(); setError(''); if (!correo || !codigo) { setTokenInvalido(true); return }; if (!fortaleza.every((r) => r.cumple)) { setError(t('registro.modal.errors.passwordWeak')); return }; if (contrasena !== confirmar) { setError(t('registro.modal.errors.confirmMismatch')); return }; setCargando(true); try { await authService.resetearContrasena(correo, codigo, contrasena); setExito(true) } catch (err) { const data = err?.response?.data || {}; const msg = data.mensaje || data.message || data.detail || data.errors?.[0]?.message || ''; if (msg.toLowerCase().includes('expir') || msg.toLowerCase().includes('inválido')) setTokenInvalido(true); else setError(msg || t('recuperar.genericError', 'No se pudo actualizar la contraseña. Intenta nuevamente.')) } finally { setCargando(false) } }
  return { contrasena, setContrasena, confirmar, setConfirmar, mostrarPass, setMostrarPass, mostrarConf, setMostrarConf, cargando, exito, error, tokenInvalido, fortaleza, esValida, navigate, handleSubmit }
}
