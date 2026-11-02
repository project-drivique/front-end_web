// src/modules/auth/pages/RegistroPage.jsx
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useRegistration } from '../hooks/useRegistration'
import { useSocialRegistration } from '../hooks/useSocialRegistration'
import { useAuthStore } from '../../../store/authStore'
import { useLanding } from '@/modules/landing/LandingContext'

import { useBrand } from '@/contexts/BrandContext'
import { showAlert } from '@/utils/swalConfig'
import { FaTimes } from 'react-icons/fa'

import { getRoleHome } from '../utils/accessControl'
import RegistrationPart from './RegistrationPage/RegistrationPart'
import AuthResponsiveLayout from './RegistrationPage/AuthResponsiveLayout'

const COLOR_MARCA = 'var(--brand-secondary)'

const coloresRegistro = (esModoOscuro) => ({
  pageBg: esModoOscuro ? '#0f172a' : '#f8fafc',
  panelCard: esModoOscuro ? '#0e172a' : '#ffffff',
  panelCardBorder: esModoOscuro ? '#1e293b' : '#dbe5f3',
  panelCardShadow: esModoOscuro ? '0 10px 40px rgba(0,0,0,0.35)' : '0 10px 30px rgba(var(--brand-secondary-rgb),0.06)',
  title: esModoOscuro ? '#ffffff' : 'var(--brand-secondary)',
  labelColor: esModoOscuro ? '#ffffff' : 'var(--brand-secondary)',
  text: esModoOscuro ? '#ffffff' : '#1e293b',
  textSoft: esModoOscuro ? '#94a3b8' : '#475569',
  textMuted: esModoOscuro ? '#94a3b8' : '#64748b',
  textFaint: esModoOscuro ? '#64748b' : '#94a3b8',

  inputBg: esModoOscuro ? '#172136' : '#ffffff',
  inputText: esModoOscuro ? '#ffffff' : '#1e293b',
  inputBorder: esModoOscuro ? '#23314d' : '#dbe5f3',
  inputBorderHover: esModoOscuro ? 'var(--brand-accent)' : '#cbd5e1',
  inputPlaceholder: esModoOscuro ? '#64748b' : '#94a3b8',

  inputErrorBg: esModoOscuro ? 'rgba(127,29,29,0.18)' : '#fef2f2',
  inputErrorBorder: esModoOscuro ? '#f87171' : '#f87171',

  accent: esModoOscuro ? 'var(--brand-text-dark)' : COLOR_MARCA,
  accentSoft: esModoOscuro ? 'rgba(var(--brand-secondary-rgb),0.24)' : 'var(--brand-soft-light)',
  accentBorder: esModoOscuro ? 'rgba(var(--brand-accent-rgb),0.26)' : 'var(--brand-border-light)',

  divider: esModoOscuro ? '#1e293b' : '#f1f5f9',

  successBg: esModoOscuro ? 'rgba(20,83,45,0.28)' : '#f0fdf4',
  successBorder: esModoOscuro ? '#166534' : '#86efac',
  successTitle: esModoOscuro ? '#86efac' : '#15803d',
  successText: esModoOscuro ? '#bbf7d0' : '#16a34a',

  errorBg: esModoOscuro ? 'rgba(127,29,29,0.22)' : '#fef2f2',
  errorBorder: esModoOscuro ? '#b91c1c' : '#fca5a5',
  errorTitle: esModoOscuro ? '#fca5a5' : '#b91c1c',
  errorText: esModoOscuro ? '#fecaca' : '#dc2626',

  errorInline: esModoOscuro ? '#fca5a5' : '#ef4444',

  checklistBg: esModoOscuro ? '#0f172a' : '#f8fafc',
  checklistBorder: esModoOscuro ? '#334155' : '#e2e8f0',
  checklistTrack: esModoOscuro ? '#334155' : '#e2e8f0',
  checklistNeutralDotBg: esModoOscuro ? '#1e293b' : '#f1f5f9',
  checklistNeutralDotColor: esModoOscuro ? '#64748b' : '#94a3b8',
  checklistOkDotBg: esModoOscuro ? 'rgba(34,197,94,0.2)' : '#dcfce7',
  checklistOkDotColor: esModoOscuro ? '#4ade80' : '#16a34a',
  checklistOkText: esModoOscuro ? '#bbf7d0' : '#15803d',
  checklistOffText: esModoOscuro ? '#94a3b8' : '#64748b',

  socialBtnBg: esModoOscuro ? '#111827' : '#ffffff',
  socialBtnBorder: esModoOscuro ? '#334155' : '#e2e8f0',
  socialBtnHoverBg: esModoOscuro ? '#1f2937' : '#f8fafc',
  socialBtnHoverBorder: esModoOscuro ? '#475569' : '#cbd5e1',
  socialBtnText: esModoOscuro ? '#e2e8f0' : '#1e293b',

  modalOverlay: 'rgba(0,0,0,0.55)',
  modalBg: esModoOscuro ? '#111827' : '#ffffff',
  modalBodyBg: esModoOscuro ? '#111827' : '#ffffff',
  modalFooterBg: esModoOscuro ? '#0f172a' : '#fafafa',
  modalDivider: esModoOscuro ? '#1e293b' : '#f1f5f9',
  modalClauseText: esModoOscuro ? '#cbd5e1' : '#475569',
  modalLegal: esModoOscuro ? '#94a3b8' : '#94a3b8',
  modalLegalStrong: esModoOscuro ? '#cbd5e1' : '#64748b',

  volver: esModoOscuro ? '#94a3b8' : '#64748b',
  volverHover: esModoOscuro ? 'var(--brand-text-dark)' : COLOR_MARCA,

  termsText: esModoOscuro ? '#cbd5e1' : '#475569',
  checkboxAccent: esModoOscuro ? 'var(--brand-text-dark)' : COLOR_MARCA,

  secondaryBtnBg: esModoOscuro ? '#111827' : '#ffffff',
  secondaryBtnBorder: esModoOscuro ? '#334155' : '#e2e8f0',
  secondaryBtnText: esModoOscuro ? '#cbd5e1' : '#64748b',

  leftPanelCardBg: 'rgba(255,255,255,0.08)',
  leftPanelCardBorder: 'rgba(255,255,255,0.08)',
})







