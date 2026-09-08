import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { FaCalendarAlt, FaCar, FaCheckCircle, FaChevronDown, FaDownload, FaEye, FaEyeSlash, FaFileContract, FaFlag, FaKey, FaLock, FaMapMarkerAlt, FaMoneyBillWave, FaRegCalendarCheck, FaScroll, FaShieldAlt, FaStar, FaTimes, FaInfoCircle, FaCreditCard, FaFileSignature, FaPenNib } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/utils/currencyUtils'
import { contractService } from '@/services/contractService'
import { useHistorialReservas } from '../hooks/useReservations'
import filtrosReservas from '@/mocks/reservationsFilters.json'
import CatalogTopHeader from '@/modules/catalog/components/CatalogTopHeader'
import { descargarContratoOriginal, prepararVistaContrato } from '@/modules/contracts/utils/downloadSignedContract'
import { reservationService } from '@/services/reservationService'
import { SUCURSALES } from '@/modules/catalog/constants'
import { construirUrlCheckout, aCentavos } from '@/services/wompiService'
import logo from '@/assets/logo.png'
import { useBrand } from '@/contexts/BrandContext'
import './ReservationsPage.css'

const CLASES_ESTADO = Object.fromEntries(filtrosReservas.estados.map(({ valor, clase }) => [valor, clase]))

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

function Estrellas({ value, onChange, disabled = false }) {
  const { t } = useTranslation()
  return <div className="estrellas" role="radiogroup" aria-label={t('reservas.ratingAria')}>
    {[1, 2, 3, 4, 5].map(n => <button key={n} type="button" disabled={disabled} onClick={() => onChange?.(n)}
      className={n <= value ? 'estrella activa' : 'estrella'} aria-label={t('reservas.starsCount', { count: n })} aria-checked={value === n} role="radio"><FaStar /></button>)}
  </div>
}

function ModalValoracion({ reserva, onClose, onSave }) {
  const { t } = useTranslation()
  const [estrellas, setEstrellas] = useState(reserva.valoracion?.estrellas || 0)
  const [comentario, setComentario] = useState(reserva.valoracion?.comentario || '')
  const [guardando, setGuardando] = useState(false)
  const guardar = async () => {
    if (!estrellas) return
    setGuardando(true); await onSave(reserva.id, { estrellas, comentario: comentario.trim() }); setGuardando(false); onClose()
  }
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="titulo-valoracion" onMouseDown={e => e.stopPropagation()}>
    <button className="modal-cerrar" onClick={onClose} aria-label={t('reservas.close')}><FaTimes /></button><div className="modal-icon"><FaStar /></div>
    <p className="eyebrow">{t('reservas.yourExperience')}</p><h2 id="titulo-valoracion">{reserva.valoracion ? t('reservas.editYourRating') : t('reservas.howWasTrip')}</h2>
    <p className="modal-subtitulo">{t('reservas.rateExperience', { vehicle: reserva.vehiculo?.nombre })}</p><Estrellas value={estrellas} onChange={setEstrellas} />
    <label className="comentario-label" htmlFor="comentario">{t('reservas.tellMore')} <span>({t('reservas.optional')})</span></label>
    <textarea id="comentario" maxLength={400} value={comentario} onChange={e => setComentario(e.target.value)} placeholder={t('reservas.commentPlaceholder')} />
    <div className="contador">{comentario.length}/400</div><button className="btn-primario modal-guardar" disabled={!estrellas || guardando} onClick={guardar}>
      {guardando ? t('reservas.saving') : reserva.valoracion ? t('reservas.saveChanges') : t('reservas.publishRating')}</button>
  </section></div>
}

