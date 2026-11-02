import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { FaCalendarAlt, FaCar, FaEye, FaEyeSlash, FaFlag, FaLock, FaMapMarkerAlt, FaRegCalendarCheck, FaShieldAlt, FaStar, FaTimes, FaFileSignature, FaClock } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/utils/currencyUtils'
import { contractService } from '@/services/contractService'
import { useHistorialReservas } from '../hooks/useReservations'
import filtrosReservas from '@/config/datos/reservationsFilters.json'
import CatalogTopHeader from '@/modules/catalog/components/CatalogTopHeader'
import { SUCURSALES } from '@/modules/catalog/constants'
import { construirUrlCheckout, aCentavos } from '@/services/wompiService'

import { useBrand } from '@/contexts/BrandContext'
import { showAlert, getErrorMessage } from '@/utils/swalConfig'
import './ReservationsPage.css'
import PuedeCancelarModal from './ReservationsPage/PuedeCancelarModal'
import EsFinalizadaModal from './ReservationsPage/EsFinalizadaModal'
import EstaEnCursoModal from './ReservationsPage/EstaEnCursoModal'
import EsDocumentosRechazados from './ReservationsPage/EsDocumentosRechazados'
import EsPendienteWompi from './ReservationsPage/EsPendienteWompi'
import EsPendienteEfectivo from './ReservationsPage/EsPendienteEfectivo'
import EsDomicilio from './ReservationsPage/EsDomicilio'
import ModalReservaInfoCard from './ReservationsPage/ModalReservaInfoCard'

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

const coloresTema = (oscuro) => ({
  navBg: oscuro ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.98)',
  navBorder: oscuro ? '#1e293b' : '#e8eef8',
  navShadow: oscuro ? '0 2px 12px rgba(0,0,0,0.25)' : '0 2px 14px rgba(var(--brand-secondary-rgb),0.06)',
  textPrimary: oscuro ? '#f8fafc' : '#111a3a',
  accentText: 'var(--brand-text)',
  heroCardBg: oscuro ? '#111827' : '#ffffff',
  heroCardBorder: oscuro ? '#334155' : '#d9e3f1',
})


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

const getFechaCreacionDate = (r) => {
  const raw = r.createdAt || r.created_at || r.fechaCreacion
  if (raw) {
    const d = new Date(raw)
    if (!isNaN(d.getTime())) return d
  }
  if (r.fechaInicio) {
    const d = new Date(r.fechaInicio)
    if (!isNaN(d.getTime())) return d
  }
  return new Date()
}

const obtenerTituloSeccionFecha = (fechaIsoStr, locale = 'es-CO') => {
  if (!fechaIsoStr || fechaIsoStr === 'desconocida') return 'Otras reservas'
  const clean = String(fechaIsoStr).split('T')[0]
  const [y, m, d] = clean.split('-').map(Number)
  if (!y || !m || !d) return 'Otras reservas'

  const ahora = new Date()
  const yearHoy = ahora.getFullYear()
  const mesHoy = String(ahora.getMonth() + 1).padStart(2, '0')
  const diaHoy = String(ahora.getDate()).padStart(2, '0')
  const hoyStr = `${yearHoy}-${mesHoy}-${diaHoy}`

  const ayerDate = new Date(ahora)
  ayerDate.setDate(ayerDate.getDate() - 1)
  const ayerStr = `${ayerDate.getFullYear()}-${String(ayerDate.getMonth() + 1).padStart(2, '0')}-${String(ayerDate.getDate()).padStart(2, '0')}`

  if (clean === hoyStr) {
    return 'Reservas de hoy'
  }
  if (clean === ayerStr) {
    return 'Ayer'
  }

  const fechaItem = new Date(y, m - 1, d)
  const hoyMid = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
  const diffDias = Math.round((hoyMid.getTime() - fechaItem.getTime()) / (1000 * 60 * 60 * 24))

  const fechaFormateada = fechaItem.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: ahora.getFullYear() === y ? undefined : 'numeric',
  })

  if (diffDias > 1 && diffDias <= 7) {
    return `Hace ${diffDias} días · ${fechaFormateada}`
  }

  return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)
}

const ETIQUETAS_ESTRELLAS = (t) => ({
  1: `😞 ${t('reservas.ratingLabels.1', { defaultValue: 'Mala experiencia' })}`,
  2: `😐 ${t('reservas.ratingLabels.2', { defaultValue: 'Regular' })}`,
  3: `🙂 ${t('reservas.ratingLabels.3', { defaultValue: 'Bueno' })}`,
  4: `😊 ${t('reservas.ratingLabels.4', { defaultValue: 'Muy bueno' })}`,
  5: `🤩 ${t('reservas.ratingLabels.5', { defaultValue: '¡Excelente!' })}`
})

function Estrellas({ value, onChange, disabled = false }) {
  const { t } = useTranslation()
  const [hoverIndex, setHoverIndex] = useState(0)
  const activeRating = hoverIndex || value || 0
  const etiquetas = ETIQUETAS_ESTRELLAS(t)

  return (
    <div className="minimal-estrellas-box">
      <div
        className="minimal-estrellas-grid"
        role="radiogroup"
        aria-label={t('reservas.ratingAria', { defaultValue: 'Calificación por estrellas' })}
        onMouseLeave={() => !disabled && setHoverIndex(0)}
      >
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(n)}
            onMouseEnter={() => !disabled && setHoverIndex(n)}
            className={`minimal-star-btn ${n <= activeRating ? 'activa' : ''}`}
            aria-label={t('reservas.starsCount', { count: n, defaultValue: '{{count}} estrellas' })}
            aria-checked={value === n}
            role="radio"
          >
            <FaStar />
          </button>
        ))}
      </div>
      {!disabled && (
        <div className="minimal-label-status">
          {activeRating > 0 ? (
            <span className="minimal-label-txt-light">
              {etiquetas[activeRating]}
            </span>
          ) : null}
        </div>
      )}
    </div>
  )
}

const resenaPendiente = (r) => (!r.valoracion && (!r.eligibility || r.eligibility.canReviewVehicle)) || Boolean(r.eligibility?.canReviewBranch)

/** Reseñas que el cliente ya publicó para la reserva (vehículo y sucursal), tal como las guarda el servidor. */
function MiResena({ eligibility }) {
  const { t } = useTranslation()
  const items = [
    { clave: 'vehiculo', titulo: t('reservas.myVehicleReview', { defaultValue: 'Tu reseña del vehículo' }), resena: eligibility?.vehicleReview },
    { clave: 'sucursal', titulo: t('reservas.myBranchReview', { defaultValue: 'Tu reseña de la sucursal' }), resena: eligibility?.branchReview },
  ].filter((i) => i.resena)
  if (items.length === 0) return null
  return (
    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map(({ clave, titulo, resena }) => (
        <div key={clave} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <strong style={{ fontSize: 13, color: '#92400e' }}>{titulo}</strong>
            <span aria-label={`${resena.rating} de 5 estrellas`} style={{ display: 'inline-flex', gap: 2 }}>
              {[1, 2, 3, 4, 5].map((n) => <FaStar key={n} size={15} color={n <= Number(resena.rating) ? '#f59e0b' : '#e2e8f0'} />)}
            </span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.5, color: resena.comment ? '#78350f' : '#a16207', fontStyle: resena.comment ? 'normal' : 'italic' }}>
            {resena.comment || t('reservas.noCommentLeft', { defaultValue: 'Calificaste sin dejar un comentario.' })}
          </p>
        </div>
      ))}
    </div>
  )
}

