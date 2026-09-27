import { useTranslation } from 'react-i18next'
import { FaMapMarkerAlt, FaTimes, FaHome, FaInfoCircle } from 'react-icons/fa'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { useEffect, useState } from 'react'

export default function DomicilioModal({ 
  isOpen, 
  onClose, 
  reserva, 
  onCambio, 
  c,
  isReadOnly 
}) {
  const { t } = useTranslation()
  const bg = c?.cardBg || '#fff'
  const textPrimary = c?.textPrimary || '#0f172a'
  const textSecond = c?.textSecondary || '#64748b'
  const accent = c?.accentText || 'var(--brand-primary)'
  const border = c?.cardBorder || '#e2e8f0'
  
  const isMobile = useIsMobile()

  // Local state to handle form before saving
  const [localDatos, setLocalDatos] = useState({
    barrio: reserva?.domicilioBarrio || '',
    direccion: reserva?.domicilioDireccion || '',
    referencias: reserva?.domicilioReferencias || ''
  })
  
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setLocalDatos({
        barrio: reserva?.domicilioBarrio || '',
        direccion: reserva?.domicilioDireccion || '',
        referencias: reserva?.domicilioReferencias || ''
      })
      setError('')
    }
  }, [isOpen, reserva])

  if (!isOpen) return null

  const handleGuardar = () => {
    if (!localDatos.barrio.trim() || !localDatos.direccion.trim()) {
      setError(t('vehiculo.domicilioRequiredFields', 'El barrio y la dirección son obligatorios.'))
      return
    }
    
    // Save to global state
    onCambio('domicilioBarrio', localDatos.barrio)
    onCambio('domicilioDireccion', localDatos.direccion)
    onCambio('domicilioReferencias', localDatos.referencias)

    onClose()
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: `1px solid ${border}`,
    background: c?.isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc',
    color: textPrimary,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s'
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isMobile ? 0 : 20
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: bg,
          borderRadius: isMobile ? '24px 24px 0 0' : 24,
          width: '100%',
          maxWidth: 550,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeInUp 0.3s ease-out forwards'
        }}
        onClick={(e) => e.stopPropagation()}
      >


        {/* Content */}
        <div style={{ padding: isMobile ? '16px' : '24px', flex: 1, overflowY: 'auto' }}>
          
          {error && (
            <div style={{ 
              marginBottom: 20, 
              padding: '12px 16px', 
              borderRadius: 12, 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: '#ef4444', 
              fontSize: 13, 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <FaInfoCircle size={16} />
              {error}
            </div>
          )}

          <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: '24px 20px' }}>
            <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--brand-secondary)', textTransform: 'uppercase', marginBottom: 16, letterSpacing: '0.02em' }}>
              {t('vehiculo.domicilioInfoTitle', 'Información de entrega a domicilio')}
            </h4>
            
            <div style={{ background: c?.isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderRadius: 12, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: textSecond, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <FaMapMarkerAlt size={12} color={accent} /> {t('vehiculo.domicilioCityLabel', 'Ciudad de entrega')}
                </span>
                <span style={{ fontSize: 15, fontWeight: 700, color: textPrimary }}>
                  {reserva?.domicilioCiudad || ''}
                </span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: accent, textTransform: 'uppercase' }}>
                {t('vehiculo.autoDetected', 'Auto-detectado')}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: textSecond, textTransform: 'uppercase' }}>
                  {t('vehiculo.domicilioNeighborhoodLabel', 'Barrio')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder={t('vehiculo.domicilioNeighborhoodPlaceholder', 'Ej: Centro')}
                  value={localDatos.barrio}
                  onChange={e => setLocalDatos({...localDatos, barrio: e.target.value})}
                  style={{ ...inputStyle, opacity: isReadOnly ? 0.7 : 1, cursor: isReadOnly ? 'not-allowed' : 'text' }}
                  disabled={isReadOnly}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: textSecond, textTransform: 'uppercase' }}>
                  {t('vehiculo.domicilioAddressLabel', 'Dirección')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder={t('vehiculo.domicilioAddressPlaceholder', 'Ej: Calle 10 # 5 - 42')}
                  value={localDatos.direccion}
                  onChange={e => setLocalDatos({...localDatos, direccion: e.target.value})}
                  style={{ ...inputStyle, opacity: isReadOnly ? 0.7 : 1, cursor: isReadOnly ? 'not-allowed' : 'text' }}
                  disabled={isReadOnly}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: textSecond, textTransform: 'uppercase' }}>
                  {t('vehiculo.domicilioReferencesLabel', 'Referencias de entrega')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder={t('vehiculo.domicilioReferencesPlaceholder', 'Ej: Frente al parque, indicaciones adicionales...')}
                  value={localDatos.referencias}
                  onChange={e => setLocalDatos({...localDatos, referencias: e.target.value})}
                  style={{ ...inputStyle, opacity: isReadOnly ? 0.7 : 1, cursor: isReadOnly ? 'not-allowed' : 'text' }}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: isMobile ? '16px' : '20px 24px', borderTop: `1px solid ${border}`, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          {isReadOnly ? (
            <button 
              onClick={onClose}
              style={{ flex: 1, padding: '12px', borderRadius: 12, background: accent, border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(var(--brand-primary-rgb), 0.3)' }}
            >
              {t('common.close', 'Cerrar')}
            </button>
          ) : (
            <>
              <button 
                onClick={onClose}
                style={{ padding: '12px 20px', borderRadius: 12, background: 'transparent', border: `1px solid ${border}`, color: textPrimary, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
              >
                {t('common.cancel', 'Cancelar')}
              </button>
              <button 
                onClick={handleGuardar}
                style={{ padding: '12px 24px', borderRadius: 12, background: 'var(--brand-gradient)', color: 'var(--brand-on-primary)', fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: 'var(--brand-shadow)' }}
              >
                {t('common.save', 'Guardar cambios')}
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
