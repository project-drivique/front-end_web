import { useTranslation } from 'react-i18next'
import { useMemo, useState, useEffect } from 'react'
import { FaCar, FaClock, FaCalendarAlt, FaRegCalendarCheck, FaMapMarkerAlt, FaFlag, FaStar } from 'react-icons/fa'
import { formatCurrency } from '@/utils/currencyUtils'
import { contractService } from '@/services/contractService'
import filtrosReservas from '@/config/datos/reservationsFilters.json'

function useContratoReal(reservationId) {
  const [contract, setContract] = useState(null)
  useEffect(() => {
    if (!reservationId) return
    contractService.obtenerPorReserva(reservationId).then(setContract).catch(() => setContract(null))
  }, [reservationId])
  return contract
}

const CLASES_ESTADO = {
  ...Object.fromEntries(filtrosReservas.estados.map(({ valor, clase }) => [valor, clase])),
  pendiente_pago: 'estado-pendiente-pago',
  pending_payment: 'estado-pendiente-pago',
  PENDING_PAYMENT: 'estado-pendiente-pago',
  pendiente_firma: 'estado-pendiente-firma',
  pending_signature: 'estado-pendiente-firma',
  PENDING_SIGNATURE: 'estado-pendiente-firma',
  pendiente_documentos: 'estado-pendiente',
  pendiente_horario: 'estado-pendiente',
  pendiente_efectivo: 'estado-pendiente',
  PENDING_DOCUMENT_REVIEW: 'estado-pendiente',
  PENDING_SCHEDULE: 'estado-pendiente',
  CONFIRMED: 'estado-confirmada',
  ACTIVE: 'estado-en-curso',
  COMPLETED: 'estado-finalizada',
  CANCELLED: 'estado-cancelada',
  CANCELLED_TIMEOUT: 'estado-cancelada',
}

