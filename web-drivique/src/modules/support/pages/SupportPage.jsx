import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
  FaCar,
  FaBolt,
  FaLifeRing,
  FaMagic,
  FaFileAlt,
  FaQuestionCircle,
  FaClock,
  FaCamera,
  FaUser,
  FaPaperPlane,
  FaFolderOpen,
} from 'react-icons/fa'
import { useLanding } from '@/modules/landing/LandingContext'
import { useAuthStore } from '@/store/authStore'
import CatalogTopHeader from '@/modules/catalog/components/CatalogTopHeader'
import { useSupportStore } from '../store/useSupportStore'
import { CANALES_ATENCION, TIPOS_INCIDENCIA, FAQS_INITIAL } from '../data/support.dummy'
import ReportDetailModal from '../components/ReportDetailModal'
import './SupportPage.css'

// Lista de vehículos con reservas activas/válidas para el selector
const VEHICULOS_RESERVAS_ACTIVAS = [
  { id: 'res-1', nombre: 'Toyota Prado VX', placa: 'KLS-849' },
  { id: 'res-2', nombre: 'Chevrolet Spark GT', placa: 'HGF-123' },
  { id: 'res-3', nombre: 'Ford Explorer 2024', placa: 'ERT-456' },
  { id: 'res-4', nombre: 'Toyota Corolla 2024', placa: 'ABC-123' },
]

