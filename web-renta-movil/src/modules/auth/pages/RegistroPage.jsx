// src/modules/auth/pages/RegistroPage.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegistro } from '../hooks/useRegistro'
import { useRegistroSocial } from '../hooks/useRegistroSocial'
import { useLanding } from '@/modules/landing/LandingContext'
import logo from '@/assets/logo/logo.png'
import {
  FaTimes,
  FaCheck,
  FaCreditCard,
  FaFileAlt,
  FaHeadset,
  FaCheckCircle
} from 'react-icons/fa'

const COLOR_MARCA = '#1e3a8a'
const COLOR_MARCA_HOVER = '#162d6e'

const coloresRegistro = (esModoOscuro) => ({
  pageBg: esModoOscuro ? '#0f172a' : '#f8fafc',
  panelCard: esModoOscuro ? '#111827' : '#ffffff',
  panelCardBorder: esModoOscuro ? '#1e293b' : '#f1f5f9',
  panelCardShadow: esModoOscuro ? '0 10px 40px rgba(0,0,0,0.35)' : '0 4px 32px rgba(0,0,0,0.07)',
  title: esModoOscuro ? '#f8fafc' : '#0f172a',
  text: esModoOscuro ? '#e2e8f0' : '#1e293b',
  textSoft: esModoOscuro ? '#cbd5e1' : '#475569',
  textMuted: esModoOscuro ? '#94a3b8' : '#64748b',
  textFaint: esModoOscuro ? '#64748b' : '#94a3b8',

  inputBg: esModoOscuro ? '#0f172a' : '#f8fafc',
  inputText: esModoOscuro ? '#f8fafc' : '#1e293b',
  inputBorder: esModoOscuro ? '#334155' : '#e2e8f0',
  inputBorderHover: esModoOscuro ? '#475569' : '#cbd5e1',
  inputPlaceholder: esModoOscuro ? '#64748b' : '#94a3b8',

  inputErrorBg: esModoOscuro ? 'rgba(127,29,29,0.18)' : '#fef2f2',
  inputErrorBorder: esModoOscuro ? '#f87171' : '#f87171',

  accent: esModoOscuro ? '#93c5fd' : COLOR_MARCA,
  accentSoft: esModoOscuro ? 'rgba(30,58,138,0.24)' : '#eff6ff',
  accentBorder: esModoOscuro ? 'rgba(147,197,253,0.26)' : '#bfdbfe',

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
  checklistOkDotBg: esModoOscuro ? 'rgba(22,163,74,0.18)' : '#dcfce7',
  checklistOkDotColor: esModoOscuro ? '#86efac' : '#16a34a',
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
  volverHover: esModoOscuro ? '#93c5fd' : COLOR_MARCA,

  termsText: esModoOscuro ? '#cbd5e1' : '#475569',
  checkboxAccent: esModoOscuro ? '#93c5fd' : COLOR_MARCA,

  secondaryBtnBg: esModoOscuro ? '#111827' : '#ffffff',
  secondaryBtnBorder: esModoOscuro ? '#334155' : '#e2e8f0',
  secondaryBtnText: esModoOscuro ? '#cbd5e1' : '#64748b',

  leftPanelCardBg: 'rgba(255,255,255,0.08)',
  leftPanelCardBorder: 'rgba(255,255,255,0.08)',
})

const inputStyle = (hasError, c) => ({
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  border: `1.5px solid ${hasError ? c.inputErrorBorder : c.inputBorder}`,
  background: hasError ? c.inputErrorBg : c.inputBg,
  fontSize: '13px',
  color: c.inputText,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 150ms, background 150ms, color 150ms',
})

const labelStyle = (c) => ({ fontSize: '13px', fontWeight: 700, color: c.text })
const errorStyle = (c) => ({ color: c.errorInline, fontSize: '12px', margin: '4px 0 0' })
const fieldWrap = { display: 'flex', flexDirection: 'column', gap: '5px' }

