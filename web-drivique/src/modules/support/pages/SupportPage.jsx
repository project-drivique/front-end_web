import { useState, useEffect, useMemo, useRef } from 'react'
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
import { showAlert } from '@/utils/swalConfig'
import { useHistorialReservas } from '@/modules/reservations/hooks/useReservations'
import CatalogTopHeader from '@/modules/catalog/components/CatalogTopHeader'
import { useSupportStore } from '../store/useSupportStore'
import { CANALES_ATENCION, TIPOS_INCIDENCIA, FAQS_INITIAL } from '../data/supportCatalog'
import ReportDetailModal from '../components/ReportDetailModal'
import './SupportPage.css'

export default function SupportPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const { usuario } = useAuthStore()
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'

  // Carga historial real de reservas
  const { reservas } = useHistorialReservas()

  // Filtrado de vehículos: reservas en curso, activas o confirmadas
  const vehiculosElegibles = useMemo(() => {
    if (!reservas || reservas.length === 0) return []
    const validas = reservas.filter(
      (r) =>
        r.estado === 'en_curso' ||
        r.estado === 'activa' ||
        r.estado === 'ACTIVE' ||
        r.status === 'ACTIVE' ||
        r.status === 'IN_PROGRESS' ||
        r.estado === 'confirmada' ||
        r.status === 'CONFIRMED'
    )
    return validas.map((r) => {
      const vPlaca = r.vehiculo?.placa || r.vehiclePlate || r.placa || r.reservaDetalles?.placa || ''
      return {
        id: String(r.id),
        reservaId: r.id,
        vehiculoId: r.vehiculo?.id || r.vehicleId || null,
        nombre: r.vehiculo?.nombre || t('hc3.reservation_hash', { defaultValue: 'Reserva #{{id}}', id: r.id }),
        placa: vPlaca,
        estado: r.estado,
      }
    })
  }, [reservas, t])

  // Leer parámetros de URL o location state si viene de "Hacer reporte" en Mis Reservas
  const searchParams = new URLSearchParams(location.search)
  const vehiculoParam = searchParams.get('vehiculo') || location.state?.vehiculo || ''
  const placaParam = searchParams.get('placa') || location.state?.placa || ''

  const [pestanaActiva, setPestanaActiva] = useState(
    vehiculoParam ? 'reportar' : 'canales'
  ) // 'canales' | 'reportar' | 'informes'

  const { reportes, conteoReportesActivos, crearReporte, abrirDetalle } = useSupportStore()
  const inputEvidenciasRef = useRef(null)
  const [archivos, setArchivos] = useState([])
  const [enviando, setEnviando] = useState(false)
  const [reporteSeleccionadoModal, setReporteSeleccionadoModal] = useState(null)

  // FAQs desplegables
  const [faqAbiertaId, setFaqAbiertaId] = useState(null)

  // Estado del Formulario
  const [formData, setFormData] = useState({
    vehiculo: vehiculoParam || (vehiculosElegibles[0] ? vehiculosElegibles[0].nombre : ''),
    placa: placaParam || (vehiculosElegibles[0] ? vehiculosElegibles[0].placa : ''),
    tipoIncidenciaId: 'averia_mecanica',
    descripcion: '',
    evidenciasCount: 0,
    contactoNombre: usuario?.nombre ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : '',
    contactoTelefono: usuario?.telefono || '',
    contactoEmail: usuario?.correo || usuario?.email || '',
  })

  // Sincroniza vehículo y placa cuando cargan las reservas o llegan parámetros
  useEffect(() => {
    if (vehiculoParam || placaParam) {
      setFormData((prev) => ({
        ...prev,
        vehiculo: vehiculoParam || prev.vehiculo,
        placa: placaParam || prev.placa,
      }))
      setPestanaActiva('reportar')
    } else if (vehiculosElegibles.length > 0 && (!formData.vehiculo || !formData.placa)) {
      setFormData((prev) => ({
        ...prev,
        vehiculo: prev.vehiculo || vehiculosElegibles[0].nombre,
        placa: prev.placa || vehiculosElegibles[0].placa,
      }))
    }
  }, [vehiculoParam, placaParam, vehiculosElegibles, formData.vehiculo, formData.placa])

  // Al seleccionar un vehículo del dropdown, actualiza el vehículo y su placa correspondiente automáticamente
  const handleSelectVehiculoChange = (e) => {
    const val = e.target.value
    const vehEncontrado = vehiculosElegibles.find((v) => v.id === val || v.nombre === val)

    setFormData((prev) => ({
      ...prev,
      vehiculo: vehEncontrado ? vehEncontrado.nombre : val,
      placa: vehEncontrado?.placa || prev.placa,
    }))
  }

  // Obtiene objeto del tipo de incidencia seleccionado
  const tipoSeleccionadoObj = TIPOS_INCIDENCIA.find((t) => t.id === formData.tipoIncidenciaId) || TIPOS_INCIDENCIA[0]

  const handleTipoChipClick = (id) => {
    setFormData((prev) => ({ ...prev, tipoIncidenciaId: id }))
  }

  const handleAdjuntarEvidencia = () => {
    if (archivos.length >= 3) {
      showAlert({
        icon: 'warning',
        title: t('soporte.evidenciasTitulo', 'Límite de evidencias'),
        text: t('soporte.maxEvidencias', 'Máximo 3 fotos o evidencias permitidas.'),
        confirmButtonText: t('common.accept', 'Aceptar'),
      })
      return
    }
    inputEvidenciasRef.current?.click()
  }

  const handleArchivosElegidos = (e) => {
    const elegidos = Array.from(e.target.files || [])
    e.target.value = ''
    const siguientes = [...archivos, ...elegidos].slice(0, 3)
    setArchivos(siguientes)
    setFormData((prev) => ({ ...prev, evidenciasCount: siguientes.length }))
  }

  const handleEliminarEvidencia = (index) => {
    const siguientes = archivos.filter((_, i) => i !== index)
    setArchivos(siguientes)
    setFormData((prev) => ({ ...prev, evidenciasCount: siguientes.length }))
  }

  const handleEnviarReporte = async (e) => {
    e.preventDefault()

    if (vehiculosElegibles.length === 0 && !formData.vehiculo) {
      showAlert({
        icon: 'warning',
        title: t('soporte.avisoReporteTitulo', 'Revisa tu reporte'),
        text: t(
          'soporte.sinReservasConfirmadasErr',
          t('hc2.no_tienes_ninguna_reserva_confirmada_o', 'No tienes ninguna reserva confirmada o en curso activa para realizar un reporte de incidencia.')
        ),
        confirmButtonText: t('common.accept', 'Aceptar'),
      })
      return
    }

    if (!formData.descripcion.trim()) {
      showAlert({
        icon: 'warning',
        title: t('soporte.avisoReporteTitulo', 'Revisa tu reporte'),
        text: t('soporte.errorDescripcion', 'Por favor describe el problema sucedido.'),
        confirmButtonText: t('common.accept', 'Aceptar'),
      })
      return
    }

    if (!formData.contactoNombre.trim() || !formData.contactoTelefono.trim()) {
      showAlert({
        icon: 'warning',
        title: t('soporte.avisoReporteTitulo', 'Revisa tu reporte'),
        text: t('soporte.errorContacto', 'Por favor ingresa tus datos de contacto para seguimiento.'),
        confirmButtonText: t('common.accept', 'Aceptar'),
      })
      return
    }

    const elegida = vehiculosElegibles.find((v) => v.nombre === formData.vehiculo)
    let reporteCreado
    try {
      setEnviando(true)
      reporteCreado = await crearReporte(
        { ...formData, reservaId: elegida?.reservaId || null, vehiculoId: elegida?.vehiculoId || null },
        archivos
      )
    } catch (error) {
      showAlert({
        icon: 'error',
        title: t('soporte.errorEnviarTitulo', 'No se pudo registrar el reporte'),
        text: error.message || t('soporte.errorEnviar', 'No fue posible registrar el reporte. Inténtalo de nuevo.'),
        confirmButtonText: t('common.accept', 'Aceptar'),
      })
      return
    } finally {
      setEnviando(false)
    }

    const escapar = (valor) => String(valor ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
    await showAlert({
      icon: 'success',
      title: t('soporte.reporteCreadoTitulo', '¡Reporte registrado!'),
      html: [
        `<strong>${escapar(reporteCreado.codigo)}</strong>`,
        t('soporte.reporteCreadoTiempo', { defaultValue: 'Tiempo estimado de atención: {{tiempo}}.', tiempo: escapar(reporteCreado.tiempoEstimado), interpolation: { escapeValue: false } }),
        t('soporte.reporteCreadoAviso', 'Recibirás las actualizaciones por correo y en la aplicación.'),
      ].join('<br/>'),
      confirmButtonText: t('common.accept', 'Aceptar'),
    })

    // Resetea formulario y pasa a pestaña Informes erróneos
    setFormData((prev) => ({
      ...prev,
      descripcion: '',
      evidenciasCount: 0,
    }))
    setArchivos([])

    setPestanaActiva('informes')
  }

  const cHeader = {
    navBg: esModoOscuro ? '#0f172a' : '#ffffff',
    navBorder: esModoOscuro ? '#334155' : '#e2e8f0',
    navShadow: '0 4px 20px rgba(0,0,0,0.04)',
    accentText: 'var(--brand-text)',
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
            <FaFolderOpen /> {t('soporte.tabInformes', 'Mis reportes')}
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
                  t('hc2.asistencia_personalizada_para_tus_alqu', 'Asistencia personalizada para tus alquileres de vehículos en Drivique.')
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
              <FaInfoCircle style={{ fontSize: 20, color: 'var(--brand-text)', flexShrink: 0 }} />
              <span>
                {t(
                  'soporte.formBanner',
                  t('hc2.complete_el_formulario_para_reportar_c', 'Complete el formulario para reportar cualquier problema técnico o mecánico durante su reserva.')
                )}
              </span>
            </div>

            {/* Aviso si no hay reservas confirmadas activas */}
            {vehiculosElegibles.length === 0 && !formData.vehiculo && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  borderRadius: 16,
                  padding: '16px 20px',
                  marginBottom: 24,
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <FaExclamationTriangle style={{ fontSize: 20, flexShrink: 0 }} />
                <span>
                  No cuentas con reservas confirmadas o en curso en este momento. Para reportar una incidencia debes tener una reserva confirmada activa.
                </span>
              </div>
            )}

            {/* Card del Formulario */}
            <form className="formulario-incidencia-card" onSubmit={handleEnviarReporte}>
              <div className="form-header-row">
                <FaWrench style={{ color: 'var(--brand-text)', fontSize: 22 }} />
                <h3>{t('soporte.formTitle', 'Formulario de Incidencia')}</h3>
              </div>

              {/* Vehículo (Select de Reservas en curso) / Placa asociada */}
              <div className="form-grupo">
                <label className="form-label">
                  {t('soporte.vehiculoLabel', 'Vehículo / Reserva asociada')}
                </label>
                <div className="form-grid-2col">
                  {/* Select desplegable con vehículos en reserva confirmada/en curso/finalizada */}
                  <select
                    className="form-input-text"
                    value={vehiculosElegibles.find(v => v.nombre === formData.vehiculo)?.id || formData.vehiculo}
                    onChange={handleSelectVehiculoChange}
                    disabled={enviando || (vehiculosElegibles.length === 0 && !formData.vehiculo)}
                  >
                    {vehiculosElegibles.length === 0 ? (
                      <option value="">{t('hc.no_tienes_reservas_confirmadas_para_re', 'No tienes reservas confirmadas para reportar')}</option>
                    ) : (
                      vehiculosElegibles.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nombre} {item.placa ? `— Placa: ${item.placa}` : ''}
                        </option>
                      ))
                    )}
                    {formData.vehiculo &&
                      !vehiculosElegibles.some((v) => v.nombre === formData.vehiculo || v.id === formData.vehiculo) && (
                        <option value={formData.vehiculo}>{formData.vehiculo}</option>
                      )}
                  </select>

                  {/* Input de Placa automática del carro */}
                  <input
                    type="text"
                    className="form-input-text"
                    placeholder={t('hc2.placa_ej_kls_849', 'Placa del vehículo (ej: KLS-849)')}
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                    readOnly={Boolean(formData.vehiculo && vehiculosElegibles.some(v => (v.nombre === formData.vehiculo || v.id === formData.vehiculo) && v.placa))}
                    style={{
                      fontFamily: 'monospace, sans-serif',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      background: formData.placa ? 'var(--city-bg, #f8fafc)' : undefined,
                    }}
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
                    t('hc2.describe_lo_sucedido_ruidos_testigos_e', 'Describe lo sucedido, ruidos, testigos en tablero o ubicación actual...')
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

                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  {archivos.length < 3 && (
                    <div className="evidencias-upload-box" onClick={handleAdjuntarEvidencia} style={{ flexShrink: 0 }}>
                      <FaCamera style={{ fontSize: 22 }} />
                      <span>{t('hc4.adjunto', '+ Adjunto')}</span>
                    </div>
                  )}
                  <input
                    ref={inputEvidenciasRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4"
                    multiple
                    hidden
                    onChange={handleArchivosElegidos}
                  />

                  {/* Vista previa de las fotos subidas */}
                  {archivos.map((archivo, idx) => {
                    const previewUrl = URL.createObjectURL(archivo)
                    const isVideo = archivo.type?.startsWith('video/')
                    return (
                      <div
                        key={`${archivo.name}-${idx}`}
                        style={{
                          position: 'relative',
                          width: 100,
                          height: 90,
                          borderRadius: 16,
                          overflow: 'hidden',
                          border: '1px solid var(--borde, #e2e8f0)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          background: '#0f172a',
                          flexShrink: 0
                        }}
                      >
                        {isVideo ? (
                          <video
                            src={previewUrl}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <img
                            src={previewUrl}
                            alt={`Evidencia ${idx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleEliminarEvidencia(idx)}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: 'rgba(0,0,0,0.7)',
                            color: '#ffffff',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: 13,
                            lineHeight: 1
                          }}
                          title={t('common.delete', 'Eliminar')}
                        >
                          ×
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Datos de contacto para seguimiento */}
              <div className="contacto-seccion-header">
                <h4>
                  <FaUser style={{ color: 'var(--brand-text)' }} />
                  {t('soporte.contactoHeader', 'Datos de contacto para seguimiento')}
                </h4>
                <p>
                  {t(
                    'soporte.contactoSub',
                    t('hc2.precargados_automaticamente_desde_tu_p', 'Precargados automáticamente desde tu perfil registrado (puedes editarlos si lo requieres).')
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

              <button
                type="submit"
                className="btn-enviar-reporte"
                disabled={vehiculosElegibles.length === 0 && !formData.vehiculo}
                style={{
                  opacity: vehiculosElegibles.length === 0 && !formData.vehiculo ? 0.6 : 1,
                  cursor: vehiculosElegibles.length === 0 && !formData.vehiculo ? 'not-allowed' : 'pointer',
                }}
              >
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
                        return { text: t('hc4.resuelto', 'Resuelto'), bg: '#dcfce7', color: '#15803d', dot: '#16a34a' }
                      case 'en_atencion':
                        return { text: t('hc.en_atencion', 'En atención'), bg: '#e0f2fe', color: '#0369a1', dot: 'var(--brand-primary)' }
                      case 'en_revision':
                        return { text: t('hc.en_revision', 'En revisión'), bg: '#fef3c7', color: '#b45309', dot: '#d97706' }
                      case 'recibido':
                      default:
                        return { text: t('hc4.recibido', 'Recibido'), bg: 'var(--brand-soft-strong-light)', color: 'var(--brand-text-light)', dot: 'var(--brand-primary)' }
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
                        {rep.vehiculo} {rep.placa && t('hc3.plate_paren', { defaultValue: '(Placa: {{placa}})', placa: rep.placa })}
                      </div>

                      <p className="reporte-desc-snippet">{rep.descripcion}</p>

                      <div className="reporte-footer-row">
                        <span className="reporte-tiempo-est">
                          Tiempo est: {rep.tiempoEstimado}
                        </span>

                        <button
                          className="btn-ver-detalle-reporte"
                          onClick={async () => setReporteSeleccionadoModal(await abrirDetalle(rep.id).catch(() => rep))}
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
