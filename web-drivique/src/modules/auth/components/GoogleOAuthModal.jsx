// src/modules/auth/components/GoogleOAuthModal.jsx
import React, { useState } from 'react'

const CUENTAS_DEFAULT = [
  {
    id: '1',
    name: 'Emily Sharith Amezquita Saavedra',
    firstName: 'Emily Sharith',
    lastName: 'Amezquita Saavedra',
    email: 'sharithamezquita81@gmail.com',
    avatarBg: '#d97706',
    initial: 'E',
    active: true,
  },
  {
    id: '2',
    name: 'Norma Constanza Saavedra',
    firstName: 'Norma Constanza',
    lastName: 'Saavedra',
    email: 'saavedranrma@gmail.com',
    avatarBg: '#15803d',
    initial: 'N',
    status: 'Saliste de la cuenta',
    active: false,
  },
  {
    id: '3',
    name: 'sharith',
    firstName: 'Sharith',
    lastName: '',
    email: 'mimisaavedra09@gmail.com',
    avatarBg: '#4ade80',
    initial: 's',
    active: true,
  },
  {
    id: '4',
    name: 'emily',
    firstName: 'Emily',
    lastName: '',
    email: 'larrysharith1830@gmail.com',
    avatarBg: '#64748b',
    initial: 'e',
    active: true,
  },
  {
    id: '5',
    name: 'Martha Saavedra',
    firstName: 'Martha',
    lastName: 'Saavedra',
    email: 'marthasaavedra592@gmail.com',
    avatarBg: '#7c3aed',
    initial: 'M',
    status: 'Saliste de la cuenta',
    active: false,
  },
  {
    id: '6',
    name: 'Marlon Urrea',
    firstName: 'Marlon',
    lastName: 'Urrea',
    email: 'hola34893@gmail.com',
    avatarBg: '#1e293b',
    initial: 'M',
    active: true,
  },
  {
    id: '7',
    name: 'Luciana Sanabria',
    firstName: 'Luciana',
    lastName: 'Sanabria',
    email: 'sanabrialuciana505@gmail.com',
    avatarBg: '#94a3b8',
    initial: 'L',
    status: 'Saliste de la cuenta',
    active: false,
  },
]