function ModalTerminos({ onCerrar, onAceptar, c }) {
  const clausulas = [
    { num: '1', titulo: 'Objeto', texto: 'RentaMóvil presta el servicio de arrendamiento de vehículos a personas naturales mayores de 18 años con licencia de conducción vigente. La relación contractual se perfecciona mediante la aceptación electrónica de estos términos, conforme al artículo 14 de la Ley 527 de 1999 (comercio electrónico).' },
    { num: '2', titulo: 'Tratamiento de datos personales — Ley 1581 de 2012', texto: 'En cumplimiento de la Ley Estatutaria 1581 de 2012 y el Decreto Reglamentario 1377 de 2013, RentaMóvil, identificada con NIT 900.XXX.XXX-X, actúa como Responsable del Tratamiento de sus datos personales. Los datos recolectados (correo electrónico) se utilizarán exclusivamente para: (i) prestación del servicio de arrendamiento, (ii) envío de confirmaciones y notificaciones, (iii) cumplimiento de obligaciones legales. No se transferirán a terceros sin su autorización previa, salvo mandato judicial o legal. Puede ejercer sus derechos de acceso, corrección, supresión y revocación escribiendo a privacidad@rentamovil.com.' },
    { num: '3', titulo: 'Veracidad de la información y responsabilidad del usuario', texto: 'El usuario declara bajo juramento que la información suministrada es verídica y actual. El suministro de datos falsos constituye una conducta punible conforme al artículo 286 del Código Penal colombiano (falsedad en documento privado, pena de 1 a 6 años de prisión). RentaMóvil queda exonerada de toda responsabilidad civil y penal derivada de información falsa o suplantación de identidad, al tenor del artículo 1604 del Código Civil.' },
    { num: '4', titulo: 'Seguridad de la cuenta', texto: 'El usuario es el único responsable de la custodia de sus credenciales de acceso (correo y contraseña). Cualquier actividad realizada con dichas credenciales se presumirá efectuada por el titular de la cuenta. En caso de compromiso de seguridad, el usuario deberá notificarlo de inmediato a soporte@rentamovil.com.' },
    { num: '5', titulo: 'Validez de la aceptación electrónica', texto: 'La marcación del casillero "Acepto los términos y condiciones" constituye una firma electrónica válida con plena eficacia jurídica, de conformidad con los artículos 7 y 14 de la Ley 527 de 1999. Esta aceptación queda registrada con fecha, hora y dirección IP para efectos probatorios.' },
    { num: '6', titulo: 'Modificaciones', texto: 'RentaMóvil podrá modificar estos términos notificando al correo registrado con al menos 15 días de antelación. El uso continuado de la plataforma tras dicho plazo implica la aceptación de los cambios.' },
    { num: '7', titulo: 'Ley aplicable y jurisdicción', texto: 'El presente acuerdo se rige por las leyes de la República de Colombia. Cualquier controversia será resuelta ante los jueces competentes de la ciudad de Bogotá D.C., con renuncia expresa a cualquier otro fuero.' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: c.modalOverlay, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: c.modalBg, borderRadius: '20px', width: '100%', maxWidth: '620px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.35)', overflow: 'hidden', border: `1px solid ${c.modalDivider}` }}>
        <div style={{ padding: '22px 28px', background: 'linear-gradient(135deg,#0f1a3d,#1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, margin: '0 0 3px' }}>Términos y Condiciones — RentaMóvil</h2>
            <p style={{ color: 'rgba(191,219,254,0.82)', fontSize: '12px', margin: 0 }}>Lea detenidamente antes de aceptar · Ley 1581/2012 · Ley 527/1999</p>
          </div>
          <button onClick={onCerrar} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', borderRadius: '8px', padding: '6px 10px', fontSize: '18px', lineHeight: 1, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaTimes />
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '28px', flex: 1, background: c.modalBodyBg }}>
          {clausulas.map(({ num, titulo, texto }) => (
            <div key={num} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: `1px solid ${c.modalDivider}` }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: c.accent, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>{num}. {titulo}</p>
              <p style={{ fontSize: '13px', color: c.modalClauseText, lineHeight: 1.75, margin: 0 }}>{texto}</p>
            </div>
          ))}

          <p style={{ fontSize: '12px', color: c.modalLegal, lineHeight: 1.6, margin: 0 }}>
            Al aceptar, declara haber leído y comprendido estos términos en su totalidad. Esta aceptación tiene plena validez legal conforme a la <strong style={{ color: c.modalLegalStrong }}>Ley 527 de 1999</strong> y la <strong style={{ color: c.modalLegalStrong }}>Ley 1581 de 2012</strong>.
          </p>
        </div>

        <div style={{ padding: '16px 28px', borderTop: `1px solid ${c.modalDivider}`, display: 'flex', gap: '12px', justifyContent: 'flex-end', background: c.modalFooterBg }}>
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
            Cerrar
          </button>

          <button
            onClick={onAceptar}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              background: 'linear-gradient(90deg,#1e3a8a,#2563eb)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(30,58,138,0.25)'
            }}
          >
            Acepto los términos
          </button>
        </div>
      </div>
    </div>
  )
}

