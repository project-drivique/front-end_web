import { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaCar, FaBolt, FaLifeRing, FaMagic, FaFileAlt, FaQuestionCircle } from 'react-icons/fa'
import { useLanding } from '@/modules/landing/LandingContext'
import { useAuthStore } from '@/store/authStore'
import { showAlert } from '@/utils/swalConfig'
import { useHistorialReservas } from '@/modules/reservations/hooks/useReservations'
import CatalogTopHeader from '@/modules/catalog/components/CatalogTopHeader'
import { useSupportStore } from '../store/useSupportStore'
import { TIPOS_INCIDENCIA } from '../data/supportCatalog'
import ReportDetailModal from '../components/ReportDetailModal'
import './SupportPage.css'
import InformesPestanaActiva from './SupportPage/InformesPestanaActiva'
import ReportarPestanaActiva from './SupportPage/ReportarPestanaActiva'
import CanalesPestanaActiva from './SupportPage/CanalesPestanaActiva'
import SoporteTabsContainer from './SupportPage/SoporteTabsContainer'

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
        <SoporteTabsContainer conteoReportesActivos={conteoReportesActivos} pestanaActiva={pestanaActiva} setPestanaActiva={setPestanaActiva} t={t} />

        {/* ── PESTAÑA 1: CANALES DE ATENCIÓN ── */}
        {pestanaActiva === 'canales' && (
          <CanalesPestanaActiva faqAbiertaId={faqAbiertaId} setFaqAbiertaId={setFaqAbiertaId} setPestanaActiva={setPestanaActiva} t={t} />
        )}

        {/* ── PESTAÑA 2: REPORTAR INCIDENCIA (FORMULARIO) ── */}
        {pestanaActiva === 'reportar' && (
          <ReportarPestanaActiva archivos={archivos} enviando={enviando} formData={formData} handleAdjuntarEvidencia={handleAdjuntarEvidencia} handleArchivosElegidos={handleArchivosElegidos} handleEliminarEvidencia={handleEliminarEvidencia} handleEnviarReporte={handleEnviarReporte} handleSelectVehiculoChange={handleSelectVehiculoChange} handleTipoChipClick={handleTipoChipClick} inputEvidenciasRef={inputEvidenciasRef} renderIconoChip={renderIconoChip} setFormData={setFormData} t={t} tipoSeleccionadoObj={tipoSeleccionadoObj} vehiculosElegibles={vehiculosElegibles} />
        )}

        {/* ── PESTAÑA 3: INFORMES ERRÓNEOS (MIS REPORTES) ── */}
        {pestanaActiva === 'informes' && (
          <InformesPestanaActiva abrirDetalle={abrirDetalle} reportes={reportes} setReporteSeleccionadoModal={setReporteSeleccionadoModal} t={t} />
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
