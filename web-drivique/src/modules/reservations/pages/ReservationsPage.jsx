import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { FaCalendarAlt, FaCar } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useTranslation } from 'react-i18next'



import { useHistorialReservas } from '../hooks/useReservations'
import filtrosReservas from '@/config/datos/reservationsFilters.json'
import CatalogTopHeader from '@/modules/catalog/components/CatalogTopHeader'





import './ReservationsPage.css'








import DetalleModal from './ReservationsPage/DetalleModal'
import useModalDetalleLogic1 from './ReservationsPage/useModalDetalleLogic1'
import useModalDetalleLogic2 from './ReservationsPage/useModalDetalleLogic2'
import obtenerTituloSeccionFecha from './ReservationsPage/obtenerTituloSeccionFecha'

import ModalValoracion from './ReservationsPage/ModalValoracion'
import TarjetaReserva from './ReservationsPage/TarjetaReserva'



const coloresTema = (oscuro) => ({
  navBg: oscuro ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.98)',
  navBorder: oscuro ? '#1e293b' : '#e8eef8',
  navShadow: oscuro ? '0 2px 12px rgba(0,0,0,0.25)' : '0 2px 14px rgba(var(--brand-secondary-rgb),0.06)',
  textPrimary: oscuro ? '#f8fafc' : '#111a3a',
  accentText: 'var(--brand-text)',
  heroCardBg: oscuro ? '#111827' : '#ffffff',
  heroCardBorder: oscuro ? '#334155' : '#d9e3f1',
})






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









/** Reseñas que el cliente ya publicó para la reserva (vehículo y sucursal), tal como las guarda el servidor. */










function ModalDetalle({ reserva, moneda, autoDesbloquear = false, onClose, onValorar, onReportar, onCancelar }) {
  const { navigate, t, i18n, brand, cancelando, contrato, reservaOriginal, isPendingDocs, isPendingSchedule, esFinalizadaModal, puedeCancelarModal, handleCancelarReserva, requiereFirmaModal, esConfirmadaModal, estaEnCursoModal, estado, nombreAuto, imagenAuto, proteccion, esDocumentosRechazados, esPendienteHorario, esPendienteValidacion, esPendienteEfectivo, esPendienteWompi, sucursalPago, ciudadPago, direccionPago, totalCalculado, domicilioRetiro, domicilioDevolucion, lugarRetiro, lugarDevolucion, esDomicilioRetiro, esDomicilioDevolucion, esDomicilio, domicilioEstado, domicilioConductor, domicilioTelefonoConductor, domicilioPin, revelarPin, setRevelarPin, verMasDomicilio, setVerMasDomicilio, medioPagoTexto, pagandoWompi, setPagandoWompi, wompiCardRef } = useModalDetalleLogic1({ autoDesbloquear, onCancelar, onClose, reserva })

  const { handlePagarWompi, formatHoraAmPm } = useModalDetalleLogic2({ contrato, isPendingDocs, isPendingSchedule, reserva, reservaOriginal, setPagandoWompi, t })

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <DetalleModal autoDesbloquear={autoDesbloquear} brand={brand} cancelando={cancelando} ciudadPago={ciudadPago} direccionPago={direccionPago} domicilioConductor={domicilioConductor} domicilioDevolucion={domicilioDevolucion} domicilioEstado={domicilioEstado} domicilioPin={domicilioPin} domicilioRetiro={domicilioRetiro} domicilioTelefonoConductor={domicilioTelefonoConductor} esConfirmadaModal={esConfirmadaModal} esDocumentosRechazados={esDocumentosRechazados} esDomicilio={esDomicilio} esDomicilioDevolucion={esDomicilioDevolucion} esDomicilioRetiro={esDomicilioRetiro} esFinalizadaModal={esFinalizadaModal} esPendienteEfectivo={esPendienteEfectivo} esPendienteHorario={esPendienteHorario} esPendienteValidacion={esPendienteValidacion} esPendienteWompi={esPendienteWompi} estaEnCursoModal={estaEnCursoModal} estado={estado} formatHoraAmPm={formatHoraAmPm} handleCancelarReserva={handleCancelarReserva} handlePagarWompi={handlePagarWompi} i18n={i18n} imagenAuto={imagenAuto} lugarDevolucion={lugarDevolucion} lugarRetiro={lugarRetiro} medioPagoTexto={medioPagoTexto} moneda={moneda} navigate={navigate} nombreAuto={nombreAuto} onCancelar={onCancelar} onClose={onClose} onReportar={onReportar} onValorar={onValorar} pagandoWompi={pagandoWompi} proteccion={proteccion} puedeCancelarModal={puedeCancelarModal} requiereFirmaModal={requiereFirmaModal} reserva={reserva} reservaOriginal={reservaOriginal} revelarPin={revelarPin} setRevelarPin={setRevelarPin} setVerMasDomicilio={setVerMasDomicilio} sucursalPago={sucursalPago} t={t} totalCalculado={totalCalculado} verMasDomicilio={verMasDomicilio} wompiCardRef={wompiCardRef} />
    </div>
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
      // Una fecha con hora (UTC del servidor) se agrupa por el día local, el mismo que muestra la tarjeta
      const ts = typeof rawDate === 'string' && /T\d{2}:\d{2}/.test(rawDate) ? new Date(rawDate) : null
      const fechaKey = ts && !Number.isNaN(ts.getTime())
        ? `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}-${String(ts.getDate()).padStart(2, '0')}`
        : String(rawDate).split('T')[0] || 'desconocida'
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

