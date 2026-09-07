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

function ContratoVerCard({ reserva, contratoFirmado, reservaParaContrato, vehiculoParaContrato, identificacion, autoDesbloquear = false }) {
  const { t, i18n } = useTranslation()
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
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '22px', padding: '20px', marginBottom: '18px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid #bbf7d0', borderRadius: '14px', background: '#f0fdf4' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <strong style={{ fontSize: '13px', color: '#15803d', fontWeight: 800 }}>
              {t('reservas.originalSignedContract', { defaultValue: 'Contrato firmado original' })}
            </strong>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              {contratoFirmado.codigo || reserva.numeroContrato || reserva.id}
            </span>
          </div>
          <button type="button" onClick={() => setDesbloqueado(false)}
            style={{ border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff', color: '#475569', fontSize: '11px', fontWeight: 700, padding: '4px 10px', cursor: 'pointer' }}>
            Bloquear
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
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '22px', padding: '24px', marginBottom: '18px', boxShadow: '0 4px 18px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxSizing: 'border-box' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: tieneContratoFirmado ? '#f0fdf4' : '#f8fafc', display: 'grid', placeItems: 'center', marginBottom: '14px', flexShrink: 0 }}>
        <FaLock size={22} color={tieneContratoFirmado ? '#16a34a' : '#94A3B8'} />
      </div>
      <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
        {tieneContratoFirmado ? 'Ver contrato firmado' : 'Contrato protegido'}
      </h3>
      <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 18px', maxWidth: '400px', fontWeight: 500 }}>
        {tieneContratoFirmado
          ? 'Ingresa tu número de cédula o identificación registrada para ver o descargar tu contrato.'
          : 'El contrato estará disponible para ver una vez hayas completado la firma digital.'}
      </p>
      <div style={{ width: '100%', maxWidth: '400px', boxSizing: 'border-box' }}>
        <div style={{ position: 'relative', width: '100%', marginBottom: error ? '8px' : '14px' }}>
          <input
            id="input-clave-contrato"
            type={mostrarClave ? 'text' : 'password'}
            value={clave}
            disabled={!tieneContratoFirmado}
            onChange={(e) => { setClave(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && validar()}
            placeholder="Ingresa tu cédula o identificación"
            aria-label="Ingresa tu cédula o identificación"
            style={{
              width: '100%', height: '46px', borderRadius: '12px',
              border: error ? '1.5px solid #EF4444' : '1.5px solid #E2E8F0',
              padding: '0 44px 0 14px', fontSize: '13.5px', color: '#0f172a',
              background: !tieneContratoFirmado ? '#F8FAFC' : '#ffffff',
              cursor: !tieneContratoFirmado ? 'not-allowed' : 'text',
              boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => { if (!error && tieneContratoFirmado) e.target.style.borderColor = '#3B82F6' }}
            onBlur={(e) => { if (!error && tieneContratoFirmado) e.target.style.borderColor = '#E2E8F0' }}
          />
          <button type="button" disabled={!tieneContratoFirmado} onClick={() => setMostrarClave(v => !v)}
            aria-label={mostrarClave ? 'Ocultar clave' : 'Mostrar clave'}
            style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: !tieneContratoFirmado ? 'not-allowed' : 'pointer', display: 'grid', placeItems: 'center', padding: '6px', fontSize: '16px', opacity: !tieneContratoFirmado ? 0.5 : 1 }}>
            {mostrarClave ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {error && <p style={{ color: '#EF4444', fontSize: '12px', fontWeight: 600, textAlign: 'left', margin: '0 0 12px 4px' }}>{error}</p>}
        <button type="button" onClick={validar} disabled={!tieneContratoFirmado}
          style={{
            width: '100%', height: '46px', borderRadius: '12px', border: 'none',
            fontSize: '13.5px', fontWeight: 700, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease',
            ...(!tieneContratoFirmado
              ? { background: '#F1F5F9', color: '#94A3B8', cursor: 'not-allowed' }
              : { background: '#16a34a', color: '#ffffff', cursor: 'pointer', boxShadow: '0 4px 14px rgba(22,163,74,0.25)' })
          }}>
          <FaFileContract size={14} color={!tieneContratoFirmado ? '#94A3B8' : '#ffffff'} />
          <span>Ver contrato firmado</span>
        </button>
      </div>
    </div>
  )
}

function Contrato({ reserva, autoDesbloquear = false }) {
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

  // Si la reserva NO está confirmada: solo tarjeta de Ver Contrato (bloqueada)
  if (!esConfirmada) {
    return (
      <ContratoVerCard
        reserva={reserva}
        contratoFirmado={contratoFirmado}
        reservaParaContrato={reservaParaContrato}
        vehiculoParaContrato={vehiculoParaContrato}
        identificacion={identificacion}
        autoDesbloquear={autoDesbloquear}
      />
    )
  }

  // Reserva CONFIRMADA: mostrar ambas tarjetas
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Tarjeta 1: Firmar contrato (solo si aún no está firmado) */}
      {!tieneContratoFirmado && (
        <div style={{
          background: '#ffffff', border: '1.5px solid #BFDBFE', borderRadius: '22px',
          padding: '24px 20px', boxShadow: '0 4px 20px rgba(37,99,235,0.08)',
          display: 'flex', alignItems: 'center', gap: '16px', boxSizing: 'border-box'
        }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#EFF6FF', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <FaFileSignature size={22} color="#1D4ED8" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ display: 'block', fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '3px' }}>
              Firma tu contrato digital
            </strong>
            <span style={{ display: 'block', fontSize: '12.5px', color: '#64748b', lineHeight: 1.4 }}>
              Tu pago fue confirmado. Lee el contrato y firma digitalmente para finalizar.
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/contrato/${reserva.id}`, { state: { reserva, vehiculo: reserva.vehiculo } })}
            style={{
              flexShrink: 0, height: '42px', padding: '0 18px', borderRadius: '12px',
              border: 'none', background: '#1D4ED8', color: '#ffffff', fontSize: '13px',
              fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '7px',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(29,78,216,0.25)', whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#1E40AF' }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#1D4ED8' }}
          >
            <FaPenNib size={13} />
            Leer y firmar
          </button>
        </div>
      )}

      {/* Tarjeta 2: Ver contrato (siempre presente) */}
      <ContratoVerCard
        reserva={reserva}
        contratoFirmado={contratoFirmado}
        reservaParaContrato={reservaParaContrato}
        vehiculoParaContrato={vehiculoParaContrato}
        identificacion={identificacion}
        autoDesbloquear={autoDesbloquear}
      />
    </div>
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
        style={{
          position: 'relative',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px 24px 28px',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
          border: '1px solid #e2e8f0'
        }}
      >
        <div className="detalle-modal-acento" />
        
        <button
          className="modal-cerrar"
          onClick={onClose}
          aria-label={t('reservas.closeDetail', { defaultValue: 'Cerrar' })}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#64748b',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <FaTimes size={14} />
        </button>

        {/* Encabezado sin el primer icono (quitado según solicitud) */}
        <div style={{ textAlign: 'center', padding: '8px 24px 16px' }}>
          <h2
            id="detalle-reserva-titulo"
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 4px',
              letterSpacing: '-0.02em'
            }}
          >
            {esPendienteEfectivo
              ? 'Pendiente de pago en efectivo'
              : (esPendienteWompi ? 'Pendiente de pago digital' : t('reservas.reservationWithStatus', { status: estado.texto.toLowerCase(), defaultValue: `Reserva ${estado.texto.toLowerCase()}` }))}
          </h2>
          <p
            style={{
              fontSize: '13.5px',
              color: '#64748b',
              margin: 0,
              fontWeight: 500
            }}
          >
            {nombreAuto}
          </p>
        </div>

        {/* Tarjeta Padre: Contenedor de Galería y Datos */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '22px',
            padding: '16px',
            marginBottom: '18px',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          {/* 1. Tarjeta de galería / Imagen del carro */}
          {imagenAuto && (
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                maxHeight: '220px'
              }}
            >
              <img
                src={imagenAuto}
                alt={nombreAuto}
                style={{
                  width: '100%',
                  maxHeight: '220px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
          )}

          {/* 2. Tarjeta de datos de la reserva (2 columnas) */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '18px',
              padding: '4px 14px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr'
            }}
          >
            {/* Fila 1: Vehículo / Fecha de retiro */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 12px 14px 4px', borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', minWidth: 0 }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#EFF6FF', color: '#1D4ED8', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: '15px' }}>
                <FaCar />
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{t('reservas.vehicle', { defaultValue: 'Vehículo' })}</span>
                <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nombreAuto}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 4px 14px 12px', borderBottom: '1px solid #f1f5f9', minWidth: 0 }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#EFF6FF', color: '#1D4ED8', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: '15px' }}>
                <FaCalendarAlt />
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{t('reservas.pickupDate', { defaultValue: 'Fecha de retiro' })}</span>
                <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fechaBonita(reserva.fechaInicio, i18n.resolvedLanguage)}</strong>
              </div>
            </div>

            {/* Fila 2: Fecha de devolución / Lugar de retiro */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 12px 14px 4px', borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', minWidth: 0 }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#EFF6FF', color: '#1D4ED8', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: '15px' }}>
                <FaRegCalendarCheck />
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{t('reservas.returnDate', { defaultValue: 'Fecha de devolución' })}</span>
                <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fechaBonita(reserva.fechaFin, i18n.resolvedLanguage)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 4px 14px 12px', borderBottom: '1px solid #f1f5f9', minWidth: 0 }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#EFF6FF', color: '#1D4ED8', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: '15px' }}>
                <FaMapMarkerAlt />
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{t('reservas.pickupLocation', { defaultValue: 'Lugar de retiro' })}</span>
                <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={reserva.vehiculo?.sucursal || sucursalPago}>{reserva.vehiculo?.sucursal || sucursalPago}</strong>
              </div>
            </div>

            {/* Fila 3: Protección / Referencia */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 12px 14px 4px', borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', minWidth: 0 }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#EFF6FF', color: '#1D4ED8', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: '15px' }}>
                <FaShieldAlt />
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{t('reservas.protection', { defaultValue: 'Protección' })}</span>
                <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{proteccion}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 4px 14px 12px', borderBottom: '1px solid #f1f5f9', minWidth: 0 }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#EFF6FF', color: '#1D4ED8', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: '15px' }}>
                <FaScroll />
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{t('reservas.reference', { defaultValue: 'Referencia' })}</span>
                <strong style={{ display: 'block', fontSize: '11.5px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={reserva.id}>{reserva.id}</strong>
              </div>
            </div>

            {/* Fila 4: Total / Estado */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 12px 14px 4px', borderRight: '1px solid #f1f5f9', minWidth: 0 }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#EFF6FF', color: '#1D4ED8', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: '15px' }}>
                <FaMoneyBillWave />
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{t('reservas.total', { defaultValue: 'Total' })}</span>
                <strong style={{ display: 'block', fontSize: '13.5px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatCurrency(reserva.total || 0, moneda)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 4px 14px 12px', minWidth: 0 }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#EFF6FF', color: '#1D4ED8', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: '15px' }}>
                <FaCheckCircle />
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{t('reservas.status', { defaultValue: 'Estado' })}</span>
                <strong style={{ display: 'block', fontSize: '13px', color: '#15803d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{estado.texto}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta de Pago en Efectivo por Sucursal (Diseño exacto de la captura) */}
        {esPendienteEfectivo && (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '22px',
              padding: '28px 20px 20px',
              textAlign: 'center',
              marginBottom: '18px',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {/* Logo Badge Circular */}
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 12,
                marginBottom: 16
              }}
            >
              <img
                src={brand?.logoDataUrl || logo}
                alt={brand?.name || 'Drivique'}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            {/* Titulo */}
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#0f172a',
                margin: '0 0 8px',
                letterSpacing: '-0.01em'
              }}
            >
              {t('vehiculo.reservationRegisteredTitle', { defaultValue: 'Reserva Registrada' })}
            </h3>

            {/* Subtitulo */}
            <p
              style={{
                fontSize: '13px',
                color: '#64748b',
                lineHeight: 1.5,
                margin: '0 0 18px',
                padding: '0 6px'
              }}
            >
              {t('vehiculo.cashReservationRegisteredDesc', {
                defaultValue: `Tu reserva quedó registrada. Para confirmarla, realiza el pago en efectivo en el punto autorizado ${sucursalPago}.`,
                sucursal: sucursalPago
              })}
            </p>

            {/* Tarjeta de Resumen con datos */}
            <div
              style={{
                width: '100%',
                background: '#EFF6FF',
                border: '1.5px solid #BFDBFE',
                borderRadius: '16px',
                padding: '16px 18px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '14px',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Referencia:</span>
                <strong style={{ color: '#1D4ED8', fontWeight: 800 }}>{reserva.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Sucursal:</span>
                <strong style={{ color: '#0f172a', fontWeight: 700 }}>{sucursalPago}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Ciudad:</span>
                <strong style={{ color: '#0f172a', fontWeight: 700 }}>{ciudadPago}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Dirección:</span>
                <strong style={{ color: '#0f172a', fontWeight: 700 }}>{direccionPago}</strong>
              </div>
              <div style={{ height: '1px', background: '#BFDBFE', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569', letterSpacing: '0.02em' }}>TOTAL A PAGAR:</span>
                <strong style={{ fontSize: '18px', fontWeight: 900, color: '#1D4ED8' }}>{formatCurrency(reserva.total || 0, moneda)}</strong>
              </div>
            </div>

            {/* Plazo para pagar (amarillo) */}
            <div
              style={{
                width: '100%',
                background: '#FEFCE8',
                border: '1.5px solid #FEF08A',
                borderRadius: '14px',
                padding: '12px 14px',
                textAlign: 'left',
                boxSizing: 'border-box'
              }}
            >
              <p
                style={{
                  margin: '0 0 4px',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#854D0E',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                PLAZO PARA PAGAR
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#854D0E',
                  lineHeight: 1.45,
                  fontWeight: 500
                }}
              >
                Tienes 72 horas desde ahora para acercarte a la sucursal y pagar. Si no pagas dentro de este plazo, la reserva se cancelará automáticamente.
              </p>
            </div>
          </div>
        )}

        {/* Tarjeta de Pago Digital Pendiente Wompi (si aplica) */}
        {esPendienteWompi && (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '22px',
              padding: '28px 24px 24px',
              textAlign: 'center',
              marginBottom: '18px',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxSizing: 'border-box'
            }}
          >
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#0f172a',
                margin: '0 0 10px',
                letterSpacing: '-0.01em'
              }}
            >
              Pago Digital Pendiente
            </h3>
            <p
              style={{
                fontSize: '13.5px',
                color: '#64748b',
                lineHeight: 1.5,
                margin: '0 0 18px',
                maxWidth: '430px',
                fontWeight: 500
              }}
            >
              Tu reserva está guardada como pendiente. Completa el pago seguro en Wompi para confirmar y habilitar tu contrato de alquiler.
            </p>

            {/* Caja de Total a pagar */}
            <div
              style={{
                width: '100%',
                maxWidth: '440px',
                background: '#EFF6FF',
                border: '1.5px solid #BFDBFE',
                borderRadius: '14px',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                boxSizing: 'border-box'
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569', letterSpacing: '0.02em' }}>
                TOTAL A PAGAR:
              </span>
              <strong style={{ fontSize: '19px', fontWeight: 900, color: '#1D4ED8' }}>
                {formatCurrency(reserva.total || 0, moneda)}
              </strong>
            </div>

            {/* Botón Pagar con Wompi */}
            <button
              type="button"
              onClick={handlePagarWompi}
              disabled={pagandoWompi}
              style={{
                width: '100%',
                maxWidth: '440px',
                height: '50px',
                borderRadius: '14px',
                background: '#1D4ED8',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '14px',
                cursor: pagandoWompi ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 14px rgba(29, 78, 216, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <FaCreditCard size={16} />
              <span>{pagandoWompi ? 'Redirigiendo a Wompi…' : 'Pagar con Wompi'}</span>
            </button>
          </div>
        )}

        {/* Tarjeta de Contrato (Listo para firmar, firma activa o protegido) */}
        <Contrato reserva={reserva} autoDesbloquear={autoDesbloquear} />

        {/* Botón de cierre */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              minWidth: 160,
              padding: '10px 24px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#1e293b',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8' }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1' }}
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
