import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaCar, FaCheckCircle, FaChevronDown, FaDownload, FaEye, FaEyeSlash, FaFileContract, FaFlag, FaKey, FaMapMarkerAlt, FaMoneyBillWave, FaRegCalendarCheck, FaScroll, FaShieldAlt, FaStar, FaTimes, FaInfoCircle, FaCreditCard } from 'react-icons/fa'
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
import FirmaContrato from '@/modules/contracts/components/ContractSignature'
import { SUCURSALES } from '@/modules/catalog/constants'
import { construirUrlCheckout, aCentavos } from '@/services/wompiService'
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

function Contrato({ reserva }) {
  const { t, i18n } = useTranslation()
  const [abierto, setAbierto] = useState(false), [clave, setClave] = useState(''), [mostrarClave, setMostrarClave] = useState(false), [desbloqueado, setDesbloqueado] = useState(false), [error, setError] = useState(''), [descargando, setDescargando] = useState(false)
  const usuario = useAuthStore(state => state.usuario)
  const identificacion = usuario?.cedula
  const contratoFirmado = useMemo(() => contractService.obtenerPorReserva(reserva.id), [reserva.id])
  const reservaLocal = useMemo(() => reservationService.obtenerPorReferencia(reserva.id), [reserva.id])
  const reservaOriginal = contratoFirmado?.contratoOriginal?.reserva || reservaLocal
  const vehiculoOriginal = contratoFirmado?.contratoOriginal?.vehiculo || reserva.vehiculo
  const contratoVisualRef = useRef(null)
  const [preparandoVista, setPreparandoVista] = useState(false)
  const [vistaPreparada, setVistaPreparada] = useState(false)
  const tieneContratoFirmado = Boolean(contratoFirmado?.firmaUsuarioDataUrl)

  const esEfectivo = reservaOriginal?.reservaDetalles?.metodoPago === 'efectivo' || reserva.metodoPago === 'efectivo'
  const esPendienteEfectivo = reserva.estado === 'PENDIENTE_EFECTIVO' || reservaOriginal?.estado === 'PENDIENTE_EFECTIVO' || (esEfectivo && reserva.estado === 'pendiente')

  const validar = () => {
    if (!identificacion) {
      setError(t('reservas.noIdentification'))
      return
    }
    const normalizar = valor => String(valor).replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    if (normalizar(clave) === normalizar(identificacion)) { setDesbloqueado(true); setError('') }
    else setError(t('reservas.wrongIdentification'))
  }
  const descargar = async () => {
    if (descargando) return
    setDescargando(true)
    try {
      if (!reservaOriginal || !vehiculoOriginal) throw new Error(t('reservas.originalDataMissing'))
      const docReserva = String(reservaOriginal?.datosForm?.numDoc || '').replace(/\D/g, '')
      const docUsuario = String(usuario?.cedula || '').replace(/\D/g, '')
      if (!reservaOriginal || !docReserva || docReserva !== docUsuario) throw new Error(t('reservas.notReservationOwner'))
      let contratoDescarga = contratoFirmado
      if (!contratoFirmado.contratoOriginal) {
        contratoDescarga = contractService.completarContratoOriginal(reserva.id, {
          reserva: JSON.parse(JSON.stringify(reservaOriginal)),
          vehiculo: JSON.parse(JSON.stringify(vehiculoOriginal)),
          idioma: i18n.resolvedLanguage || i18n.language || 'es',
          guardadoEn: contratoFirmado.firmadoEn || new Date().toISOString(),
          migradoDesdeReserva: true,
        })
      }
      await descargarContratoOriginal({
        contrato: contratoDescarga,
        elementoContrato: contratoVisualRef.current,
      })
      setError('')
    } catch (e) { setError(e.message) }
    finally { setDescargando(false) }
  }
  useEffect(() => {
    if (!desbloqueado || vistaPreparada || !reservaOriginal || !vehiculoOriginal) return
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
  }, [desbloqueado, vistaPreparada, reservaOriginal, vehiculoOriginal, contratoFirmado, reserva.id])
  return <div className={`contrato ${abierto ? 'abierto' : ''}`}>
    <button className="contrato-toggle" onClick={() => setAbierto(v => !v)} aria-expanded={abierto}><span className="contrato-icon"><FaFileContract /></span>
      <span><strong>{t('reservas.rentalContract')}</strong><small>{!tieneContratoFirmado ? (esPendienteEfectivo ? 'Pendiente de pago en sucursal' : t('reservas.pendingSignature')) : desbloqueado ? (contratoFirmado.codigo || reserva.numeroContrato) : t('reservas.protectedIdentification')}</small></span><FaChevronDown className="chevron" /></button>
    {abierto && <div className="contrato-contenido">{!tieneContratoFirmado
      ? <div className="contrato-listo contrato-pendiente"><div><strong>{esPendienteEfectivo ? 'Contrato pendiente de pago en sucursal' : t('reservas.contractUnavailable')}</strong><span>{esPendienteEfectivo ? 'Una vez la sucursal confirme el pago en efectivo, podrás leer y firmar el contrato de alquiler para descargarlo.' : t('reservas.contractAvailableAfterSigning')}</span></div>
        <button className="btn-secundario btn-descarga-bloqueada" type="button" disabled title={t('reservas.availableAfterSigning')}><FaDownload /> {t('reservas.downloadContract')}</button></div>
      : !desbloqueado ? <><p>{t('reservas.enterIdentification')}</p>
      <div className={`clave-row ${error ? 'con-error' : ''}`}><FaKey className="clave-icono" /><input type={mostrarClave ? 'text' : 'password'} inputMode="numeric" autoComplete="off" value={clave} onChange={e => { setClave(e.target.value); setError('') }} onKeyDown={e => e.key === 'Enter' && validar()} placeholder={t('reservas.identificationNumber')} aria-label={t('reservas.identificationNumber')} /><button className={`clave-ojo ${mostrarClave ? 'activo' : ''}`} type="button" onClick={() => setMostrarClave(v => !v)} aria-label={mostrarClave ? t('reservas.hideIdentification') : t('reservas.showIdentification')} title={mostrarClave ? t('reservas.hideIdentification') : t('reservas.showIdentification')} aria-pressed={mostrarClave}>{mostrarClave ? <FaEye /> : <FaEyeSlash />}</button><button className="clave-validar" type="button" onClick={validar}>{t('reservas.validate')}</button></div>
      {error && <p className="clave-error" role="alert">{error}</p>}</> : contratoFirmado?.firmaUsuarioDataUrl
      ? <div className="contrato-desbloqueado"><div className="contrato-vista-head"><div><strong>{t('reservas.originalSignedContract')}</strong><span>{contratoFirmado.codigo || reserva.numeroContrato}</span></div></div>
        <div className="contrato-vista-html" ref={contratoVisualRef}><FirmaContrato vehiculo={vehiculoOriginal} reservaGuardada={reservaOriginal} /></div>
        {preparandoVista && <div className="contrato-vista-progreso">{t('reservas.optimizingDocument')}</div>}
        <div className="contrato-acciones-doc"><button className="contrato-descargar" onClick={descargar} disabled={descargando || preparandoVista || !vistaPreparada}><span className="contrato-descarga-icon"><FaDownload /></span><span><strong>{descargando ? t('reservas.preparingDocument') : t('reservas.downloadContract')}</strong><small>{t('reservas.originalPdf')}</small></span></button></div></div>
      : null
      }{desbloqueado && error && <p className="clave-error" role="alert">{error}</p>}</div>}
  </div>
}

