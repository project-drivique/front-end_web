import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaTimes, FaEye, FaEyeSlash, FaTrashAlt } from 'react-icons/fa'
import { showAlert } from '@/utils/swalConfig'
import { useAuthStore } from '@/store/authStore'

export default function DeleteAccountModal({ isOpen, onClose, c, esModoOscuro }) {
  const { t } = useTranslation()
  const { logout } = useAuthStore()
  const [password, setPassword] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  if (!isOpen) return null

  const handleConfirmDelete = async () => {
    if (!password.trim()) {
      setError(t('perfil.deleteAccountErr', 'Ingresa tu contraseña para confirmar.'))
      return
    }

    setCargando(true)
    setError('')

    try {
      // Simulación de respuesta de backend
      await new Promise(resolve => setTimeout(resolve, 800))
      
      onClose()
      setPassword('')
      
      await showAlert({
        icon: 'success',
        title: t('perfil.accountDeletedTitle', 'Cuenta eliminada'),
        text: t('perfil.accountDeletedText', 'Tu cuenta ha sido eliminada permanentemente.'),
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#dc2626',
      })

      logout()
      window.location.replace('/')
    } catch (err) {
      setError(err?.message || t('perfil.deleteAccountFail', 'Error al eliminar la cuenta.'))
    } finally {
      setCargando(false)
    }
  }

  const inputStyle = (hasError) => ({
    width: '100%',
    height: '42px',
    padding: '0 40px 0 14px',
    borderRadius: '10px',
    border: `1.5px solid ${hasError ? '#f87171' : c?.inputBorder || '#e2e8f0'}`,
    background: hasError ? c?.inputErrorBg || '#fef2f2' : c?.inputBg || '#ffffff',
    fontSize: '13.5px',
    color: c?.inputText || '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 150ms ease',
  })

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: c?.title || '#334155',
    marginBottom: '6px',
  }

  return (
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
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: c?.innerCardBg || '#ffffff',
          borderRadius: '20px',
          maxWidth: '420px',
          width: '100%',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: `1px solid ${c?.innerCardBorder || '#e2e8f0'}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          boxSizing: 'border-box',
        }}
      >
        {/* Modal Header - Mismo diseño que Cambiar Contraseña */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            paddingBottom: '12px',
            borderBottom: `1px solid ${esModoOscuro ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)'}`,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '16.5px',
                fontWeight: 800,
                color: esModoOscuro ? '#93c5fd' : '#1e3a8a',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {t('perfil.deleteAccountTitle', 'Eliminar cuenta')}
            </h3>
            <p style={{ fontSize: '12.5px', color: c?.textMuted || '#64748b', margin: '2px 0 0' }}>
              {t('perfil.deleteAccountSub', 'Esta acción es permanente e irreversible')}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: c?.textMuted || '#94a3b8',
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

        {/* Mensaje de confirmación */}
        <p style={{ fontSize: '13px', color: c?.textMuted || '#64748b', margin: 0, lineHeight: '1.45' }}>
          {t('perfil.deleteAccountWarning', 'Al eliminar tu cuenta perderás de forma definitiva todo tu historial de reservas y datos guardados.')}
        </p>

        {/* Formulario de confirmación de contraseña */}
        <div>
          <label style={labelStyle}>
            {t('perfil.enterPasswordConfirm', 'Ingresa tu contraseña para confirmar')}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={verPassword ? 'text' : 'password'}
              value={password}
              onChange={e => {
                setPassword(e.target.value)
                if (error) setError('')
              }}
              placeholder="••••••••"
              style={inputStyle(!!error)}
              onFocus={e => e.target.style.borderColor = c?.inputBorderFocus || '#1e3a8a'}
              onBlur={e => e.target.style.borderColor = error ? '#f87171' : c?.inputBorder || '#e2e8f0'}
              onKeyDown={e => {
                if (e.key === 'Enter') handleConfirmDelete()
              }}
            />
            <button
              type="button"
              onClick={() => setVerPassword(prev => !prev)}
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
              {verPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
            </button>
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: '11.5px', margin: '4px 0 0' }}>{error}</p>}
        </div>

        {/* Modal Footer Actions - Estructura idéntica a Cambiar Contraseña */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '12px', marginTop: '6px' }}>
          <button
            onClick={onClose}
            disabled={cargando}
            style={{
              padding: '11px',
              borderRadius: '10px',
              background: c?.btnSecBg || '#ffffff',
              border: `1.5px solid ${c?.btnSecBorder || '#e2e8f0'}`,
              color: c?.btnSecText || '#475569',
              fontWeight: 600,
              fontSize: '13.5px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              opacity: cargando ? 0.5 : 1,
            }}
          >
            {t('perfil.cancel', 'Cancelar')}
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={cargando || !password.trim()}
            style={{
              padding: '11px',
              borderRadius: '10px',
              background: password.trim() ? '#dc2626' : (esModoOscuro ? 'rgba(220, 38, 38, 0.4)' : '#fca5a5'),
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: (cargando || !password.trim()) ? 'not-allowed' : 'pointer',
              opacity: (cargando || !password.trim()) ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 150ms ease',
            }}
          >
            {cargando ? (
              <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> {t('perfil.deleting', 'Eliminando...')}</>
            ) : (
              <>
                <FaTrashAlt style={{ fontSize: '12px' }} />
                {t('perfil.deleteAccountBtn', 'Eliminar cuenta')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
