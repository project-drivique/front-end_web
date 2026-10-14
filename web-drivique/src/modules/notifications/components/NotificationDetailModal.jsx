import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  FaTimes,
  FaBell,
  FaCheckCircle,
  FaCreditCard,
  FaFileContract,
  FaCar,
  FaExclamationTriangle,
  FaComments,
  FaIdCard,
  FaInfoCircle,
  FaCalendarAlt,
  FaArrowRight,
  FaCheckDouble,
  FaShieldAlt,
} from 'react-icons/fa'
import { notificationService } from '@/services/notificationService'
import './NotificationDetailModal.css'

export default function NotificationDetailModal({
  notificacionId,
  notificacionPrevia,
  onClose,
  onMarkAsRead,
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [detalle, setDetalle] = useState(notificacionPrevia || null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!notificacionId) return

    let activo = true
    const cargar = async () => {
      setCargando(true)
      setError(null)
      try {
        const data = await notificationService.getNotificationDetail(notificacionId)
        if (activo) {
          setDetalle(data)
          if (!data.leida && onMarkAsRead) {
            onMarkAsRead(notificacionId)
          }
        }
      } catch (err) {
        console.warn('Error cargando detalle de notificación:', err)
        if (activo) {
          // Si falla endpoint detalle, usamos la previa
          if (!notificacionPrevia) {
            setError(err?.response?.data?.detail || err?.response?.data?.message || 'No se pudo cargar el detalle.')
          }
        }
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargar()
    return () => {
      activo = false
    }
  }, [notificacionId, notificacionPrevia, onMarkAsRead])

  if (!notificacionId) return null

  const notif = detalle || notificacionPrevia || {}

  // Mapeo amigable de tipo de evento y su icono
  const resolverTipoEvento = (tipo = '') => {
    const raw = String(tipo).toLowerCase()
    if (raw.includes('reserva') || raw.includes('booking')) {
      return {
        etiqueta: 'Reserva de Vehículo',
        icono: <FaCar />,
        color: '#2563eb',
        bg: 'rgba(37, 99, 235, 0.12)',
        accion: { texto: 'Ver mis reservas', ruta: '/reservas' },
      }
    }
    if (raw.includes('pago') || raw.includes('payment') || raw.includes('wompi')) {
      return {
        etiqueta: 'Pago Confirmado',
        icono: <FaCreditCard />,
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.12)',
        accion: { texto: 'Ver reservas y pagos', ruta: '/reservas' },
      }
    }
    if (raw.includes('contrato') || raw.includes('contract')) {
      return {
        etiqueta: 'Contrato de Alquiler',
        icono: <FaFileContract />,
        color: '#8b5cf6',
        bg: 'rgba(139, 92, 246, 0.12)',
        accion: { texto: 'Ver reservas', ruta: '/reservas' },
      }
    }
    if (raw.includes('entrega') || raw.includes('delivery')) {
      return {
        etiqueta: 'Entrega de Vehículo',
        icono: <FaCar />,
        color: '#06b6d4',
        bg: 'rgba(6, 182, 212, 0.12)',
      }
    }
    if (raw.includes('devolucion') || raw.includes('return')) {
      return {
        etiqueta: 'Devolución de Vehículo',
        icono: <FaCheckCircle />,
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.12)',
      }
    }
    if (raw.includes('documento') || raw.includes('kyc') || raw.includes('licencia')) {
      return {
        etiqueta: 'Verificación de Documentos',
        icono: <FaIdCard />,
        color: '#059669',
        bg: 'rgba(5, 150, 105, 0.12)',
        accion: { texto: 'Ver perfil y documentos', ruta: '/perfil' },
      }
    }
    if (raw.includes('soporte') || raw.includes('incidencia') || raw.includes('support')) {
      return {
        etiqueta: 'Soporte y Atención',
        icono: <FaComments />,
        color: '#0284c7',
        bg: 'rgba(2, 132, 199, 0.12)',
        accion: { texto: 'Ir a Centro de Soporte', ruta: '/soporte' },
      }
    }
    if (raw.includes('registro') || raw.includes('auth') || raw.includes('bienvenida')) {
      return {
        etiqueta: 'Cuenta y Seguridad',
        icono: <FaShieldAlt />,
        color: '#6366f1',
        bg: 'rgba(99, 102, 241, 0.12)',
        accion: { texto: 'Ver mi perfil', ruta: '/perfil' },
      }
    }
    return {
      etiqueta: 'Notificación General',
      icono: <FaBell />,
      color: 'var(--brand-primary, #2563eb)',
      bg: 'var(--brand-soft, rgba(37,99,235,0.1))',
    }
  }

  const infoEvento = resolverTipoEvento(notif.tipo)

  // Mapeo de criticidad
  const resolverCriticidad = (crit = 'MEDIUM') => {
    const c = String(crit).toUpperCase()
    if (c === 'HIGH' || c === 'CRITICAL' || c === 'ALTA' || c === 'URGENTE') {
      return {
        texto: 'Prioridad Alta',
        icono: <FaExclamationTriangle />,
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.12)',
        border: 'rgba(239, 68, 68, 0.3)',
      }
    }
    if (c === 'LOW' || c === 'BAJA') {
      return {
        texto: 'Informativa',
        icono: <FaInfoCircle />,
        color: '#64748b',
        bg: 'rgba(100, 116, 139, 0.1)',
        border: 'rgba(100, 116, 139, 0.25)',
      }
    }
    return {
      texto: 'Importante',
      icono: <FaInfoCircle />,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.3)',
    }
  }

  const critInfo = resolverCriticidad(notif.criticidad)

  const formatearFecha = (iso) => {
    if (!iso) return ''
    try {
      return new Date(iso).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  const metadata = notif.metadata && typeof notif.metadata === 'object' && Object.keys(notif.metadata).length > 0
    ? notif.metadata
    : null

  const metaActionPath = notif.metadata?.actionPath || (notif.metadata?.actionUrl && notif.metadata.actionUrl.startsWith('/') ? notif.metadata.actionUrl : (notif.metadata?.reservationId ? `/reservas?detalle=${notif.metadata.reservationId}` : null))
  const metaActionLabel = notif.metadata?.actionLabel || (metaActionPath ? 'Continuar con mi reserva' : null)
  const accionFinal = metaActionPath ? { texto: metaActionLabel, ruta: metaActionPath } : infoEvento.accion

  return (
    <div className="notif-detail-backdrop" onClick={onClose}>
      <div className="notif-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header Modal */}
        <div className="notif-detail-header">
          <div className="notif-detail-header-left">
            <span
              className="notif-detail-event-tag"
              style={{ color: infoEvento.color, background: infoEvento.bg }}
            >
              {infoEvento.icono}
              <span>{infoEvento.etiqueta}</span>
            </span>

            <span
              className="notif-detail-crit-tag"
              style={{
                color: critInfo.color,
                background: critInfo.bg,
                borderColor: critInfo.border,
              }}
            >
              {critInfo.icono}
              <span>{critInfo.texto}</span>
            </span>
          </div>

          <button
            type="button"
            className="notif-detail-close-btn"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <FaTimes />
          </button>
        </div>

        {/* Contenido principal */}
        <div className="notif-detail-body">
          {cargando && !detalle ? (
            <div className="notif-detail-loading">
              <div className="notif-detail-spinner" />
              <p>Cargando detalles de la notificación...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="notif-detail-alert-error">
                  <FaExclamationTriangle />
                  <span>{error}</span>
                </div>
              )}

              <h2 className="notif-detail-title">{notif.titulo}</h2>

              {notif.fechaIso && (
                <div className="notif-detail-fecha-row">
                  <FaCalendarAlt />
                  <span>{formatearFecha(notif.fechaIso)}</span>
                  {notif.leida && (
                    <span className="notif-detail-status-pill leida">
                      <FaCheckDouble /> Leída
                    </span>
                  )}
                </div>
              )}

              <div className="notif-detail-message-box">
                <p>{notif.mensaje}</p>
              </div>

              {/* Comprobante de Transacción si es notificación de pago */}
              {(() => {
                const esPago = String(notif.tipo || '').toLowerCase().includes('pago') ||
                  String(notif.tipo || '').toLowerCase().includes('payment') ||
                  String(notif.titulo || '').toLowerCase().includes('pago') ||
                  String(notif.titulo || '').toLowerCase().includes('comprobante');
                if (!esPago) return null;
                const statusRaw = String(metadata?.status || '').toUpperCase();
                const esRechazado = statusRaw === 'DECLINED' || statusRaw === 'REJECTED' || statusRaw === 'ERROR' || String(notif.titulo || '').toLowerCase().includes('fallo') || String(notif.titulo || '').toLowerCase().includes('problema');
                const monto = metadata?.amount ? Number(metadata.amount).toLocaleString('es-CO') : null;
                const moneda = metadata?.currency || 'COP';
                const bookingCode = metadata?.bookingCode || notif.referenceId || null;

                return (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '16px',
                      borderRadius: '12px',
                      background: esRechazado ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                      border: `1px solid ${esRechazado ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--texto-primary, #0f172a)' }}>
                        Comprobante de Pago Oficial
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: esRechazado ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: esRechazado ? '#b91c1c' : '#047857',
                        }}
                      >
                        {esRechazado ? 'Pago Rechazado' : 'Pago Exitoso (APROBADO)'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                      {monto && (
                        <div>
                          <span style={{ color: 'var(--texto-muted, #64748b)', display: 'block', fontSize: '11px' }}>Monto Pagado</span>
                          <span style={{ fontWeight: 800, color: 'var(--texto-primary, #0f172a)' }}>$ {monto} {moneda}</span>
                        </div>
                      )}
                      {bookingCode && (
                        <div>
                          <span style={{ color: 'var(--texto-muted, #64748b)', display: 'block', fontSize: '11px' }}>Código de Reserva</span>
                          <span style={{ fontWeight: 800, color: 'var(--texto-primary, #0f172a)' }}>{bookingCode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Metadatos asociados */}
              {metadata && (
                <div className="notif-detail-metadata-section">
                  <h4 className="notif-detail-metadata-title">Información adicional</h4>
                  <div className="notif-detail-metadata-grid">
                    {Object.entries(metadata).map(([key, value]) => {
                      if (typeof value === 'object' && value !== null) {
                        return null
                      }
                      return (
                        <div key={key} className="notif-detail-metadata-item">
                          <span className="metadata-item-key">{key}:</span>
                          <span className="metadata-item-val">{String(value)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer del Modal con acciones */}
        <div className="notif-detail-footer">
          {accionFinal && (
            <button
              type="button"
              className="notif-detail-action-btn primary"
              onClick={() => {
                onClose()
                navigate(accionFinal.ruta)
              }}
            >
              <span>{accionFinal.texto}</span>
              <FaArrowRight size={12} />
            </button>
          )}

          <button
            type="button"
            className="notif-detail-action-btn secondary"
            onClick={onClose}
          >
            {t('comun.cerrar', 'Cerrar')}
          </button>
        </div>
      </div>
    </div>
  )
}
