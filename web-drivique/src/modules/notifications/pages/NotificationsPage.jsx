import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaBell, FaTag, FaCheckCircle, FaCreditCard, FaFileAlt, FaComments, FaCar, FaExclamationCircle, FaHourglassHalf, FaCheckDouble, FaInbox, FaSlidersH, FaSyncAlt, FaFileContract, FaShieldAlt, FaArrowRight } from 'react-icons/fa'
import { useLanding } from '@/modules/landing/LandingContext'
import CatalogTopHeader from '@/modules/catalog/components/CatalogTopHeader'
import { useNotificationStore } from '../store/useNotificationStore'
import CouponModal from '../components/CouponModal'
import ConditionsModal from '../components/ConditionsModal'
import NotificationDetailModal from '../components/NotificationDetailModal'
import DeliveryPreferencesForm from '../components/DeliveryPreferencesForm'
import NotificationsPromotionsTab from '../components/NotificationsPromotionsTab'
import './NotificationsPage.css'

export default function NotificationsPage({ defaultTab }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { moneda, tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'

  const searchParams = new URLSearchParams(location.search)
  const tabFromQuery = searchParams.get('tab')
  const initialTab = defaultTab || tabFromQuery || (
    location.pathname.includes('cupon') || location.pathname.includes('promo')
      ? 'promociones'
      : (location.pathname.includes('pref') ? 'preferencias' : 'generales')
  )

  const [pestanaActiva, setPestanaActiva] = useState(initialTab) // 'generales' | 'preferencias' | 'promociones'
  const [filtroLectura, setFiltroLectura] = useState('todas') // 'todas' | 'no_leidas' | 'leidas'
  const [notificacionModal, setNotificacionModal] = useState(null)
  const [cuponSeleccionadoModal, setCuponSeleccionadoModal] = useState(null)
  const [condicionesCuponModal, setCondicionesCuponModal] = useState(null)

  const {
    notificaciones,
    cargando,
    cargarNotificaciones,
    marcarLeida,
    marcarTodasLeidas,
    cupones,
    promosVehiculos,
    refrescarPromociones,
    aplicarCupon,
  } = useNotificationStore()

  const [renderTime] = useState(() => Date.now())

  useEffect(() => {
    cargarNotificaciones()
    refrescarPromociones()
  }, [cargarNotificaciones, refrescarPromociones])

  const notificacionesVisibles = useMemo(() => {
    const list = (notificaciones || []).filter((n) => {
      if (!n || typeof n !== 'object') return false
      const tit = n.tituloKey ? t(n.tituloKey, n.tituloFallback || n.titulo || n.subject || n.title || '') : (n.titulo || n.tituloFallback || n.subject || n.title || '')
      const msg = n.mensajeKey ? t(n.mensajeKey, n.mensajeFallback || n.mensaje || n.message || '') : (n.mensaje || n.mensajeFallback || n.message || '')
      return Boolean((tit && tit.trim()) || (msg && msg.trim()))
    })

    const deduplicadas = []
    const clavesVistas = new Set()
    for (const item of list) {
      const tit = (item.titulo || item.subject || '').trim().toLowerCase()
      const msg = (item.mensaje || item.message || '').trim().toLowerCase()
      const ref = item.metadata?.reservationId || item.metadata?.bookingCode || item.referenceId || ''
      const key = `${tit}|${msg}|${ref}`
      if (!clavesVistas.has(key)) {
        clavesVistas.add(key)
        deduplicadas.push(item)
      }
    }
    return deduplicadas
  }, [notificaciones, t])

  const notificacionesFiltradas = useMemo(() => {
    if (filtroLectura === 'no_leidas') {
      return notificacionesVisibles.filter((n) => !n.leida)
    }
    if (filtroLectura === 'leidas') {
      return notificacionesVisibles.filter((n) => n.leida)
    }
    return notificacionesVisibles
  }, [notificacionesVisibles, filtroLectura])

  const noLeidasGeneralesCount = useMemo(() => {
    return notificacionesVisibles.filter((n) => !n.leida).length
  }, [notificacionesVisibles])

  const sinAplicarCuponesCount = useMemo(() => {
    return (cupones || []).filter((c) => !c.aplicado).length
  }, [cupones])

  const renderIconoNotif = (tipo = '') => {
    const raw = String(tipo).toLowerCase()
    if (raw.includes('cancel') || raw.includes('vencim') || raw.includes('expir')) {
      return <FaExclamationCircle style={{ color: '#dc2626' }} />
    }
    if (raw.includes('reserva') || raw.includes('booking')) {
      return <FaCheckCircle style={{ color: 'var(--brand-text)' }} />
    }
    if (raw.includes('pago') || raw.includes('payment') || raw.includes('wompi')) {
      return <FaCreditCard style={{ color: '#10b981' }} />
    }
    if (raw.includes('contrato') || raw.includes('contract')) {
      return <FaFileContract style={{ color: '#8b5cf6' }} />
    }
    if (raw.includes('documento') || raw.includes('kyc') || raw.includes('licencia')) {
      return <FaFileAlt style={{ color: '#059669' }} />
    }
    if (raw.includes('soporte') || raw.includes('incidencia') || raw.includes('support')) {
      return <FaComments style={{ color: 'var(--brand-text)' }} />
    }
    if (raw.includes('entrega') || raw.includes('devolucion') || raw.includes('alquiler') || raw.includes('vehiculo')) {
      return <FaCar style={{ color: 'var(--brand-text)' }} />
    }
    if (raw.includes('registro') || raw.includes('bienvenida') || raw.includes('seguridad')) {
      return <FaShieldAlt style={{ color: '#6366f1' }} />
    }
    return <FaExclamationCircle style={{ color: '#f59e0b' }} />
  }

  const renderChipCriticidad = (criticidad = 'MEDIUM') => {
    const c = String(criticidad).toUpperCase()
    if (c === 'HIGH' || c === 'CRITICAL' || c === 'ALTA' || c === 'URGENTE') {
      return <span className="notif-chip-criticidad alta">{t('hc4.alta', 'Alta')}</span>
    }
    if (c === 'LOW' || c === 'BAJA') {
      return <span className="notif-chip-criticidad baja">Info</span>
    }
    return null
  }

  const formatearFechaHora = (fechaIso) => {
    if (!fechaIso) return ''
    try {
      const d = new Date(fechaIso)
      return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return fechaIso
    }
  }

  const calcularChipVencimiento = (expiracionMs) => {
    if (!expiracionMs) return null
    const diffMs = expiracionMs - renderTime
    if (diffMs <= 0) return null

    const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    let texto
    let esUrgente = diasRestantes <= 2

    if (diasRestantes <= 1) {
      texto = t('notificaciones.venceHoy', 'Vence hoy')
      esUrgente = true
    } else {
      texto = t('notificaciones.venceEnDias', 'Vence en {{dias}} días', { dias: diasRestantes })
    }

    return (
      <span className={`notif-chip-vencimiento ${esUrgente ? 'urgente' : 'normal'}`}>
        <FaHourglassHalf /> {texto}
      </span>
    )
  }

  const handleCardClick = (n) => {
    setNotificacionModal(n)
    if (!n.leida && n.id) {
      marcarLeida(n.id)
    }
  }

  const cHeader = {
    navBg: esModoOscuro ? '#0f172a' : '#ffffff',
    navBorder: esModoOscuro ? '#334155' : '#e2e8f0',
    navShadow: '0 4px 20px rgba(0,0,0,0.04)',
    accentText: 'var(--brand-text)',
  }

  return (
    <div className="notificaciones-pagina">
      <CatalogTopHeader c={cHeader} mostrarPerfil modoRegistrado />

      <main className="notificaciones-main">
        <div className="notificaciones-header-title">
          <h1>{t('notificaciones.title', 'Notificaciones')}</h1>
          <p>{t('notificaciones.subtitle', 'Consulta tus alertas importantes, eventos de reservas y preferencias de entrega')}</p>
        </div>

        <div className="notificaciones-tabs-container">
          <button
            className={`notificacion-tab-btn ${pestanaActiva === 'generales' ? 'activa' : ''}`}
            onClick={() => setPestanaActiva('generales')}
          >
            <FaBell /> {t('notificaciones.tabGenerales', 'Bandeja de Entrada')}
            {noLeidasGeneralesCount > 0 && (
              <span className="notificacion-tab-badge">{noLeidasGeneralesCount}</span>
            )}
          </button>

          <button
            className={`notificacion-tab-btn ${pestanaActiva === 'preferencias' ? 'activa' : ''}`}
            onClick={() => setPestanaActiva('preferencias')}
          >
            <FaSlidersH /> {t('notificaciones.tabPreferencias', 'Preferencias de Entrega')}
          </button>

          <button
            className={`notificacion-tab-btn ${pestanaActiva === 'promociones' ? 'activa' : ''}`}
            onClick={() => setPestanaActiva('promociones')}
          >
            <FaTag /> {t('notificaciones.tabPromociones', 'Promociones')}
            {sinAplicarCuponesCount > 0 && (
              <span className="notificacion-tab-badge">{sinAplicarCuponesCount}</span>
            )}
          </button>
        </div>

        {pestanaActiva === 'generales' && (
          <div>
            <div className="notif-generales-header-row">
              <div className="notif-filtros-bar">
                <button
                  type="button"
                  className={`notif-filtro-chip ${filtroLectura === 'todas' ? 'activo' : ''}`}
                  onClick={() => setFiltroLectura('todas')}
                >
                  {t('notificaciones.filtroTodas', 'Todas')} ({notificacionesVisibles.length})
                </button>

                <button
                  type="button"
                  className={`notif-filtro-chip ${filtroLectura === 'no_leidas' ? 'activo' : ''}`}
                  onClick={() => setFiltroLectura('no_leidas')}
                >
                  {t('notificaciones.filtroNoLeidas', 'No leídas')} ({noLeidasGeneralesCount})
                </button>

                <button
                  type="button"
                  className={`notif-filtro-chip ${filtroLectura === 'leidas' ? 'activo' : ''}`}
                  onClick={() => setFiltroLectura('leidas')}
                >
                  {t('notificaciones.filtroLeidas', 'Leídas')} ({notificacionesVisibles.length - noLeidasGeneralesCount})
                </button>

                <button
                  type="button"
                  className="notif-filtro-chip"
                  title={t('hc4.sincronizar_notificaciones', 'Sincronizar notificaciones')}
                  onClick={() => cargarNotificaciones()}
                >
                  <FaSyncAlt /> {t('comun.actualizar', 'Actualizar')}
                </button>
              </div>

              {notificacionesVisibles.length > 0 && noLeidasGeneralesCount > 0 && (
                <button className="btn-marcar-todas-leidas" onClick={marcarTodasLeidas}>
                  <FaCheckDouble /> {t('notificaciones.marcarTodasLeidas', 'Marcar todas como leídas')}
                </button>
              )}
            </div>

            {cargando && notificacionesVisibles.length === 0 ? (
              <div className="notif-loading-banner">
                <FaSyncAlt className="pref-spinner" />
                <span>{t('hc.cargando_notificaciones_del_servidor', 'Cargando notificaciones del servidor...')}</span>
              </div>
            ) : notificacionesFiltradas.length === 0 ? (
              <div className="notificaciones-vacio">
                <FaInbox className="notificaciones-vacio-icon" />
                <h3>
                  {filtroLectura === 'no_leidas'
                    ? t('notificaciones.sinNoLeidasTitle', '¡Estás al día!')
                    : t('notificaciones.sinNotificacionesTitle', 'Sin notificaciones')}
                </h3>
                <p>
                  {filtroLectura === 'no_leidas'
                    ? t('notificaciones.sinNoLeidasMsg', 'No tienes mensajes pendientes por leer.')
                    : t('notificaciones.sinNotificacionesMsg', 'Actualmente no tienes mensajes ni alertas pendientes en tu cuenta.')}
                </p>
              </div>
            ) : (
              <div className="notificaciones-lista">
                {notificacionesFiltradas.map((n, idxNotificacion) => {
                  const chipVencimiento = calcularChipVencimiento(n.expiracionMs)
                  const titulo = (n.tituloKey ? t(n.tituloKey, n.tituloFallback || n.titulo || n.title || '') : (n.titulo || n.tituloFallback || n.title || '')).trim()
                  const mensaje = (n.mensajeKey ? t(n.mensajeKey, n.mensajeFallback || n.mensaje || n.message || '') : (n.mensaje || n.mensajeFallback || n.message || '')).trim()
                  const chipCrit = renderChipCriticidad(n.criticidad)

                  return (
                    <div
                      key={n.id || `notificacion-${idxNotificacion}`}
                      className={`notificacion-card-item ${!n.leida ? 'no-leida' : ''}`}
                      onClick={() => handleCardClick(n)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="notif-icono-wrap">{renderIconoNotif(n.tipo)}</div>

                      <div className="notif-contenido">
                        <div className="notif-top-row">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h3 className="notif-titulo">
                              {titulo || t('notificaciones.title', 'Notificación')}
                            </h3>
                            {chipCrit}
                            {(() => {
                              const esPago = String(n.tipo || '').toLowerCase().includes('pago') ||
                                String(n.tipo || '').toLowerCase().includes('payment') ||
                                String(titulo || '').toLowerCase().includes('pago') ||
                                String(titulo || '').toLowerCase().includes('comprobante');
                              if (!esPago) return null;
                              const statusRaw = String(n.metadata?.status || '').toUpperCase();
                              const esRechazado = statusRaw === 'DECLINED' || statusRaw === 'REJECTED' || statusRaw === 'ERROR' || String(titulo || '').toLowerCase().includes('fallo') || String(titulo || '').toLowerCase().includes('problema');
                              return (
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    background: esRechazado ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                                    color: esRechazado ? '#dc2626' : '#059669',
                                    border: `1px solid ${esRechazado ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  {esRechazado ? t('hc2.pago_rechazado', '✕ Pago Rechazado') : t('hc2.pago_exitoso', '✓ Pago Exitoso')}
                                </span>
                              );
                            })()}
                          </div>
                          {!n.leida && <span className="notif-punto-no-leida" />}
                        </div>

                        {n.fechaIso && (
                          <div className="notif-fecha-row">
                            <span>{formatearFechaHora(n.fechaIso)}</span>
                          </div>
                        )}

                        {mensaje && <p className="notif-mensaje">{mensaje}</p>}

                        {n.metadata && (n.metadata.actionPath || n.metadata.actionUrl) && (
                          <div style={{ marginTop: '10px' }}>
                            <button
                              type="button"
                              className="btn-primario"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (!n.leida && n.id) {
                                  marcarLeida(n.id)
                                }
                                const targetUrl = n.metadata.actionPath || n.metadata.actionUrl
                                if (targetUrl.startsWith('http')) {
                                  window.location.href = targetUrl
                                } else {
                                  navigate(targetUrl)
                                }
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 14px',
                                fontSize: '12px',
                                fontWeight: 700,
                                borderRadius: '8px',
                                background: 'var(--brand-primary, #2563eb)',
                                color: '#ffffff',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <span>{n.metadata.actionLabel || t('hc2.continuar_con_mi_reserva', 'Continuar con mi reserva')}</span>
                              <FaArrowRight size={11} />
                            </button>
                          </div>
                        )}

                        {chipVencimiento}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {pestanaActiva === 'preferencias' && (
          <div>
            <DeliveryPreferencesForm />
          </div>
        )}

        {pestanaActiva === 'promociones' && (
          <NotificationsPromotionsTab
            cupones={cupones}
            promosVehiculos={promosVehiculos}
            moneda={moneda}
            navigate={navigate}
            calcularChipVencimiento={calcularChipVencimiento}
            setCondicionesCuponModal={setCondicionesCuponModal}
            setCuponSeleccionadoModal={setCuponSeleccionadoModal}
          />
        )}
      </main>

      {notificacionModal && (
        <NotificationDetailModal
          notificacionId={notificacionModal.id}
          notificacionPrevia={notificacionModal}
          onClose={() => setNotificacionModal(null)}
          onMarkAsRead={(id) => marcarLeida(id)}
        />
      )}

      <CouponModal
        cupon={cuponSeleccionadoModal}
        onClose={() => setCuponSeleccionadoModal(null)}
        onAplicar={aplicarCupon}
      />

      <ConditionsModal
        cupon={condicionesCuponModal}
        onClose={() => setCondicionesCuponModal(null)}
      />
    </div>
  )
}