function ModalDetalle({ reserva, moneda, onClose }) {
  const { t } = useTranslation()
  const contrato = contractService.obtenerPorReserva(reserva.id)
  const vehiculoOriginal = contrato?.contratoOriginal?.vehiculo || reserva.vehiculo
  const nombreAuto = reserva.vehiculo?.nombre || vehiculoOriginal?.nombre || (reserva.vehiculo?.marca ? `${reserva.vehiculo.marca} ${reserva.vehiculo.modelo || ''}` : 'Vehículo')
  const imagenAuto = reserva.vehiculo?.imagenes?.[0] || vehiculoOriginal?.imagenes?.[0] || reserva.vehiculo?.imagen || vehiculoOriginal?.imagen

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="detalle-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-reserva-titulo"
        onMouseDown={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', width: '100%', padding: '24px' }}
      >
        <button className="modal-cerrar" onClick={onClose} aria-label={t('reservas.closeDetail', { defaultValue: 'Cerrar' })}>
          <FaTimes />
        </button>

        {/* 1. Título principal separado con una raya */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2
            id="detalle-reserva-titulo"
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--texto-primary, #0f172a)',
              margin: '0 0 16px',
              letterSpacing: '-0.02em'
            }}
          >
            Detalles de la Reserva
          </h2>
          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0' }} />
        </div>

        {/* 2. Subtítulo de estado */}
        <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '6px' }}>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#1D4ED8',
              margin: '0 0 6px',
              letterSpacing: '-0.01em'
            }}
          >
            Pendiente de pago en efectivo
          </h3>
          {/* 3. Nombre del carro */}
          <p
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--texto-second, #475569)',
              margin: '0 0 18px'
            }}
          >
            {nombreAuto}
          </p>
        </div>

        {/* 4. Foto del carro completa y bien visible */}
        <div
          style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '18px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            maxHeight: '260px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(29, 78, 216, 0.04)'
          }}
        >
          {imagenAuto ? (
            <img
              src={imagenAuto}
              alt={nombreAuto}
              style={{
                width: '100%',
                maxHeight: '220px',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#60A5FA' }}>
              <FaCar size={48} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Foto no disponible</span>
            </div>
          )}
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
  const { reservas, cargando, error, guardarValoracion } = useHistorialReservas()
  const [mes, setMes] = useState('todos'), [estadoFiltro, setEstadoFiltro] = useState('todos'), [valorando, setValorando] = useState(null), [detalle, setDetalle] = useState(null)
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
    <section className="reservas-lista">{filtradas.map(r => <TarjetaReserva key={r.id} reserva={r} moneda={moneda} onValorar={setValorando} onReportar={reportar} onVerDetalle={setDetalle} />)}</section>
  </main>{valorando && <ModalValoracion reserva={valorando} onClose={() => setValorando(null)} onSave={guardarValoracion} />}{detalle && <ModalDetalle reserva={detalle} moneda={moneda} onClose={() => setDetalle(null)} />}</div>
}
