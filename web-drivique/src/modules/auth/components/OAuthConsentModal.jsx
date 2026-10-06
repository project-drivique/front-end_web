// src/modules/auth/components/OAuthConsentModal.jsx
import React, { useState } from 'react'
import { FaGoogle, FaFacebook, FaShieldAlt, FaTimes, FaCheck } from 'react-icons/fa'

export default function OAuthConsentModal({
  visible,
  provider = 'GOOGLE',
  onConfirm,
  onClose,
  esModoOscuro = false,
}) {
  const isGoogle = provider?.toUpperCase() === 'GOOGLE'

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [correo, setCorreo] = useState('')
  const [errorValidacion, setErrorValidacion] = useState('')

  if (!visible) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!correo.trim() || !correo.includes('@')) {
      setErrorValidacion('Por favor ingresa un correo electrónico válido')
      return
    }
    if (!nombre.trim()) {
      setErrorValidacion('Por favor ingresa tu nombre')
      return
    }

    onConfirm({
      email: correo.trim().toLowerCase(),
      firstName: nombre.trim(),
      lastName: apellido.trim() || (isGoogle ? 'Google' : 'Facebook'),
      provider: isGoogle ? 'GOOGLE' : 'FACEBOOK',
    })
  }

  const bgModal = esModoOscuro ? '#0f172a' : '#ffffff'
  const textPrimary = esModoOscuro ? '#f8fafc' : '#0f172a'
  const textSecondary = esModoOscuro ? '#94a3b8' : '#64748b'
  const borderCol = esModoOscuro ? '#334155' : '#e2e8f0'
  const inputBg = esModoOscuro ? '#1e293b' : '#f8fafc'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: bgModal,
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: `1px solid ${borderCol}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Header con marca del proveedor */}
        <div
          style={{
            padding: '24px 24px 16px',
            borderBottom: `1px solid ${borderCol}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isGoogle
              ? esModoOscuro ? 'rgba(66, 133, 244, 0.08)' : '#f8faff'
              : esModoOscuro ? 'rgba(24, 119, 242, 0.08)' : '#f0f6ff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isGoogle ? '#ffffff' : '#1877F2',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              {isGoogle ? (
                <svg width="22" height="22" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.09-6.09C34.46 3.09 29.53 1 24 1 14.82 1 7.07 6.48 3.64 14.18l7.09 5.51C12.4 13.67 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.15 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h12.44c-.54 2.9-2.18 5.36-4.64 7.01l7.19 5.59C43.16 37.13 46.15 31.29 46.15 24.5z"/>
                  <path fill="#FBBC05" d="M10.73 28.31A14.6 14.6 0 019.5 24c0-1.49.26-2.93.73-4.31L3.14 14.18A22.94 22.94 0 001 24c0 3.57.85 6.95 2.36 9.95l7.37-5.64z"/>
                  <path fill="#34A853" d="M24 47c5.53 0 10.17-1.83 13.56-4.97l-7.19-5.59c-1.84 1.24-4.2 1.97-6.37 1.97-6.26 0-11.6-4.17-13.27-9.78l-7.37 5.64C7.07 41.52 14.82 47 24 47z"/>
                </svg>
              ) : (
                <FaFacebook size={22} color="#ffffff" />
              )}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: textPrimary }}>
                {isGoogle ? 'Iniciar sesión con Google' : 'Continuar con Facebook'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: textSecondary }}>
                OAuth 2.0 / OpenID Connect
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: textSecondary,
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Cuerpo del formulario */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '0.85rem', color: textSecondary, margin: '0 0 14px', lineHeight: 1.5 }}>
              Para iniciar sesión con tu cuenta real de <strong>{isGoogle ? 'Google' : 'Facebook'}</strong> en Drivique, confirma tus datos de acceso:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: textPrimary, marginBottom: '5px' }}>
                  Nombre(s) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: `1.5px solid ${borderCol}`,
                    background: inputBg,
                    color: textPrimary,
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: textPrimary, marginBottom: '5px' }}>
                  Apellido(s)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Gómez"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: `1.5px solid ${borderCol}`,
                    background: inputBg,
                    color: textPrimary,
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: textPrimary, marginBottom: '5px' }}>
                Correo electrónico {isGoogle ? 'de Google (@gmail.com)' : 'de Facebook'} *
              </label>
              <input
                type="email"
                required
                placeholder={isGoogle ? 'tu_correo@gmail.com' : 'tu_correo@facebook.com'}
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: `1.5px solid ${borderCol}`,
                  background: inputBg,
                  color: textPrimary,
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Permisos solicitados */}
            <div
              style={{
                backgroundColor: esModoOscuro ? '#1e293b' : '#f1f5f9',
                borderRadius: '12px',
                padding: '12px 14px',
                fontSize: '0.78rem',
                color: textSecondary,
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: textPrimary, marginBottom: '6px' }}>
                <FaShieldAlt size={13} color={isGoogle ? '#4285F4' : '#1877F2'} />
                <span>Permisos solicitados por Drivique:</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.6 }}>
                <li>Ver tu nombre completo y foto de perfil</li>
                <li>Ver tu dirección de correo electrónico</li>
                <li>Autenticar identidad mediante protocolo PKCE / OIDC</li>
              </ul>
            </div>

            {errorValidacion && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0 0 12px', fontWeight: 600 }}>
                {errorValidacion}
              </p>
            )}
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: `1px solid ${borderCol}`,
                background: 'transparent',
                color: textSecondary,
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                background: isGoogle
                  ? 'linear-gradient(135deg, #4285F4, #2b6cb0)'
                  : 'linear-gradient(135deg, #1877F2, #145dbf)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <FaCheck size={12} />
              <span>Autorizar y Acceder</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