function ChecklistPassword({ password, c }) {
  if (!password) return null

  const reglas = [
    { id: 'len', label: 'Mínimo 8 caracteres', ok: password.length >= 8 },
    { id: 'may', label: 'Al menos una mayúscula (A-Z)', ok: /[A-Z]/.test(password) },
    { id: 'min', label: 'Al menos una minúscula (a-z)', ok: /[a-z]/.test(password) },
    { id: 'num', label: 'Al menos un número (0-9)', ok: /\d/.test(password) },
    { id: 'esp', label: 'Al menos un símbolo (!@#…)', ok: /[^a-zA-Z\d]/.test(password) },
  ]

  const cumplidas = reglas.filter(r => r.ok).length
  const colores = ['#e2e8f0', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']
  const coloresDark = ['#334155', '#f87171', '#fb923c', '#facc15', '#a3e635', '#4ade80']
  const textos = ['', 'Muy débil', 'Débil', 'Regular', 'Buena', 'Segura']
  const color = c.pageBg === '#0f172a' ? coloresDark[cumplidas] : colores[cumplidas]

  return (
    <div style={{ marginTop: '6px', background: c.checklistBg, border: `1px solid ${c.checklistBorder}`, borderRadius: '10px', padding: '12px 14px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ height: '4px', flex: 1, borderRadius: '9999px', background: i <= cumplidas ? color : c.checklistTrack, transition: 'all 300ms' }} />
        ))}
      </div>

      {cumplidas > 0 && <p style={{ fontSize: '11px', fontWeight: 700, color, margin: '0 0 8px' }}>{textos[cumplidas]}</p>}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {reglas.map(r => (
          <li key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px' }}>
            <span style={{
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: r.ok ? c.checklistOkDotBg : c.checklistNeutralDotBg,
              fontSize: '9px',
              fontWeight: 700,
              color: r.ok ? c.checklistOkDotColor : c.checklistNeutralDotColor
            }}>
              {r.ok ? <FaCheck /> : '·'}
            </span>
            <span style={{ color: r.ok ? c.checklistOkText : c.checklistOffText, fontWeight: r.ok ? 600 : 400 }}>{r.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PassInput({ id, value, onChange, ver, setVer, hasError, placeholder, c }) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        type={ver ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder || ''}
        style={{ ...inputStyle(hasError, c), paddingRight: '44px' }}
      />
      <button
        type="button"
        onClick={() => setVer(v => !v)}
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: c.textFaint,
          padding: 0,
          display: 'flex'
        }}
      >
        {ver
          ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
          : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        }
      </button>
    </div>
  )
}

function SpinnerBtn({ c }) {
  return <span style={{ width: '16px', height: '16px', border: `2px solid ${c.inputBorder}`, borderTopColor: c.textMuted, borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
}

function BotonesSocial({ onGoogle, onFacebook, cargandoGoogle, cargandoFacebook, deshabilitado, c }) {
  const bloqueado = deshabilitado || cargandoGoogle || cargandoFacebook
  const baseBtn = {
    flex: 1,
    padding: '11px 8px',
    borderRadius: '12px',
    border: `1.5px solid ${c.socialBtnBorder}`,
    background: c.socialBtnBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 150ms',
    color: c.socialBtnText,
  }

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button
        type="button"
        onClick={onGoogle}
        disabled={bloqueado}
        style={{ ...baseBtn, opacity: bloqueado ? 0.6 : 1 }}
        onMouseEnter={e => { if (!bloqueado) { e.currentTarget.style.borderColor = c.socialBtnHoverBorder; e.currentTarget.style.background = c.socialBtnHoverBg } }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = c.socialBtnBorder; e.currentTarget.style.background = c.socialBtnBg }}
      >
        {cargandoGoogle ? <SpinnerBtn c={c} /> : (
          <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
            <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.09-6.09C34.46 3.09 29.53 1 24 1 14.82 1 7.07 6.48 3.64 14.18l7.09 5.51C12.4 13.67 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.15 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h12.44c-.54 2.9-2.18 5.36-4.64 7.01l7.19 5.59C43.16 37.13 46.15 31.29 46.15 24.5z"/>
            <path fill="#FBBC05" d="M10.73 28.31A14.6 14.6 0 019.5 24c0-1.49.26-2.93.73-4.31L3.14 14.18A22.94 22.94 0 001 24c0 3.57.85 6.95 2.36 9.95l7.37-5.64z"/>
            <path fill="#34A853" d="M24 47c5.53 0 10.17-1.83 13.56-4.97l-7.19-5.59c-1.84 1.24-4.2 1.97-6.37 1.97-6.26 0-11.6-4.17-13.27-9.78l-7.37 5.64C7.07 41.52 14.82 47 24 47z"/>
          </svg>
        )}
        {cargandoGoogle ? 'Conectando…' : 'Google'}
      </button>

      <button
        type="button"
        onClick={onFacebook}
        disabled={bloqueado}
        style={{ ...baseBtn, opacity: bloqueado ? 0.6 : 1 }}
        onMouseEnter={e => { if (!bloqueado) { e.currentTarget.style.borderColor = c.socialBtnHoverBorder; e.currentTarget.style.background = c.socialBtnHoverBg } }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = c.socialBtnBorder; e.currentTarget.style.background = c.socialBtnBg }}
      >
        {cargandoFacebook ? <SpinnerBtn c={c} /> : (
          <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
            <path fill="#1877F2" d="M48 24C48 10.745 37.255 0 24 0S0 10.745 0 24c0 11.979 8.776 21.908 20.25 23.708V30.938h-6.094V24h6.094v-5.288c0-6.014 3.583-9.337 9.065-9.337 2.625 0 5.372.469 5.372.469v5.906h-3.026c-2.981 0-3.911 1.85-3.911 3.75V24h6.656l-1.064 6.938H27.75v16.77C39.224 45.908 48 35.979 48 24z"/>
            <path fill="#fff" d="M33.342 30.938 34.406 24H27.75v-4.5c0-1.899.93-3.75 3.911-3.75h3.026V9.844s-2.747-.469-5.372-.469c-5.482 0-9.065 3.323-9.065 9.337V24h-6.094v6.938h6.094v16.77a24.18 24.18 0 007.5 0V30.938h5.592z"/>
          </svg>
        )}
        {cargandoFacebook ? 'Conectando…' : 'Facebook'}
      </button>
    </div>
  )
}

export default function RegistroPage() {
  const navigate = useNavigate()
  const exitoRef = useRef(null)
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'
  const c = coloresRegistro(esModoOscuro)

  const { registrar, cargando, exito, error } = useRegistro()

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [terminos, setTerminos] = useState(false)
  const [verPass, setVerPass] = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [errores, setErrores] = useState({})

  const {
    cargandoGoogle, cargandoFacebook, errorSocial,
    proveedorExito, iniciarGoogle, iniciarFacebook,
  } = useRegistroSocial({
    onExito: () => {
      exitoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => navigate('/home'), 2000)
    },
  })

  const exitoFinal = exito || !!proveedorExito

  useEffect(() => {
    if (exito) {
      exitoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const t = setTimeout(() => navigate('/login'), 3000)
      return () => clearTimeout(t)
    }
  }, [exito, navigate])

  const validar = () => {
    const e = {}
    const rxCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!correo.trim()) e.correo = 'El correo electrónico es obligatorio'
    else if (!rxCorreo.test(correo)) e.correo = 'Formato de correo inválido'
    if (!password) e.password = 'La contraseña es obligatoria'
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/.test(password)) e.password = 'La contraseña no cumple los requisitos de seguridad'
    if (!confirmar) e.confirmar = 'Confirme su contraseña'
    else if (password !== confirmar) e.confirmar = 'Las contraseñas no coinciden'
    if (!terminos) e.terminos = 'Debe aceptar los términos y condiciones para continuar'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validar()
    if (Object.keys(found).length > 0) {
      setErrores(found)
      return
    }
    setErrores({})
    await registrar({ correo, contrasena: password })
  }

  return (
    <>
      {modalAbierto && (
        <ModalTerminos
          c={c}
          onCerrar={() => setModalAbierto(false)}
          onAceptar={() => {
            setTerminos(true)
            setModalAbierto(false)
            setErrores(prev => ({ ...prev, terminos: '' }))
          }}
        />
      )}

      <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', background: c.pageBg }}>
        <div className="lg-left" style={{ display: 'none', width: '42%', flexDirection: 'column', background: 'linear-gradient(160deg,#060e2e 0%,#0c1f5c 50%,#1e3a8a 100%)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <style>{`@media(min-width:1024px){.lg-left{display:flex !important}}`}</style>
          <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }} />
          <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '340px', height: '340px', borderRadius: '50%', background: 'rgba(99,102,241,0.08)' }} />

          <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 36px', textAlign: 'center', gap: '24px' }}>
            <img src={logo} alt="RentaMóvil" style={{ height: '52px', filter: 'brightness(0) invert(1)' }} />
            <div>
              <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 900, margin: '0 0 8px' }}>Únete a RentaMóvil</h2>
              <p style={{ color: 'rgba(191,219,254,0.7)', fontSize: '13px', lineHeight: 1.6, maxWidth: '240px', margin: '0 auto' }}>
                Crea tu cuenta en minutos y empieza a reservar el vehículo que necesitas.
              </p>
            </div>

            <span></span>

            <div style={{ width: '80%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { icon: FaCheckCircle, text: 'Registro rápido y seguro' },
                { icon: FaCreditCard, text: 'PSE, Nequi y tarjetas' },
                { icon: FaFileAlt, text: 'Contratos digitales al instante' },
                { icon: FaHeadset, text: 'Soporte 24/7' },
              ].map(({ icon: Icono, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: c.leftPanelCardBg, borderRadius: '10px', padding: '10px 14px', border: `1px solid ${c.leftPanelCardBorder}` }}>
                  <span style={{ fontSize: '16px', flexShrink: 0, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icono />
                  </span>
                  <p style={{ color: '#fff', fontSize: '13px', fontWeight: 600, margin: 0, textAlign: 'left' }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 1, padding: '12px 36px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
            <p style={{ color: 'rgba(147,197,253,0.35)', fontSize: '11px', margin: 0 }}>RentaMóvil © 2026</p>
          </div>
        </div>

        <div style={{ flex: 1, background: c.pageBg, overflowY: 'auto', height: '100%' }}>
          <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
            <div className="logo-mob" style={{ marginBottom: '20px' }}>
              <style>{`@media(min-width:1024px){.logo-mob{display:none}}`}</style>
              <img src={logo} alt="RentaMóvil" style={{ height: '44px', display: 'block', margin: '0 auto' }} />
            </div>

            <div style={{ width: '100%', maxWidth: '460px', marginBottom: '10px' }}>
              <button
                type="button"
                onClick={() => navigate('/')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', color: c.volver, fontSize: '13px', fontWeight: 500, padding: 0 }}
                onMouseEnter={e => { e.currentTarget.style.color = c.volverHover }}
                onMouseLeave={e => { e.currentTarget.style.color = c.volver }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Volver al inicio
              </button>
            </div>

            <div style={{ width: '100%', maxWidth: '460px', background: c.panelCard, borderRadius: '24px', boxShadow: c.panelCardShadow, border: `1px solid ${c.panelCardBorder}`, padding: '36px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: c.title, margin: '0 0 6px' }}>Crear cuenta</h1>
                <p style={{ fontSize: '13px', color: c.textMuted, margin: 0 }}>Complete los campos para registrarse</p>
              </div>

              {exitoFinal && (
                <div ref={exitoRef} style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '12px', background: c.successBg, border: `1px solid ${c.successBorder}`, display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <svg style={{ width: '20px', height: '20px', color: c.successText, flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p style={{ color: c.successTitle, fontSize: '14px', fontWeight: 700, margin: '0 0 2px' }}>¡Registro exitoso!</p>
                    <p style={{ color: c.successText, fontSize: '13px', margin: 0 }}>
                      {proveedorExito
                        ? `Cuenta vinculada con ${proveedorExito === 'google' ? 'Google' : 'Facebook'} correctamente. Será redirigido en unos segundos.`
                        : 'Su cuenta fue creada correctamente. Será redirigido al inicio de sesión en unos segundos.'
                      }
                    </p>
                  </div>
                </div>
              )}

              {(error || errorSocial) && !exitoFinal && (
                <div style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '12px', background: c.errorBg, border: `1px solid ${c.errorBorder}`, display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <svg style={{ width: '20px', height: '20px', color: c.errorText, flexShrink: 0, marginTop: '1px' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p style={{ color: c.errorTitle, fontSize: '14px', fontWeight: 700, margin: '0 0 2px' }}>Registro fallido</p>
                    <p style={{ color: c.errorText, fontSize: '13px', margin: 0 }}>{error || errorSocial}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={fieldWrap}>
                  <label htmlFor="correo" style={labelStyle(c)}>Correo electrónico <span style={{ color: c.accent }}>*</span></label>
                  <input
                    id="correo"
                    type="email"
                    value={correo}
                    onChange={e => { setCorreo(e.target.value); setErrores(p => ({ ...p, correo: '' })) }}
                    placeholder="ejemplo@correo.com"
                    style={inputStyle(!!errores.correo, c)}
                  />
                  {errores.correo && <p style={errorStyle(c)}>{errores.correo}</p>}
                </div>

                <div style={fieldWrap}>
                  <label htmlFor="password" style={labelStyle(c)}>Contraseña <span style={{ color: c.accent }}>*</span></label>
                  <PassInput
                    id="password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrores(p => ({ ...p, password: '' })) }}
                    ver={verPass}
                    setVer={setVerPass}
                    hasError={!!errores.password}
                    placeholder="Mínimo 8 caracteres"
                    c={c}
                  />
                  {errores.password && <p style={errorStyle(c)}>{errores.password}</p>}
                  <ChecklistPassword password={password} c={c} />
                </div>

                <div style={fieldWrap}>
                  <label htmlFor="confirmar" style={labelStyle(c)}>Confirmar contraseña <span style={{ color: c.accent }}>*</span></label>
                  <PassInput
                    id="confirmar"
                    value={confirmar}
                    onChange={e => { setConfirmar(e.target.value); setErrores(p => ({ ...p, confirmar: '' })) }}
                    ver={verConfirmar}
                    setVer={setVerConfirmar}
                    hasError={!!errores.confirmar}
                    placeholder="Repita su contraseña"
                    c={c}
                  />
                  {errores.confirmar && <p style={errorStyle(c)}>{errores.confirmar}</p>}
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="terminos"
                    checked={terminos}
                    onChange={e => { setTerminos(e.target.checked); setErrores(p => ({ ...p, terminos: '' })) }}
                    style={{ width: '15px', height: '15px', marginTop: '3px', cursor: 'pointer', accentColor: c.checkboxAccent, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1 }}>
                    <label htmlFor="terminos" style={{ fontSize: '13px', color: c.termsText, lineHeight: 1.6, cursor: 'pointer', display: 'block' }}>
                      Acepto los{' '}
                      <span
                        onClick={e => { e.preventDefault(); setModalAbierto(true) }}
                        style={{ color: c.accent, fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        términos y condiciones
                      </span>
                      {' '}y el tratamiento de mis datos personales según la{' '}
                      <span style={{ fontWeight: 600 }}>Ley 1581 de 2012</span>.
                    </label>
                    {errores.terminos && <p style={errorStyle(c)}>{errores.terminos}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cargando || exitoFinal}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    background: exitoFinal ? 'linear-gradient(90deg,#15803d,#16a34a)' : 'linear-gradient(90deg,#1e3a8a,#2563eb)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '14px',
                    border: 'none',
                    cursor: (cargando || exitoFinal) ? 'not-allowed' : 'pointer',
                    opacity: (cargando || exitoFinal) ? 0.8 : 1,
                    boxShadow: '0 4px 16px rgba(30,58,138,0.25)',
                    transition: 'all 300ms',
                  }}
                >
                  {cargando
                    ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                        Procesando…
                      </span>
                    : exitoFinal ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <FaCheck />
                        Registro completado
                      </span>
                    ) : 'Crear mi cuenta'
                  }
                </button>

                <BotonesSocial
                  onGoogle={iniciarGoogle}
                  onFacebook={iniciarFacebook}
                  cargandoGoogle={cargandoGoogle}
                  cargandoFacebook={cargandoFacebook}
                  deshabilitado={exitoFinal}
                  c={c}
                />

                <div style={{ borderTop: `1px solid ${c.divider}`, paddingTop: '14px' }}>
                  <p style={{ textAlign: 'center', fontSize: '13px', color: c.textMuted, margin: 0 }}>
                    ¿Ya tiene una cuenta?{' '}
                    <Link to="/login" style={{ color: c.accent, fontWeight: 700, textDecoration: 'none' }}>Inicie sesión aquí</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: ${c.inputPlaceholder}; opacity: 1; }
      `}</style>
    </>
  )
}