export default function SupportPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'

  // Leer parámetros de URL o location state si viene de "Hacer reporte" en Mis Reservas
  const searchParams = new URLSearchParams(location.search)
  const vehiculoParam = searchParams.get('vehiculo') || location.state?.vehiculo || ''
  const placaParam = searchParams.get('placa') || location.state?.placa || ''

  const [pestanaActiva, setPestanaActiva] = useState(
    vehiculoParam ? 'reportar' : 'canales'
  ) // 'canales' | 'reportar' | 'informes'

  const { reportes, conteoReportesActivos, crearReporte } = useSupportStore()
  const [reporteSeleccionadoModal, setReporteSeleccionadoModal] = useState(null)

  // FAQs desplegables
  const [faqAbiertaId, setFaqAbiertaId] = useState(null)

  // Estado del Formulario
  const [formData, setFormData] = useState({
    vehiculo: vehiculoParam || VEHICULOS_RESERVAS_ACTIVAS[0].nombre,
    placa: placaParam || VEHICULOS_RESERVAS_ACTIVAS[0].placa,
    tipoIncidenciaId: 'averia_mecanica',
    descripcion: '',
    evidenciasCount: 0,
    contactoNombre: usuario?.nombre ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : 'Cliente Drivique',
    contactoTelefono: usuario?.telefono || '+57 314 478 9702',
    contactoEmail: usuario?.correo || usuario?.email || 'cliente@drivique.com',
  })

  // Actualiza el formulario si llegan params desde Mis Reservas
  useEffect(() => {
    if (vehiculoParam || placaParam) {
      setFormData((prev) => ({
        ...prev,
        vehiculo: vehiculoParam || prev.vehiculo,
        placa: placaParam || prev.placa,
      }))
      setPestanaActiva('reportar')
    }
  }, [vehiculoParam, placaParam])

  // Al seleccionar un vehículo del dropdown, actualiza el vehículo y su placa correspondiente
  const handleSelectVehiculoChange = (e) => {
    const nombreVeh = e.target.value
    const vehEncontrado = VEHICULOS_RESERVAS_ACTIVAS.find((v) => v.nombre === nombreVeh)

    setFormData((prev) => ({
      ...prev,
      vehiculo: nombreVeh,
      placa: vehEncontrado ? vehEncontrado.placa : prev.placa,
    }))
  }

  // Obtiene objeto del tipo de incidencia seleccionado
  const tipoSeleccionadoObj = TIPOS_INCIDENCIA.find((t) => t.id === formData.tipoIncidenciaId) || TIPOS_INCIDENCIA[0]

  const handleTipoChipClick = (id) => {
    setFormData((prev) => ({ ...prev, tipoIncidenciaId: id }))
  }

  const handleAdjuntarEvidencia = () => {
    if (formData.evidenciasCount >= 3) {
      alert(t('soporte.maxEvidencias', 'Máximo 3 fotos o evidencias permitidas.'))
      return
    }
    setFormData((prev) => ({ ...prev, evidenciasCount: prev.evidenciasCount + 1 }))
  }

  const handleEnviarReporte = (e) => {
    e.preventDefault()

    if (!formData.descripcion.trim()) {
      alert(t('soporte.errorDescripcion', 'Por favor describe el problema sucedido.'))
      return
    }

    if (!formData.contactoNombre.trim() || !formData.contactoTelefono.trim()) {
      alert(t('soporte.errorContacto', 'Por favor ingresa tus datos de contacto para seguimiento.'))
      return
    }

    const reporteCreado = crearReporte(formData)

    alert(
      t(
        'soporte.reporteCreadoExito',
        `¡Reporte ${reporteCreado.codigo} registrado exitosamente!\nTiempo estimado de atención: ${reporteCreado.tiempoEstimado}. Se enviará una actualización a tu correo y notificaciones.`
      )
    )

    // Resetea formulario y pasa a pestaña Informes erróneos
    setFormData((prev) => ({
      ...prev,
      descripcion: '',
      evidenciasCount: 0,
    }))

    setPestanaActiva('informes')
  }

  const cHeader = {
    navBg: esModoOscuro ? '#0f172a' : '#ffffff',
    navBorder: esModoOscuro ? '#334155' : '#e2e8f0',
    navShadow: '0 4px 20px rgba(0,0,0,0.04)',
    accentText: esModoOscuro ? '#93c5fd' : '#1e3a8a',
  }

  // Renderizado de iconos para chips de incidencia
  const renderIconoChip = (iconoNombre) => {
    switch (iconoNombre) {
      case 'FaCar':
        return <FaCar />
      case 'FaBolt':
        return <FaBolt />
      case 'FaLifeRing':
        return <FaLifeRing />
      case 'FaSparkles':
        return <FaMagic />
      case 'FaFileAlt':
        return <FaFileAlt />
      case 'FaQuestionCircle':
      default:
        return <FaQuestionCircle />
    }
  }

  return (
    <div className="soporte-pagina">
      {/* Header Superior Limpio */}
      <CatalogTopHeader c={cHeader} mostrarPerfil modoRegistrado />

      <main className="soporte-main">
        {/* Encabezado */}
        <div className="soporte-header-title">
          <h1>{t('soporte.title', 'Soporte')}</h1>
          <p>{t('soporte.subtitle', 'Asistencia técnica en carretera y atención personalizada 24/7')}</p>
        </div>

        {/* Pestañas (Tabs Bar) */}
        <div className="soporte-tabs-container">
          <button
            className={`soporte-tab-btn ${pestanaActiva === 'canales' ? 'activa' : ''}`}
            onClick={() => setPestanaActiva('canales')}
          >
            <FaHeadphones /> {t('soporte.tabCanales', 'Canales de atención')}
          </button>

          <button
            className={`soporte-tab-btn ${pestanaActiva === 'reportar' ? 'activa' : ''}`}
            onClick={() => setPestanaActiva('reportar')}
          >
            <FaWrench /> {t('soporte.tabReportar', 'Reportar incidencia')}
          </button>

          <button
            className={`soporte-tab-btn ${pestanaActiva === 'informes' ? 'activa' : ''}`}
            onClick={() => setPestanaActiva('informes')}
          >
            <FaFolderOpen /> {t('soporte.tabInformes', 'Informes erróneos')}
            {conteoReportesActivos > 0 && (
              <span className="soporte-tab-badge">{conteoReportesActivos}</span>
            )}
          </button>
        </div>

        {/* ── PESTAÑA 1: CANALES DE ATENCIÓN ── */}
        {pestanaActiva === 'canales' && (
          <div>
            {/* Card Hero Centro de Atención */}
            <div className="centro-atencion-card">
              <div className="centro-atencion-icon-wrap">
                <FaHeadphones />
              </div>
              <h2>{t('soporte.centroTitle', 'Centro de Atención al Usuario')}</h2>
              <p>
                {t(
                  'soporte.centroSub',
                  'Asistencia personalizada para tus alquileres de vehículos en Drivique.'
                )}
              </p>
              <button
                className="btn-reportar-incidencia-hero"
                onClick={() => setPestanaActiva('reportar')}
              >
                <FaExclamationTriangle /> {t('soporte.btnReportarHero', 'Reportar Incidencia')}
              </button>
            </div>

            {/* Lista de Canales de Atención */}
            <h3 className="seccion-subtitulo-soporte">
              {t('soporte.canalesHeader', 'Canales de atención')}
            </h3>

            <div className="canales-lista">
              {CANALES_ATENCION.map((canal) => (
                <a
                  key={canal.id}
                  href={canal.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="canal-card-item"
                >
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

            {/* Sección Preguntas Frecuentes (FAQs) */}
            <h3 className="seccion-subtitulo-soporte" style={{ marginTop: 36 }}>
              {t('soporte.faqsHeader', 'Preguntas frecuentes')}
            </h3>

            <div className="faqs-lista">
              {FAQS_INITIAL.map((faq) => {
                const isOpen = faqAbiertaId === faq.id
                return (
                  <div key={faq.id} className="faq-item">
                    <button
                      className="faq-pregunta-btn"
                      onClick={() => setFaqAbiertaId(isOpen ? null : faq.id)}
                    >
                      <span>{t(faq.preguntaKey, faq.preguntaFallback)}</span>
                      {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                    </button>

                    {isOpen && (
                      <div className="faq-respuesta">
                        {t(faq.respuestaKey, faq.respuestaFallback)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── PESTAÑA 2: REPORTAR INCIDENCIA (FORMULARIO) ── */}
        {pestanaActiva === 'reportar' && (
          <div>
            {/* Banner de Información */}
            <div className="form-info-banner">
              <FaInfoCircle style={{ fontSize: 20, color: '#2563eb', flexShrink: 0 }} />
              <span>
                {t(
                  'soporte.formBanner',
                  'Complete el formulario para reportar cualquier problema técnico o mecánico durante su reserva.'
                )}
              </span>
            </div>

            {/* Card del Formulario */}
            <form className="formulario-incidencia-card" onSubmit={handleEnviarReporte}>
              <div className="form-header-row">
                <FaWrench style={{ color: '#2563eb', fontSize: 22 }} />
                <h3>{t('soporte.formTitle', 'Formulario de Incidencia')}</h3>
              </div>

              {/* Vehículo (Select de Reservas en curso) / Placa asociada */}
              <div className="form-grupo">
                <label className="form-label">
                  {t('soporte.vehiculoLabel', 'Vehículo / Reserva asociada')}
                </label>
                <div className="form-grid-2col">
                  {/* Select desplegable con vehículos en reserva válida */}
                  <select
                    className="form-input-text"
                    value={formData.vehiculo}
                    onChange={handleSelectVehiculoChange}
                  >
                    {VEHICULOS_RESERVAS_ACTIVAS.map((item) => (
                      <option key={item.id} value={item.nombre}>
                        {item.nombre}
                      </option>
                    ))}
                    {formData.vehiculo &&
                      !VEHICULOS_RESERVAS_ACTIVAS.some((v) => v.nombre === formData.vehiculo) && (
                        <option value={formData.vehiculo}>{formData.vehiculo}</option>
                      )}
                  </select>

                  {/* Input de Placa */}
                  <input
                    type="text"
                    className="form-input-text"
                    placeholder="Placa (ej: KLS-849)"
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                  />
                </div>
              </div>

              {/* Tipo de Incidencia */}
              <div className="form-grupo">
                <label className="form-label">
                  {t('soporte.tipoIncidenciaLabel', 'Tipo de Incidencia')} <span>*</span>
                </label>
                <div className="tipos-incidencia-grid">
                  {TIPOS_INCIDENCIA.map((tipo) => {
                    const isSelected = formData.tipoIncidenciaId === tipo.id
                    return (
                      <button
                        key={tipo.id}
                        type="button"
                        className={`tipo-chip-btn ${isSelected ? 'seleccionado' : ''}`}
                        onClick={() => handleTipoChipClick(tipo.id)}
                      >
                        {renderIconoChip(tipo.icono)}
                        <span>{tipo.nombre}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Banner de Tiempo Estimado Dinámico */}
              <div className="tiempo-estimado-banner">
                <FaClock style={{ fontSize: 24, flexShrink: 0 }} />
                <div>
                  <span className="tiempo-estimado-text">
                    {t('soporte.tiempoEstLabel', 'Tiempo estimado de atención técnica:')}
                  </span>
                  <span className="tiempo-estimado-val">{tipoSeleccionadoObj.tiempoEstimado}</span>
                </div>
              </div>

              {/* Descripción del problema */}
              <div className="form-grupo">
                <label className="form-label">
                  {t('soporte.descripcionLabel', 'Descripción del problema')} <span>*</span>
                </label>
                <textarea
                  rows={4}
                  className="form-textarea"
                  placeholder={t(
                    'soporte.descripcionPlaceholder',
                    'Describe lo sucedido, ruidos, testigos en tablero o ubicación actual...'
                  )}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>

              {/* Evidencias (Imágenes / Videos opcionales) */}
              <div className="form-grupo">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    {t('soporte.evidenciasLabel', 'Evidencias (Imágenes / Videos opcionales)')}
                  </label>
                  <span style={{ fontSize: 11, color: 'var(--texto-second, #94a3b8)' }}>
                    Máx 3 fotos ({formData.evidenciasCount}/3)
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="evidencias-upload-box" onClick={handleAdjuntarEvidencia}>
                    <FaCamera style={{ fontSize: 22 }} />
                    <span>+ Adjunto</span>
                  </div>

                  {formData.evidenciasCount > 0 && (
                    <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 800 }}>
                      ✓ {formData.evidenciasCount} evidencia(s) adjuntada(s)
                    </div>
                  )}
                </div>
              </div>

              {/* Datos de contacto para seguimiento */}
              <div className="contacto-seccion-header">
                <h4>
                  <FaUser style={{ color: '#2563eb' }} />
                  {t('soporte.contactoHeader', 'Datos de contacto para seguimiento')}
                </h4>
                <p>
                  {t(
                    'soporte.contactoSub',
                    'Precargados automáticamente desde tu perfil registrado (puedes editarlos si lo requieres).'
                  )}
                </p>
              </div>

              <div className="form-grupo">
                <label className="form-label">
                  {t('soporte.nombreLabel', 'Nombre completo')} <span>*</span>
                </label>
                <input
                  type="text"
                  className="form-input-text"
                  value={formData.contactoNombre}
                  onChange={(e) => setFormData({ ...formData, contactoNombre: e.target.value })}
                />
              </div>

              <div className="form-grupo">
                <div className="form-grid-2col">
                  <div>
                    <label className="form-label">
                      {t('soporte.telefonoLabel', 'Teléfono')} <span>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input-text"
                      value={formData.contactoTelefono}
                      onChange={(e) => setFormData({ ...formData, contactoTelefono: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      {t('soporte.emailLabel', 'Correo electrónico')} <span>*</span>
                    </label>
                    <input
                      type="email"
                      className="form-input-text"
                      value={formData.contactoEmail}
                      onChange={(e) => setFormData({ ...formData, contactoEmail: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-enviar-reporte">
                <FaPaperPlane /> {t('soporte.btnEnviarReporte', 'Enviar Reporte de Incidencia')}
              </button>
            </form>
          </div>
        )}

        {/* ── PESTAÑA 3: INFORMES ERRÓNEOS (MIS REPORTES) ── */}
        {pestanaActiva === 'informes' && (
          <div>
            {reportes.length === 0 ? (
              <div className="notificaciones-vacio" style={{ background: 'var(--bg-tarjeta, #ffffff)' }}>
                <FaFolderOpen className="notificaciones-vacio-icon" />
                <h3>{t('soporte.sinReportesTitle', 'No tienes informes o reportes activos')}</h3>
                <p>{t('soporte.sinReportesMsg', 'Si tienes alguna avería o problema con tu vehículo, puedes crear un reporte en la pestaña anterior.')}</p>
              </div>
            ) : (
              <div className="reportes-lista">
                {reportes.map((rep) => {
                  const getEstadoPill = (estado) => {
                    switch (estado) {
                      case 'resuelto':
                        return { text: 'Resuelto', bg: '#dcfce7', color: '#15803d', dot: '#16a34a' }
                      case 'en_atencion':
                        return { text: 'En atención', bg: '#f3e8ff', color: '#7e22ce', dot: '#9333ea' }
                      case 'en_revision':
                        return { text: 'En revisión', bg: '#fef3c7', color: '#b45309', dot: '#d97706' }
                      case 'recibido':
                      default:
                        return { text: 'Recibido', bg: '#dbeafe', color: '#1e40af', dot: '#2563eb' }
                    }
                  }

                  const pill = getEstadoPill(rep.estado)

                  return (
                    <div key={rep.id} className="reporte-card-item">
                      <div className="reporte-top-row">
                        <span className="reporte-codigo">{rep.codigo}</span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: pill.bg,
                            color: pill.color,
                            padding: '4px 10px',
                            borderRadius: 14,
                            fontSize: 11,
                            fontWeight: 800,
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: pill.dot }} />
                          {pill.text}
                        </span>
                      </div>

                      <div className="reporte-tipo-vehiculo">{rep.tipoIncidenciaNombre}</div>
                      <div className="reporte-vehiculo-sub">
                        {rep.vehiculo} {rep.placa && `(Placa: ${rep.placa})`}
                      </div>

                      <p className="reporte-desc-snippet">{rep.descripcion}</p>

                      <div className="reporte-footer-row">
                        <span className="reporte-tiempo-est">
                          Tiempo est: {rep.tiempoEstimado}
                        </span>

                        <button
                          className="btn-ver-detalle-reporte"
                          onClick={() => setReporteSeleccionadoModal(rep)}
                        >
                          Ver detalle →
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

      {/* Modal de Detalle de Reporte */}
      <ReportDetailModal
        reporte={reporteSeleccionadoModal}
        onClose={() => setReporteSeleccionadoModal(null)}
      />
    </div>
  )
}