function ModalValoracion({ reserva, onClose, onSave, onSaveSucursal }) {
  const { t } = useTranslation()
  const [estrellas, setEstrellas] = useState(reserva.valoracion?.estrellas || 0)
  const [comentario, setComentario] = useState(reserva.valoracion?.comentario || '')
  const [guardando, setGuardando] = useState(false)
  const [estrellasSucursal, setEstrellasSucursal] = useState(0)
  const [comentarioSucursal, setComentarioSucursal] = useState('')
  const [vehiculoGuardado, setVehiculoGuardado] = useState(false)

  const vehiculoNombre = reserva.vehiculo?.nombre || reserva.vehiculoNombre || t('hc2.este_vehiculo', 'este vehículo')
  const mostrarVehiculo = !vehiculoGuardado && !reserva.valoracion && (!reserva.eligibility || reserva.eligibility.canReviewVehicle)
  const sucursalId = reserva.eligibility?.canReviewBranch ? reserva.eligibility.branchId : null
  const sucursalNombre = reserva.eligibility?.branchName || ''
  const hayAlgoQueEnviar = (mostrarVehiculo && estrellas > 0) || (sucursalId && estrellasSucursal > 0)

  const guardar = async () => {
    if (!hayAlgoQueEnviar) return
    setGuardando(true)
    try {
      if (mostrarVehiculo && estrellas > 0) {
        await onSave(reserva.id, {
          estrellas,
          comentario: comentario.trim()
        })
        setVehiculoGuardado(true)
      }
      if (sucursalId && estrellasSucursal > 0) {
        await onSaveSucursal(reserva.id, sucursalId, {
          estrellas: estrellasSucursal,
          comentario: comentarioSucursal.trim()
        })
      }
      await showAlert({
        icon: 'success',
        title: t('reservas.reviewThanksTitle', '¡Gracias por tu reseña!'),
        text: t('reservas.reviewThanksText', 'Tu opinión quedó registrada con éxito y nos ayuda a mejorar.'),
        confirmButtonText: t('common.accept', 'Aceptar')
      })
      onClose()
    } catch (error) {
      showAlert({
        icon: 'error',
        title: t('common.error', 'Error'),
        text: error?.response?.data?.detail || error?.response?.data?.message || t('reservas.reviewSaveError', 'No fue posible publicar la reseña.')
      })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="modal-backdrop minimal-modal-backdrop" onMouseDown={onClose}>
      <section className="modal-panel minimal-modal-panel valo-panel" role="dialog" aria-modal="true" aria-labelledby="titulo-valoracion" style={{ maxHeight: '92vh', overflowY: 'auto' }} onMouseDown={e => e.stopPropagation()}>
        <button className="minimal-close-btn" onClick={onClose} aria-label={t('reservas.close', { defaultValue: 'Cerrar' })}>
          <FaTimes />
        </button>

        <div className="valo-hero">
          <span className="valo-hero-icon"><FaStar /></span>
          <h2 id="titulo-valoracion" className="minimal-title">
            {t('reservas.howWasTrip', { defaultValue: '¿Cómo estuvo tu viaje?' })}
          </h2>
          <p className="minimal-subtitle">
            {t('reservas.rateExperience', { defaultValue: `Califica tu experiencia con ${vehiculoNombre}.`, vehicle: vehiculoNombre })}
          </p>
        </div>

        <div className="valo-body">
          {mostrarVehiculo && (
            <div className="valo-card">
              <div className="valo-card-head">
                <span className="valo-card-icon"><FaCar /></span>
                <div>
                  <strong>{t('reservas.vehicleReviewTitle', { defaultValue: 'Tu experiencia con el vehículo' })}</strong>
                  <small>{vehiculoNombre}</small>
                </div>
              </div>

              <Estrellas value={estrellas} onChange={setEstrellas} />

              {/* Sección de Comentario Libre */}
              <div className="minimal-textarea-group">
                <div className="minimal-group-head">
                  <label className="minimal-label" htmlFor="comentario">
                    {t('reservas.tellMore', { defaultValue: 'Comentario' })} <span>({t('reservas.optional', { defaultValue: 'opcional' })})</span>
                  </label>
                  <span className="minimal-counter">{comentario.length}/400</span>
                </div>
                <textarea
                  id="comentario"
                  maxLength={400}
                  value={comentario}
                  onChange={e => setComentario(e.target.value)}
                  placeholder={t('reservas.commentPlaceholder', { defaultValue: '¿Qué tal estuvo el estado del vehículo, la limpieza o el servicio?' })}
                  className="minimal-textarea"
                />
              </div>
            </div>
          )}

          {sucursalId && (
            <div className="valo-card">
              <div className="valo-card-head">
                <span className="valo-card-icon"><FaMapMarkerAlt /></span>
                <div>
                  <strong>{t('reservas.branchReviewTitle', { defaultValue: 'Cuéntanos tu experiencia en la sucursal' })}</strong>
                  <small>{sucursalNombre}</small>
                </div>
              </div>

              <Estrellas value={estrellasSucursal} onChange={setEstrellasSucursal} />

              <div className="minimal-textarea-group">
                <div className="minimal-group-head">
                  <label className="minimal-label" htmlFor="comentario-sucursal">
                    {t('reservas.branchTellMore', { defaultValue: 'Tu reseña' })} <span>({t('reservas.optional', { defaultValue: 'opcional' })})</span>
                  </label>
                  <span className="minimal-counter">{comentarioSucursal.length}/400</span>
                </div>
                <textarea
                  id="comentario-sucursal"
                  maxLength={400}
                  value={comentarioSucursal}
                  onChange={e => setComentarioSucursal(e.target.value)}
                  placeholder={t('reservas.branchCommentPlaceholder', { defaultValue: '¿Cómo fue la atención, la entrega y la devolución del vehículo?' })}
                  className="minimal-textarea"
                />
              </div>
            </div>
          )}

          <button className="minimal-submit-btn" disabled={!hayAlgoQueEnviar || guardando} onClick={guardar}>
            {guardando
              ? t('reservas.saving', { defaultValue: 'Guardando...' })
              : t('reservas.publishRating', { defaultValue: 'Publicar valoración' })}
          </button>
        </div>
      </section>
    </div>
  )
}

function ContratoVerCard({ reserva, contratoFirmado, reservaParaContrato, vehiculoParaContrato, identificacion }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [clave, setClave] = useState('')
  const [mostrarClave, setMostrarClave] = useState(false)
  const tieneContratoFirmado = Boolean(
    contratoFirmado?.signatureUrl ||
    contratoFirmado?.signedAt ||
    contratoFirmado?.statusCode === 'ACTIVE' ||
    contratoFirmado?.firmaUsuarioDataUrl
  )
  const [error, setError] = useState('')
  const usuario = useAuthStore(state => state.usuario)
  const targetId = reserva.referencia || reserva.codigo || reserva.id

  const irAContrato = (soloLectura = false) => {
    navigate(`/contrato/${encodeURIComponent(targetId)}`, {
      state: {
        reserva: reservaParaContrato || reserva,
        vehiculo: vehiculoParaContrato || reserva.vehiculo,
        soloLectura
      }
    })
  }

  // Si el contrato aún NO ha sido firmado, mostrar directamente la acción para firmarlo
  if (!tieneContratoFirmado) {
    return (
      <div className="contrato-card desbloqueada" style={{ border: '1.5px solid var(--brand-primary)', background: 'linear-gradient(180deg, var(--brand-soft) 0%, #ffffff 100%)', borderRadius: '16px', padding: '18px 20px', marginTop: '16px' }}>
        <div className="contrato-subcard" style={{ textAlign: 'center' }}>
          <div className="contrato-icon-wrap" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--brand-soft-strong)', color: 'var(--brand-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <FaFileSignature size={22} />
          </div>

          <h3 className="contrato-card-titulo" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--brand-text)', margin: '0 0 6px' }}>
            {t('reservas.readyToSign', { defaultValue: 'Firma de Contrato Digital Pendiente' })}
          </h3>

          <p className="contrato-card-desc" style={{ fontSize: '13px', color: '#334155', margin: '0 0 16px', lineHeight: 1.5 }}>
            {t('reservas.readyToSignDesc', { defaultValue: 'Tu pago ha sido confirmado con éxito. Procede a firmar digitalmente tu contrato para completar la reserva y acceder al documento protegido.' })}
          </p>

          <button
            type="button"
            onClick={() => irAContrato(false)}
            className="contrato-action-btn activo"
            style={{ width: '100%', padding: '12px 20px', background: 'linear-gradient(135deg, var(--brand-primary-hover) 0%, var(--brand-primary) 100%)', color: '#ffffff', borderRadius: '10px', fontWeight: 800, fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(var(--brand-primary-rgb),0.25)' }}
          >
            <FaFileSignature size={15} />
            <span>{t('reservas.signContractNow', { defaultValue: 'Proceder a Firmar Contrato' })}</span>
          </button>
        </div>
      </div>
    )
  }

  const validar = () => {
    if (!clave || !clave.trim()) {
      setError(t('reservas.noIdentification', { defaultValue: 'Por favor ingresa tu número de identificación o clave.' }))
      return
    }

    // Solo se abre con la cédula o identificación registrada en la reserva; ninguna otra clave sirve
    const normalizar = (v) => String(v || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    const c = normalizar(clave)
    const registradas = [
      identificacion,
      reservaParaContrato?.datosForm?.numDoc,
      reserva.clienteDocumento,
      contratoFirmado?.contratoOriginal?.reserva?.datosForm?.numDoc,
      usuario?.cedula,
    ].map(normalizar).filter(Boolean)

    if (c && registradas.includes(c)) {
      setError('')
      irAContrato(true)
    } else {
      setError(t('reservas.wrongIdentification', { defaultValue: 'La clave ingresada no coincide.' }))
    }
  }

  return (
    <div className="contrato-card desbloqueada">
      <div className="contrato-subcard">
        <div className="contrato-icon-wrap">
          <FaLock size={22} />
        </div>

        <h3 className="contrato-card-titulo">
          {t('reservas.contractProtected', { defaultValue: 'Contrato firmado y protegido' })}
        </h3>

        <p className="contrato-card-desc">
          {t('reservas.enterIdToViewContract', { defaultValue: 'Ingresa tu número de documento o clave para ver y descargar tu contrato oficial.' })}
        </p>

        <div className="contrato-card-form">
          <div className="contrato-input-box">
            <input
              id="input-clave-contrato"
              type={mostrarClave ? 'text' : 'password'}
              value={clave}
              onChange={(e) => { setClave(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && validar()}
              placeholder={t('reservas.enterPasswordPlaceholder', { defaultValue: 'Ingrese su clave o documento' })}
              aria-label={t('reservas.enterPasswordPlaceholder', { defaultValue: 'Ingrese su clave o documento' })}
              className="contrato-card-input"
            />
            <button
              type="button"
              onClick={() => setMostrarClave(v => !v)}
              aria-label={mostrarClave ? t('reservas.hidePassword', { defaultValue: 'Ocultar clave' }) : t('reservas.showPassword', { defaultValue: 'Mostrar clave' })}
              className="contrato-eye-btn"
            >
              {mostrarClave ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {error && <p className="contrato-error-msg">{error}</p>}

          <button
            type="button"
            onClick={validar}
            className="contrato-action-btn activo"
          >
            <span>{t('reservas.viewContract', { defaultValue: 'Ver y Descargar Contrato' })}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function useContratoReal(reservationId) {
  const [contract, setContract] = useState(null)
  useEffect(() => {
    if (!reservationId) return
    contractService.obtenerPorReserva(reservationId).then(setContract).catch(() => setContract(null))
  }, [reservationId])
  return contract
}

function Contrato({ reserva }) {
  const { t } = useTranslation()
  const usuario = useAuthStore(state => state.usuario)
  const contratoFirmado = useContratoReal(reserva.id)
  const reservaAlmacenada = null

  // REGLA: Si no se ha firmado el contrato, la reserva NO pasa a confirmada

  const reservaParaContrato = useMemo(() => {
    const base = contratoFirmado?.contratoOriginal?.reserva || reservaAlmacenada || reserva || {}
    const df = base.datosForm || {}
    const rd = base.reservaDetalles || {}
    const nombreCliente = df.nombre || [df.nombres, df.apellidos].filter(Boolean).join(' ').trim() || base.clienteNombre || usuario?.nombre || t('hc2.cliente_drivique', 'Cliente Drivique')
    const correoCliente = df.correo || base.clienteCorreo || usuario?.correo || usuario?.email || ''
    const telCliente = df.celular || df.telefono || base.clienteTelefono || usuario?.telefono || ''
    const docCliente = df.numDoc || df.documento || base.clienteDocumento || usuario?.cedula || ''
    const ref = base.referencia || base.codigo || base.id || reserva.id

    const licName = df.licenciaPdf?.name || (typeof df.licenciaPdf === 'string' && df.licenciaPdf) 
    const cedName = df.cedulaPdf?.name || (typeof df.cedulaPdf === 'string' && df.cedulaPdf) 

    return {
      ...base,
      referencia: ref,
      codigo: ref,
      id: ref,
      total: base.total || base.totalCOP || reserva.total || 0,
      seguroIdx: base.seguroIdx ?? reserva.seguroIdx ?? 0,
      serviciosSeleccionados: base.serviciosSeleccionados || reserva.serviciosSeleccionados || [],
      datosForm: {
        ...df,
        nombre: nombreCliente,
        correo: correoCliente,
        celular: telCliente,
        telefono: telCliente,
        tipoDoc: df.tipoDoc || usuario?.tipoDocumento || 'CC',
        numDoc: docCliente,
        cedulaPdf: cedName,
        licenciaPdf: licName,
        direccion: df.direccion || usuario?.direccion || ''
      },
      reservaDetalles: {
        ...rd,
        fechaInicio: rd.fechaInicio || reserva.fechaInicio,
        fechaFin: rd.fechaFin || reserva.fechaFin,
        horaInicio: rd.horaInicio || '08:00',
        horaFin: rd.horaFin || '18:00',
        sucursalRetiro: rd.sucursalRetiro || reserva.sucursalRetiro || reserva.sucursal || reserva.vehiculo?.sucursal || '',
        sucursalDevolucion: rd.sucursalDevolucion || reserva.sucursalDevolucion || reserva.sucursal || reserva.vehiculo?.sucursal || '',
        metodoPago: rd.metodoPago || reserva.metodoPago || reserva.pasarela || (reserva.metodoPago === 'efectivo' ? 'efectivo' : 'tarjeta'),
        sucursalPagoEfectivo: rd.sucursalPagoEfectivo || reserva.sucursalPagoEfectivo || reserva.sucursal || reserva.vehiculo?.sucursal || ''
      }
    }
  }, [reserva, contratoFirmado, reservaAlmacenada, usuario])

  const vehiculoParaContrato = useMemo(() => {
    const base = contratoFirmado?.contratoOriginal?.vehiculo || reservaAlmacenada?.vehiculo || reserva.vehiculo || {}
    return {
      ...base,
      nombre: base.nombre || (base.marca ? `${base.marca} ${base.modelo || ''}` : t('hc2.vehiculo_drivique', 'Vehículo Drivique')),
      placa: base.placa || 'ABC-123',
      color: base.color || 'Plata',
      año: base.año || base.anio || 2024,
      sucursal: base.sucursal || reserva.sucursal || '',
      servicios: base.servicios || [],
      seguros: base.seguros || [{ nombre: t('hc2.proteccion_basica_estandar', 'Protección Básica Estándar') }]
    }
  }, [reserva, contratoFirmado, reservaAlmacenada])

  const identificacion = useMemo(() => {
    return reservaParaContrato?.datosForm?.numDoc || reserva.clienteDocumento || usuario?.cedula || ''
  }, [reservaParaContrato, reserva, usuario])

  return (
    <ContratoVerCard
      reserva={reserva}
      contratoFirmado={contratoFirmado}
      reservaParaContrato={reservaParaContrato}
      vehiculoParaContrato={vehiculoParaContrato}
      identificacion={identificacion}
    />
  )
}

function ModalDetalle({ reserva, moneda, autoDesbloquear = false, onClose, onValorar, onReportar, onCancelar }) {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { brand } = useBrand() || {}
  const usuario = useAuthStore(state => state.usuario)
  const [cancelando, setCancelando] = useState(false)

  const contrato = useContratoReal(reserva.id)
  const reservaOriginal = contrato?.contratoOriginal?.reserva
  const vehiculoOriginal = contrato?.contratoOriginal?.vehiculo || reserva.vehiculo

  const backendStatus = String(reserva.status || reserva.estadoRaw || '').toUpperCase()
  const isPendingPayment = backendStatus === 'PENDING_PAYMENT' || reserva.estado === 'PENDING_PAYMENT' || reserva.estado === 'pendiente_pago'
  const isPendingDocs = backendStatus === 'PENDING_DOCUMENT_REVIEW' || reserva.estado === 'PENDING_DOCUMENT_REVIEW' || reserva.estado === 'pendiente_documentos'
  const isPendingSchedule = backendStatus === 'PENDING_SCHEDULE' || reserva.estado === 'PENDING_SCHEDULE' || reserva.estado === 'pendiente_horario'

  const esEfectivo = Boolean(reserva.cashPaymentCode) || Boolean(reservaOriginal?.cashPaymentCode) || (reserva.metodoPago === 'efectivo' && !isPendingPayment)
  const rawEstadoModal = backendStatus || reservaOriginal?.estado || reserva.estado || ''
  const estadoNormModal = String(rawEstadoModal).toLowerCase()
  const contratoData = contrato
  const tieneContratoFirmado = Boolean(
    contratoData?.signatureUrl ||
    contratoData?.signedAt ||
    contratoData?.statusCode === 'ACTIVE' ||
    contratoData?.firmaUsuarioDataUrl
  )

  const esPagoConfirmadoModal =
    backendStatus === 'CONFIRMED' ||
    backendStatus === 'ACTIVE' ||
    backendStatus === 'COMPLETED' ||
    backendStatus === 'IN_PROGRESS' ||
    backendStatus === 'PENDING_SIGNATURE' ||
    estadoNormModal === 'confirmada' ||
    estadoNormModal === 'confirmed' ||
    estadoNormModal === 'activa' ||
    estadoNormModal === 'active' ||
    estadoNormModal === 'en_curso' ||
    estadoNormModal === 'en curso' ||
    estadoNormModal === 'finalizada' ||
    estadoNormModal === 'completada' ||
    estadoNormModal === 'completed' ||
    estadoNormModal === 'pagada' ||
    reservaOriginal?.pagoEstado === 'aprobado' ||
    reserva.pagoEstado === 'aprobado' ||
    Boolean(reservaOriginal?.fechaPagoConfirmado) ||
    Boolean(reserva.fechaPagoConfirmado)

  const esFinalizadaModal = ['finalizada', 'completada', 'finalizado', 'completado', 'completed'].includes(estadoNormModal) || backendStatus === 'COMPLETED'

  // Solo se cancela mientras no hay pago: pendiente de pago, en revisión de documentos o en espera del horario de la sucursal.
  // Con la reserva ya pagada, confirmada, en curso o finalizada el botón no se ofrece.
  const puedeCancelarModal = isPendingPayment || isPendingDocs || isPendingSchedule

  const handleCancelarReserva = async () => {
    const result = await showAlert({
      icon: 'warning',
      title: t('reservas.cancelTitle', { defaultValue: '¿Cancelar reserva?' }),
      text: t('reservas.cancelConfirmText', { defaultValue: '¿Estás seguro de que deseas cancelar esta reserva? Esta acción liberará el vehículo.' }),
      showCancelButton: true,
      confirmButtonText: t('reservas.yesCancel', { defaultValue: 'Sí, cancelar reserva' }),
      cancelButtonText: t('common.no', { defaultValue: 'No, mantener' }),
      confirmButtonColor: '#dc2626'
    })
    if (result?.isConfirmed) {
      setCancelando(true)
      try {
        await onCancelar(reserva.id)
        await showAlert({
          icon: 'success',
          title: t('reservas.cancelledTitle', { defaultValue: 'Reserva cancelada' }),
          text: t('reservas.cancelledDesc', { defaultValue: 'La reserva ha sido cancelada exitosamente.' })
        })
        onClose()
      } catch (err) {
        await showAlert({
          icon: 'error',
          title: t('common.error', { defaultValue: 'Error' }),
          text: err?.message || 'No se pudo cancelar la reserva.'
        })
      } finally {
        setCancelando(false)
      }
    }
  }

  // Regla estricta: Si no se ha firmado el contrato, la reserva NO debe salir confirmada
  const requiereFirmaModal = (backendStatus === 'PENDING_SIGNATURE' || esPagoConfirmadoModal) && !tieneContratoFirmado && !esFinalizadaModal
  const esConfirmadaModal = esPagoConfirmadoModal && (tieneContratoFirmado || esFinalizadaModal) && !requiereFirmaModal

  const esRawEnCursoModal =
    estadoNormModal === 'activa' ||
    estadoNormModal === 'active' ||
    estadoNormModal === 'en_curso' ||
    estadoNormModal === 'en curso' ||
    backendStatus === 'ACTIVE' ||
    backendStatus === 'IN_PROGRESS'
  const estaEnCursoModal = esRawEnCursoModal || estadoNormModal === 'en_curso' || estadoNormModal === 'activa'

  const estadoClaveModal = requiereFirmaModal
    ? 'PENDING_SIGNATURE'
    : (esConfirmadaModal
      ? (estaEnCursoModal ? 'activa' : (esFinalizadaModal ? 'finalizada' : 'confirmada'))
      : (isPendingPayment
        ? 'PENDING_PAYMENT'
        : (isPendingDocs
          ? 'PENDING_DOCUMENT_REVIEW'
          : (isPendingSchedule
            ? 'PENDING_SCHEDULE'
            : (reserva.estado || 'pendiente')))))

  const estado = {
    texto: t(`reservas.statuses.${estadoClaveModal}`, { defaultValue: t(`reservas.statuses.${reserva.estado}`, { defaultValue: t('reservas.statuses.pendiente') }) }),
    clase: CLASES_ESTADO[estadoClaveModal] || CLASES_ESTADO[reserva.estado] || CLASES_ESTADO.pendiente
  }

  const nombreAuto = reserva.vehiculo?.nombre || vehiculoOriginal?.nombre || (reserva.vehiculo?.marca ? `${reserva.vehiculo.marca} ${reserva.vehiculo.modelo || ''}` : t('hc2.vehiculo', 'Vehículo'))
  const imagenAuto = reserva.vehiculo?.imagenes?.[0] || vehiculoOriginal?.imagenes?.[0] || reserva.vehiculo?.imagen || vehiculoOriginal?.imagen
  const seguroIdx = reservaOriginal?.seguroIdx ?? reserva.seguroIdx ?? 0
  const proteccion = reserva.seguroNombre || reserva.reservaDetalles?.seguro || (vehiculoOriginal?.seguros?.[seguroIdx]?.nombre) || reservaOriginal?.reservaDetalles?.seguro || t('hc2.proteccion_basica_estandar', 'Protección Básica Estándar')
  const esDocumentosRechazados = !esConfirmadaModal && (
    reserva.estado === 'DOCUMENTOS_RECHAZADOS' ||
    backendStatus === 'DOCUMENTOS_RECHAZADOS' ||
    reservaOriginal?.estado === 'DOCUMENTOS_RECHAZADOS' ||
    reserva.estadoDocumentos === 'RECHAZADO' ||
    reservaOriginal?.estadoDocumentos === 'RECHAZADO'
  )
  const esPendienteHorario = !esConfirmadaModal && !isPendingPayment && !esDocumentosRechazados && (
    isPendingSchedule ||
    reserva.estado === 'PENDIENTE_HORARIO' ||
    reserva.estado === 'pendiente_horario'
  )
  const esPendienteValidacion = !esConfirmadaModal && !isPendingPayment && !esPendienteHorario && !esDocumentosRechazados && (
    isPendingDocs ||
    reserva.estado === 'PENDIENTE_VALIDACION' ||
    reserva.estado === 'pendiente_documentos' ||
    (reservaOriginal?.estado === 'PENDING_DOCUMENT_REVIEW' && !backendStatus) ||
    (reservaOriginal?.estadoDocumentos === 'PENDIENTE' && !backendStatus)
  )

  // Si el pago ya se confirmó (aunque falte firmar el contrato) no se muestra nada de "pendiente de pago" ni su plazo
  const esPendienteEfectivo = !esPagoConfirmadoModal && !esConfirmadaModal && !esPendienteValidacion && !esPendienteHorario && !esDocumentosRechazados && (
    reserva.estado === 'PENDIENTE_EFECTIVO' ||
    Boolean(reserva.cashPaymentCode) ||
    Boolean(reservaOriginal?.cashPaymentCode) ||
    (esEfectivo && (estadoNormModal === 'pendiente' || !reserva.estado))
  )
  const esPendienteWompi = !esEfectivo && !esPendienteEfectivo && !esPagoConfirmadoModal && !esConfirmadaModal && !esPendienteValidacion && !esPendienteHorario && !esDocumentosRechazados && (
    isPendingPayment ||
    estadoNormModal === 'pendiente' ||
    estadoNormModal === 'pending_payment' ||
    reserva.estado === 'PENDING_PAYMENT'
  )

  const sucursalPago = reservaOriginal?.reservaDetalles?.sucursalPagoEfectivo || reserva.vehiculo?.sucursal || ''
  const branchObj = SUCURSALES.find(s => s.nombre === sucursalPago)
  const ciudadPago = branchObj?.ciudad || reserva.vehiculo?.ciudad || 'Neiva'
  const direccionPago = branchObj?.direccion || 'Calle 9 # 8-25, Centro'

  // Normalización completa de la reserva para el contrato oficial
  const reservaParaContrato = useMemo(() => {
    const base = contrato?.contratoOriginal?.reserva || reservaOriginal || reserva || {}
    const df = base.datosForm || {}
    const rd = base.reservaDetalles || {}
    const nombreCliente = df.nombre || [df.nombres, df.apellidos].filter(Boolean).join(' ').trim() || base.clienteNombre || usuario?.nombre || t('hc2.cliente_drivique', 'Cliente Drivique')
    const correoCliente = df.correo || base.clienteCorreo || usuario?.correo || usuario?.email || ''
    const telCliente = df.celular || df.telefono || base.clienteTelefono || usuario?.telefono || ''
    const docCliente = df.numDoc || df.documento || base.clienteDocumento || usuario?.cedula || ''
    const ref = base.referencia || base.codigo || base.id || reserva.id

    const licName = df.licenciaPdf?.name || (typeof df.licenciaPdf === 'string' && df.licenciaPdf) 
    const cedName = df.cedulaPdf?.name || (typeof df.cedulaPdf === 'string' && df.cedulaPdf) 

    return {
      ...base,
      referencia: ref,
      codigo: ref,
      id: ref,
      total: base.total || base.totalCOP || reserva.total || 0,
      seguroIdx: base.seguroIdx ?? reserva.seguroIdx ?? 0,
      serviciosSeleccionados: base.serviciosSeleccionados || reserva.serviciosSeleccionados || [],
      datosForm: {
        ...df,
        nombre: nombreCliente,
        correo: correoCliente,
        celular: telCliente,
        telefono: telCliente,
        tipoDoc: df.tipoDoc || usuario?.tipoDocumento || 'CC',
        numDoc: docCliente,
        cedulaPdf: cedName,
        licenciaPdf: licName,
        direccion: df.direccion || usuario?.direccion || ''
      },
      reservaDetalles: {
        ...rd,
        fechaInicio: rd.fechaInicio || reserva.fechaInicio,
        fechaFin: rd.fechaFin || reserva.fechaFin,
        horaInicio: rd.horaInicio || '08:00',
        horaFin: rd.horaFin || '18:00',
        sucursalRetiro: rd.sucursalRetiro || reserva.sucursalRetiro || reserva.sucursal || reserva.vehiculo?.sucursal || '',
        sucursalDevolucion: rd.sucursalDevolucion || reserva.sucursalDevolucion || reserva.sucursal || reserva.vehiculo?.sucursal || '',
        metodoPago: rd.metodoPago || reserva.metodoPago || reserva.pasarela || (reserva.metodoPago === 'efectivo' ? 'efectivo' : 'tarjeta'),
        sucursalPagoEfectivo: rd.sucursalPagoEfectivo || reserva.sucursalPagoEfectivo || reserva.sucursal || reserva.vehiculo?.sucursal || ''
      }
    }
  }, [reserva, contrato, reservaOriginal, usuario])

  const totalCalculado = useMemo(() => {
    const rawTotal = Number(reserva.total || reservaOriginal?.total || reservaOriginal?.totalCOP || reservaParaContrato?.total || reserva.totalCOP || 0)
    if (rawTotal > 0) return rawTotal

    const v = reserva.vehiculo || vehiculoOriginal
    const precioDia = v?.precioDiario || v?.precio || 0
    const fInicio = reserva.fechaInicio || reserva.reservaDetalles?.fechaInicio
    const fFin = reserva.fechaFin || reserva.reservaDetalles?.fechaFin
    if (precioDia && fInicio && fFin) {
      const f1 = fInicio.split('T')[0]
      const f2 = fFin.split('T')[0]
      const diffDays = f1 === f2 ? 1 : Math.max(1, Math.round(Math.abs(new Date(`${f2}T00:00:00`) - new Date(`${f1}T00:00:00`)) / 86400000) + 1)
      return diffDays * precioDia
    }
    return rawTotal
  }, [reserva, reservaOriginal, reservaParaContrato, vehiculoOriginal])

  // Normalización completa del vehículo para el contrato oficial

  // Resolver Lugar de Retiro y Devolución
  const resolverLugar = (loc, dom) => {
    if (!loc) return sucursalPago
    if (loc === 'domicilio') {
      return dom ? `${t('reservas.atHome', 'A Domicilio')} (${dom})` : t('reservas.atHome', 'A Domicilio')
    }
    if (loc === 'aeropuerto') return 'Aeropuerto'
    if (loc === 'terminal') return 'Terminal'
    return loc
  }

  const lugarRetiroRaw = reserva.sucursalRetiro || reservaOriginal?.sucursalRetiro || reservaOriginal?.reservaDetalles?.sucursalRetiro || reserva.vehiculo?.sucursal || vehiculoOriginal?.sucursal || sucursalPago
  const domicilioRetiro = reserva.domicilioDireccion || reservaOriginal?.domicilioDireccion || reservaOriginal?.reservaDetalles?.domicilioDireccion

  const lugarDevolucionRaw = reserva.sucursalDevolucion || reservaOriginal?.sucursalDevolucion || reservaOriginal?.reservaDetalles?.sucursalDevolucion || lugarRetiroRaw
  // Si el retiro es a domicilio pero la devolución es en sucursal, no se arrastra la dirección del retiro
  const domicilioDevolucion = reserva.domicilioDevolucionDireccion || reservaOriginal?.domicilioDevolucionDireccion || (lugarDevolucionRaw === 'domicilio' ? domicilioRetiro : undefined)

  const lugarRetiro = resolverLugar(lugarRetiroRaw, domicilioRetiro)
  const lugarDevolucion = resolverLugar(lugarDevolucionRaw, domicilioDevolucion)

  const esDomicilioRetiro = lugarRetiroRaw === 'domicilio' || Boolean(domicilioRetiro)
  const esDomicilioDevolucion = lugarDevolucionRaw === 'domicilio' || Boolean(domicilioDevolucion)
  const esDomicilio = esDomicilioRetiro || esDomicilioDevolucion

  // Logística del domicilio según el servidor: conductor, estado y PIN (el PIN solo lo recibe el dueño de la reserva)
  const puntosDomicilio = (reserva.deliveryPoints || reservaOriginal?.deliveryPoints || []).filter((p) => p.modality === 'HOME_DELIVERY')
  const puntoActivo = puntosDomicilio.find((p) => p.deliveryStatus !== 'COMPLETED') || puntosDomicilio[puntosDomicilio.length - 1] || null
  const domicilioEstado = !puntoActivo || puntoActivo.deliveryStatus === 'PENDING'
    ? 'EN_PREPARACION'
    : puntoActivo.deliveryStatus === 'ASSIGNED'
      ? 'EN_CAMINO'
      : (puntoActivo.pointType === 'PICKUP' ? 'ENTREGADO' : 'RECOGIDO')
  const domicilioConductor = puntoActivo?.driverName || ''
  const domicilioTelefonoConductor = puntoActivo?.driverPhone || ''
  const domicilioPin = puntoActivo?.deliveryPin || ''

  const [revelarPin, setRevelarPin] = useState(false)
  const [verMasDomicilio, setVerMasDomicilio] = useState(false)

  // Resolver Medio / Canal de Pago
  const resolverMedioPago = () => {
    const rawEfectivo =
      esEfectivo ||
      reserva.metodoPago === 'efectivo' ||
      reservaOriginal?.reservaDetalles?.metodoPago === 'efectivo' ||
      reserva.metodoPagoConfirmado === 'efectivo' ||
      reservaOriginal?.metodoPagoConfirmado === 'efectivo' ||
      reserva.estado === 'PENDIENTE_EFECTIVO' ||
      reservaOriginal?.estado === 'PENDIENTE_EFECTIVO' ||
      reserva.pasarela === 'efectivo'

    if (rawEfectivo) {
      return t('hc2.efectivo_en_sucursal_245', 'Efectivo en sucursal')
    }

    const sub = String(
      reserva.medioPago ||
      reserva.subMetodoPago ||
      reserva.metodoPagoDetalle ||
      reserva.tipoPago ||
      reserva.wompiMetodo ||
      reserva.pasarelaMetodo ||
      reserva.formaPago ||
      reservaOriginal?.medioPago ||
      reservaOriginal?.subMetodoPago ||
      reservaOriginal?.reservaDetalles?.subMetodoPago ||
      reservaOriginal?.reservaDetalles?.medioPago ||
      ''
    ).toLowerCase().trim()

    if (sub.includes('nequi')) return t('hc2.pago_wompi_nequi', 'Pago Wompi - Nequi')
    if (sub.includes('daviplata')) return t('hc2.pago_wompi_daviplata', 'Pago Wompi - Daviplata')
    if (sub.includes('efectivo') && sub.includes('bancolombia')) return t('hc2.pago_wompi_efectivo_bancolombia', 'Pago Wompi - Efectivo Bancolombia')
    if (sub.includes('bancolombia')) return t('hc2.pago_wompi_bancolombia', 'Pago Wompi - Bancolombia')
    if (sub.includes('pse')) return t('hc2.pago_wompi_pse', 'Pago Wompi - PSE')
    if (sub.includes('tarjeta') || sub.includes('card') || sub.includes('credito') || sub.includes('debito')) return t('hc2.pago_wompi_tarjeta', 'Pago Wompi - Tarjeta')

    if (sub && sub !== 'wompi' && sub !== 'digital') {
      return t('hc3.wompi_method', { defaultValue: 'Pago Wompi - {{metodo}}', metodo: sub.charAt(0).toUpperCase() + sub.slice(1) })
    }

    return t('hc2.pago_wompi', 'Pago Wompi')
  }

  const medioPagoTexto = resolverMedioPago()

  const [pagandoWompi, setPagandoWompi] = useState(false)
  const wompiCardRef = useRef(null)

  useEffect(() => {
    if (isPendingPayment || autoDesbloquear) {
      const timer = setTimeout(() => {
        wompiCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isPendingPayment, autoDesbloquear])

  const handlePagarWompi = async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (
      isPendingDocs ||
      reserva.estado === 'PENDING_DOCUMENT_REVIEW' ||
      reserva.status === 'PENDING_DOCUMENT_REVIEW' ||
      reservaOriginal?.estado === 'PENDING_DOCUMENT_REVIEW' ||
      reserva.estado === 'pendiente_documentos' ||
      reserva.estadoDocumentos === 'PENDIENTE'
    ) {
      showAlert({
        icon: 'info',
        title: t('hc6.docs_en_revision_titulo', { defaultValue: 'Documentos en revisión' }),
        text: t('hc6.docs_en_revision_alerta', {
          defaultValue: 'La sucursal aún está revisando tus documentos. Podrás pagar una vez que sean aprobados por el encargado de la sucursal.'
        })
      })
      return
    }

    if (
      isPendingSchedule ||
      reserva.estado === 'PENDING_SCHEDULE' ||
      reserva.status === 'PENDING_SCHEDULE' ||
      reserva.estado === 'pendiente_horario'
    ) {
      showAlert({
        icon: 'info',
        title: t('reservas.pendingScheduleTitle', { defaultValue: 'En espera de horario' }),
        text: t('reservas.pendingScheduleText', {
          defaultValue: 'Tu reserva fue registrada fuera del horario de atención de la sucursal. Se habilitará para pago al inicio de la jornada de atención.'
        })
      })
      return
    }
    setPagandoWompi(true)
    try {
      const baseRef = reserva.codigo || reserva.referencia || reserva.id || reservaOriginal?.referencia
      const attemptRef = `${baseRef}_${Date.now()}`
      sessionStorage.setItem('current_wompi_reference', baseRef)
      sessionStorage.setItem('current_wompi_attempt_ref', attemptRef)
      const rawTotal = reserva.total ?? reservaOriginal?.total ?? 0
      const totalNum = typeof rawTotal === 'number' ? rawTotal : parseFloat(String(rawTotal).replace(/[^0-9.-]+/g, '')) || 0
      const centavos = aCentavos(totalNum)
      const url = await construirUrlCheckout({
        reference: attemptRef,
        contractId: contrato?.id || null,
        amountInCents: centavos,
        redirectUrl: `${window.location.origin}/respuesta`,
      })
      window.location.href = url
    } catch (err) {
      console.error('Error al generar enlace Wompi:', err)
      setPagandoWompi(false)
      showAlert({
        icon: 'error',
        title: t('common.error', 'Error'),
        text: getErrorMessage(err, t('reservas.wompiError', { defaultValue: 'No se pudo conectar con la pasarela de pagos de Wompi. Por favor intenta nuevamente.' }))
      })
    }
  }

  const formatHoraAmPm = (hora24) => {
    if (!hora24) return ''
    const [h, m] = hora24.split(':').map(Number)
    const ampm = h >= 12 ? 'p. m.' : 'a. m.'
    let hour12 = h % 12
    if (hour12 === 0) hour12 = 12
    return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="detalle-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-reserva-titulo"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="detalle-modal-acento" />
        
        <button
          className="modal-cerrar"
          onClick={onClose}
          aria-label={t('reservas.closeDetail', { defaultValue: 'Cerrar' })}
        >
          <FaTimes size={14} />
        </button>

        {/* Encabezado */}
        <div className="detalle-modal-head-custom">
          <h2 id="detalle-reserva-titulo" className="detalle-modal-titulo">
            {esPendienteEfectivo
              ? t('reservas.pendingCashPayment', { defaultValue: 'Pendiente de pago en efectivo' })
              : (esPendienteWompi ? t('reservas.pendingDigitalPayment', { defaultValue: 'Pago Digital Pendiente' }) : t('reservas.reservationWithStatus', { status: estado.texto.toLowerCase(), defaultValue: `Reserva ${estado.texto.toLowerCase()}` }))}
          </h2>
          <p className="detalle-modal-subtitulo">
            {nombreAuto}
          </p>
        </div>

        {/* Tarjeta Padre: Contenedor de Galería y Datos */}
        <ModalReservaInfoCard estado={estado} formatHoraAmPm={formatHoraAmPm} i18n={i18n} imagenAuto={imagenAuto} lugarDevolucion={lugarDevolucion} lugarRetiro={lugarRetiro} medioPagoTexto={medioPagoTexto} moneda={moneda} nombreAuto={nombreAuto} proteccion={proteccion} reserva={reserva} t={t} totalCalculado={totalCalculado} />

        {/* Tarjeta de Domicilio (Logo, Código Nequi sin vencimiento, Campos Completos + Hora) */}
        {esDomicilio && (
          <EsDomicilio brand={brand} ciudadPago={ciudadPago} domicilioConductor={domicilioConductor} domicilioDevolucion={domicilioDevolucion} domicilioEstado={domicilioEstado} domicilioPin={domicilioPin} domicilioRetiro={domicilioRetiro} domicilioTelefonoConductor={domicilioTelefonoConductor} esDomicilioDevolucion={esDomicilioDevolucion} esDomicilioRetiro={esDomicilioRetiro} formatHoraAmPm={formatHoraAmPm} reserva={reserva} reservaOriginal={reservaOriginal} revelarPin={revelarPin} setRevelarPin={setRevelarPin} setVerMasDomicilio={setVerMasDomicilio} t={t} verMasDomicilio={verMasDomicilio} />
        )}

        {/* Tarjeta de Pago en Efectivo por Sucursal */}
        {esPendienteEfectivo && (
          <EsPendienteEfectivo brand={brand} ciudadPago={ciudadPago} direccionPago={direccionPago} moneda={moneda} reserva={reserva} sucursalPago={sucursalPago} t={t} totalCalculado={totalCalculado} />
        )}

        {/* Tarjeta de Pago Digital Pendiente Wompi (si aplica) */}
        {esPendienteWompi && (
          <EsPendienteWompi handlePagarWompi={handlePagarWompi} moneda={moneda} pagandoWompi={pagandoWompi} reserva={reserva} t={t} totalCalculado={totalCalculado} wompiCardRef={wompiCardRef} />
        )}

        {/* Tarjeta de Reserva en Espera de Horario de Atención */}
        {esPendienteHorario && (
          <div className="modal-wompi-card" style={{ borderColor: 'rgba(var(--brand-primary-rgb), 0.4)', background: 'linear-gradient(180deg, rgba(239, 246, 255, 0.7) 0%, rgba(255, 255, 255, 1) 100%)' }}>
            <div className="modal-wompi-subcard">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <FaClock style={{ fontSize: '24px', color: 'var(--brand-text)' }} />
                <h3 className="modal-wompi-titulo" style={{ margin: 0, color: 'var(--brand-text)' }}>
                  En Espera de Apertura de Sucursal
                </h3>
              </div>
              <p className="modal-wompi-desc" style={{ color: 'var(--brand-text)' }}>
                Tu reserva fue registrada fuera del horario de atención de la sucursal <strong>{reserva.sucursal || sucursalPago}</strong>. En cuanto la sede inicie su jornada de atención, recibirás una notificación automática por correo, web y push para proceder con el pago y confirmación de tu reserva.
              </p>
              <div style={{ padding: '10px 14px', background: 'var(--brand-soft-strong)', borderRadius: '10px', fontSize: '13px', color: 'var(--brand-text)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <FaClock /> Estado: Esperando apertura de sucursal
              </div>
            </div>
          </div>
        )}

        {/* Tarjeta de Documentación en Proceso de Validación */}
        {esPendienteValidacion && (
          <div className="modal-wompi-card" style={{ borderColor: 'rgba(var(--brand-primary-rgb), 0.4)', background: 'linear-gradient(180deg, rgba(239, 246, 255, 0.7) 0%, rgba(255, 255, 255, 1) 100%)' }}>
            <div className="modal-wompi-subcard">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <FaShieldAlt style={{ fontSize: '24px', color: 'var(--brand-text)' }} />
                <h3 className="modal-wompi-titulo" style={{ margin: 0, color: 'var(--brand-text)' }}>
                  Documentación en Proceso de Validación
                </h3>
              </div>
              <p className="modal-wompi-desc" style={{ color: 'var(--brand-text)' }}>
                Tus documentos de identidad y licencia de conducción están siendo revisados por el encargado de la sucursal <strong>{reserva.sucursal || sucursalPago}</strong>. En cuanto los documentos sean aprobados, tu reserva se confirmará automáticamente y se habilitará la firma digital del contrato.
              </p>
              <div style={{ padding: '10px 14px', background: 'var(--brand-soft-strong)', borderRadius: '10px', fontSize: '13px', color: 'var(--brand-text)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <FaClock /> Estado: En revisión por encargado de sucursal
              </div>
            </div>
          </div>
        )}

        {/* Tarjeta de Documentación Rechazada */}
        {esDocumentosRechazados && (
          <EsDocumentosRechazados navigate={navigate} reserva={reserva} sucursalPago={sucursalPago} t={t} />
        )}

        {(esConfirmadaModal || requiereFirmaModal) && <Contrato reserva={reserva} autoDesbloquear={autoDesbloquear} />}

        {estaEnCursoModal && onReportar && (
          <EstaEnCursoModal onReportar={onReportar} reserva={reserva} t={t} />
        )}

        {esFinalizadaModal && <MiResena eligibility={reserva.eligibility} />}

        {esFinalizadaModal && onValorar && resenaPendiente(reserva) && (
          <EsFinalizadaModal onValorar={onValorar} reserva={reserva} t={t} />
        )}

        {puedeCancelarModal && onCancelar && (
          <PuedeCancelarModal cancelando={cancelando} handleCancelarReserva={handleCancelarReserva} t={t} />
        )}

      </section>
    </div>
  )
}

function TarjetaReserva({ reserva, moneda, onValorar, onReportar, onVerDetalle }) {
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

export default function ReservationsPage() {
  const { t, i18n } = useTranslation()
  const { moneda, tema } = useLanding(), navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { reservas, cargando, error, cancelarReserva, guardarValoracion, guardarResenaSucursal } = useHistorialReservas()
  const [mes, setMes] = useState('todos'), [estadoFiltro, setEstadoFiltro] = useState('todos'), [valorando, setValorando] = useState(null), [detalle, setDetalle] = useState(null)

  const detalleIdUrl = searchParams.get('detalle') || location.state?.detalleId
  const autoDesbloquear = searchParams.get('desbloquear') === 'true' || location.state?.autoDesbloquear === true
  const prevDetalleIdRef = useRef(null)

  // Enlace del correo "Calificar y reseñar mi experiencia": /reservas?calificar=<código de la reserva>
  const calificarUrl = searchParams.get('calificar')
  const calificarAbiertoRef = useRef(false)
  useEffect(() => {
    if (!calificarUrl || calificarAbiertoRef.current || reservas.length === 0) return
    const objetivo = reservas.find((r) => String(r.codigo || r.referencia || '').toUpperCase() === calificarUrl.trim().toUpperCase())
    if (!objetivo) return
    calificarAbiertoRef.current = true
    const pendiente = (!objetivo.valoracion && (!objetivo.eligibility || objetivo.eligibility.canReviewVehicle)) || objetivo.eligibility?.canReviewBranch
    if (objetivo.estado === 'finalizada' && pendiente) setValorando(objetivo)
  }, [calificarUrl, reservas])

  useEffect(() => {
    if (detalleIdUrl && reservas.length > 0) {
      if (prevDetalleIdRef.current !== detalleIdUrl) {
        prevDetalleIdRef.current = detalleIdUrl
        const cleanId = String(detalleIdUrl).split('_')[0].trim().toUpperCase()
        const encontrada = reservas.find(r => 
          String(r.id).toUpperCase() === cleanId || 
          String(r.codigo || '').toUpperCase() === cleanId || 
          String(r.referencia || '').toUpperCase() === cleanId ||
          String(r.id) === String(detalleIdUrl) ||
          r.codigo === detalleIdUrl ||
          r.referencia === detalleIdUrl
        )
        if (encontrada) {
          setDetalle(encontrada)
        }
      }
    }
  }, [detalleIdUrl, reservas])

  useEffect(() => {
    if (detalle && reservas?.length > 0) {
      const encontrada = reservas.find(
        r => r.id === detalle.id || r.referencia === detalle.referencia || r.codigo === detalle.codigo
      )
      if (encontrada && (encontrada.status !== detalle.status || encontrada.estado !== detalle.estado)) {
        setDetalle(encontrada)
      }
    }
  }, [reservas])

  const handleVerDetalle = (reserva) => {
    setDetalle(reserva)
  }

  const handleCerrarDetalle = () => {
    setDetalle(null)
    prevDetalleIdRef.current = '__closed__'
    if (searchParams.get('detalle') || searchParams.get('desbloquear') || location.state?.detalleId) {
      navigate('/reservas', { replace: true, state: {} })
    }
  }

  const filtradas = useMemo(() => reservas.filter(r => {
    const d = getFechaCreacionDate(r)
    const mesCreacion = String(d.getMonth() + 1).padStart(2, '0')
    const mesInicio = r.fechaInicio ? r.fechaInicio.slice(5, 7) : null
    const coincideMes = mes === 'todos' || mesCreacion === mes || mesInicio === mes
    const coincideEstado = estadoFiltro === 'todos' || r.estado === estadoFiltro
    return coincideMes && coincideEstado
  }), [reservas, mes, estadoFiltro])

  const seccionesReservas = useMemo(() => {
    const mapa = new Map()
    for (const r of filtradas) {
      const rawDate = r.createdAt || r.created_at || r.fechaReserva || r.fechaCreacion || r.fechaInicio || ''
      const fechaKey = String(rawDate).split('T')[0] || 'desconocida'
      const lista = mapa.get(fechaKey) || []
      lista.push(r)
      mapa.set(fechaKey, lista)
    }
    const fechasOrdenadas = Array.from(mapa.keys()).sort((a, b) => b.localeCompare(a))
    return fechasOrdenadas.map((fechaKey) => ({
      fechaKey,
      titulo: obtenerTituloSeccionFecha(fechaKey === 'desconocida' ? null : fechaKey, i18n?.resolvedLanguage || 'es-CO'),
      reservas: mapa.get(fechaKey) || [],
    }))
  }, [filtradas, i18n?.resolvedLanguage])

  const reportar = reserva => navigate(`/soporte?reserva=${encodeURIComponent(reserva.id)}&vehiculo=${encodeURIComponent(reserva.vehiculo?.nombre || '')}&placa=${encodeURIComponent(reserva.vehiculo?.placa || '')}`, { state: { reservaId: reserva.id, vehiculo: reserva.vehiculo?.nombre, placa: reserva.vehiculo?.placa } })
  const c = coloresTema(tema === 'oscuro')
  return <div className="catalogo-page reservas-page"><CatalogTopHeader c={c} mostrarPerfil modoRegistrado /><main className="reservas-main">
    <div className="reservas-titlebar">
      <div><p className="eyebrow">{t('reservas.activity')}</p><h1>{t('reservas.title')}</h1><p>{t('reservas.pageSubtitle')}</p></div>
      <div className="reservas-filtros">
        <label className="filtro-select"><FaCalendarAlt /><span>{t('reservas.filterByMonth')}</span><select value={mes} onChange={e => setMes(e.target.value)}><option value="todos">{t('reservas.allMonths')}</option>{filtrosReservas.meses.map(item => <option key={item.valor} value={item.valor}>{t(`reservas.months.${item.valor}`)}</option>)}</select></label>
        <label className="filtro-select"><FaCar /><span>{t('reservas.filterByStatus')}</span><select value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)}><option value="todos">{t('reservas.allStatuses')}</option>{filtrosReservas.estados.map(item => <option key={item.valor} value={item.valor}>{t(`reservas.statuses.${item.valor}`)}</option>)}</select></label>
      </div>
    </div>
    {!cargando && !error && <p className="resultados-label">{t('reservas.resultsFound', { count: filtradas.length })}</p>}
    {cargando && <div className="estado-pagina">{t('reservas.loading')}</div>}{!cargando && error && <div className="estado-pagina error">{error}</div>}
  {!cargando && !error && filtradas.length === 0 && <div className="estado-pagina vacio"><div><FaCalendarAlt /></div><h2>{reservas.length ? t('reservas.noFilteredResults') : t('reservas.noReservations')}</h2><p>{reservas.length ? t('reservas.changeFilters') : t('reservas.noReservationsSubtitle')}</p>{reservas.length ? <button className="btn-primario" onClick={() => { setMes('todos'); setEstadoFiltro('todos') }}>{t('reservas.clearFilters')}</button> : <Link className="btn-primario" to="/home">{t('reservas.exploreVehicles')}</Link>}</div>}
    {!cargando && !error && filtradas.length > 0 && (
      <div className="reservas-secciones">
        {seccionesReservas.map(sec => (
          <div key={sec.fechaKey} className="seccion-reservas-bloque">
            <div className="seccion-header">
              <span className="seccion-punto" />
              <h2 className="seccion-titulo">{sec.titulo}</h2>
              <span className="seccion-contador">
                {sec.reservas.length} {sec.reservas.length === 1 ? t('reservas.singleReservation', { defaultValue: 'reserva' }) : t('reservas.multipleReservations', { defaultValue: 'reservas' })}
              </span>
              <span className="seccion-linea" />
            </div>
            <div className="reservas-lista">
              {sec.reservas.map(r => (
                <TarjetaReserva
                  key={r.id}
                  reserva={r}
                  moneda={moneda}
                  onValorar={setValorando}
                  onReportar={reportar}
                  onVerDetalle={handleVerDetalle}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
  </main>{detalle && <ModalDetalle reserva={detalle} moneda={moneda} autoDesbloquear={autoDesbloquear} onClose={handleCerrarDetalle} onValorar={setValorando} onReportar={reportar} onCancelar={cancelarReserva} />}{valorando && <ModalValoracion reserva={valorando} onClose={() => setValorando(null)} onSave={async (id, val) => {
    const res = await guardarValoracion(id, val)
    if (detalle && (detalle.id === id || detalle.referencia === id || detalle.codigo === id)) {
      setDetalle(prev => prev ? { ...prev, valoracion: res } : null)
    }
  }} onSaveSucursal={async (id, branchId, val) => {
    await guardarResenaSucursal(id, branchId, val)
    setValorando((prev) => prev ? { ...prev, eligibility: { ...(prev.eligibility || {}), canReviewBranch: false } } : prev)
  }} />}</div>
}

