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
            setError(err?.response?.data?.detail || err?.response?.data?.message || t('hc2.no_se_pudo_cargar_el_detalle', 'No se pudo cargar el detalle.'))
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
    if (raw.includes('cancel') || raw.includes('vencim') || raw.includes('expir')) {
      return {
        etiqueta: t('hc2.cancelacion_vencimiento', 'Cancelación / Vencimiento'),
        icono: <FaCalendarAlt />,
        color: '#dc2626',
        bg: 'rgba(220, 38, 38, 0.12)',
        accion: { texto: t('hc2.explorar_catalogo', 'Explorar catálogo'), ruta: '/catalogo' },
      }
    }
    if (raw.includes('reserva') || raw.includes('booking')) {
      return {
        etiqueta: t('hc2.reserva_de_vehiculo', 'Reserva de Vehículo'),
        icono: <FaCar />,
        color: 'var(--brand-text)',
        bg: 'rgba(var(--brand-primary-rgb), 0.12)',
        accion: { texto: t('hc2.ver_mis_reservas', 'Ver mis reservas'), ruta: '/reservas' },
      }
    }
    if (raw.includes('pago') || raw.includes('payment') || raw.includes('wompi')) {
      return {
        etiqueta: t('hc2.pago_confirmado', 'Pago Confirmado'),
        icono: <FaCreditCard />,
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.12)',
        accion: { texto: t('hc2.ver_reservas_y_pagos', 'Ver reservas y pagos'), ruta: '/reservas' },
      }
    }
    if (raw.includes('contrato') || raw.includes('contract')) {
      return {
        etiqueta: t('hc2.contrato_de_alquiler', 'Contrato de Alquiler'),
        icono: <FaFileContract />,
        color: '#8b5cf6',
        bg: 'rgba(139, 92, 246, 0.12)',
        accion: { texto: t('hc2.ver_reservas', 'Ver reservas'), ruta: '/reservas' },
      }
    }
    if (raw.includes('entrega') || raw.includes('delivery')) {
      return {
        etiqueta: t('hc2.entrega_de_vehiculo', 'Entrega de Vehículo'),
        icono: <FaCar />,
        color: '#06b6d4',
        bg: 'rgba(6, 182, 212, 0.12)',
      }
    }
    if (raw.includes('devolucion') || raw.includes('return')) {
      return {
        etiqueta: t('hc2.devolucion_de_vehiculo', 'Devolución de Vehículo'),
        icono: <FaCheckCircle />,
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.12)',
      }
    }
    if (raw.includes('documento') || raw.includes('kyc') || raw.includes('licencia')) {
      return {
        etiqueta: t('hc2.verificacion_de_documentos', 'Verificación de Documentos'),
        icono: <FaIdCard />,
        color: '#059669',
        bg: 'rgba(5, 150, 105, 0.12)',
        accion: { texto: t('hc2.ver_perfil_y_documentos', 'Ver perfil y documentos'), ruta: '/perfil' },
      }
    }
    if (raw.includes('soporte') || raw.includes('incidencia') || raw.includes('support')) {
      return {
        etiqueta: t('hc2.soporte_y_atencion', 'Soporte y Atención'),
        icono: <FaComments />,
        color: 'var(--brand-text)',
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
        accion: { texto: t('hc2.ver_mi_perfil', 'Ver mi perfil'), ruta: '/perfil' },
      }
    }
    return {
      etiqueta: t('hc2.notificacion_general', 'Notificación General'),
      icono: <FaBell />,
      color: 'var(--brand-primary, #2563eb)',
      bg: 'var(--brand-soft, rgba(var(--brand-primary-rgb),0.1))',
    }
  }

  const infoEvento = resolverTipoEvento(notif.tipo)

  // Mapeo de criticidad
  const resolverCriticidad = (crit = 'MEDIUM') => {
    const c = String(crit).toUpperCase()
    if (c === 'HIGH' || c === 'CRITICAL' || c === 'ALTA' || c === 'URGENTE') {
      return {
        texto: t('hc4.prioridad_alta', 'Prioridad Alta'),
        icono: <FaExclamationTriangle />,
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.12)',
        border: 'rgba(239, 68, 68, 0.3)',
      }
    }
    if (c === 'LOW' || c === 'BAJA') {
      return {
        texto: t('hc4.informativa', 'Informativa'),
        icono: <FaInfoCircle />,
        color: '#64748b',
        bg: 'rgba(100, 116, 139, 0.1)',
        border: 'rgba(100, 116, 139, 0.25)',
      }
    }
    return {
      texto: t('hc4.importante', 'Importante'),
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
  const metaActionLabel = notif.metadata?.actionLabel || (metaActionPath ? t('hc2.continuar_con_mi_reserva', 'Continuar con mi reserva') : null)
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
            aria-label={t('hc4.cerrar', 'Cerrar')}
          >
            <FaTimes />
          </button>
        </div>

        {/* Contenido principal */}
        <div className="notif-detail-body">
          {cargando && !detalle ? (
            <div className="notif-detail-loading">
              <div className="notif-detail-spinner" />
              <p>{t('hc.cargando_detalles_de_la_notificacion', 'Cargando detalles de la notificación...')}</p>
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
                  String(notif.titulo || '').toLowerCase().includes('comprobante') ||
                  String(notif.mensaje || '').toLowerCase().includes('pago');
                if (!esPago) return null;
                const statusRaw = String(metadata?.status || '').toUpperCase();
                const esRechazado = statusRaw === 'DECLINED' || statusRaw === 'REJECTED' || statusRaw === 'ERROR' || String(notif.titulo || '').toLowerCase().includes('fallo') || String(notif.titulo || '').toLowerCase().includes('problema') || String(notif.titulo || '').toLowerCase().includes('rechazado');
                
                let monto = metadata?.amount ? Number(metadata.amount).toLocaleString('es-CO') : null;
                let moneda = metadata?.currency || 'COP';
                let bookingCode = metadata?.bookingCode || notif.referenceId || null;

                if (!monto && notif.mensaje) {
                  const mMatch = notif.mensaje.match(/(?:pago(?:\\s+de)?|transacci[oó]n(?:\\s+de)?)\\s+([\\d.,]+)\\s*([A-Z]{3})?/i);
                  if (mMatch) {
                    monto = Number(mMatch[1].replace(/,/g, '')).toLocaleString('es-CO');
                    if (mMatch[2]) moneda = mMatch[2];
                  }
                }
                if (!bookingCode && (notif.mensaje || notif.titulo)) {
                  const cMatch = (notif.mensaje + ' ' + notif.titulo).match(/RES-\\d{4}-\\d+/i);
                  if (cMatch) {
                    bookingCode = cMatch[0].toUpperCase();
                  }
                }

                return (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '18px',
                      borderRadius: '12px',
                      background: esRechazado ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                      border: `1px solid ${esRechazado ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--texto-primary, #0f172a)' }}>
                        Comprobante de Transacción Oficial
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          background: esRechazado ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: esRechazado ? '#b91c1c' : '#047857',
                          border: `1px solid ${esRechazado ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                          letterSpacing: '0.3px',
                        }}
                      >
                        {esRechazado ? t('hc2.transaccion_declinada', '✕ TRANSACCIÓN DECLINADA') : t('hc2.pago_exitoso_aprobado', '✓ PAGO EXITOSO · APROBADO')}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', fontSize: '12px' }}>
                      {monto && (
                        <div>
                          <span style={{ color: 'var(--texto-muted, #64748b)', display: 'block', fontSize: '11px' }}>{t('hc.monto_de_transaccion', 'Monto de Transacción')}</span>
                          <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--texto-primary, #0f172a)' }}>$ {monto} {moneda}</span>
                        </div>
                      )}
                      {bookingCode && (
                        <div>
                          <span style={{ color: 'var(--texto-muted, #64748b)', display: 'block', fontSize: '11px' }}>{t('hc.codigo_de_reserva', 'Código de Reserva')}</span>
                          <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--texto-primary, #0f172a)' }}>{bookingCode}</span>
                        </div>
                      )}
                      <div>
                        <span style={{ color: 'var(--texto-muted, #64748b)', display: 'block', fontSize: '11px' }}>{t('hc.pasarela_de_pago', 'Pasarela de Pago')}</span>
                        <span style={{ fontWeight: 600, color: 'var(--texto-primary, #0f172a)' }}>Wompi Colombia (Segura)</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--texto-muted, #64748b)', display: 'block', fontSize: '11px' }}>{t('hc4.comercio', 'Comercio')}</span>
                        <span style={{ fontWeight: 600, color: 'var(--texto-primary, #0f172a)' }}>Drivique S.A.S.</span>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: '12px',
                        paddingTop: '10px',
                        borderTop: '1px dashed rgba(100, 116, 139, 0.2)',
                        fontSize: '11.5px',
                        color: 'var(--texto-muted, #475569)',
                        lineHeight: 1.5,
                      }}
                    >
                      {esRechazado
                        ? t('hc2.tu_banco_no_autorizo_la_operacion_no_s', 'Tu banco no autorizó la operación. No se realizó ningún cargo a tu cuenta. Puedes intentar de nuevo con otra tarjeta o PSE para asegurar tu vehículo.')
                        : t('hc2.el_pago_ha_sido_acreditado_exitosament', 'El pago ha sido acreditado exitosamente. Ya puedes continuar con la revisión y firma digital de tu contrato de alquiler para la entrega.')}
                    </div>
                  </div>
                );
              })()}

              {/* Metadatos asociados */}
              {metadata && (
                <div className="notif-detail-metadata-section">
                  <h4 className="notif-detail-metadata-title">{t('hc.informacion_adicional', 'Información adicional')}</h4>
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