function ModalTerminos({ onCerrar, onAceptar, c }) {
  const { t } = useTranslation()
  const [haLlegadoAlFinal, setHaLlegadoAlFinal] = useState(false)
  const clausulasObtenidas = t('registro.modal.clausulas', { returnObjects: true })
  const clausulas = Array.isArray(clausulasObtenidas) ? clausulasObtenidas : []

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
    if (scrollTop + clientHeight >= scrollHeight - 25) {
      setHaLlegadoAlFinal(true)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: c.modalOverlay, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: c.modalBg, borderRadius: '20px', width: '100%', maxWidth: '620px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.35)', overflow: 'hidden', border: `1px solid ${c.modalDivider}` }}>
        <div style={{ padding: '22px 28px', background: 'linear-gradient(135deg,var(--brand-secondary),var(--brand-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, margin: '0 0 3px' }}>{t('registro.modal.title')}</h2>
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '12px', margin: 0 }}>{t('registro.modal.subtitle')}</p>
          </div>
          <button onClick={onCerrar} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', borderRadius: '8px', padding: '6px 10px', fontSize: '18px', lineHeight: 1, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaTimes />
          </button>
        </div>

        <div onScroll={handleScroll} style={{ overflowY: 'auto', padding: '28px', flex: 1, background: c.modalBodyBg }}>
          {clausulas.map(({ num, titulo, texto }) => (
            <div key={num} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: `1px solid ${c.modalDivider}` }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: c.accent, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>{num}. {titulo}</p>
              <p style={{ fontSize: '13px', color: c.modalClauseText, lineHeight: 1.75, margin: 0 }}>{texto}</p>
            </div>
          ))}

          <p style={{ fontSize: '12px', color: c.modalLegal, lineHeight: 1.6, margin: 0 }}>
            {t('registro.modal.legalNote')}
          </p>

          <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: haLlegadoAlFinal ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
            border: `1px solid ${haLlegadoAlFinal ? '#22c55e' : '#f59e0b'}`,
            color: haLlegadoAlFinal ? '#16a34a' : '#d97706',
            fontSize: '12px',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            {haLlegadoAlFinal
              ? t('hc2.has_leido_la_totalidad_de_los_terminos', '✓ Has leído la totalidad de los términos y condiciones. Ya puedes aceptar.')
              : t('hc2.desplazate_hasta_el_final_para_habilit', '↓ Desplázate hasta el final para habilitar el botón de aceptar.')}
          </div>
        </div>

        <div style={{ padding: '16px 28px', borderTop: `1px solid ${c.modalDivider}`, display: 'flex', gap: '12px', justifyContent: 'flex-end', background: c.modalFooterBg, alignItems: 'center' }}>
          <button
            onClick={onCerrar}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: `1.5px solid ${c.secondaryBtnBorder}`,
              background: c.secondaryBtnBg,
              color: c.secondaryBtnText,
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            {t('registro.modal.close')}
          </button>

          <button
            onClick={haLlegadoAlFinal ? onAceptar : undefined}
            disabled={!haLlegadoAlFinal}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              background: haLlegadoAlFinal
                ? 'linear-gradient(90deg,var(--brand-secondary),var(--brand-primary))'
                : '#94a3b8',
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px',
              border: 'none',
              cursor: haLlegadoAlFinal ? 'pointer' : 'not-allowed',
              opacity: haLlegadoAlFinal ? 1 : 0.6,
              boxShadow: haLlegadoAlFinal ? '0 4px 12px rgba(var(--brand-secondary-rgb),0.25)' : 'none',
              transition: 'all 200ms ease'
            }}
          >
            {haLlegadoAlFinal ? t('registro.modal.accept') : t('hc2.desplazate_al_final_para_aceptar', 'Desplázate al final para aceptar')}
          </button>
        </div>
      </div>
    </div>
  )
}









