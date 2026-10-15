import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaHeadphones,
  FaExclamationTriangle,
  FaWhatsapp,
  FaPhoneAlt,
  FaEnvelope,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
  FaInfoCircle,
  FaWrench,
  FaClock,
  FaCamera,
  FaPaperPlane,
  FaFolderOpen,
} from 'react-icons/fa'
import { useLanding } from '@/modules/landing/LandingContext'
import CatalogTopHeader from '@/modules/catalog/components/CatalogTopHeader'
import { reservationsService } from '@/services/reservationsService'
import { incidentService } from '@/services/incidentService'
import { api } from '@/services/httpClient'
import { CANALES_ATENCION, FAQS_INITIAL } from '../constants/supportContent'
import IncidentDetailModal from '../components/IncidentDetailModal'
import {
  CATEGORIES, PRIORITY, STATUS, categoryLabel, formatDateTime, formatSize, validateFiles,
} from '../lib/incidentLabels'
import './SupportPage.css'

const EMPTY_FORM = { category: 'VEHICLE', reservationId: '', branchId: '', subject: '', description: '' }

export default function SupportPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'

  const searchParams = new URLSearchParams(location.search)
  const reservaParam = searchParams.get('reserva') || location.state?.reserva || ''
  const incidenciaParam = searchParams.get('incidencia') || ''

  const [pestanaActiva, setPestanaActiva] = useState(incidenciaParam ? 'informes' : reservaParam ? 'reportar' : 'canales')
  const [faqAbiertaId, setFaqAbiertaId] = useState(null)

  const [reservas, setReservas] = useState([])
  const [sedes, setSedes] = useState([])
  const [incidencias, setIncidencias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [detalleId, setDetalleId] = useState(incidenciaParam || null)

  const [form, setForm] = useState({ ...EMPTY_FORM, reservationId: reservaParam })
  const [archivos, setArchivos] = useState([])
  const [enviando, setEnviando] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  const [creada, setCreada] = useState(null)
  const inputArchivos = useRef(null)

  const cargar = useCallback(async () => {
    try {
      setErrorCarga('')
      const [misReservas, misIncidencias, listaSedes] = await Promise.all([reservationsService.getReservas(), incidentService.mine(), api.get('/branches')])
      setReservas(Array.isArray(misReservas) ? misReservas : [])
      setSedes(listaSedes.data || [])
      setIncidencias(misIncidencias)
    } catch (error) {
      setErrorCarga(error.message || 'No se pudieron cargar tus reportes.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const conteoActivos = useMemo(() => incidencias.filter((i) => i.status === 'OPEN' || i.status === 'IN_REVIEW').length, [incidencias])
  const reservaSeleccionada = reservas.find((r) => String(r.id) === String(form.reservationId))
  const requiereReserva = form.category === 'RESERVATION' || form.category === 'VEHICLE'

  const adjuntar = (event) => {
    const resultado = validateFiles(archivos, [...event.target.files])
    event.target.value = ''
    if (resultado.error) setErrorForm(resultado.error)
    else { setErrorForm(''); setArchivos(resultado.files) }
  }

  const enviar = async (event) => {
    event.preventDefault()
    setErrorForm('')
    if (requiereReserva && !form.reservationId) {
      setErrorForm('Selecciona la reserva a la que se refiere la incidencia.')
      return
    }
    if (!form.reservationId && !form.branchId) {
      setErrorForm('Selecciona la sede a la que va dirigida la incidencia.')
      return
    }
    if (!form.subject.trim() || !form.description.trim()) {
      setErrorForm('Completa el asunto y la descripción del problema.')
      return
    }
    setEnviando(true)
    try {
      let incidencia = await incidentService.create({
        category: form.category,
        reservationId: form.reservationId || null,
        branchId: form.reservationId ? null : form.branchId,
        subject: form.subject.trim(),
        description: form.description.trim(),
      })
      if (archivos.length) incidencia = await incidentService.uploadAttachments(incidencia.id, archivos).then(() => incidencia)
      setCreada(incidencia)
      setForm({ ...EMPTY_FORM, reservationId: reservaParam })
      setArchivos([])
      await cargar()
      setPestanaActiva('informes')
    } catch (error) {
      setErrorForm(error.message)
    } finally {
      setEnviando(false)
    }
  }

  const cHeader = {
    navBg: esModoOscuro ? '#0f172a' : '#ffffff',
    navBorder: esModoOscuro ? '#334155' : '#e2e8f0',
    navShadow: '0 4px 20px rgba(0,0,0,0.04)',
    accentText: 'var(--brand-text)',
  }

  const pillStyle = (palette) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6, background: palette.bg, color: palette.color,
    padding: '4px 10px', borderRadius: 14, fontSize: 11, fontWeight: 800,
  })

  return (
    <div className="soporte-pagina">
      <CatalogTopHeader c={cHeader} mostrarPerfil modoRegistrado />

      <main className="soporte-main">
        <div className="soporte-header-title">
          <h1>{t('soporte.title', 'Soporte')}</h1>
          <p>{t('soporte.subtitle', 'Asistencia técnica en carretera y atención personalizada 24/7')}</p>
        </div>

        <div className="soporte-tabs-container">
          <button className={`soporte-tab-btn ${pestanaActiva === 'canales' ? 'activa' : ''}`} onClick={() => setPestanaActiva('canales')}>
            <FaHeadphones /> {t('soporte.tabCanales', 'Canales de atención')}
          </button>
          <button className={`soporte-tab-btn ${pestanaActiva === 'reportar' ? 'activa' : ''}`} onClick={() => setPestanaActiva('reportar')}>
            <FaWrench /> {t('soporte.tabReportar', 'Reportar incidencia')}
          </button>
          <button className={`soporte-tab-btn ${pestanaActiva === 'informes' ? 'activa' : ''}`} onClick={() => setPestanaActiva('informes')}>
            <FaFolderOpen /> {t('soporte.tabInformes', 'Mis reportes')}
            {conteoActivos > 0 && <span className="soporte-tab-badge">{conteoActivos}</span>}
          </button>
        </div>

        {pestanaActiva === 'canales' && (
          <div>
            <div className="centro-atencion-card">
              <div className="centro-atencion-icon-wrap"><FaHeadphones /></div>
              <h2>{t('soporte.centroTitle', 'Centro de Atención al Usuario')}</h2>
              <p>{t('soporte.centroSub', 'Asistencia personalizada para tus alquileres de vehículos en Drivique.')}</p>
              <button className="btn-reportar-incidencia-hero" onClick={() => setPestanaActiva('reportar')}>
                <FaExclamationTriangle /> {t('soporte.btnReportarHero', 'Reportar Incidencia')}
              </button>
            </div>

            <h3 className="seccion-subtitulo-soporte">{t('soporte.canalesHeader', 'Canales de atención')}</h3>
            <div className="canales-lista">
              {CANALES_ATENCION.map((canal) => (
                <a key={canal.id} href={canal.link} target="_blank" rel="noopener noreferrer" className="canal-card-item">
                  <div className={`canal-icon-wrap ${canal.tipo}`}>
                    {canal.tipo === 'whatsapp' && <FaWhatsapp />}
                    {canal.tipo === 'telefono' && <FaPhoneAlt />}
                    {canal.tipo === 'correo' && <FaEnvelope />}
                  </div>
                  <div className="canal-info">
                    <h4 className="canal-titulo">{t(canal.tituloKey, canal.tituloFallback)}</h4>
                    <p className="canal-subtitulo">{t(canal.subtituloKey, canal.subtituloFallback)}</p>
                  </div>
                  <FaChevronRight className="canal-flecha" />
                </a>
              ))}
            </div>

            <h3 className="seccion-subtitulo-soporte" style={{ marginTop: 36 }}>{t('soporte.faqsHeader', 'Preguntas frecuentes')}</h3>
            <div className="faqs-lista">
              {FAQS_INITIAL.map((faq) => {
                const abierta = faqAbiertaId === faq.id
                return (
                  <div key={faq.id} className="faq-item">
                    <button className="faq-pregunta-btn" onClick={() => setFaqAbiertaId(abierta ? null : faq.id)}>
                      <span>{t(faq.preguntaKey, faq.preguntaFallback)}</span>
                      {abierta ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    {abierta && <div className="faq-respuesta">{t(faq.respuestaKey, faq.respuestaFallback)}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {pestanaActiva === 'reportar' && (
          <div>
            <div className="form-info-banner">
              <FaInfoCircle style={{ fontSize: 20, color: 'var(--brand-text)', flexShrink: 0 }} />
              <span>{t('soporte.formBanner', 'Cuéntanos qué pasó. La prioridad y el tiempo de atención se calculan automáticamente según el tipo de problema.')}</span>
            </div>

            <form className="formulario-incidencia-card" onSubmit={enviar}>
              <div className="form-header-row">
                <FaWrench style={{ color: 'var(--brand-text)', fontSize: 22 }} />
                <h3>{t('soporte.formTitle', 'Formulario de Incidencia')}</h3>
              </div>

              <div className="form-grupo">
                <label className="form-label">{t('soporte.tipoIncidenciaLabel', 'Tipo de Incidencia')} <span>*</span></label>
                <div className="tipos-incidencia-grid">
                  {CATEGORIES.map((categoria) => (
                    <button key={categoria.id} type="button" title={categoria.hint}
                      className={`tipo-chip-btn ${form.category === categoria.id ? 'seleccionado' : ''}`}
                      onClick={() => setForm({ ...form, category: categoria.id })}>
                      <span>{categoria.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-grupo">
                <label className="form-label">
                  {t('soporte.vehiculoLabel', 'Reserva asociada')} {requiereReserva && <span>*</span>}
                </label>
                <select className="form-input-text" value={form.reservationId} onChange={(e) => setForm({ ...form, reservationId: e.target.value })}>
                  <option value="">{requiereReserva ? 'Selecciona una reserva' : 'Sin reserva asociada'}</option>
                  {reservas.map((reserva) => (
                    <option key={reserva.id} value={reserva.id}>
                      {reserva.code} · {reserva.vehicleModel} ({reserva.vehiclePlate})
                    </option>
                  ))}
                </select>
                {reservaSeleccionada && (
                  <small style={{ opacity: 0.7 }}>{reservaSeleccionada.vehicleModel} · {reservaSeleccionada.vehiclePlate}</small>
                )}
              </div>

              {!form.reservationId && (
                <div className="form-grupo">
                  <label className="form-label">Sede de atención <span>*</span></label>
                  <select className="form-input-text" value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
                    <option value="">Selecciona una sede</option>
                    {sedes.map((sede) => <option key={sede.id} value={sede.id}>{sede.name} - {sede.cityName}</option>)}
                  </select>
                </div>
              )}

              <div className="form-grupo">
                <label className="form-label">Asunto <span>*</span></label>
                <input className="form-input-text" maxLength={150} value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Resume el problema en una frase" />
              </div>

              <div className="form-grupo">
                <label className="form-label">{t('soporte.descripcionLabel', 'Descripción del problema')} <span>*</span></label>
                <textarea rows={4} className="form-textarea" maxLength={5000} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={t('soporte.descripcionPlaceholder', 'Describe lo sucedido, ruidos, testigos en tablero o ubicación actual...')} />
              </div>

              <div className="form-grupo">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label className="form-label" style={{ margin: 0 }}>{t('soporte.evidenciasLabel', 'Evidencias (opcional)')}</label>
                  <span style={{ fontSize: 11, opacity: 0.7 }}>JPG, PNG o PDF · máx. 5 MB · hasta 5 archivos ({archivos.length}/5)</span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="evidencias-upload-box" onClick={() => inputArchivos.current?.click()}>
                    <FaCamera style={{ fontSize: 22 }} />
                    <span>+ Adjunto</span>
                  </div>
                  <input ref={inputArchivos} type="file" accept="image/jpeg,image/png,application/pdf" multiple hidden onChange={adjuntar} />
                  {archivos.map((archivo, indice) => (
                    <span key={indice} style={{ fontSize: 12, border: '1px solid var(--borde, #e2e8f0)', borderRadius: 8, padding: '4px 8px' }}>
                      {archivo.name} ({formatSize(archivo.size)}){' '}
                      <button type="button" onClick={() => setArchivos(archivos.filter((_, j) => j !== indice))}
                        style={{ border: 'none', background: 'none', color: '#b91c1c', cursor: 'pointer' }}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {errorForm && <p style={{ color: '#b91c1c', fontSize: 13, fontWeight: 700 }}>{errorForm}</p>}

              <button type="submit" className="btn-enviar-reporte" disabled={enviando} style={{ opacity: enviando ? 0.6 : 1 }}>
                <FaPaperPlane /> {enviando ? 'Enviando...' : t('soporte.btnEnviarReporte', 'Enviar Reporte de Incidencia')}
              </button>
            </form>
          </div>
        )}

        {pestanaActiva === 'informes' && (
          <div>
            {creada && (
              <div className="form-info-banner" style={{ marginBottom: 16 }}>
                <FaInfoCircle style={{ fontSize: 20, color: 'var(--brand-text)', flexShrink: 0 }} />
                <span>
                  Reporte {creada.code} registrado. Prioridad {PRIORITY[creada.priority]?.label.toLowerCase()}; atención estimada antes de {formatDateTime(creada.slaDueAt)}. Te avisaremos por notificación y correo.
                </span>
              </div>
            )}
            {errorCarga && <p style={{ color: '#b91c1c', fontWeight: 700 }}>{errorCarga}</p>}
            {!cargando && incidencias.length === 0 ? (
              <div className="notificaciones-vacio" style={{ background: 'var(--bg-tarjeta, #ffffff)' }}>
                <FaFolderOpen className="notificaciones-vacio-icon" />
                <h3>{t('soporte.sinReportesTitle', 'No tienes informes o reportes activos')}</h3>
                <p>{t('soporte.sinReportesMsg', 'Si tienes alguna avería o problema con tu vehículo, puedes crear un reporte en la pestaña anterior.')}</p>
              </div>
            ) : (
              <div className="reportes-lista">
                {incidencias.map((incidencia) => (
                  <div key={incidencia.id} className="reporte-card-item">
                    <div className="reporte-top-row">
                      <span className="reporte-codigo">{incidencia.code}</span>
                      <span style={pillStyle(STATUS[incidencia.status])}>{STATUS[incidencia.status]?.label}</span>
                    </div>
                    <div className="reporte-tipo-vehiculo">{incidencia.subject}</div>
                    <div className="reporte-vehiculo-sub">
                      {categoryLabel(incidencia.category)}
                      {incidencia.vehicleModel && ` · ${incidencia.vehicleModel} (Placa: ${incidencia.vehiclePlate})`}
                      {' · '}
                      <span style={pillStyle(PRIORITY[incidencia.priority])}>Prioridad {PRIORITY[incidencia.priority]?.label}</span>
                    </div>
                    <p className="reporte-desc-snippet">{incidencia.description}</p>
                    <div className="reporte-footer-row">
                      <span className="reporte-tiempo-est" style={{ color: incidencia.slaBreached ? '#b91c1c' : undefined }}>
                        <FaClock /> {incidencia.status === 'RESOLVED' || incidencia.status === 'CLOSED'
                          ? `Actualizada ${formatDateTime(incidencia.updatedAt)}`
                          : `${incidencia.slaBreached ? 'Vencida desde' : 'Atención estimada antes de'} ${formatDateTime(incidencia.slaDueAt)}`}
                      </span>
                      <button className="btn-ver-detalle-reporte" onClick={() => setDetalleId(incidencia.id)}>Ver detalle →</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {detalleId && (
        <IncidentDetailModal incidentId={detalleId} mode="customer" onClose={() => setDetalleId(null)} onChanged={cargar} />
      )}
    </div>
  )
}
