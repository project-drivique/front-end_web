import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
} from 'react-icons/fa'
import { useLanding } from '@/modules/landing/LandingContext'
import { formatCurrency } from '@/utils/currencyUtils'
import VEHICULOS_MOCK from '@/mocks/vehicles.json'
import CatalogTopHeader from '@/modules/catalog/components/CatalogTopHeader'
import { useNotificationStore } from '../store/useNotificationStore'
import CouponModal from '../components/CouponModal'
import ConditionsModal from '../components/ConditionsModal'
import './NotificationsPage.css'

export default function NotificationsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { moneda, tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'

  const [pestanaActiva, setPestanaActiva] = useState('generales') // 'generales' | 'promociones'
  const [cuponSeleccionadoModal, setCuponSeleccionadoModal] = useState(null)
  const [condicionesCuponModal, setCondicionesCuponModal] = useState(null)

  const {
    notificaciones,
    cupones,
    promosVehiculos,
    conteoNoLeidas,
    marcarLeida,
    marcarTodasLeidas,
    aplicarCupon,
  } = useNotificationStore()

  // Conteo no leídas pestaña generales
  const noLeidasGeneralesCount = useMemo(() => {
    return notificaciones.filter((n) => !n.leida).length
  }, [notificaciones])

  // Conteo cupones sin aplicar pestaña promociones
  const sinAplicarCuponesCount = useMemo(() => {
    return cupones.filter((c) => !c.aplicado).length
  }, [cupones])

  // Helper para iconos según el tipo de evento general
  const renderIconoNotif = (tipo) => {
    switch (tipo) {
      case 'reserva_confirmada':
        return <FaCheckCircle style={{ color: '#2563eb' }} />
      case 'pago_validado':
        return <FaCreditCard style={{ color: '#10b981' }} />
      case 'documentos_verificados':
        return <FaFileAlt style={{ color: '#059669' }} />
      case 'soporte_respuesta':
        return <FaComments style={{ color: '#8b5cf6' }} />
      case 'alquiler_finalizado':
        return <FaCar style={{ color: '#3b82f6' }} />
      case 'politica_actualizacion':
      default:
        return <FaExclamationCircle style={{ color: '#f59e0b' }} />
    }
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
    const diffMs = expiracionMs - Date.now()
    if (diffMs <= 0) return null

    const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    let texto = ''
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

  const cHeader = {
    navBg: esModoOscuro ? '#0f172a' : '#ffffff',
    navBorder: esModoOscuro ? '#334155' : '#e2e8f0',
    navShadow: '0 4px 20px rgba(0,0,0,0.04)',
    accentText: esModoOscuro ? '#93c5fd' : '#1e3a8a',
  }

  return (
    <div className="notificaciones-pagina">
      {/* Header Superior Principal */}
      <CatalogTopHeader c={cHeader} mostrarPerfil modoRegistrado />

      <main className="notificaciones-main">
        {/* Encabezado */}
        <div className="notificaciones-header-title">
          <h1>{t('notificaciones.title', 'Notificaciones')}</h1>
          <p>{t('notificaciones.subtitle', 'Consulta tus alertas importantes y promociones exclusivas')}</p>
        </div>

        {/* Pestañas (Tabs Bar) */}
        <div className="notificaciones-tabs-container">
          <button
            className={`notificacion-tab-btn ${pestanaActiva === 'generales' ? 'activa' : ''}`}
            onClick={() => setPestanaActiva('generales')}
          >
            <FaBell /> {t('notificaciones.tabGenerales', 'Generales')}
            {noLeidasGeneralesCount > 0 && (
              <span className="notificacion-tab-badge">{noLeidasGeneralesCount}</span>
            )}
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

        {/* ── PESTAÑA 1: GENERALES ── */}
        {pestanaActiva === 'generales' && (
          <div>
            {/* Header de la pestaña: botón marcar todas leídas */}
            {notificaciones.length > 0 && noLeidasGeneralesCount > 0 && (
              <div className="notif-generales-header-row">
                <span></span>
                <button className="btn-marcar-todas-leidas" onClick={marcarTodasLeidas}>
                  <FaCheckDouble /> {t('notificaciones.marcarTodasLeidas', 'Marcar todas como leídas')}
                </button>
              </div>
            )}

            {/* Sin notificaciones */}
            {notificaciones.length === 0 ? (
              <div className="notificaciones-vacio">
                <FaInbox className="notificaciones-vacio-icon" />
                <h3>{t('notificaciones.sinNotificacionesTitle', 'Sin notificaciones generales')}</h3>
                <p>{t('notificaciones.sinNotificacionesMsg', 'Actualmente no tienes mensajes ni alertas pendientes en tu cuenta.')}</p>
              </div>
            ) : (
              <div className="notificaciones-lista">
                {notificaciones.map((n) => {
                  const chipVencimiento = calcularChipVencimiento(n.expiracionMs)
                  return (
                    <div
                      key={n.id}
                      className={`notificacion-card-item ${!n.leida ? 'no-leida' : ''}`}
                      onClick={() => marcarLeida(n.id)}
                    >
                      <div className="notif-icono-wrap">{renderIconoNotif(n.tipo)}</div>

                      <div className="notif-contenido">
                        <div className="notif-top-row">
                          <h3 className="notif-titulo">
                            {t(n.tituloKey, n.tituloFallback)}
                          </h3>
                          {!n.leida && <span className="notif-punto-no-leida" />}
                        </div>

                        <div className="notif-fecha-row">
                          <span>{formatearFechaHora(n.fechaIso)}</span>
                        </div>

                        <p className="notif-mensaje">{t(n.mensajeKey, n.mensajeFallback)}</p>

                        {chipVencimiento}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PESTAÑA 2: PROMOCIONES ── */}
        {pestanaActiva === 'promociones' && (
          <div>
            {/* SUBSECCIÓN 1: CUPONES DE RECOMPENSA */}
            <h2 className="promociones-seccion-titulo">
              {t('notificaciones.seccionCupones', 'Más cupones geniales')}
            </h2>

            {cupones.length === 0 ? (
              <div className="notificaciones-vacio" style={{ marginBottom: 32 }}>
                <FaTicketAlt className="notificaciones-vacio-icon" />
                <h3>{t('notificaciones.sinCuponesTitle', 'No tienes cupones vigentes')}</h3>
                <p>{t('notificaciones.sinCuponesMsg', 'Completa más reservas para desbloquear recompensas exclusivas.')}</p>
              </div>
            ) : (
              <div className="cupones-lista">
                {cupones.map((cup) => (
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
                          <FaTicketAlt color="#2563eb" size={16} />
                          <h3 className="cupon-logro-titulo">{cup.titulo}</h3>
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
                        {cup.porAgotarse && (
                          <span className="badge-por-agotarse">
                            {t('notificaciones.porAgotarse', '¡Por agotarse!')}
                          </span>
                        )}
                        <span className="cupon-fecha-otorgado">{cup.fechaOtorgado}</span>
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

            {promosVehiculos.length === 0 ? (
              <div className="notificaciones-vacio">
                <FaCar className="notificaciones-vacio-icon" />
                <h3>{t('notificaciones.sinPromosTitle', 'No hay ofertas de vehículos en este momento')}</h3>
              </div>
            ) : (
              <div className="promos-vehiculos-grid">
                {promosVehiculos.map((promo) => {
                  const vehiculo = VEHICULOS_MOCK.find((v) => v.id === promo.vehiculoId)
                  const chipVencimiento = calcularChipVencimiento(promo.expiracionMs)

                  return (
                    <div
                      key={promo.id}
                      className="promo-vehiculo-card"
                      onClick={() => navigate(`/catalogo/${promo.vehiculoId}`)}
                    >
                      <div className="promo-vehiculo-img-wrap">
                        {vehiculo?.imagenes?.[0] ? (
                          <img src={vehiculo.imagenes[0]} alt={promo.titulo} />
                        ) : (
                          <FaCar style={{ fontSize: 40, color: '#94a3b8' }} />
                        )}
                      </div>

                      <div className="promo-vehiculo-content">
                        <h4 className="promo-vehiculo-titulo">{promo.titulo}</h4>

                        <div className="promo-vehiculo-footer">
                          <span>{promo.fechaPublicacion}</span>
                          {chipVencimiento}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>

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
