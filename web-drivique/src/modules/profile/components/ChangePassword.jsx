import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaLock, FaEye, FaEyeSlash, FaTimes, FaShieldAlt } from 'react-icons/fa'
import { useCambiarContrasena } from '../hooks/useChangePassword'
import { showAlert } from '@/utils/swalConfig'

export default function CambiarContrasena({ c }) {
  const { t } = useTranslation()
  const {
    form, errores, cargando, exito,
    modoEdicion, setModoEdicion,
    actualizarCampo, handleGuardar, handleCancelar,
  } = useCambiarContrasena()

  const [ver, setVer] = useState({ actual: false, nueva: false, confirmar: false })
  const toggleVer = (campo) => setVer(prev => ({ ...prev, [campo]: !prev[campo] }))

  useEffect(() => {
    if (exito) {
      showAlert({
        icon: 'success',
        title: t('perfil.passwordUpdatedTitle', '¡Contraseña actualizada!'),
        text: t('perfil.passwordUpdatedText', 'Tu contraseña se ha actualizado correctamente.'),
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#1d4ed8',
      })
    }
  }, [exito, t])

  const inputStyle = (hasError) => ({
    width: '100%',
    height: '44px',
    padding: '0 40px 0 14px',
    borderRadius: '12px',
    border: `1.5px solid ${hasError ? '#f87171' : c.inputBorder || '#e2e8f0'}`,
    background: hasError ? c.inputErrorBg || '#fef2f2' : c.inputBg || '#ffffff',
    fontSize: '13.5px',
    color: c.inputText || '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 150ms ease',
  })

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: c.title || '#334155',
    marginBottom: '6px',
  }

  return (
    <>
      {/* 1. Tarjeta gatillo en la pantalla de Perfil */}
      <div
        style={{
          background: c.innerCardBg || '#ffffff',
          borderRadius: '16px',
          border: `1px solid ${c.innerCardBorder || '#e2e8f0'}`,
          boxShadow: c.innerCardShadow || '0 1px 3px rgba(0,0,0,0.05)',
          padding: '22px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginTop: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(37, 99, 235, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FaShieldAlt style={{ color: '#2563eb', fontSize: '18px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '15.5px', fontWeight: 700, color: c.title || '#1e293b', margin: 0 }}>
              {t('perfil.security', 'Seguridad y Contraseña')}
            </h2>
            <p style={{ fontSize: '12.5px', color: c.textMuted || '#64748b', margin: '2px 0 0' }}>
              {t('perfil.securityHint', 'Administra tu clave de acceso y seguridad')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setModoEdicion(true)}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            background: c.btnPrimary || '#1e40af',
            color: '#ffffff',
            border: 'none',
            fontWeight: 700,
            fontSize: '13.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 150ms ease',
          }}
        >
          <FaLock style={{ fontSize: '12px' }} /> {t('perfil.changePassword', 'Cambiar contraseña')}
        </button>
      </div>

      {/* 2. Modal Emergente cuando se presiona "Cambiar contraseña" */}
      {modoEdicion && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCancelar()
          }}
        >
          <div
            style={{
              background: c.innerCardBg || '#ffffff',
              borderRadius: '24px',
              maxWidth: '420px',
              width: '100%',
              padding: '26px 24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: `1px solid ${c.innerCardBorder || '#e2e8f0'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxSizing: 'border-box',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'rgba(37, 99, 235, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FaShieldAlt style={{ color: '#2563eb', fontSize: '18px' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: c.title || '#1e293b', margin: 0, letterSpacing: '-0.01em' }}>
                    {t('perfil.changePasswordTitle', 'Cambiar contraseña')}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: c.textMuted || '#64748b', margin: '2px 0 0' }}>
                    {t('perfil.changePasswordSub', 'Protege el acceso a tu cuenta')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancelar}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: c.textMuted || '#94a3b8',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                }}
              >
                <FaTimes style={{ fontSize: '16px' }} />
              </button>
            </div>

            {/* Modal Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Contraseña actual */}
              <div>
                <label style={labelStyle}>{t('perfil.currentPassword', 'Contraseña actual')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={ver.actual ? 'text' : 'password'}
                    value={form.actual}
                    onChange={e => actualizarCampo('actual', e.target.value)}
                    style={inputStyle(!!errores.actual)}
                    onFocus={e => e.target.style.borderColor = c.inputBorderFocus || '#2563eb'}
                    onBlur={e => e.target.style.borderColor = errores.actual ? '#f87171' : c.inputBorder || '#e2e8f0'}
                  />
                  <button
                    type="button"
                    onClick={() => toggleVer('actual')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      display: 'flex',
                      padding: '4px',
                    }}
                  >
                    {ver.actual ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
                {errores.actual && <p style={{ color: '#ef4444', fontSize: '11.5px', margin: '4px 0 0' }}>{errores.actual}</p>}
              </div>

              {/* Nueva contraseña */}
              <div>
                <label style={labelStyle}>{t('perfil.newPassword', 'Nueva contraseña')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={ver.nueva ? 'text' : 'password'}
                    value={form.nueva}
                    onChange={e => actualizarCampo('nueva', e.target.value)}
                    style={inputStyle(!!errores.nueva)}
                    onFocus={e => e.target.style.borderColor = c.inputBorderFocus || '#2563eb'}
                    onBlur={e => e.target.style.borderColor = errores.nueva ? '#f87171' : c.inputBorder || '#e2e8f0'}
                  />
                  <button
                    type="button"
                    onClick={() => toggleVer('nueva')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      display: 'flex',
                      padding: '4px',
                    }}
                  >
                    {ver.nueva ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
                {errores.nueva && <p style={{ color: '#ef4444', fontSize: '11.5px', margin: '4px 0 0' }}>{errores.nueva}</p>}
              </div>

              {/* Confirmar nueva contraseña */}
              <div>
                <label style={labelStyle}>{t('perfil.confirmPassword', 'Confirmar nueva contraseña')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={ver.confirmar ? 'text' : 'password'}
                    value={form.confirmar}
                    onChange={e => actualizarCampo('confirmar', e.target.value)}
                    style={inputStyle(!!errores.confirmar)}
                    onFocus={e => e.target.style.borderColor = c.inputBorderFocus || '#2563eb'}
                    onBlur={e => e.target.style.borderColor = errores.confirmar ? '#f87171' : c.inputBorder || '#e2e8f0'}
                  />
                  <button
                    type="button"
                    onClick={() => toggleVer('confirmar')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      display: 'flex',
                      padding: '4px',
                    }}
                  >
                    {ver.confirmar ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
                {errores.confirmar && <p style={{ color: '#ef4444', fontSize: '11.5px', margin: '4px 0 0' }}>{errores.confirmar}</p>}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '12px', marginTop: '6px' }}>
              <button
                onClick={handleCancelar}
                disabled={cargando}
                style={{
                  padding: '11px',
                  borderRadius: '12px',
                  background: c.btnSecBg || '#ffffff',
                  border: `1.5px solid ${c.btnSecBorder || '#e2e8f0'}`,
                  color: c.btnSecText || '#475569',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  cursor: cargando ? 'not-allowed' : 'pointer',
                  opacity: cargando ? 0.5 : 1,
                }}
              >
                {t('perfil.cancel', 'Cancelar')}
              </button>
              <button
                onClick={handleGuardar}
                disabled={cargando}
                style={{
                  padding: '11px',
                  borderRadius: '12px',
                  background: c.btnPrimary || '#1d4ed8',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: cargando ? 'not-allowed' : 'pointer',
                  opacity: cargando ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {cargando ? (
                  <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> {t('perfil.updating', 'Actualizando...')}</>
                ) : (
                  t('perfil.updatePasswordBtn', 'Actualizar contraseña')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