export default function RegistroPage() {
  const { brand } = useBrand()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const exitoRef = useRef(null)
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'
  const c = coloresRegistro(esModoOscuro)

  const { registrar, cargando, exito, error } = useRegistration()
  const iniciarVerificacionCorreo = useAuthStore((s) => s.iniciarVerificacionCorreo)

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [terminos, setTerminos] = useState(false)
  const [terminosLeidos, setTerminosLeidos] = useState(false)
  const [verPass, setVerPass] = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [errores, setErrores] = useState({})

  const {
    cargandoGoogle, cargandoFacebook, errorSocial,
    proveedorExito, iniciarGoogle, iniciarFacebook,
  } = useSocialRegistration({
    onExito: (_, data) => {
      exitoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      showAlert({
        icon: 'success',
        title: t('registro.socialSuccessTitle'),
        text: t('registro.successText'),
      })
      const rol = data?.usuario?.rol
      setTimeout(() => navigate(getRoleHome(rol)), 2000)
    },
  })

  const exitoFinal = exito || !!proveedorExito

  useEffect(() => {
    if (errorSocial) {
      showAlert({
        icon: 'error',
        title: t('registro.socialError'),
        text: errorSocial,
      })
    }
  }, [errorSocial, t])

  const validar = () => {
    const e = {}
    const rxCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!correo.trim()) e.correo = t('registro.modal.errors.emailRequired')
    else if (!rxCorreo.test(correo)) e.correo = t('registro.modal.errors.emailInvalid')
    if (!password) e.password = t('registro.modal.errors.passwordRequired')
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{12,}$/.test(password)) e.password = t('registro.modal.errors.passwordWeak')
    if (!confirmar) e.confirmar = t('registro.modal.errors.confirmRequired')
    else if (password !== confirmar) e.confirmar = t('registro.modal.errors.confirmMismatch')
    if (!terminos) e.terminos = t('registro.modal.errors.termsRequired')
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validar()
    if (Object.keys(found).length > 0) {
      setErrores(found)
      const primerError = Object.values(found)[0]
      showAlert({
        icon: 'warning',
        title: t('registro.verifyData'),
        text: primerError,
      })
      return
    }
    setErrores({})

    const respuestaRegistro = await registrar({ correo, contrasena: password })
    if (!respuestaRegistro) {
      if (error) {
        showAlert({
          icon: 'error',
          title: t('registro.failTitle'),
          text: error,
        })
      }
      return
    }

    iniciarVerificacionCorreo(correo, { contrasena: password })

    const mensajeExito = respuestaRegistro?.message || t('registro.checkEmail')

    showAlert({
      icon: 'success',
      title: t('registro.successTitle'),
      text: mensajeExito,
      timer: 3500,
      showConfirmButton: true,
    })

    setTimeout(() => {
      navigate('/verificar-correo')
    }, 2200)
  }

  return (
    <>
      {modalAbierto && (
        <ModalTerminos
          c={c}
          onCerrar={() => setModalAbierto(false)}
          onAceptar={() => {
            setTerminosLeidos(true)
            setTerminos(true)
            setModalAbierto(false)
            setErrores(prev => ({ ...prev, terminos: '' }))
          }}
        />
      )}

      <AuthResponsiveLayout brand={brand} c={c} cargando={cargando} cargandoFacebook={cargandoFacebook} cargandoGoogle={cargandoGoogle} confirmar={confirmar} correo={correo} error={error} errorSocial={errorSocial} errores={errores} esModoOscuro={esModoOscuro} exitoFinal={exitoFinal} exitoRef={exitoRef} handleSubmit={handleSubmit} iniciarFacebook={iniciarFacebook} iniciarGoogle={iniciarGoogle} password={password} proveedorExito={proveedorExito} setConfirmar={setConfirmar} setCorreo={setCorreo} setErrores={setErrores} setModalAbierto={setModalAbierto} setPassword={setPassword} setTerminos={setTerminos} setVerConfirmar={setVerConfirmar} setVerPass={setVerPass} t={t} terminos={terminos} terminosLeidos={terminosLeidos} verConfirmar={verConfirmar} verPass={verPass} />

      <RegistrationPart c={c} />
    </>
  )
}