export default function GoogleOAuthModal({ visible, onConfirm, onClose }) {
  const [paso, setPaso] = useState('seleccionar') // 'seleccionar' | 'consentimiento' | 'otra_cuenta'
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(CUENTAS_DEFAULT[0])
  const [otraNombre, setOtraNombre] = useState('')
  const [otraApellido, setOtraApellido] = useState('')
  const [otraCorreo, setOtraCorreo] = useState('')
  const [errorOtra, setErrorOtra] = useState('')

  if (!visible) return null

  const handleElegirCuenta = (cuenta) => {
    setCuentaSeleccionada(cuenta)
    setPaso('consentimiento')
  }

  const handleConfirmarFinal = () => {
    onConfirm({
      email: cuentaSeleccionada.email,
      firstName: cuentaSeleccionada.firstName || cuentaSeleccionada.name.split(' ')[0],
      lastName: cuentaSeleccionada.lastName || cuentaSeleccionada.name.split(' ').slice(1).join(' ') || 'Google',
      provider: 'GOOGLE',
    })
    setPaso('seleccionar')
  }

  const handleCrearOtraCuenta = (e) => {
    e.preventDefault()
    if (!otraCorreo || !otraCorreo.includes('@')) {
      setErrorOtra('Ingresa un correo electrónico de Google válido')
      return
    }
    if (!otraNombre.trim()) {
      setErrorOtra('Ingresa tu nombre completo')
      return
    }

    const nuevaCuenta = {
      id: `custom_${Date.now()}`,
      name: `${otraNombre.trim()} ${otraApellido.trim()}`.trim(),
      firstName: otraNombre.trim(),
      lastName: otraApellido.trim(),
      email: otraCorreo.trim().toLowerCase(),
      avatarBg: '#2563eb',
      initial: otraNombre.trim().charAt(0).toUpperCase(),
      active: true,
    }

    setCuentaSeleccionada(nuevaCuenta)
    setPaso('consentimiento')
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
        overflowY: 'auto',
      }}
    >
      {/* Barra superior de Google */}
      <div
        style={{
          width: '100%',
          maxWidth: '1040px',
          margin: '0 auto',
          padding: '24px 32px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.09-6.09C34.46 3.09 29.53 1 24 1 14.82 1 7.07 6.48 3.64 14.18l7.09 5.51C12.4 13.67 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.15 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h12.44c-.54 2.9-2.18 5.36-4.64 7.01l7.19 5.59C43.16 37.13 46.15 31.29 46.15 24.5z"/>
          <path fill="#FBBC05" d="M10.73 28.31A14.6 14.6 0 019.5 24c0-1.49.26-2.93.73-4.31L3.14 14.18A22.94 22.94 0 001 24c0 3.57.85 6.95 2.36 9.95l7.37-5.64z"/>
          <path fill="#34A853" d="M24 47c5.53 0 10.17-1.83 13.56-4.97l-7.19-5.59c-1.84 1.24-4.2 1.97-6.37 1.97-6.26 0-11.6-4.17-13.27-9.78l-7.37 5.64C7.07 41.52 14.82 47 24 47z"/>
        </svg>
        <span style={{ fontSize: '14px', color: '#1f1f1f', fontWeight: 500 }}>
          Acceder con Google
        </span>
      </div>

      {/* Contenedor Principal (Tarjeta estilo Google) */}
      <div
        style={{
          width: '100%',
          maxWidth: '1040px',
          margin: '20px auto',
          padding: '24px 32px',
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 1fr) minmax(360px, 1.4fr)',
          gap: '48px',
          alignItems: 'start',
          minHeight: '440px',
        }}
      >
        {/* COLUMNA IZQUIERDA */}
        <div>
          {paso === 'seleccionar' && (
            <>
              <h1
                style={{
                  fontSize: '36px',
                  fontWeight: 400,
                  color: '#1f1f1f',
                  margin: '0 0 12px',
                  letterSpacing: '-0.5px',
                  lineHeight: 1.2,
                }}
              >
                Elige una cuenta
              </h1>
              <p style={{ fontSize: '16px', color: '#1f1f1f', margin: 0 }}>
                Ir a <span style={{ color: '#1a73e8', fontWeight: 500 }}>drivique.com</span>
              </p>
            </>
          )}

          {paso === 'consentimiento' && (
            <>
              <h1
                style={{
                  fontSize: '36px',
                  fontWeight: 400,
                  color: '#1f1f1f',
                  margin: '0 0 24px',
                  letterSpacing: '-0.5px',
                  lineHeight: 1.2,
                }}
              >
                Accede a drivique.com
              </h1>

              {/* Selector de cuenta elegida */}
              <div
                onClick={() => setPaso('seleccionar')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 14px 6px 6px',
                  borderRadius: '24px',
                  border: '1px solid #747775',
                  cursor: 'pointer',
                  backgroundColor: '#ffffff',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: cuentaSeleccionada.avatarBg || '#2563eb',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {cuentaSeleccionada.initial || cuentaSeleccionada.name.charAt(0)}
                </div>
                <span style={{ fontSize: '13.5px', color: '#1f1f1f', fontWeight: 500 }}>
                  {cuentaSeleccionada.email}
                </span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#5f6368">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </div>
            </>
          )}

          {paso === 'otra_cuenta' && (
            <>
              <h1
                style={{
                  fontSize: '36px',
                  fontWeight: 400,
                  color: '#1f1f1f',
                  margin: '0 0 12px',
                  letterSpacing: '-0.5px',
                  lineHeight: 1.2,
                }}
              >
                Iniciar sesión
              </h1>
              <p style={{ fontSize: '16px', color: '#1f1f1f', margin: 0 }}>
                Usa tu cuenta de Google para ir a <span style={{ color: '#1a73e8', fontWeight: 500 }}>drivique.com</span>
              </p>
            </>
          )}
        </div>

        {/* COLUMNA DERECHA */}
        <div>
          {/* VISTA 1: LISTA DE CUENTAS */}
          {paso === 'seleccionar' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderTop: '1px solid #dadce0',
                }}
              >
                {CUENTAS_DEFAULT.map((cuenta) => (
                  <div
                    key={cuenta.id}
                    onClick={() => handleElegirCuenta(cuenta)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 12px',
                      borderBottom: '1px solid #dadce0',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafd')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: cuenta.avatarBg,
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {cuenta.initial}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1f1f1f', lineHeight: 1.3 }}>
                          {cuenta.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#444746', marginTop: '2px' }}>
                          {cuenta.email}
                        </div>
                      </div>
                    </div>

                    {cuenta.status && (
                      <span style={{ fontSize: '12px', color: '#747775' }}>
                        {cuenta.status}
                      </span>
                    )}
                  </div>
                ))}

                {/* Opción Usar otra cuenta */}
                <div
                  onClick={() => setPaso('otra_cuenta')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 12px',
                    borderBottom: '1px solid #dadce0',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafd')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: '#f1f3f4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#444746',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#1f1f1f' }}>
                    Usar otra cuenta
                  </span>
                </div>
              </div>

              {/* Botón cancelar */}
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-start' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '20px',
                    border: '1px solid #747775',
                    background: '#ffffff',
                    color: '#0b57d0',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* VISTA 2: CONSENTIMIENTO Y PERMISOS (PANTALLA EXACTA GOOGLE) */}
          {paso === 'consentimiento' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <p
                style={{
                  fontSize: '16px',
                  color: '#1f1f1f',
                  fontWeight: 500,
                  margin: '0 0 24px',
                  lineHeight: 1.4,
                }}
              >
                Google permitirá que <strong style={{ color: '#0b57d0' }}>drivique.com</strong> acceda a la siguiente información sobre ti
              </p>

              {/* Permiso 1: Perfil */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'flex-start' }}>
                <div style={{ color: '#444746', marginTop: '2px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1f1f1f' }}>
                    {cuentaSeleccionada.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#444746', marginTop: '2px' }}>
                    Nombre y foto de perfil
                  </div>
                </div>
              </div>

              {/* Permiso 2: Email */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', alignItems: 'flex-start' }}>
                <div style={{ color: '#444746', marginTop: '2px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1f1f1f' }}>
                    {cuentaSeleccionada.email}
                  </div>
                  <div style={{ fontSize: '12px', color: '#444746', marginTop: '2px' }}>
                    Dirección de correo electrónico
                  </div>
                </div>
              </div>

              {/* Textos legales */}
              <p style={{ fontSize: '12px', color: '#444746', lineHeight: 1.6, margin: '0 0 12px' }}>
                Revisa la <span style={{ color: '#0b57d0', cursor: 'pointer' }}>Política de Privacidad</span> y las <span style={{ color: '#0b57d0', cursor: 'pointer' }}>Condiciones del Servicio</span> de drivique.com para comprender de qué manera drivique.com procesará y protegerá tus datos.
              </p>

              <p style={{ fontSize: '12px', color: '#444746', lineHeight: 1.6, margin: '0 0 8px' }}>
                Para realizar cambios en cualquier momento, ve a tu <span style={{ color: '#0b57d0', cursor: 'pointer' }}>Cuenta de Google</span>.
              </p>

              <p style={{ fontSize: '12px', color: '#444746', lineHeight: 1.6, margin: '0 0 32px' }}>
                Obtén más información sobre <span style={{ color: '#0b57d0', cursor: 'pointer' }}>Acceder con Google</span>.
              </p>

              {/* Botones Cancelar y Continuar */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setPaso('seleccionar')}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '20px',
                    border: '1px solid #747775',
                    background: '#ffffff',
                    color: '#0b57d0',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmarFinal}
                  style={{
                    padding: '10px 28px',
                    borderRadius: '20px',
                    border: 'none',
                    background: '#0b57d0',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* VISTA 3: INGRESAR OTRA CUENTA MANUAL */}
          {paso === 'otra_cuenta' && (
            <form onSubmit={handleCrearOtraCuenta} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1f1f1f', marginBottom: '6px' }}>
                  Nombre(s) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Emily Sharith"
                  value={otraNombre}
                  onChange={(e) => setOtraNombre(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #747775',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1f1f1f', marginBottom: '6px' }}>
                  Apellido(s)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Amezquita Saavedra"
                  value={otraApellido}
                  onChange={(e) => setOtraApellido(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #747775',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1f1f1f', marginBottom: '6px' }}>
                  Correo electrónico de Google (@gmail.com) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="tu_correo@gmail.com"
                  value={otraCorreo}
                  onChange={(e) => setOtraCorreo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #747775',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {errorOtra && (
                <p style={{ color: '#d93025', fontSize: '13px', margin: 0 }}>
                  {errorOtra}
                </p>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setPaso('seleccionar')}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '20px',
                    border: '1px solid #747775',
                    background: '#ffffff',
                    color: '#0b57d0',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Volver
                </button>

                <button
                  type="submit"
                  style={{
                    padding: '10px 28px',
                    borderRadius: '20px',
                    border: 'none',
                    background: '#0b57d0',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Siguiente
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer inferior exacto de Google */}
      <div
        style={{
          width: '100%',
          maxWidth: '1040px',
          margin: '0 auto',
          padding: '16px 32px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: '#444746',
          borderTop: '1px solid #f1f3f4',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <span>Español (Latinoamérica)</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <span style={{ cursor: 'pointer' }}>Ayuda</span>
          <span style={{ cursor: 'pointer' }}>Privacidad</span>
          <span style={{ cursor: 'pointer' }}>Condiciones</span>
        </div>
      </div>
    </div>
  )
}
