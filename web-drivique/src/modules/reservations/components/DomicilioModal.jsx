import { useTranslation } from 'react-i18next'
import { FaMapMarkerAlt, FaTimes, FaHome, FaInfoCircle } from 'react-icons/fa'
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
  const accent = c?.accentText || '#2563eb'
  const border = c?.cardBorder || '#e2e8f0'

  // Local state to handle form before saving
  const [localDatos, setLocalDatos] = useState({
    barrio: reserva?.domicilioBarrio || '',
    direccion: reserva?.domicilioDireccion || '',
    referencias: reserva?.domicilioReferencias || '',
    mismoLugar: reserva?.sucursalDevolucion === 'domicilio'
  })
  
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setLocalDatos({
        barrio: reserva?.domicilioBarrio || '',
        direccion: reserva?.domicilioDireccion || '',
        referencias: reserva?.domicilioReferencias || '',
        mismoLugar: reserva?.sucursalDevolucion === 'domicilio'
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
    
    if (localDatos.mismoLugar) {
      onCambio('sucursalDevolucion', 'domicilio')
    } else if (reserva?.sucursalDevolucion === 'domicilio') {
      onCambio('sucursalDevolucion', '')
    }

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
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: bg,
          borderRadius: 24,
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
        {/* Header */}
        <div style={{ padding: '24px 24px 20px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>
              <FaHome size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: textPrimary }}>
                {t('vehiculo.domicilioModalTitle', 'Dirección de Domicilio')}
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: textSecond }}>
                {t('vehiculo.domicilioModalSubtitle', 'Indícanos dónde recoger o entregar el vehículo.')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: textSecond, cursor: 'pointer', padding: 8 }}
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: 10, color: '#ef4444', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaInfoCircle /> {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>
                {t('vehiculo.domicilioCityLabel', 'Ciudad (Fija según sucursal)')}
              </label>
              <input
                type="text"
                value={reserva?.domicilioCiudad || ''}
                disabled
                style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>
                {t('vehiculo.domicilioNeighborhoodLabel', 'Barrio')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder={t('vehiculo.domicilioNeighborhoodPlaceholder', 'Ej. El Centro...')}
                value={localDatos.barrio}
                onChange={e => setLocalDatos({...localDatos, barrio: e.target.value})}
                style={{ ...inputStyle, opacity: isReadOnly ? 0.7 : 1, cursor: isReadOnly ? 'not-allowed' : 'text' }}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>
              {t('vehiculo.domicilioAddressLabel', 'Dirección exacta')} <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <FaMapMarkerAlt size={14} color={textSecond} style={{ position: 'absolute', top: 14, left: 14 }} />
              <input
                type="text"
                placeholder={t('vehiculo.domicilioAddressPlaceholder', 'Calle 10 # 5-20')}
                value={localDatos.direccion}
                onChange={e => setLocalDatos({...localDatos, direccion: e.target.value})}
                style={{ ...inputStyle, paddingLeft: 38, opacity: isReadOnly ? 0.7 : 1, cursor: isReadOnly ? 'not-allowed' : 'text' }}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>
              {t('vehiculo.domicilioReferencesLabel', 'Indicaciones o Referencias')}
            </label>
            <textarea
              rows={2}
              placeholder={t('vehiculo.domicilioReferencesPlaceholder', 'Ej. Frente al parque, casa de rejas blancas...')}
              value={localDatos.referencias}
              onChange={e => setLocalDatos({...localDatos, referencias: e.target.value})}
              style={{ ...inputStyle, resize: 'none', opacity: isReadOnly ? 0.7 : 1, cursor: isReadOnly ? 'not-allowed' : 'text' }}
              disabled={isReadOnly}
            />
          </div>

          {!isReadOnly && reserva?.sucursalRetiro === 'domicilio' && (
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 10, padding: '12px 16px', cursor: 'pointer', background: 'rgba(37, 99, 235, 0.05)', borderRadius: 12, border: `1px solid rgba(37, 99, 235, 0.2)` }}>
              <input
                type="checkbox"
                checked={localDatos.mismoLugar}
                onChange={e => setLocalDatos({...localDatos, mismoLugar: e.target.checked})}
                style={{ accentColor: accent, width: 18, height: 18, cursor: 'pointer', flexShrink: 0, marginTop: 2 }}
              />
              <p style={{ fontSize: 13, color: textPrimary, margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
                <strong style={{ color: accent, display: 'block', marginBottom: 4 }}>Devolver el vehículo en esta misma dirección</strong>
                Al marcar esta casilla, el lugar de devolución quedará automáticamente configurado para recoger el auto en esta misma ubicación al finalizar tu reserva.
              </p>
            </label>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px 24px', display: 'flex', gap: 12 }}>
          {isReadOnly ? (
            <button 
              onClick={onClose}
              style={{ flex: 1, padding: '12px', borderRadius: 12, background: accent, border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
            >
              {t('common.close', 'Cerrar')}
            </button>
          ) : (
            <>
              <button 
                onClick={onClose}
                style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'transparent', border: `1px solid ${border}`, color: textPrimary, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                {t('common.cancel', 'Cancelar')}
              </button>
              <button 
                onClick={handleGuardar}
                style={{ flex: 1, padding: '12px', borderRadius: 12, background: accent, border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
              >
                {t('common.confirm', 'Confirmar Dirección')}
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
