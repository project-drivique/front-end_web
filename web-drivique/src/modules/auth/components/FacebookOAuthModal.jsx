// src/modules/auth/components/FacebookOAuthModal.jsx
import React, { useState } from 'react'
import { FaFacebook } from 'react-icons/fa'

export default function FacebookOAuthModal({ visible, onConfirm, onClose }) {
  const [paso, setPaso] = useState('dialog') // 'dialog' | 'otra_cuenta'
  const [nombre, setNombre] = useState('Emily Sharith Amezquita')
  const [correo, setCorreo] = useState('sharithamezquita81@gmail.com')
  const [errorOtra, setErrorOtra] = useState('')

  if (!visible) return null

  const handleConfirmarFacebook = () => {
    const partesNombre = nombre.trim().split(' ')
    const firstName = partesNombre[0] || 'Emily'
    const lastName = partesNombre.slice(1).join(' ') || 'Amezquita'

    onConfirm({
      email: correo.trim().toLowerCase(),
      firstName,
      lastName,
      provider: 'FACEBOOK',
    })
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header azul oficial de Facebook */}
        <div
          style={{
            backgroundColor: '#1877F2',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaFacebook size={26} color="#ffffff" />
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
              Iniciar sesión con Facebook
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '20px',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Contenido del Diálogo */}
        <div style={{ padding: '24px 28px' }}>
          {paso === 'dialog' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    backgroundColor: '#1877F2',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  {nombre.charAt(0)}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: '#1c1e21', fontWeight: 600 }}>
                    {nombre}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#65676b' }}>
                    {correo}
                  </p>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#f0f2f5',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  fontSize: '13px',
                  color: '#4b4f56',
                  lineHeight: 1.5,
                  marginBottom: '20px',
                }}
              >
                <strong style={{ color: '#1c1e21' }}>drivique.com</strong> recibirá tu nombre y foto de perfil, así como tu dirección de correo electrónico.
              </div>

              <p style={{ fontSize: '12px', color: '#8a8d91', lineHeight: 1.5, margin: '0 0 24px' }}>
                Esto no le permite a la aplicación publicar en Facebook. Al continuar, aceptas las Condiciones y la Política de Privacidad de drivique.com.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleConfirmarFacebook}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#1877F2',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(24, 119, 242, 0.3)',
                  }}
                >
                  Continuar como {nombre.split(' ')[0]}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setPaso('otra_cuenta')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1877F2',
                      fontSize: '13px',
                      cursor: 'pointer',
                      padding: 0,
                      fontWeight: 600,
                    }}
                  >
                    Editar información / Cambiar cuenta
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: '1px solid #ccd0d5',
                      backgroundColor: '#f5f6f7',
                      color: '#4b4f56',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '16px', color: '#1c1e21' }}>
                Ingresa tus datos de Facebook
              </h4>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#65676b', marginBottom: '4px' }}>
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #ccd0d5',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#65676b', marginBottom: '4px' }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #ccd0d5',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setPaso('dialog')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #ccd0d5',
                    backgroundColor: '#f5f6f7',
                    color: '#4b4f56',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={() => setPaso('dialog')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#1877F2',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Guardar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