function ContratoVerCard({ reserva, contratoFirmado, reservaParaContrato, vehiculoParaContrato, identificacion, autoDesbloquear = false, esConfirmada = false }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [clave, setClave] = useState('')
  const [mostrarClave, setMostrarClave] = useState(false)
  const tieneContratoFirmado = Boolean(contratoFirmado?.firmaUsuarioDataUrl)
  const [desbloqueado, setDesbloqueado] = useState(() => Boolean(autoDesbloquear && tieneContratoFirmado))
  const [error, setError] = useState('')
  const [descargando, setDescargando] = useState(false)
  const contratoVisualRef = useRef(null)
  const [preparandoVista, setPreparandoVista] = useState(false)
  const [vistaPreparada, setVistaPreparada] = useState(false)
  const usuario = useAuthStore(state => state.usuario)

  useEffect(() => {
    if (autoDesbloquear && tieneContratoFirmado) {
      setDesbloqueado(true)
    }
  }, [autoDesbloquear, tieneContratoFirmado])

  const validar = () => {
    if (!tieneContratoFirmado) return
    if (!identificacion && !clave) {
      setError(t('reservas.noIdentification', { defaultValue: 'Por favor ingresa tu número de identificación.' }))
      return
    }
    const normalizar = valor => String(valor || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    if (!identificacion || normalizar(clave) === normalizar(identificacion)) {
      setDesbloqueado(true)
      setError('')
    } else {
      setError(t('reservas.wrongIdentification', { defaultValue: 'El número de identificación no coincide con el registrado.' }))
    }
  }

  const descargar = async () => {
    if (descargando) return
    setDescargando(true)
    try {
      if (!reservaParaContrato || !vehiculoParaContrato) throw new Error(t('reservas.originalDataMissing'))
      const docReserva = String(reservaParaContrato?.datosForm?.numDoc || '').replace(/\D/g, '')
      const docUsuario = String(usuario?.cedula || '').replace(/\D/g, '')
      if (docReserva && docUsuario && docReserva !== docUsuario) throw new Error(t('reservas.notReservationOwner'))
      let contratoDescarga = contratoFirmado
      if (!contratoFirmado?.contratoOriginal) {
        contratoDescarga = contractService.completarContratoOriginal(reserva.id, {
          reserva: JSON.parse(JSON.stringify(reservaParaContrato)),
          vehiculo: JSON.parse(JSON.stringify(vehiculoParaContrato)),
          idioma: i18n.resolvedLanguage || i18n.language || 'es',
          guardadoEn: contratoFirmado?.firmadoEn || new Date().toISOString(),
          migradoDesdeReserva: true,
        })
      }
      await descargarContratoOriginal({ contrato: contratoDescarga, elementoContrato: contratoVisualRef.current })
      setError('')
    } catch (e) { setError(e.message) }
    finally { setDescargando(false) }
  }

  useEffect(() => {
    if (!desbloqueado || vistaPreparada || !reservaParaContrato || !vehiculoParaContrato) return
    let activo = true
    const preparar = async () => {
      setPreparandoVista(true)
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      try {
        await prepararVistaContrato({ elementoContrato: contratoVisualRef.current, contrato: contratoFirmado })
        if (!activo) return
        setVistaPreparada(true)
        setError('')
      } catch (e) { if (activo) setError(e.message) }
      finally { if (activo) setPreparandoVista(false) }
    }
    preparar()
    return () => { activo = false }
  }, [desbloqueado, vistaPreparada, reservaParaContrato, vehiculoParaContrato, contratoFirmado, reserva.id])

  // Vista desbloqueada: mostrar contrato completo + descarga
  if (desbloqueado && tieneContratoFirmado) {
    return (
      <div className="contrato-desbloqueado-card">
        <div className="contrato-desbloqueado-head">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <strong className="contrato-desbloqueado-status">
              {t('reservas.originalSignedContract', { defaultValue: 'Contrato firmado original' })}
            </strong>
            <span className="contrato-desbloqueado-codigo">
              {contratoFirmado.codigo || reserva.numeroContrato || reserva.id}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDesbloqueado(false)}
            className="contrato-bloquear-btn"
          >
            {t('reservas.lock', { defaultValue: 'Bloquear' })}
          </button>
        </div>
        <div className="contrato-vista-html" ref={contratoVisualRef} />
        {preparandoVista && <div className="contrato-vista-progreso">{t('reservas.optimizingDocument', { defaultValue: 'Optimizando documento...' })}</div>}
        <div className="contrato-acciones-doc">
          <button className="contrato-descargar" onClick={descargar} disabled={descargando || preparandoVista || !vistaPreparada}>
            <span className="contrato-descarga-icon"><FaDownload /></span>
            <span>
              <strong>{descargando ? t('reservas.preparingDocument') : t('reservas.downloadContract')}</strong>
              <small>{t('reservas.originalPdf')}</small>
            </span>
          </button>
        </div>
        {error && <p className="clave-error" role="alert" style={{ textAlign: 'center' }}>{error}</p>}
      </div>
    )
  }

  // Vista bloqueada: siempre presente (bloqueada si no firmado, desbloqueable si firmado)
  return (
    <div className="contrato-card-padre">
      {/* Encabezado superior de la Tarjeta Padre */}
      <div className="contrato-padre-header">
        <div className="contrato-padre-meta">
          <span className="contrato-padre-eyebrow">
            <FaFileContract /> {t('reservas.legalDocumentation', { defaultValue: 'DOCUMENTACIÓN LEGAL' })}
          </span>
          <h4 className="contrato-padre-titulo">
            {t('reservas.digitalRentalContract', { defaultValue: 'Contrato Digital de Alquiler' })}
          </h4>
        </div>
        <span className={`contrato-padre-badge-status ${tieneContratoFirmado ? 'firmado' : 'protegido'}`}>
          <FaShieldAlt />
          {tieneContratoFirmado
            ? t('reservas.digitalSignatureCompleted', { defaultValue: 'Firma Digital Completada' })
            : t('reservas.contractProtected', { defaultValue: 'Contrato Protegido' })}
        </span>
      </div>

      {/* SUBTARJETA INTERIOR (La que lleva el contenido) */}
      <div className="contrato-subtarjeta">
        <div className="contrato-subtarjeta-icon-wrap">
          <FaLock size={22} color="var(--brand-primary, #2563eb)" />
        </div>

        <h3 className="contrato-subtarjeta-titulo">
          {tieneContratoFirmado
            ? t('reservas.viewSignedContract', { defaultValue: 'Ver contrato firmado' })
            : t('reservas.contractProtected', { defaultValue: 'Contrato protegido' })}
        </h3>

        <p className="contrato-subtarjeta-desc">
          {tieneContratoFirmado
            ? t('reservas.enterIdToViewContract', { defaultValue: 'Ingresa tu número de cédula o identificación registrada para ver o descargar tu contrato en PDF.' })
            : t('reservas.availableAfterSigning', { defaultValue: 'El contrato estará disponible para ver una vez hayas completado la firma digital.' })}
        </p>

        <div className="contrato-subtarjeta-form">
          <div className="contrato-subtarjeta-input-box">
            <input
              id="input-clave-contrato"
              type={mostrarClave ? 'text' : 'password'}
              value={clave}
              disabled={!tieneContratoFirmado}
              onChange={(e) => { setClave(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && validar()}
              placeholder={t('reservas.enterIdentificationPlaceholder', { defaultValue: 'Ingresa tu cédula o identificación' })}
              aria-label={t('reservas.enterIdentificationPlaceholder', { defaultValue: 'Ingresa tu cédula o identificación' })}
              className="contrato-subtarjeta-input"
            />
            <button
              type="button"
              disabled={!tieneContratoFirmado}
              onClick={() => setMostrarClave(v => !v)}
              aria-label={mostrarClave ? t('reservas.hidePassword', { defaultValue: 'Ocultar clave' }) : t('reservas.showPassword', { defaultValue: 'Mostrar clave' })}
              className="contrato-subtarjeta-eye"
            >
              {mostrarClave ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {error && <p className="contrato-subtarjeta-error">{error}</p>}

          <button
            type="button"
            onClick={validar}
            disabled={!tieneContratoFirmado}
            className={`contrato-subtarjeta-btn ${!tieneContratoFirmado ? 'bloqueado' : 'activo'}`}
          >
            <FaFileContract size={15} />
            <span>{t('reservas.viewSignedContract', { defaultValue: 'Ver contrato firmado' })}</span>
          </button>

          {esConfirmada && !tieneContratoFirmado && (
            <button
              type="button"
              onClick={() => navigate(`/contrato/${reserva.id}`, { state: { reserva, vehiculo: reserva.vehiculo } })}
              className="contrato-firmar-link"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--brand-primary, #2563eb)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '4px',
                textDecoration: 'underline'
              }}
            >
              <FaPenNib size={12} />
              <span>{t('reservas.readAndSign', { defaultValue: 'Leer y firmar contrato digital' })}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Contrato({ reserva, autoDesbloquear = false }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const usuario = useAuthStore(state => state.usuario)
  const [contratoLocal, setContratoLocal] = useState(() => contractService.obtenerPorReserva(reserva.id))

  const contratoFirmado = contratoLocal || contractService.obtenerPorReserva(reserva.id)
  const reservaAlmacenada = useMemo(() => reservationService.obtenerPorReferencia(reserva.id), [reserva.id])

  const tieneContratoFirmado = Boolean(contratoFirmado?.firmaUsuarioDataUrl)
  const estadoNorm = String(reserva.estado || '').toLowerCase()
  const esConfirmada = estadoNorm === 'confirmada' || estadoNorm === 'activa' || estadoNorm === 'en_curso' || estadoNorm === 'en curso' || estadoNorm === 'finalizada'

  const reservaParaContrato = useMemo(() => {
    const base = contratoFirmado?.contratoOriginal?.reserva || reservaAlmacenada || reserva || {}
    const df = base.datosForm || {}
    const rd = base.reservaDetalles || {}
    const nombreCliente = df.nombre || [df.nombres, df.apellidos].filter(Boolean).join(' ').trim() || base.clienteNombre || usuario?.nombre || 'Cliente Drivique'
    const correoCliente = df.correo || base.clienteCorreo || usuario?.correo || usuario?.email || 'cliente@drivique.com'
    const telCliente = df.celular || df.telefono || base.clienteTelefono || usuario?.telefono || '+57 300 000 0000'
    const docCliente = df.numDoc || df.documento || base.clienteDocumento || usuario?.cedula || '1020304050'
    const ref = base.referencia || base.codigo || base.id || reserva.id
    return {
      ...base, referencia: ref,
      total: base.total || base.totalCOP || reserva.total || 0,
      seguroIdx: base.seguroIdx ?? reserva.seguroIdx ?? 0,
      serviciosSeleccionados: base.serviciosSeleccionados || reserva.serviciosSeleccionados || [],
      datosForm: {
        ...df,
        nombre: nombreCliente,
        correo: correoCliente,
        celular: telCliente,
        telefono: telCliente,
        tipoDoc: df.tipoDoc || 'CC',
        numDoc: docCliente,
        licenciaPdf: df.licenciaPdf || null
      },
      reservaDetalles: {
        ...rd,
        fechaInicio: rd.fechaInicio || reserva.fechaInicio,
        fechaFin: rd.fechaFin || reserva.fechaFin,
        horaInicio: rd.horaInicio || '08:00',
        horaFin: rd.horaFin || '18:00',
        sucursalRetiro: rd.sucursalRetiro || reserva.sucursal || reserva.vehiculo?.sucursal || 'Alquiler Neiva - Centro',
        sucursalDevolucion: rd.sucursalDevolucion || reserva.sucursal || reserva.vehiculo?.sucursal || 'Alquiler Neiva - Centro',
        metodoPago: rd.metodoPago || reserva.pasarela || (reserva.metodoPago === 'efectivo' ? 'efectivo' : 'tarjeta'),
        sucursalPagoEfectivo: rd.sucursalPagoEfectivo || reserva.sucursal || reserva.vehiculo?.sucursal || 'Alquiler Neiva - Centro'
      }
    }
  }, [reserva, contratoFirmado, reservaAlmacenada, usuario])

  const vehiculoParaContrato = useMemo(() => {
    const base = contratoFirmado?.contratoOriginal?.vehiculo || reserva.vehiculo || {}
    return {
      ...base,
      nombre: base.nombre || (base.marca ? `${base.marca} ${base.modelo || ''}` : 'Vehículo Drivique'),
      placa: base.placa || 'Asignación al entregar',
      color: base.color || 'Plata',
      año: base.año || base.anio || 2024,
      sucursal: base.sucursal || reserva.sucursal || 'Alquiler Neiva - Centro',
      servicios: base.servicios || [],
      seguros: base.seguros || [{ nombre: 'Protección Básica Estándar' }]
    }
  }, [reserva, contratoFirmado])

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
      autoDesbloquear={autoDesbloquear}
      esConfirmada={esConfirmada}
    />
  )
}


function ModalDetalle({ reserva, moneda, autoDesbloquear = false, onClose }) {
  const { t, i18n } = useTranslation()
  const { brand } = useBrand() || {}
  const estado = { texto: t(`reservas.statuses.${reserva.estado}`, { defaultValue: t('reservas.statuses.pendiente') }), clase: CLASES_ESTADO[reserva.estado] || CLASES_ESTADO.pendiente }
  const contrato = contractService.obtenerPorReserva(reserva.id)
  const reservaOriginal = contrato?.contratoOriginal?.reserva || reservationService.obtenerPorReferencia(reserva.id)
  const vehiculoOriginal = contrato?.contratoOriginal?.vehiculo || reserva.vehiculo
  const nombreAuto = reserva.vehiculo?.nombre || vehiculoOriginal?.nombre || (reserva.vehiculo?.marca ? `${reserva.vehiculo.marca} ${reserva.vehiculo.modelo || ''}` : 'Vehículo')
  const imagenAuto = reserva.vehiculo?.imagenes?.[0] || vehiculoOriginal?.imagenes?.[0] || reserva.vehiculo?.imagen || vehiculoOriginal?.imagen
  const seguroIdx = reservaOriginal?.seguroIdx
  const proteccion = seguroIdx != null ? vehiculoOriginal?.seguros?.[seguroIdx]?.nombre : t('reservas.unspecified')

  const esEfectivo = reservaOriginal?.reservaDetalles?.metodoPago === 'efectivo' || reserva.metodoPago === 'efectivo'
  const esPendienteEfectivo = reserva.estado === 'PENDIENTE_EFECTIVO' || reservaOriginal?.estado === 'PENDIENTE_EFECTIVO' || (esEfectivo && (reserva.estado === 'pendiente' || !reserva.estado))
  const esPendienteWompi = !esEfectivo && (reserva.estado === 'pendiente' || reserva.estado === 'PENDIENTE')
  const esWompiAprobado = !esEfectivo && (reserva.estado === 'confirmada' || reserva.estado === 'activa' || reserva.estado === 'en_curso' || reserva.estado === 'finalizada')

  const sucursalPago = reservaOriginal?.reservaDetalles?.sucursalPagoEfectivo || reserva.vehiculo?.sucursal || 'Alquiler Neiva - Centro'
  const branchObj = SUCURSALES.find(s => s.nombre === sucursalPago)
  const ciudadPago = branchObj?.ciudad || reserva.vehiculo?.ciudad || 'Neiva'
  const direccionPago = branchObj?.direccion || 'Calle 9 # 8-25, Centro'

  const [pagandoWompi, setPagandoWompi] = useState(false)

  const handlePagarWompi = async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setPagandoWompi(true)
    try {
      const ref = reserva.id || reserva.referencia || reservaOriginal?.referencia
      sessionStorage.setItem('current_wompi_reference', ref)
      const rawTotal = reserva.total ?? reservaOriginal?.total ?? 0
      const totalNum = typeof rawTotal === 'number' ? rawTotal : parseFloat(String(rawTotal).replace(/[^0-9.-]+/g, '')) || 0
      const centavos = aCentavos(totalNum)
      const url = await construirUrlCheckout({
        reference: ref,
        amountInCents: centavos,
        redirectUrl: `${window.location.origin}/respuesta`,
      })
      window.location.href = url
    } catch (err) {
      console.error('Error al generar enlace Wompi:', err)
      setPagandoWompi(false)
    }
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
        <div className="modal-reserva-info-card">
          {/* 1. Tarjeta de galería / Imagen del carro */}
          {imagenAuto && (
            <div className="modal-reserva-img-box">
              <img
                src={imagenAuto}
                alt={nombreAuto}
                className="modal-reserva-img"
              />
            </div>
          )}

          {/* 2. Tarjeta de datos de la reserva (2 columnas) */}
          <div className="modal-reserva-datos-grid">
            {/* Fila 1: Vehículo / Fecha de retiro */}
            <div className="modal-reserva-dato-celda celda-borde-r celda-borde-b">
              <div className="modal-dato-icon">
                <FaCar />
              </div>
              <div className="modal-dato-texto">
                <span className="modal-dato-label">{t('reservas.vehicle', { defaultValue: 'Vehículo' })}</span>
                <strong className="modal-dato-val">{nombreAuto}</strong>
              </div>
            </div>

            <div className="modal-reserva-dato-celda celda-borde-b">
              <div className="modal-dato-icon">
                <FaCalendarAlt />
              </div>
              <div className="modal-dato-texto">
                <span className="modal-dato-label">{t('reservas.pickupDate', { defaultValue: 'Fecha de retiro' })}</span>
                <strong className="modal-dato-val">{fechaBonita(reserva.fechaInicio, i18n.resolvedLanguage)}</strong>
              </div>
            </div>

            {/* Fila 2: Fecha de devolución / Lugar de retiro */}
            <div className="modal-reserva-dato-celda celda-borde-r celda-borde-b">
              <div className="modal-dato-icon">
                <FaRegCalendarCheck />
              </div>
              <div className="modal-dato-texto">
                <span className="modal-dato-label">{t('reservas.returnDate', { defaultValue: 'Fecha de devolución' })}</span>
                <strong className="modal-dato-val">{fechaBonita(reserva.fechaFin, i18n.resolvedLanguage)}</strong>
              </div>
            </div>

            <div className="modal-reserva-dato-celda celda-borde-b">
              <div className="modal-dato-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="modal-dato-texto">
                <span className="modal-dato-label">{t('reservas.pickupLocation', { defaultValue: 'Lugar de retiro' })}</span>
                <strong className="modal-dato-val" title={reserva.vehiculo?.sucursal || sucursalPago}>{reserva.vehiculo?.sucursal || sucursalPago}</strong>
              </div>
            </div>

            {/* Fila 3: Protección / Referencia */}
            <div className="modal-reserva-dato-celda celda-borde-r celda-borde-b">
              <div className="modal-dato-icon">
                <FaShieldAlt />
              </div>
              <div className="modal-dato-texto">
                <span className="modal-dato-label">{t('reservas.protection', { defaultValue: 'Protección' })}</span>
                <strong className="modal-dato-val">{proteccion}</strong>
              </div>
            </div>

            <div className="modal-reserva-dato-celda celda-borde-b">
              <div className="modal-dato-icon">
                <FaScroll />
              </div>
              <div className="modal-dato-texto">
                <span className="modal-dato-label">{t('reservas.reference', { defaultValue: 'Referencia' })}</span>
                <strong className="modal-dato-val" title={reserva.id}>{reserva.id}</strong>
              </div>
            </div>

            {/* Fila 4: Total / Estado */}
            <div className="modal-reserva-dato-celda celda-borde-r">
              <div className="modal-dato-icon brand-tint">
                <FaMoneyBillWave />
              </div>
              <div className="modal-dato-texto">
                <span className="modal-dato-label">{t('reservas.total', { defaultValue: 'Total' })}</span>
                <strong className="modal-dato-val">{formatCurrency(reserva.total || 0, moneda)}</strong>
              </div>
            </div>

            <div className="modal-reserva-dato-celda">
              <div className="modal-dato-icon brand-tint">
                <FaCheckCircle />
              </div>
              <div className="modal-dato-texto">
                <span className="modal-dato-label">{t('reservas.status', { defaultValue: 'Estado' })}</span>
                <strong className="modal-dato-val status-val">{estado.texto}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta de Pago en Efectivo por Sucursal */}
        {esPendienteEfectivo && (
          <div className="modal-cash-card">
            {/* Logo Badge Circular */}
            <div className="modal-cash-logo-badge">
              <img
                src={brand?.logoDataUrl || logo}
                alt={brand?.name || 'Drivique'}
              />
            </div>

            {/* Titulo */}
            <h3 className="modal-cash-titulo">
              {t('vehiculo.reservationRegisteredTitle', { defaultValue: 'Reserva Registrada' })}
            </h3>

            {/* Subtitulo */}
            <p className="modal-cash-desc">
              {t('vehiculo.cashReservationRegisteredDesc', {
                defaultValue: `Tu reserva quedó registrada. Para confirmarla, realiza el pago en efectivo en el punto autorizado ${sucursalPago}.`,
                sucursal: sucursalPago
              })}
            </p>

            {/* Tarjeta de Resumen con datos */}
            <div className="modal-cash-summary">
              <div className="modal-cash-row">
                <span className="modal-cash-row-label">{t('reservas.reference', { defaultValue: 'Referencia:' })}</span>
                <strong className="modal-cash-ref-val">{reserva.id}</strong>
              </div>
              <div className="modal-cash-row">
                <span className="modal-cash-row-label">{t('reservas.branch', { defaultValue: 'Sucursal:' })}</span>
                <strong className="modal-cash-row-val">{sucursalPago}</strong>
              </div>
              <div className="modal-cash-row">
                <span className="modal-cash-row-label">{t('reservas.city', { defaultValue: 'Ciudad:' })}</span>
                <strong className="modal-cash-row-val">{ciudadPago}</strong>
              </div>
              <div className="modal-cash-row">
                <span className="modal-cash-row-label">{t('reservas.address', { defaultValue: 'Dirección:' })}</span>
                <strong className="modal-cash-row-val">{direccionPago}</strong>
              </div>
              <div className="modal-cash-divider" />
              <div className="modal-cash-row total">
                <span className="modal-cash-total-label">{t('reservas.totalToPay', { defaultValue: 'TOTAL A PAGAR:' })}</span>
                <strong className="modal-cash-total-val">{formatCurrency(reserva.total || 0, moneda)}</strong>
              </div>
            </div>

            {/* Plazo para pagar */}
            <div className="modal-cash-deadline-box">
              <p className="modal-cash-deadline-title">
                {t('reservas.paymentDeadline', { defaultValue: 'PLAZO PARA PAGAR' })}
              </p>
              <p className="modal-cash-deadline-text">
                {t('reservas.cashDeadlineNotice', {
                  defaultValue: 'Tienes 72 horas desde ahora para acercarte a la sucursal y pagar. Si no pagas dentro de este plazo, la reserva se cancelará automáticamente.'
                })}
              </p>
            </div>
          </div>
        )}

        {/* Tarjeta de Pago Digital Pendiente Wompi (si aplica) */}
        {esPendienteWompi && (
          <div className="modal-wompi-card">
            <h3 className="modal-wompi-titulo">
              {t('reservas.pendingDigitalPayment', { defaultValue: 'Pago Digital Pendiente' })}
            </h3>
            <p className="modal-wompi-desc">
              {t('reservas.digitalPendingDesc', {
                defaultValue: 'Tu reserva está guardada como pendiente. Completa el pago seguro en Wompi para confirmar y habilitar tu contrato de alquiler.'
              })}
            </p>

            {/* Caja de Total a pagar */}
            <div className="modal-wompi-total-box">
              <span className="modal-wompi-total-label">
                {t('reservas.totalToPay', { defaultValue: 'TOTAL A PAGAR:' })}
              </span>
              <strong className="modal-wompi-total-val">
                {formatCurrency(reserva.total || 0, moneda)}
              </strong>
            </div>

            {/* Botón Pagar con Wompi */}
            <button
              type="button"
              onClick={handlePagarWompi}
              disabled={pagandoWompi}
              className="modal-wompi-btn"
            >
              <FaCreditCard size={16} />
              <span>{pagandoWompi ? t('reservas.redirectingToWompi', { defaultValue: 'Redirigiendo a Wompi…' }) : t('reservas.payWithWompi', { defaultValue: 'Pagar con Wompi' })}</span>
            </button>
          </div>
        )}

        {/* Tarjeta de Contrato (Listo para firmar, firma activa o protegido) */}
        <Contrato reserva={reserva} autoDesbloquear={autoDesbloquear} />

        {/* Botón de cierre */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
          <button
            type="button"
            onClick={onClose}
            className="detalle-cerrar-btn-custom"
          >
            {t('reservas.closeDetail', { defaultValue: 'Cerrar detalle' })}
          </button>
        </div>
      </section>
    </div>
  )
}

function TarjetaReserva({ reserva, moneda, onValorar, onReportar, onVerDetalle }) {
  const { t, i18n } = useTranslation()
  const estado = { texto: t(`reservas.statuses.${reserva.estado}`, { defaultValue: t('reservas.statuses.pendiente') }), clase: CLASES_ESTADO[reserva.estado] || CLASES_ESTADO.pendiente }, sede = reserva.vehiculo?.sucursal || t('reservas.defaultBranch')
  const estadoNorm = String(reserva.estado || '').toLowerCase()
  const estaEnCurso = estadoNorm === 'activa' || estadoNorm === 'en_curso' || estadoNorm === 'en curso'
  const esConfirmada = estadoNorm === 'confirmada' || estaEnCurso

  const contratoFirmado = contractService.obtenerPorReserva(reserva.id)
  const tieneContratoFirmado = Boolean(contratoFirmado?.firmaUsuarioDataUrl)
  const requiereFirma = esConfirmada && !tieneContratoFirmado

  return <article className="reserva-card"><div className="reserva-imagen-wrap">
    {reserva.vehiculo?.imagenes?.[0] ? <img src={reserva.vehiculo.imagenes[0]} alt={reserva.vehiculo.nombre} /> : <div className="imagen-vacia"><FaCar /></div>}
    <span className={`estado-badge ${estado.clase}`}>{estado.texto}</span></div><div className="reserva-info">
    <div className="reserva-head"><div><span className="reserva-id">{t('reservas.reservationNumber', { id: reserva.id })}</span><h2>{reserva.vehiculo?.nombre || t('reservas.vehicleUnavailable')}</h2></div><strong className="reserva-total">{formatCurrency(reserva.total || 0, moneda)}</strong></div>
    <div className="reserva-meta"><div><FaCalendarAlt /><span><small>{t('reservas.pickup')}</small>{fechaBonita(reserva.fechaInicio, i18n.resolvedLanguage)}</span></div><span className="linea-fechas" />
      <div><FaRegCalendarCheck /><span><small>{t('reservas.return')}</small>{fechaBonita(reserva.fechaFin, i18n.resolvedLanguage)}</span></div><div className="meta-sede"><FaMapMarkerAlt /><span><small>{t('reservas.branch')}</small>{sede}</span></div></div>
    {reserva.estado === 'finalizada' && <div className="valoracion-resumen">{reserva.valoracion ? <div><Estrellas value={reserva.valoracion.estrellas} disabled /><p>“{reserva.valoracion.comentario || t('reservas.noComment')}”</p></div> : <div><strong>{t('reservas.howWasTrip')}</strong><span>{t('reservas.feedbackHelps')}</span></div>}
      <button className="btn-link" onClick={() => onValorar(reserva)}>{reserva.valoracion ? t('reservas.editRating') : t('reservas.rateVehicle')}</button></div>}
    <div className="reserva-actions">
      {estaEnCurso && (
        <button className="btn-reporte" onClick={() => onReportar(reserva)}>
          <FaFlag /> {t('reservas.makeReport')}
        </button>
      )}
      <button className="btn-detalle" onClick={() => onVerDetalle(reserva)}>
        {t('reservas.viewDetail')}
      </button>
    </div>
  </div></article>
}

export default function ReservationsPage() {
  const { t } = useTranslation()
  const { moneda, tema } = useLanding(), navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { reservas, cargando, error, guardarValoracion } = useHistorialReservas()
  const [mes, setMes] = useState('todos'), [estadoFiltro, setEstadoFiltro] = useState('todos'), [valorando, setValorando] = useState(null), [detalle, setDetalle] = useState(null)

  const detalleIdUrl = searchParams.get('detalle') || location.state?.detalleId
  const autoDesbloquear = searchParams.get('desbloquear') === 'true' || location.state?.autoDesbloquear === true

  useEffect(() => {
    if (detalleIdUrl && reservas.length > 0 && (!detalle || String(detalle.id) !== String(detalleIdUrl))) {
      const encontrada = reservas.find(r => String(r.id) === String(detalleIdUrl) || r.codigo === detalleIdUrl || r.referencia === detalleIdUrl)
      if (encontrada) {
        setDetalle(encontrada)
      }
    }
  }, [detalleIdUrl, reservas, detalle])

  const handleVerDetalle = (reserva) => {
    setDetalle(reserva)
  }

  const handleCerrarDetalle = () => {
    setDetalle(null)
    if (searchParams.get('detalle') || searchParams.get('desbloquear')) {
      navigate('/reservas', { replace: true })
    }
  }

  const filtradas = useMemo(() => reservas.filter(r =>
    (mes === 'todos' || r.fechaInicio?.slice(5, 7) === mes) &&
    (estadoFiltro === 'todos' || r.estado === estadoFiltro)
  ), [reservas, mes, estadoFiltro])
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
    <section className="reservas-lista">{filtradas.map(r => <TarjetaReserva key={r.id} reserva={r} moneda={moneda} onValorar={setValorando} onReportar={reportar} onVerDetalle={handleVerDetalle} />)}</section>
  </main>{valorando && <ModalValoracion reserva={valorando} onClose={() => setValorando(null)} onSave={guardarValoracion} />}{detalle && <ModalDetalle reserva={detalle} moneda={moneda} autoDesbloquear={autoDesbloquear} onClose={handleCerrarDetalle} />}</div>
}
