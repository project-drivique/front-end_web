import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaExclamationTriangle, FaTimes, FaEye, FaEyeSlash, FaTrashAlt } from 'react-icons/fa'
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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: c?.modalBg || (esModoOscuro ? '#111827' : '#ffffff'),
          borderRadius: '20px',
          maxWidth: '460px',
          width: '100%',
          padding: '28px',
          boxShadow: esModoOscuro
            ? '0 25px 60px -15px rgba(0, 0, 0, 0.7)'
            : '0 25px 60px -15px rgba(220, 38, 38, 0.2)',
          border: `1px solid ${esModoOscuro ? '#374151' : '#fee2e2'}`,
          borderTop: '5px solid #dc2626',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxSizing: 'border-box',
          animation: 'fadeInUp 250ms ease-out',
        }}
      >
        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: esModoOscuro ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
                border: `1.5px solid ${esModoOscuro ? 'rgba(239, 68, 68, 0.3)' : '#fee2e2'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FaExclamationTriangle style={{ color: '#ef4444', fontSize: '20px' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: esModoOscuro ? '#f87171' : '#dc2626', margin: 0, letterSpacing: '-0.01em' }}>
                {t('perfil.deleteAccountTitle', 'Eliminar cuenta')}
              </h3>
              <p style={{ fontSize: '12.5px', color: c?.textMuted || '#64748b', margin: '3px 0 0' }}>
                {t('perfil.deleteAccountSub', 'Esta acción es permanente e irreversible')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: c?.textMuted || '#94a3b8',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = esModoOscuro ? '#ffffff' : '#111827'}
            onMouseLeave={e => e.currentTarget.style.color = c?.textMuted || '#94a3b8'}
          >
            <FaTimes style={{ fontSize: '16px' }} />
          </button>
        </div>

        {/* Advertencia Destacada */}
        <div
          style={{
            background: esModoOscuro ? 'rgba(127, 29, 29, 0.25)' : '#fff5f5',
            border: `1px solid ${esModoOscuro ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'}`,
            borderRadius: '12px',
            padding: '14px 16px',
            fontSize: '13px',
            color: esModoOscuro ? '#fca5a5' : '#991b1b',
            lineHeight: '1.5',
          }}
        >
          {t('perfil.deleteAccountWarning', '¿Estás seguro de que deseas eliminar tu cuenta? Al hacerlo, perderás de forma definitiva todo tu historial de reservas y datos guardados en Drivique.')}
        </div>

        {/* Formulario de confirmación de contraseña */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: c?.title || (esModoOscuro ? '#e2e8f0' : '#334155') }}>
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
              style={{
                width: '100%',
                height: '44px',
                padding: '0 40px 0 14px',
                borderRadius: '12px',
                border: `1.5px solid ${error ? '#f87171' : (c?.inputBorder || '#cbd5e1')}`,
                background: error ? (esModoOscuro ? 'rgba(127,29,29,0.2)' : '#fef2f2') : (c?.inputBg || '#ffffff'),
                fontSize: '13.5px',
                color: c?.inputText || (esModoOscuro ? '#e2e8f0' : '#1e293b'),
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 150ms ease',
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
          {error && <p style={{ color: '#dc2626', fontSize: '11.5px', margin: '3px 0 0', fontWeight: 600 }}>{error}</p>}
        </div>

        {/* Acciones de Footer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '12px', marginTop: '6px' }}>
          <button
            onClick={onClose}
            disabled={cargando}
            style={{
              padding: '11px',
              borderRadius: '10px',
              background: c?.btnSecBg || (esModoOscuro ? '#1e293b' : '#ffffff'),
              border: `1.5px solid ${c?.btnSecBorder || '#e2e8f0'}`,
              color: c?.btnSecText || (esModoOscuro ? '#cbd5e1' : '#475569'),
              fontWeight: 600,
              fontSize: '13.5px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              opacity: cargando ? 0.5 : 1,
              transition: 'all 150ms ease',
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
              background: password.trim()
                ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                : (esModoOscuro ? 'rgba(220,38,38,0.3)' : '#fca5a5'),
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
              boxShadow: password.trim() ? '0 4px 14px rgba(220, 38, 38, 0.35)' : 'none',
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
