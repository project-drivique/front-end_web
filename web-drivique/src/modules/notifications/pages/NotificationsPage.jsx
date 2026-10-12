import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaBell,
  FaTag,
  FaCheckCircle,
  FaCreditCard,
  FaFileAlt,
  FaComments,
  FaCar,
  FaExclamationCircle,
  FaHourglassHalf,
  FaCheckDouble,
  FaTicketAlt,
  FaInbox,
  FaCog,
  FaSlidersH,
  FaSyncAlt,
  FaFilter,
  FaFileContract,
  FaShieldAlt,
} from 'react-icons/fa'
import { useLanding } from '@/modules/landing/LandingContext'
import { formatCurrency } from '@/utils/currencyUtils'
import VEHICULOS_MOCK from '@/mocks/vehicles.json'
import CatalogTopHeader from '@/modules/catalog/components/CatalogTopHeader'
import { useNotificationStore } from '../store/useNotificationStore'
import CouponModal from '../components/CouponModal'
import ConditionsModal from '../components/ConditionsModal'
import NotificationDetailModal from '../components/NotificationDetailModal'
import DeliveryPreferencesForm from '../components/DeliveryPreferencesForm'
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
    conteoNoLeidas,
    cargando,
    error,
    cargarNotificaciones,
    marcarLeida,
    marcarTodasLeidas,
    cupones,
    promosVehiculos,
    refrescarPromociones,
    aplicarCupon,
  } = useNotificationStore()

  const [renderTime] = useState(() => Date.now())

  // Cargar notificaciones reales y promociones al montar
  useEffect(() => {
    cargarNotificaciones()
    refrescarPromociones()
  }, [cargarNotificaciones, refrescarPromociones])

  // Notificaciones válidas con contenido de texto
  const notificacionesVisibles = useMemo(() => {
    return (notificaciones || []).filter((n) => {
      if (!n || typeof n !== 'object') return false
      const tit = n.tituloKey ? t(n.tituloKey, n.tituloFallback || n.titulo || n.title || '') : (n.titulo || n.tituloFallback || n.title || '')
      const msg = n.mensajeKey ? t(n.mensajeKey, n.mensajeFallback || n.mensaje || n.message || '') : (n.mensaje || n.mensajeFallback || n.message || '')
      return Boolean((tit && tit.trim()) || (msg && msg.trim()))
    })
  }, [notificaciones, t])

  // Filtradas por estado de lectura
  const notificacionesFiltradas = useMemo(() => {
    if (filtroLectura === 'no_leidas') {
      return notificacionesVisibles.filter((n) => !n.leida)
    }
    if (filtroLectura === 'leidas') {
      return notificacionesVisibles.filter((n) => n.leida)
    }
    return notificacionesVisibles
  }, [notificacionesVisibles, filtroLectura])

  // Conteo no leídas
  const noLeidasGeneralesCount = useMemo(() => {
    return notificacionesVisibles.filter((n) => !n.leida).length
  }, [notificacionesVisibles])

  // Conteo cupones sin aplicar
  const sinAplicarCuponesCount = useMemo(() => {
    return (cupones || []).filter((c) => !c.aplicado).length
  }, [cupones])

  // Helper para iconos según el tipo de evento general
  const renderIconoNotif = (tipo = '') => {
    const raw = String(tipo).toLowerCase()
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
      return <FaComments style={{ color: '#0284c7' }} />
    }
    if (raw.includes('entrega') || raw.includes('devolucion') || raw.includes('alquiler') || raw.includes('vehiculo')) {
      return <FaCar style={{ color: 'var(--brand-text)' }} />
    }
    if (raw.includes('registro') || raw.includes('bienvenida') || raw.includes('seguridad')) {
      return <FaShieldAlt style={{ color: '#6366f1' }} />
    }
    return <FaExclamationCircle style={{ color: '#f59e0b' }} />
  }

  // Chip de criticidad si aplica
  const renderChipCriticidad = (criticidad = 'MEDIUM') => {
    const c = String(criticidad).toUpperCase()
    if (c === 'HIGH' || c === 'CRITICAL' || c === 'ALTA' || c === 'URGENTE') {
      return <span className="notif-chip-criticidad alta">Alta</span>
    }
    if (c === 'LOW' || c === 'BAJA') {
      return <span className="notif-chip-criticidad baja">Info</span>
    }
    return null
  }

  // Formato de fecha legible dd MMM aaaa, HH:mm
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

  // Cálculo de chip de vencimiento en días
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
      {/* Header Superior Principal */}
      <CatalogTopHeader c={cHeader} mostrarPerfil modoRegistrado />

      <main className="notificaciones-main">
        {/* Encabezado */}
        <div className="notificaciones-header-title">
          <h1>{t('notificaciones.title', 'Notificaciones')}</h1>
          <p>{t('notificaciones.subtitle', 'Consulta tus alertas importantes, eventos de reservas y preferencias de entrega')}</p>
        </div>

        {/* Pestañas (Tabs Bar) */}
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

        {/* ── PESTAÑA 1: BANDEJA DE ENTRADA (NOTIFICACIONES REALES) ── */}
        {pestanaActiva === 'generales' && (
          <div>
            {/* Toolbar de filtros y marcar leídas */}
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
                  title="Sincronizar notificaciones"
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

            {/* Spinner de carga */}
            {cargando && notificacionesVisibles.length === 0 ? (
              <div className="notif-loading-banner">
                <FaSyncAlt className="pref-spinner" />
                <span>Cargando notificaciones del servidor...</span>
              </div>
            ) : notificacionesFiltradas.length === 0 ? (
              /* Sin notificaciones */
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
              /* Lista de Notificaciones */
              <div className="notificaciones-lista">
                {notificacionesFiltradas.map((n) => {
                  const chipVencimiento = calcularChipVencimiento(n.expiracionMs)
                  const titulo = (n.tituloKey ? t(n.tituloKey, n.tituloFallback || n.titulo || n.title || '') : (n.titulo || n.tituloFallback || n.title || '')).trim()
                  const mensaje = (n.mensajeKey ? t(n.mensajeKey, n.mensajeFallback || n.mensaje || n.message || '') : (n.mensaje || n.mensajeFallback || n.message || '')).trim()
                  const chipCrit = renderChipCriticidad(n.criticidad)

                  return (
                    <div
                      key={n.id || Math.random()}
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
                          </div>
                          {!n.leida && <span className="notif-punto-no-leida" />}
                        </div>

                        {n.fechaIso && (
                          <div className="notif-fecha-row">
                            <span>{formatearFechaHora(n.fechaIso)}</span>
                          </div>
                        )}

                        {mensaje && <p className="notif-mensaje">{mensaje}</p>}

                        {chipVencimiento}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PESTAÑA 2: PREFERENCIAS DE ENTREGA Y CANALES ── */}
        {pestanaActiva === 'preferencias' && (
          <div>
            <DeliveryPreferencesForm />
          </div>
        )}

        {/* ── PESTAÑA 3: PROMOCIONES Y CUPONES ── */}
        {pestanaActiva === 'promociones' && (
          <div>
            {/* SUBSECCIÓN 1: CUPONES DE RECOMPENSA */}
            <h2 className="promociones-seccion-titulo">
              {t('notificaciones.seccionCupones', 'Más cupones geniales')}
            </h2>

            {(cupones || []).length === 0 ? (
              <div className="notificaciones-vacio" style={{ marginBottom: 32 }}>
                <FaTicketAlt className="notificaciones-vacio-icon" />
                <h3>{t('notificaciones.sinCuponesTitle', 'No tienes cupones vigentes')}</h3>
                <p>{t('notificaciones.sinCuponesMsg', 'Completa más reservas para desbloquear recompensas exclusivas.')}</p>
              </div>
            ) : (
              <div className="cupones-lista">
                {(cupones || []).map((cup) => (
                  <div key={cup.id} className="cupon-ticket-card">
                    {/* 4 Muescas (2 externas + 2 internas) */}
                    <div className="cupon-notch-left" />
                    <div className="cupon-notch-right" />
                    <div className="cupon-notch-top" />
                    <div className="cupon-notch-bottom" />

                    {/* Parte Izquierda del Ticket */}
                    <div className="cupon-ticket-left">
                      <div>
                        <div className="cupon-top-info">
                          <FaTicketAlt color="var(--brand-text)" size={16} />
                          <div>
                            <h3 className="cupon-logro-titulo">{cup.titulo}</h3>
                            {cup.vehiculoNombre ? (
                              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-primary, #2563eb)', display: 'block', marginTop: '2px' }}>
                                🚗 Válido para: {cup.vehiculoNombre}
                              </span>
                            ) : cup.categoriaVehiculo && cup.categoriaVehiculo !== 'Todos' ? (
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', display: 'block', marginTop: '2px' }}>
                                🏷️ Categoría: {cup.categoriaVehiculo}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* Thumbnails del catálogo real */}
                        {cup.imagenes && cup.imagenes.length > 0 && (
                          <div className="cupon-vehiculos-thumbs">
                            {cup.imagenes.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt="Vehículo elegible"
                                className="cupon-thumb-img"
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="cupon-footer-meta">
                        {calcularChipVencimiento(cup.expiracionMs)}
                        <span className="cupon-fecha-otorgado">
                          {t('notificaciones.validoHasta', 'Vence')}: {cup.fechaFin}
                        </span>
                        <button
                          className="cupon-condiciones-link"
                          onClick={() => setCondicionesCuponModal(cup)}
                        >
                          {t('notificaciones.verCondiciones', 'Condiciones')}
                        </button>
                      </div>
                    </div>

                    {/* Parte Derecha del Ticket */}
                    <div className="cupon-ticket-right">
                      <div className="cupon-descuento-monto">{cup.descuentoTexto}</div>

                      <div className="cupon-condicion-reserva">
                        {cup.reservaMinima > 0
                          ? `${t('notificaciones.reservaMinima', 'Reserva mínima')} ${formatCurrency(cup.reservaMinima, moneda)}`
                          : t('notificaciones.sinReservaMinima', 'Sin reserva mínima')}
                      </div>

                      <button
                        className={`btn-aplicar-cupon ${cup.aplicado ? 'aplicado' : ''}`}
                        onClick={() => {
                          if (!cup.aplicado) {
                            setCuponSeleccionadoModal(cup)
                          }
                        }}
                      >
                        {cup.aplicado
                          ? t('notificaciones.cuponAplicado', '✓ Aplicado')
                          : t('notificaciones.aplicarCupon', 'Aplicar')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SUBSECCIÓN 2: PROMOS DE VEHÍCULOS ESPECÍFICOS */}
            <h2 className="promociones-seccion-titulo" style={{ marginTop: 36 }}>
              {t('notificaciones.seccionPromosDestacadas', 'Promociones destacadas')}
            </h2>

            {(promosVehiculos || []).length === 0 ? (
              <div className="notificaciones-vacio">
                <FaCar className="notificaciones-vacio-icon" />
                <h3>{t('notificaciones.sinPromosTitle', 'No hay ofertas de vehículos en este momento')}</h3>
              </div>
            ) : (
              <div className="promos-vehiculos-grid">
                {(promosVehiculos || []).map((promo) => {
                  const vehiculo = VEHICULOS_MOCK.find((v) => Number(v.id) === Number(promo.vehiculoId))
                  const chipVencimiento = calcularChipVencimiento(promo.expiracionMs)
                  const precioBase = promo.precioBase || vehiculo?.precio || 80000
                  const isPct = promo.tipoDescuento === 'porcentaje' || Boolean(promo.descuentoPorcentaje)
                  const discountVal = promo.valorDescuento || promo.descuentoPorcentaje || 10
                  const precioRebajado = isPct
                    ? Math.round(precioBase * (1 - discountVal / 100))
                    : Math.max(0, precioBase - discountVal)
                  const targetQuery = promo.codigo ? `?promo=${promo.codigo}` : `?descuento=${discountVal}`
                  const targetUrl = `/catalogo/${promo.vehiculoId}${targetQuery}`

                  return (
                    <div
                      key={promo.id}
                      className="promo-vehiculo-card"
                      onClick={() => navigate(targetUrl)}
                    >
                      <div className="promo-vehiculo-img-wrap" style={{ position: 'relative' }}>
                        {vehiculo?.imagenes?.[0] || promo.vehiculoImagen ? (
                          <img src={vehiculo?.imagenes?.[0] || promo.vehiculoImagen} alt={promo.titulo} />
                        ) : (
                          <FaCar style={{ fontSize: 40, color: '#94a3b8' }} />
                        )}
                        <span
                          style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            background: 'var(--brand-gradient, var(--brand-primary, #2563eb))',
                            color: 'var(--brand-on-primary, #ffffff)',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            boxShadow: 'var(--brand-shadow, 0 2px 8px rgba(0,0,0,0.25))',
                            zIndex: 2,
                            letterSpacing: '0.02em',
                          }}
                        >
                          {isPct ? `-${discountVal}%` : `-${formatCurrency(discountVal, moneda)}`}
                        </span>
                      </div>

                      <div className="promo-vehiculo-content">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '20px', border: '1px solid #c8efd9' }}>
                            {promo.categoriaVehiculo || vehiculo?.categoria || 'Destacado'}
                          </span>
                        </div>

                        <h4 className="promo-vehiculo-titulo">{promo.titulo}</h4>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '6px 0 10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>
                            {formatCurrency(precioBase, moneda)}
                          </span>
                          <span style={{ fontSize: '18px', fontWeight: 900, color: '#059669' }}>
                            {formatCurrency(precioRebajado, moneda)}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>/día</span>
                        </div>

                        <div className="promo-vehiculo-footer">
                          <span>{promo.fechaPublicacion}</span>
                          {chipVencimiento}
                        </div>

                        <button
                          type="button"
                          className="btn-reservar-promo-destacada"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(targetUrl)
                          }}
                          style={{
                            marginTop: 12,
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 10,
                            background: 'var(--brand-gradient, var(--brand-primary, #2563eb))',
                            color: 'var(--brand-on-primary, #ffffff)',
                            border: 'none',
                            fontWeight: 800,
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            boxShadow: 'var(--brand-shadow, 0 4px 12px rgba(0,0,0,0.15))',
                          }}
                        >
                          <FaCar /> {t('catalogo.reserveNow', 'Reservar ahora')}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Detalle de Notificación (HU-INT-17) */}
      {notificacionModal && (
        <NotificationDetailModal
          notificacionId={notificacionModal.id}
          notificacionPrevia={notificacionModal}
          onClose={() => setNotificacionModal(null)}
          onMarkAsRead={(id) => marcarLeida(id)}
        />
      )}

      {/* Modal Código de Cupón */}
      <CouponModal
        cupon={cuponSeleccionadoModal}
        onClose={() => setCuponSeleccionadoModal(null)}
        onAplicar={aplicarCupon}
      />

      {/* Modal Términos y Condiciones */}
      <ConditionsModal
        cupon={condicionesCuponModal}
        onClose={() => setCondicionesCuponModal(null)}
      />
    </div>
  )
}
