import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaExclamationTriangle, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa'
import { showAlert } from '@/utils/swalConfig'
import { useAuthStore } from '@/store/authStore'

export default function DeleteAccountModal({ isOpen, onClose, c }) {
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
      // Simulación de respuesta de backend estilo Discord
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

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
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
          borderRadius: '24px',
          maxWidth: '440px',
          width: '100%',
          padding: '28px 24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          border: `1.5px solid ${c?.innerCardBorder || '#e2e8f0'}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxSizing: 'border-box',
        }}
      >
        {/* Encabezado Discord Style */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FaExclamationTriangle style={{ color: '#dc2626', fontSize: '18px' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '17.5px', fontWeight: 800, color: '#dc2626', margin: 0, letterSpacing: '-0.01em' }}>
                {t('perfil.deleteAccountTitle', 'Eliminar cuenta')}
              </h3>
              <p style={{ fontSize: '12.5px', color: c?.textMuted || '#64748b', margin: '2px 0 0' }}>
                {t('perfil.deleteAccountSub', 'Esta acción es permanente e irreversible')}
              </p>
            </div>
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

        {/* Advertencia Estilo Discord */}
        <div
          style={{
            background: '#fef2f2',
            borderLeft: '4px solid #dc2626',
            borderRadius: '8px',
            padding: '12px 14px',
            fontSize: '13px',
            color: '#991b1b',
            lineHeight: '1.45',
          }}
        >
          {t('perfil.deleteAccountWarning', '¿Estás seguro de que deseas eliminar tu cuenta? Al hacerlo, perderás de forma definitiva todo tu historial de reservas y datos guardados.')}
        </div>

        {/* Formulario de confirmación de contraseña */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: c?.title || '#334155' }}>
            {t('perfil.enterPasswordConfirm', 'Ingresa tu contraseña para confirmar')}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={verPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                height: '44px',
                padding: '0 40px 0 14px',
                borderRadius: '12px',
                border: `1.5px solid ${error ? '#f87171' : c?.inputBorder || '#e2e8f0'}`,
                background: error ? c?.inputErrorBg || '#fef2f2' : c?.inputBg || '#ffffff',
                fontSize: '13.5px',
                color: c?.inputText || '#1e293b',
                outline: 'none',
                boxSizing: 'border-box',
              }}
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
          {error && <p style={{ color: '#dc2626', fontSize: '12px', margin: '2px 0 0' }}>{error}</p>}
        </div>

        {/* Acciones de Footer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '12px', marginTop: '4px' }}>
          <button
            onClick={onClose}
            disabled={cargando}
            style={{
              padding: '11px',
              borderRadius: '12px',
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
              borderRadius: '12px',
              background: password.trim() ? '#dc2626' : '#f87171',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: (cargando || !password.trim()) ? 'not-allowed' : 'pointer',
              opacity: (cargando || !password.trim()) ? 0.6 : 1,
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
              t('perfil.deleteAccountBtn', 'Eliminar cuenta')
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