const formatFechaHora = (fecha, idioma) => {
  if (!fecha) return ''
  try {
    const d = new Date(fecha)
    if (isNaN(d.getTime())) return String(fecha)
    return new Intl.DateTimeFormat(idioma || 'es', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(d).replace(/\./g, '')
  } catch {
    return String(fecha)
  }
}

const fechaBonita = (fecha, idioma) => {
  if (!fecha) return '—'
  try {
    const str = String(fecha).trim()
    const d = str.includes('T') ? new Date(str) : new Date(`${str}T00:00:00Z`)
    if (isNaN(d.getTime())) return str
    return new Intl.DateTimeFormat(idioma || 'es', {
      day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
    }).format(d).replace('.', '')
  } catch {
    return String(fecha || '—')
  }
}

const resenaPendiente = (r) => (!r.valoracion && (!r.eligibility || r.eligibility.canReviewVehicle)) || Boolean(r.eligibility?.canReviewBranch)

export default function TarjetaReserva({ reserva, moneda, onValorar, onReportar, onVerDetalle }) {
  const { t, i18n } = useTranslation()
  const reservaAlmacenada = null

  const backendStatus = String(reserva.status || reserva.estadoRaw || '').toUpperCase()
  const isPendingPayment = backendStatus === 'PENDING_PAYMENT' || reserva.estado === 'PENDING_PAYMENT' || reserva.estado === 'pendiente_pago'
  const isPendingDocs = backendStatus === 'PENDING_DOCUMENT_REVIEW' || reserva.estado === 'PENDING_DOCUMENT_REVIEW' || reserva.estado === 'pendiente_documentos'
  const isPendingSchedule = backendStatus === 'PENDING_SCHEDULE' || reserva.estado === 'PENDING_SCHEDULE' || reserva.estado === 'pendiente_horario'

  const rawEstado = backendStatus || reservaAlmacenada?.estado || reserva.estado || ''
  const estadoNorm = String(rawEstado).toLowerCase()
  const contratoFirmado = useContratoReal(reserva.id)
  const tieneContratoFirmado = Boolean(
    contratoFirmado?.signatureUrl ||
    contratoFirmado?.signedAt ||
    contratoFirmado?.statusCode === 'ACTIVE' ||
    contratoFirmado?.firmaUsuarioDataUrl
  )

  const esPagoConfirmado =
    backendStatus === 'CONFIRMED' ||
    backendStatus === 'ACTIVE' ||
    backendStatus === 'COMPLETED' ||
    backendStatus === 'IN_PROGRESS' ||
    backendStatus === 'PENDING_SIGNATURE' ||
    reserva.pagoEstado === 'aprobado' ||
    reservaAlmacenada?.pagoEstado === 'aprobado' ||
    Boolean(reserva.fechaPagoConfirmado) ||
    Boolean(reservaAlmacenada?.fechaPagoConfirmado)

  const esFinalizada = ['finalizada', 'completada', 'finalizado', 'completado', 'completed'].includes(estadoNorm) || backendStatus === 'COMPLETED'
  const esRawEnCurso = estadoNorm === 'activa' || estadoNorm === 'active' || estadoNorm === 'en_curso' || estadoNorm === 'en curso' || backendStatus === 'ACTIVE' || backendStatus === 'IN_PROGRESS'
  const estaEnCurso = esRawEnCurso || estadoNorm === 'en_curso' || estadoNorm === 'activa'
  const puedeReportar = estaEnCurso

  // REGLA CRÍTICA: Si no se ha firmado el contrato, la reserva NO debe salir como confirmada
  const requiereFirma = (backendStatus === 'PENDING_SIGNATURE' || esPagoConfirmado) && !tieneContratoFirmado && !esFinalizada
  const esConfirmada = esPagoConfirmado && (tieneContratoFirmado || esFinalizada) && !requiereFirma

  const estadoClave = requiereFirma
    ? 'PENDING_SIGNATURE'
    : (esConfirmada
      ? (estaEnCurso ? 'activa' : (esFinalizada ? 'finalizada' : 'confirmada'))
      : (isPendingPayment
        ? 'PENDING_PAYMENT'
        : (isPendingDocs
          ? 'PENDING_DOCUMENT_REVIEW'
          : (isPendingSchedule
            ? 'PENDING_SCHEDULE'
            : (reserva.estado || 'pendiente')))))

  const estado = {
    texto: t(`reservas.statuses.${estadoClave}`, { defaultValue: t(`reservas.statuses.${reserva.estado}`, { defaultValue: t('reservas.statuses.pendiente') }) }),
    clase: CLASES_ESTADO[estadoClave] || CLASES_ESTADO[reserva.estado] || CLASES_ESTADO.pendiente
  }
  const sede = reserva.vehiculo?.sucursal || reservaAlmacenada?.vehiculo?.sucursal || t('reservas.defaultBranch')

  const totalTarjeta = useMemo(() => {
    const rawTotal = Number(reserva.total || reserva.totalCOP || 0)
    if (rawTotal > 0) return rawTotal

    const rawStored = reservaAlmacenada
    if (rawStored?.total) return Number(rawStored.total)
    if (rawStored?.totalCOP) return Number(rawStored.totalCOP)

    const precioDia = reserva.vehiculo?.precioDiario || reserva.vehiculo?.precio || 0
    if (precioDia && reserva.fechaInicio && reserva.fechaFin) {
      const f1 = reserva.fechaInicio.split('T')[0]
      const f2 = reserva.fechaFin.split('T')[0]
      const diffDays = f1 === f2 ? 1 : Math.max(1, Math.round(Math.abs(new Date(`${f2}T00:00:00`) - new Date(`${f1}T00:00:00`)) / 86400000) + 1)
      return diffDays * precioDia
    }
    return 0
  }, [reserva, reservaAlmacenada])

  return (
    <article className="reserva-card">
      <div className="reserva-imagen-wrap">
        {reserva.vehiculo?.imagenes?.[0] ? (
          <img src={reserva.vehiculo.imagenes[0]} alt={reserva.vehiculo.nombre} />
        ) : (
          <div className="imagen-vacia"><FaCar /></div>
        )}
        <span className={`estado-badge ${estado.clase}`}>{estado.texto}</span>
      </div>
      <div className="reserva-info">
        <div className="reserva-head">
          <div>
            <div className="reserva-head-meta">
              <span className="reserva-id">{t('reservas.reservationNumber', { id: reserva.codigo || reserva.referencia || reserva.id })}</span>
              {reserva.createdAt && (
                <span className="reserva-creada-badge" title="Fecha en que se realizó la reserva">
                  <FaClock size={11} />
                  <span>Realizada el: <strong>{formatFechaHora(reserva.createdAt, i18n.resolvedLanguage)}</strong></span>
                </span>
              )}
            </div>
            <h2>{reserva.vehiculo?.nombre || t('reservas.vehicleUnavailable')}</h2>
          </div>
          <strong className="reserva-total">{formatCurrency(totalTarjeta, moneda)}</strong>
        </div>
        <div className="reserva-meta">
          <div>
            <FaCalendarAlt />
            <span><small>{t('reservas.pickup')}</small>{fechaBonita(reserva.fechaInicio, i18n.resolvedLanguage)}</span>
          </div>
          <span className="linea-fechas" />
          <div>
            <FaRegCalendarCheck />
            <span><small>{t('reservas.return')}</small>{fechaBonita(reserva.fechaFin, i18n.resolvedLanguage)}</span>
          </div>
          <div className="meta-sede">
            <FaMapMarkerAlt />
            <span><small>{t('reservas.branch')}</small>{sede}</span>
          </div>
        </div>
        <div className="reserva-actions">
          {puedeReportar && (
            <button className="btn-reporte" onClick={() => onReportar(reserva)}>
              <FaFlag size={12} />
              <span>{t('reservas.makeReport', { defaultValue: 'Soporte / Reportar' })}</span>
            </button>
          )}
          {esFinalizada && resenaPendiente(reserva) && (
            <button className="btn-calificar" onClick={() => onValorar(reserva)}>
              <FaStar color="#f59e0b" size={13} />
              <span>{t('reservas.rateAndReview', { defaultValue: 'Calificar y reseñar' })}</span>
            </button>
          )}
          <button className="btn-detalle" onClick={() => onVerDetalle(reserva)}>
            {t('reservas.viewDetail', { defaultValue: 'Ver detalle' })}
          </button>
        </div>
      </div>
    </article>
  )
}
