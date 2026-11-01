import { FaTicketAlt, FaCar } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/currencyUtils'

export default function NotificationsPromotionsTab({
  cupones,
  promosVehiculos,
  moneda,
  navigate,
  calcularChipVencimiento,
  setCondicionesCuponModal,
  setCuponSeleccionadoModal,
}) {
  const { t } = useTranslation()

  return (
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
              <div className="cupon-notch-left" />
              <div className="cupon-notch-right" />
              <div className="cupon-notch-top" />
              <div className="cupon-notch-bottom" />

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

                  {cup.imagenes && cup.imagenes.length > 0 && (
                    <div className="cupon-vehiculos-thumbs">
                      {cup.imagenes.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={t('hc.vehiculo_elegible', 'Vehículo elegible')}
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
            const chipVencimiento = calcularChipVencimiento(promo.expiracionMs)
            const precioBase = Number(promo.precioBase || 0)
            const isPct = promo.tipoDescuento === 'porcentaje' || Boolean(promo.descuentoPorcentaje)
            const discountVal = Number(promo.valorDescuento || promo.descuentoPorcentaje || 0)
            const precioRebajado = isPct
              ? Math.round(precioBase * (1 - discountVal / 100))
              : Math.max(0, precioBase - discountVal)
            const targetQuery = promo.codigo ? `?promo=${promo.codigo}` : ''
            const targetUrl = `/catalogo/${promo.vehiculoId}${targetQuery}`

            return (
              <div
                key={promo.id}
                className="promo-vehiculo-card"
                onClick={() => navigate(targetUrl)}
              >
                <div className="promo-vehiculo-img-wrap" style={{ position: 'relative' }}>
                  {promo.vehiculoImagen ? (
                    <img src={promo.vehiculoImagen} alt={promo.titulo} />
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
                      {promo.categoriaVehiculo || 'Destacado'}
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
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{t('hc.dia', '/día')}</span>
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
  )
}
