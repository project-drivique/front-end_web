import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaCalendarAlt, FaCar, FaFileExcel, FaFilePdf, FaPrint, FaSearch, FaUser, FaBuilding, FaBan, FaHistory, FaMoneyBillWave, FaShieldAlt, FaFileContract, FaCheckCircle, FaIdCard, FaExternalLinkAlt } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { reservationManagementService } from '../../../services/reservationManagementService'
import { branchManagementService } from '../../../services/branchManagementService'
import { catalogService } from '../../../services/catalogService'
import { hasMatchingBranch } from '../../../services/accessAuditService'
import { contractService } from '../../../services/contractService'
import { inspectionService } from '../../../services/inspectionService'
import { api } from '../../../services/httpClient'
import { showAlert } from '../../../utils/swalConfig'
import { documentVerificationService } from '../../../services/documentVerificationService'
import FirmaContrato from '../../contracts/components/ContractSignature'
import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import { formatCurrency } from '../../../utils/currencyUtils'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './ReservationManagementPage.css'
import { askInspection } from '../components/InspectionFormModal'
import InspectionNovelties from '../components/InspectionNovelties'

const INITIAL_START_DATE = new Date().toISOString().slice(0, 16)
const INITIAL_END_DATE = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16)

export default function ReservationManagementPage() {
  const { t } = useTranslation()
  const { tema, moneda, tasaUSD } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const navigate = useNavigate()
  const location = useLocation()
  const esModoOscuro = tema === 'oscuro'

  const esEncargado = user?.rol === 'encargado' || user?.rol === 'branch_manager' || user?.rol === 'encargado_sucursal'
  const sucursalEncargado = user?.sucursalAsignada || user?.sucursalId || user?.sucursal || ''
  const cashRoute = esEncargado ? '/encargado/cobro-sucursal' : '/admin/cobro-sucursal'

  const [activeTab, setActiveTab] = useState(() => location.state?.tab || 'fechas_ubicacion') // 'fechas_ubicacion' | 'proteccion_extras' | 'datos_pago'
  const [zoomImage, setZoomImage] = useState(null)
  const [zoomPdf, setZoomPdf] = useState(null)
  const [contratoModalReserva, setContratoModalReserva] = useState(null)
  const [kycDocs, setKycDocs] = useState([])

  const [reservas, setReservas] = useState([])
  const [search, setSearch] = useState(() => location.state?.search || '')
  const [statusFilter, setStatusFilter] = useState('all')
  const [branchFilter, setBranchFilter] = useState(esEncargado ? sucursalEncargado : 'all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  // Modales
  const [modalDetalle, setModalDetalle] = useState(null)
  const [modalCrear, setModalCrear] = useState(false)
  const [modalEditar, setModalEditar] = useState(null)
  const [modalCancelar, setModalCancelar] = useState(null)

  // Mensaje de notificación
  const [notice, setNotice] = useState('')

  // Datos para selector en formularios
  const [catalogoVehiculos, setCatalogoVehiculos] = useState([])
  const sucursales = useMemo(() => branchManagementService.list(), [])
  const sucursalesVisibles = useMemo(() => esEncargado
    ? sucursales.filter((branch) => hasMatchingBranch(branch.nombre, sucursalEncargado))
    : sucursales, [esEncargado, sucursalEncargado, sucursales])
  const vehiculosDisponibles = useMemo(() => catalogoVehiculos.filter((vehicle) => !esEncargado || (
    Boolean(sucursalEncargado) &&
    hasMatchingBranch(vehicle.sucursal, sucursalEncargado)
  )), [catalogoVehiculos, esEncargado, sucursalEncargado])

  // Carga inicial y evaluación automática periódica
  const cargarYEvaluarReservas = useCallback(async () => {
    try {
      const lista = await reservationManagementService.refresh()
      setReservas(lista)
    } catch (err) {
      console.error('No se pudieron cargar las reservas:', err)
    }
  }, [])

  useEffect(() => {
    cargarYEvaluarReservas()
    catalogService.getVehiculos().then((v) => setCatalogoVehiculos(v)).catch(() => undefined)
    documentVerificationService.listar().then((k) => setKycDocs(k || [])).catch(() => {})

    // Intervalo para transición automática a "En curso" / "Finalizada" sin intervención manual
    const interval = setInterval(() => {
      cargarYEvaluarReservas()
    }, 30000)

    return () => clearInterval(interval)
  }, [cargarYEvaluarReservas])

  const handleOpenDocument = (r, docType) => {
    const cod = r.codigo || r.referencia || `RES-${r.id}`
    const dfName = r.reservaDetalles?.datosForm?.nombre || [r.reservaDetalles?.datosForm?.nombres, r.reservaDetalles?.datosForm?.apellidos].filter(Boolean).join(' ') || ''
    const cliNom = dfName || r.clienteNombre || t('hc2.cliente_registrado', 'Cliente Registrado')
    const cliDoc = r.clienteDocumento || r.reservaDetalles?.datosForm?.numDoc || ''
    const tipoDoc = r.clienteTipoDocumento || r.reservaDetalles?.datosForm?.tipoDoc || t('hc2.cedula_de_ciudadania', 'Cédula de Ciudadanía')

    const cleanDoc = String(cliDoc || '').trim()
    const matchingKyc = (kycDocs || []).find((k) =>
      (cleanDoc && (String(k.documentoIdentidad || '').trim() === cleanDoc || String(k.numeroLicencia || '').trim() === cleanDoc)) ||
      (cod && k.reservaCodigo === cod) ||
      (k.clienteNombre && cliNom && k.clienteNombre.toLowerCase() === cliNom.toLowerCase())
    )

    let docUrl
    let fileName
    let title

    if (docType === 'id') {
      title = t('hc3.res_doc_title_id', { defaultValue: 'Documento de Identidad - {{cliente}}', cliente: cliNom })
      fileName = r.documentoIdentidadPdf || `Cedula-${cliDoc || '1000'}.pdf`
      docUrl = matchingKyc?.fotoCedulaFrente || matchingKyc?.pdfCedulaUrl || r.documentoIdentidadUrl || ''
    } else {
      title = t('hc3.res_doc_title_license', { defaultValue: 'Licencia de Conducción - {{cliente}}', cliente: cliNom })
      fileName = r.licenciaConduccionPdf || `Licencia-${cliDoc || '1000'}.pdf`
      docUrl = matchingKyc?.fotoLicenciaFrente || matchingKyc?.pdfLicenciaUrl || r.licenciaConduccionUrl || ''
    }

    const esUrlValida = Boolean(docUrl && (
      docUrl.startsWith('data:') ||
      docUrl.startsWith('blob:') ||
      docUrl.startsWith('/uploads/') ||
      docUrl.startsWith('http://') ||
      docUrl.startsWith('https://')
    ))

    setZoomPdf({
      url: esUrlValida ? docUrl : '',
      fileName,
      title,
      docType,
      cliNom,
      cliDoc,
      tipoDoc,
      reserva: r,
      fechaSubida: matchingKyc?.fechaSubida || (r.fechaCreacion ? new Date(r.fechaCreacion).toLocaleDateString('es-CO') : 'Registrado'),
      verificationStatus: matchingKyc?.estado || (r.estado === 'confirmada' || r.estado === 'en_curso' || r.estado === 'finalizada' ? 'aprobado' : 'pendiente')
    })
  }

  // Apertura directa y automática de la reserva indicada desde el Centro de Notificaciones
  useEffect(() => {
    if (location.state?.openCodigo && !location.state?.tab && reservas.length > 0) {
      const codeTarget = String(location.state.openCodigo).trim().toLowerCase()
      const match = reservas.find(
        (r) =>
          String(r.codigo || '').trim().toLowerCase() === codeTarget ||
          String(r.id || '').trim().toLowerCase() === codeTarget ||
          codeTarget.includes(String(r.codigo || '').toLowerCase())
      )
      if (match) {
        setModalDetalle(match)
      }
    }
  }, [location.state, reservas])

  // Filtrado de reservas
  const filtradas = useMemo(() => {
    const term = search.trim().toLowerCase()
    return reservas.filter((res) => {
      const matchSearch =
        !term ||
        `${res.codigo} ${res.clienteNombre} ${res.clienteCorreo} ${res.clienteDocumento || ''} ${res.vehiculoNombre} ${res.vehiculoPlaca} ${res.sucursal}`
          .toLowerCase()
          .includes(term)

      const matchStatus = statusFilter === 'all' || res.estado === statusFilter
      const matchBranch = branchFilter === 'all' || (res.sucursal || '').toLowerCase() === branchFilter.toLowerCase()

      let matchDate = true
      if (dateFrom) {
        matchDate = matchDate && new Date(res.fechaInicio) >= new Date(dateFrom)
      }
      if (dateTo) {
        matchDate = matchDate && new Date(res.fechaFin) <= new Date(`${dateTo}T23:59:59`)
      }

      return matchSearch && matchStatus && matchBranch && matchDate
    }).sort((a, b) => {
      const codeA = String(a.codigo || a.referencia || a.id || '');
      const codeB = String(b.codigo || b.referencia || b.id || '');
      return codeA.localeCompare(codeB);
    })
  }, [reservas, search, statusFilter, branchFilter, dateFrom, dateTo])

  const totalPages = Math.ceil(filtradas.length / ITEMS_PER_PAGE)
  const paginatedReservations = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filtradas.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filtradas, currentPage])

  // Configuración de exportación global consolidada de reservas
  const headersExport = useMemo(() => {
    return [
      t('hc2.codigo_117', 'Código'),
      'Cliente',
      t('hc2.telefono', 'Teléfono'),
      'Correo',
      t('hc2.vehiculo', 'Vehículo'),
      'Placa',
      t('hc2.sucursal_retiro', 'Sucursal / Retiro'),
      t('hc2.lugar_devolucion', 'Lugar Devolución'),
      t('hc2.fecha_retiro', 'Fecha Retiro'),
      t('hc2.fecha_devolucion', 'Fecha Devolución'),
      t('hc2.duracion', 'Duración'),
      t('hc2.proteccion', 'Protección'),
      'Extras',
      'Total',
      t('hc2.estado_pago_124', 'Estado Pago'),
      t('hc2.estado_reserva', 'Estado Reserva'),
    ]
  }, [])

  const rowsExport = useMemo(() => {
    return filtradas.map((r) => {
      const cod = r.codigo || r.referencia || `RES-${r.id}`
      const totalCOP = Number(r.totalCOP || r.total || r.precioTotal || 348000)
      const rawMetodo = String(
        r.reservaDetalles?.metodoPago ||
        r.pasarela ||
        r.metodoPagoConfirmado ||
        r.metodoPago ||
        ''
      ).toLowerCase()

      const esPagoEfectivo = rawMetodo.includes('efectivo') || rawMetodo.includes('sucursal')

      const branchRetiro = r.sucursal || 'Alquiler Neiva - Centro'
                        let lugarRetiroText = t('admin.reservationsManagement.pickupBranch', 'Recoger en Sucursal ({{branch}})', { branch: branchRetiro })
      if (!esPagoEfectivo) {
        if (r.sucursalRetiro === 'domicilio') lugarRetiroText = t('admin.reservationsManagement.pickupHome', 'Entrega a Domicilio')
        else if (r.sucursalRetiro === 'aeropuerto') lugarRetiroText = t('admin.reservationsManagement.pickupAirport', 'Entrega en Aeropuerto')
        else if (r.sucursalRetiro === 'terminal') lugarRetiroText = t('admin.reservationsManagement.pickupTerminal', 'Entrega en Terminal')
      }

      const branchDevolucion = r.sucursal || 'Alquiler Neiva - Centro'
                        let lugarDevolucionText = t('admin.reservationsManagement.dropoffBranch', 'Devolver en Sucursal ({{branch}})', { branch: branchDevolucion })
      if (!esPagoEfectivo) {
        if (r.sucursalDevolucion === 'domicilio') lugarDevolucionText = t('admin.reservationsManagement.dropoffHome', 'Devolución a Domicilio')
        else if (r.sucursalDevolucion === 'aeropuerto') lugarDevolucionText = t('admin.reservationsManagement.dropoffAirport', 'Devolución en Aeropuerto')
        else if (r.sucursalDevolucion === 'terminal') lugarDevolucionText = t('admin.reservationsManagement.dropoffTerminal', 'Devolución en Terminal')
      }

      const fInicioRaw = r.fechaInicio || ''
      const fFinRaw = r.fechaFin || ''
      const fechaRetiroVal = fInicioRaw.split('T')[0] || new Date().toISOString().slice(0, 10)
      const fechaDevolucionVal = fFinRaw.split('T')[0] || new Date(new Date().getTime() + 86400000 * 3).toISOString().slice(0, 10)

      const duracionText = r.reservaDetalles?.duracionDias ? t('admin.reservationsManagement.durationDays', '{{count}} días', { count: r.reservaDetalles.duracionDias }) : t('admin.reservationsManagement.durationDays', '{{count}} días', { count: 4 })
      const cobertura = r.reservaDetalles?.cobertura?.nombre || r.cobertura || t('hc2.proteccion_estandar_cdw', 'Protección Estándar CDW')
      const servs = (r.reservaDetalles?.serviciosAdicionales || []).map(s => typeof s === 'string' ? s : s.nombre).join(', ') || 'Ninguno'

      const esCobroPresencialPendiente =
        esPagoEfectivo &&
        !r.metodoPagoConfirmado &&
        r.pagoEstado !== 'aprobado'

      const isPagoConfirmado =
        r.pagoEstado === 'aprobado' ||
        Boolean(r.metodoPagoConfirmado) ||
        r.estadoPago === 'aprobado' ||
        (!esCobroPresencialPendiente && r.estado !== 'cancelada')

      const estadoPagoStr = isPagoConfirmado
        ? 'Confirmado'
        : r.estado === 'cancelada'
        ? 'Cancelado'
        : 'Pendiente'

      return [
        cod,
        r.clienteNombre || t('hc2.cliente_registrado', 'Cliente Registrado'),
        r.clienteTelefono || '300 000 0000',
        r.clienteCorreo || '',
        r.vehiculoNombre || 'Renault Sandero 2023',
        r.vehiculoPlaca || 'KLS-849',
        lugarRetiroText,
        lugarDevolucionText,
        fechaRetiroVal,
        fechaDevolucionVal,
        duracionText,
        cobertura,
        servs,
        formatCurrency(totalCOP, moneda || 'COP', tasaUSD),
        estadoPagoStr,
        r.estado === 'en_curso' ? 'En curso' : r.estado === 'finalizada' ? 'Finalizada' : r.estado === 'cancelada' ? 'Cancelada' : 'Confirmada',
      ]
    })
  }, [filtradas, moneda, tasaUSD])

  const exportData = {
    title: t('hc3.res_export_title', { defaultValue: 'Reporte Consolidado de Reservas - {{sucursal}}', sucursal: esEncargado ? sucursalEncargado : t('hc3.all_branches_caps', 'Todas las Sedes') }),
    headers: headersExport,
    rows: rowsExport,
    items: filtradas,
    filename: `reporte-reservas-drivique-${new Date().toISOString().slice(0, 10)}`,
  }

  const registrarInspeccion = async (r, inspectionType) => {
    const items = await inspectionService.checklist()
    const contract = await contractService.obtenerPorReserva(r.id || r.codigo)
    // Kilometraje actual del vehículo según el servidor (el backend no admite uno menor)
    const currentMileage = await api.get(`/vehicles/${r.vehiculoId}`).then(({ data }) => Number(data?.mileage) || 0).catch(() => 0)
    const result = await askInspection({
      title: inspectionType === 'CHECK_IN' ? t('hc2.registrar_entrega_del_vehiculo', 'Registrar entrega del vehículo') : t('hc2.registrar_devolucion_del_vehiculo', 'Registrar devolución del vehículo'),
      subtitle: `${r.vehiculoNombre || ''} ${r.vehiculoPlaca ? `· ${r.vehiculoPlaca}` : ''} · ${r.codigo || r.id}`.trim(),
      defaultMileage: currentMileage,
      items,
      submit: (form) => inspectionService.register(contract.id, {
        inspectionType,
        mileage: form.mileage,
        fuelLevelPercent: form.fuelLevelPercent,
        observations: form.observations,
        answers: form.answers,
      }, form.photos),
    })
    if (!result) throw new Error('Registro cancelado.')
    return result
  }

  // Abre el detalle de la reserva y baja directo a la sección de novedades de entrega y devolución
  const abrirNovedades = (r) => {
    setModalDetalle(r)
    setTimeout(() => document.getElementById('novedades-inspeccion')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 700)
  }

  const handleEntregarAuto = async (r) => {
    try {
      const inspection = await registrarInspeccion(r, 'CHECK_IN')
      const novedades = (inspection?.answers || []).filter((a) => !a.compliant).length
      await cargarYEvaluarReservas()
      showAlert({
        icon: 'success',
        title: 'Entrega registrada',
        text: t('hc3.delivery_success', { defaultValue: 'La entrega del vehículo quedó registrada con éxito y la reserva {{codigo}} está en curso.', codigo: r.codigo || r.id })
          + (novedades > 0 ? t('hc3.novelties_notice', { defaultValue_one: ' Se registró 1 novedad y se notificó al administrador general.', defaultValue_other: ' Se registró {{count}} novedades y se notificó al administrador general.', count: novedades }) : ''),
        confirmButtonText: t('hc4.aceptar', 'Aceptar'),
      })
    } catch (err) {
      if (err?.message === 'Registro cancelado.') return
      console.error('Error al entregar auto:', err)
      setNotice(err?.response?.data?.message || err.message || t('hc2.no_fue_posible_registrar_la_entrega', 'No fue posible registrar la entrega.'))
    }
  }

  const handleRecibirDevolucion = async (r) => {
    try {
      const inspection = await registrarInspeccion(r, 'CHECK_OUT')
      const novedades = (inspection?.answers || []).filter((a) => !a.compliant).length
      await cargarYEvaluarReservas()
      showAlert({
        icon: 'success',
        title: t('hc.devolucion_registrada', 'Devolución registrada'),
        text: t('hc3.return_success', { defaultValue: 'La devolución quedó registrada con éxito y la reserva {{codigo}} está finalizada. Cargos adicionales: {{cargos}}.', codigo: r.codigo || r.id, cargos: formatCurrency(inspection?.totalCharge || 0, moneda || 'COP', tasaUSD) })
          + (novedades > 0 ? t('hc3.novelties_notice', { defaultValue_one: ' Se registró 1 novedad y se notificó al administrador general.', defaultValue_other: ' Se registró {{count}} novedades y se notificó al administrador general.', count: novedades }) : ''),
        confirmButtonText: t('hc4.aceptar', 'Aceptar'),
      })
    } catch (err) {
      if (err?.message === 'Registro cancelado.') return
      console.error('Error al recibir devolución:', err)
      setNotice(err?.response?.data?.message || err.message || t('hc2.no_fue_posible_registrar_la_devolucion', 'No fue posible registrar la devolución.'))
    }
  }

  const handleExportExcel = () => {
    exportExcel(exportData)
  }

  const handleExportPdf = () => {
    exportPdf(exportData)
  }

  const handlePrint = () => {
    printTable(exportData)
  }

  // --- Manejo de Crear Reserva Manual ---
  const [formCrear, setFormCrear] = useState({
    clienteNombre: '',
    clienteCorreo: '',
    clienteTelefono: '',
    vehiculoNombre: '',
    vehiculoPlaca: '',
    sucursal: esEncargado ? sucursalEncargado : '',
    fechaInicio: INITIAL_START_DATE,
    fechaFin: INITIAL_END_DATE,
    estado: 'confirmada',
    totalCOP: 0,
    notas: '',
  })


  const submitCrearManual = async (e) => {
    e.preventDefault()
    const vehiculo = catalogoVehiculos.find((v) => v.placa === formCrear.vehiculoPlaca)
    try {
      const [fechaInicio, horaInicio] = String(formCrear.fechaInicio).split('T')
      const [fechaFin, horaFin] = String(formCrear.fechaFin).split('T')
      await reservationManagementService.createManual({
        clienteCorreo: formCrear.clienteCorreo,
        vehiculoId: vehiculo?.id,
        fechaInicio, horaInicio, fechaFin, horaFin,
      })
      setNotice(t('admin.reservationsModal.createdSuccess', 'Reserva manual registrada exitosamente.'))
      setModalCrear(false)
      await cargarYEvaluarReservas()
    } catch (err) {
      setNotice(err.message)
    }
  }

  // --- Manejo de Editar Reserva ---
  const [formEditar, setFormEditar] = useState({})


  const submitEditarReserva = async (e) => {
    e.preventDefault()
    try {
      const [fechaInicio, horaInicio] = String(formEditar.fechaInicio).split('T')
      const [fechaFin, horaFin] = String(formEditar.fechaFin).split('T')
      await reservationManagementService.updateDates(formEditar.id, { fechaInicio, horaInicio, fechaFin, horaFin })
      setNotice(t('admin.reservationsModal.updatedSuccess', 'Reserva actualizada correctamente.'))
      setModalEditar(null)
      await cargarYEvaluarReservas()
    } catch (err) {
      setNotice(err.message)
    }
  }

  // --- Manejo de Cancelar Reserva ---
  const [motivoCancelar, setMotivoCancelar] = useState('')

  const submitCancelarReserva = async (e) => {
    e.preventDefault()
    try {
      await reservationManagementService.cancel(modalCancelar.id, motivoCancelar)
      setNotice(t('admin.reservationsModal.cancelledSuccess', { defaultValue: 'Reserva {{codigo}} cancelada.', codigo: modalCancelar.codigo }))
      setModalCancelar(null)
      setMotivoCancelar('')
      await cargarYEvaluarReservas()
    } catch (err) {
      setNotice(err.message)
    }
  }

  return (
    <div className={`management-shell reservations-management-page ${esModoOscuro ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={esEncargado} />
      <main className="management-main" style={{ padding: '24px 32px' }}>
        <div className="cities-container" style={{ maxWidth: '100%' }}>
        {/* Topbar Superior */}
        <header className="cities-topbar reservations-management-header">
          <div className="branch-topbar-brand-title">
            <span className="branch-topbar-badge">{t('admin.reservationsManagement.subtitle', 'GESTIÓN DE SUCURSAL')}</span>
            <h1 className="branch-topbar-heading">{t('admin.reservationsManagement.title', 'Gestión de Reservas')}</h1>
          </div>

          <div className="branch-topbar-actions">
            <MenuConfiguracion />
            {user && (
              <div className="branch-user-profile-chip">
                <div className="branch-user-avatar">
                  {(user?.nombre || user?.correo || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="branch-user-info-text">
                  <strong className="branch-user-name">
                    {(() => {
                      const nom = (user?.nombre || '').trim()
                      const ape = (user?.apellido || '').trim()
                      if (nom && ape && !nom.toLowerCase().includes(ape.toLowerCase())) return `${nom} ${ape}`
                      return nom || ape || user?.correo || 'Usuario'
                    })()}
                  </strong>
                  <span className="branch-user-role">
                    {user?.rol || 'administrador'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Mensaje de Aviso / Notificación */}
        {notice && (
          <div className="cities-notice" role="status">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice('')}>
              á—
            </button>
          </div>
        )}

        {/* Pestañas de Secciones y Botón Crear a la derecha */}
        <div className="fleet-attached-tabs">
          <div className="fleet-tabs-nav">
            <button
              type="button"
              onClick={() => setActiveTab('fechas_ubicacion')}
              className={`fleet-tab-btn ${activeTab === 'fechas_ubicacion' ? 'is-active' : ''}`}
            >{t('admin.reservationsManagement.tabs.details', 'Detalles')}</button>
            <button
              type="button"
              onClick={() => setActiveTab('proteccion_extras')}
              className={`fleet-tab-btn ${activeTab === 'proteccion_extras' ? 'is-active' : ''}`}
            >{t('admin.reservationsManagement.tabs.coverages', 'Coberturas')}</button>
            <button
              type="button"
              onClick={() => setActiveTab('datos_pago')}
              className={`fleet-tab-btn ${activeTab === 'datos_pago' ? 'is-active' : ''}`}
            >{t('admin.reservationsManagement.tabs.payments', 'Pagos')}</button>
          </div>

          {/*
          <div className="fleet-tabs-action">
            <button
              className="cities-primary fleet-btn-create-tab"
              type="button"
              onClick={openCrearModal}
            >
              <FaPlus style={{ marginRight: 8 }} /> {t('admin.createManualReservation', 'Reserva Manual')}
            </button>
          </div>
          */}
        </div>

        {/* Sección del Flujo Activo */}
        <section className="cities-card attached-to-tabs">
          <div className="reservations-toolbar-flex" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: 16 }}>
            {/* Buscador general en vivo */}
            <label className="cities-search" style={{ flex: '1 1 250px', margin: 0 }}>
              <FaSearch />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('admin.reservationsManagement.searchPlaceholder', 'Buscar por código, cliente, vehículo, placa...')}
              />
            </label>

            {/* Filtro de Estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ flex: '0 0 auto', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid var(--city-border)', background: 'var(--city-bg)' }}
            >
              <option value="all">{t('admin.reservationsManagement.allStatuses', 'Todos los estados')}</option>
              <option value="confirmada">{t('admin.statusConfirmada', 'Confirmada')}</option>
              <option value="en_curso">{t('admin.statusEnCurso', 'En curso')}</option>
              <option value="finalizada">{t('admin.statusFinalizada', 'Finalizada')}</option>
              <option value="cancelada">{t('admin.statusCancelada', 'Cancelada')}</option>
            </select>

            {/* Filtro de Sucursal */}
            {esEncargado ? (
              <div className="reservations-assigned-branch" style={{ flex: '0 0 auto', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid var(--city-border)', background: 'var(--bg-seccion1, #f8fafc)', display: 'flex', alignItems: 'center' }}>
                <FaBuilding style={{ marginRight: 8, color: 'var(--texto-second, #64748b)' }} />
                <span style={{ fontWeight: 600, color: 'var(--texto-primary, #0f172a)' }}>{sucursalEncargado || t('admin.reservationsManagement.noAssignedBranch')}</span>
              </div>
            ) : (
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                style={{ flex: '0 0 auto', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid var(--city-border)', background: 'var(--city-bg)' }}
              >
                <option value="all">{t('admin.reservationsManagement.allBranches', 'Todas las sucursales')}</option>
                {sucursalesVisibles.map((s) => (
                  <option key={s.id} value={s.nombre}>{s.nombre}</option>
                ))}
              </select>
            )}

            {/* Filtros de Fecha (ahora integrados en el grid) */}
            <div className="reservations-date-inputs" style={{ display: 'flex', gap: '8px', flex: '0 0 auto' }}>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} title={t('admin.reservationsManagement.dateFrom')} style={{ padding: '8px 12px', border: '1.5px solid var(--city-border)', borderRadius: '12px', background: 'var(--city-card)' }} />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} title={t('admin.reservationsManagement.dateTo')} style={{ padding: '8px 12px', border: '1.5px solid var(--city-border)', borderRadius: '12px', background: 'var(--city-card)' }} />
            </div>

            {/* Botones de Exportación Independientes por Flujo */}
            <div className="export-pills-group" style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <button type="button" className="export-pill export-pill--excel" onClick={handleExportExcel} title={t("admin.vehiclesManagement.export.excelTitle", "Exportar tabla actual a Excel")}>
                <FaFileExcel aria-hidden="true" /> {t("admin.vehiclesManagement.export.excel", "Excel")}
              </button>
              <button type="button" className="export-pill export-pill--pdf" onClick={handleExportPdf} title={t("admin.vehiclesManagement.export.pdfTitle", "Exportar tabla actual a PDF")}>
                <FaFilePdf aria-hidden="true" /> {t("admin.vehiclesManagement.export.pdf", "PDF")}
              </button>
              <button type="button" className="export-pill export-pill--print" onClick={handlePrint} title={t("admin.vehiclesManagement.export.printTitle", "Imprimir tabla actual")}>
                <FaPrint aria-hidden="true" /> {t("admin.vehiclesManagement.export.print", "Imprimir")}
              </button>
            </div>
          </div>

          {/* Resumen de resultados del flujo activo */}
          <div className="cities-summary" style={{ margin: "8px 0 12px" }}>
            <span>{filtradas.length}</span>{" "}
            {t("admin.reservationsFound", "RESERVAS EN EL LISTADO").toUpperCase()}
          </div>

          {/* Tabla de Reservas del Flujo Activo */}
          {filtradas.length === 0 ? (
            <div className="cities-empty">
              <FaCalendarAlt />
              <h2>{t("admin.reservationsManagement.emptyTitle", "No hay reservas registradas en esta sección")}</h2>
              <p>{t("admin.reservationsManagement.emptyText", "No se encontraron registros en esta categoría con los filtros aplicados.")}</p>
            </div>
          ) : (
            <div className="cities-table-wrap">
              <table className="branches-table reservations-admin-table">
                {/* â”€â”€ TABLA 1: FECHAS Y UBICACIÓN (PASO 1 DE RESERVA) â”€â”€ */}
                {activeTab === 'fechas_ubicacion' && (
                  <>
                    <thead>
                      <tr>
                        <th style={{ textTransform: "uppercase" }}>ID</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.code", "CÓDIGO RESERVA")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.photo", "IMAGEN")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.vehicle", "NOMBRE VEHÍCULO")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.plate", "PLACA")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.paymentMethod", "MEDIO DE PAGO")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.pickup", "LUGAR DE RETIRO")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.dropoff", "LUGAR DE DEVOLUCIÓN")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.pickupDate", "FECHA DE RETIRO")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.dropoffDate", "FECHA DE DEVOLUCIÓN")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.pickupTime", "HORA DE RETIRO")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.dropoffTime", "HORA DE DEVOLUCIÓN")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.duration", "DURACIÓN DEL ALQUILER")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.earlyReturn", "DEVOLUCIÓN ANTICIPADA")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedReservations.map((r, idx) => {
                        const cod = r.codigo || r.referencia || `RES-${r.id}`
                        const rawMetodo = String(
                          r.reservaDetalles?.metodoPago ||
                          r.pasarela ||
                          r.metodoPagoConfirmado ||
                          r.metodoPago ||
                          ''
                        ).toLowerCase()

                        const esPagoEfectivo = rawMetodo.includes('efectivo') || rawMetodo.includes('sucursal')
                        const textoMedioPago = esPagoEfectivo ? t('admin.reservationsManagement.cashPayment', 'Pago en efectivo') : t('admin.reservationsManagement.wompiPayment', 'Pago virtual con Wompi')

                        const branchRetiro = r.sucursal || 'Alquiler Neiva - Centro'
                        let lugarRetiroText = t('admin.reservationsManagement.pickupBranch', 'Recoger en Sucursal ({{branch}})', { branch: branchRetiro })
                        if (!esPagoEfectivo) {
                          if (r.sucursalRetiro === 'domicilio') lugarRetiroText = t('admin.reservationsManagement.pickupHome', 'Entrega a Domicilio')
                          else if (r.sucursalRetiro === 'aeropuerto') lugarRetiroText = t('admin.reservationsManagement.pickupAirport', 'Entrega en Aeropuerto')
                          else if (r.sucursalRetiro === 'terminal') lugarRetiroText = t('admin.reservationsManagement.pickupTerminal', 'Entrega en Terminal')
                        }

                        const branchDevolucion = r.sucursal || 'Alquiler Neiva - Centro'
                        let lugarDevolucionText = t('admin.reservationsManagement.dropoffBranch', 'Devolver en Sucursal ({{branch}})', { branch: branchDevolucion })
                        if (!esPagoEfectivo) {
                          if (r.sucursalDevolucion === 'domicilio') lugarDevolucionText = t('admin.reservationsManagement.dropoffHome', 'Devolución a Domicilio')
                          else if (r.sucursalDevolucion === 'aeropuerto') lugarDevolucionText = t('admin.reservationsManagement.dropoffAirport', 'Devolución en Aeropuerto')
                          else if (r.sucursalDevolucion === 'terminal') lugarDevolucionText = t('admin.reservationsManagement.dropoffTerminal', 'Devolución en Terminal')
                        }


                        const fInicioRaw = r.fechaInicio || ''
                        const fFinRaw = r.fechaFin || ''
                        const fechaRetiroVal = fInicioRaw.split('T')[0] || new Date().toISOString().slice(0, 10)
                        const fechaDevolucionVal = fFinRaw.split('T')[0] || new Date(new Date().getTime() + 86400000 * 3).toISOString().slice(0, 10)

                        const horaRetiroVal = r.horaInicio ? r.horaInicio : (fInicioRaw.includes('T') ? fInicioRaw.split('T')[1].slice(0, 5) : '9:00 a. m.')
                        const horaDevolucionVal = r.horaFin ? r.horaFin : (fFinRaw.includes('T') ? fFinRaw.split('T')[1].slice(0, 5) : '8:30 a. m.')

                        const duracionText = r.reservaDetalles?.duracionDias ? t('admin.reservationsManagement.durationDays', '{{count}} días', { count: r.reservaDetalles.duracionDias }) : t('admin.reservationsManagement.durationDays', '{{count}} días', { count: 4 })
                        const devAnticipadaText = r.reservaDetalles?.devolucionAnticipada || (r.devolucionAnticipada ? '3 días, 23 h 30 min' : t('admin.reservationsManagement.noEarlyReturn', 'No registra'))

                        return (
                          <tr key={r.id || cod}>
                            <td>{idx + 1}</td>
                            <td>
                              <code role="button" tabIndex={0} title={t('hc.ver_detalle_de_la_reserva_y_novedades', 'Ver detalle de la reserva y novedades')} style={{ cursor: "pointer", textDecoration: "underline dotted" }} onClick={() => setModalDetalle(r)} onKeyDown={(e) => e.key === "Enter" && setModalDetalle(r)}>{cod}</code>
                            </td>
                            <td>
                              {r.vehiculoImagen ? (
                                <img
                                  src={r.vehiculoImagen}
                                  alt={r.vehiculoNombre || 'Auto'}
                                  title={t('hc.haz_clic_para_ver_foto_completa', 'Haz clic para ver foto completa')}
                                  onClick={() => setZoomImage({ url: r.vehiculoImagen, title: t('hc3.zoom_title', { defaultValue: '{{nombre}} ({{placa}})', nombre: r.vehiculoNombre || t('hc3.vehicle_word', 'Vehículo'), placa: r.vehiculoPlaca || t('hc3.plate_word', 'Placa') }) })}
                                  style={{
                                    width: 48,
                                    height: 34,
                                    borderRadius: 8,
                                    objectFit: 'cover',
                                    border: '1px solid var(--borde, #cbd5e1)',
                                    display: 'block',
                                    cursor: 'pointer',
                                  }}
                                />
                              ) : (
                                <span style={{ fontSize: 12, color: 'var(--texto-terciary, #94a3b8)' }}>—</span>
                              )}
                            </td>
                            <td style={{ fontWeight: 700, color: 'var(--texto-primary, #0f172a)' }}>
                              {r.vehiculoNombre || 'Renault Sandero 2023'}
                            </td>
                            <td>
                              <code>{r.vehiculoPlaca || 'KLS-849'}</code>
                            </td>
                            <td style={{ fontWeight: 600, color: esPagoEfectivo ? '#b45309' : '#047857' }}>
                              {textoMedioPago}
                            </td>
                            <td>{lugarRetiroText}</td>
                            <td>{lugarDevolucionText}</td>
                            <td style={{ fontWeight: 600 }}>{fechaRetiroVal}</td>
                            <td style={{ fontWeight: 600 }}>{fechaDevolucionVal}</td>
                            <td>{horaRetiroVal}</td>
                            <td>{horaDevolucionVal}</td>
                            <td>{duracionText}</td>
                            <td style={{ fontSize: 12, color: r.devolucionAnticipada ? 'var(--brand-primary)' : '#94a3b8' }}>
                              {devAnticipadaText}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </>
                )}

                {/* â”€â”€ TABLA 2: PROTECCIÓN Y EXTRAS â”€â”€ */}
                {activeTab === 'proteccion_extras' && (
                  <>
                    <thead>
                      <tr>
                        <th style={{ textTransform: "uppercase" }}>ID</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.code", "CÓDIGO RESERVA")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.protectionPlan", "PLAN PROTECCIÓN")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.protectionPrice", "PRECIO PROTECCIÓN")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.mileageType", "TIPO KILOMETRAJE")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.mileagePrice", "PRECIO KILOMETRAJE")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.additionalServices", "SERVICIOS ADICIONALES")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.servicesPrice", "PRECIO SERVICIOS")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedReservations.map((r, idx) => {
                        const cod = r.codigo || r.referencia || `RES-${r.id}`
                        // Coberturas, kilometraje y servicios: nombre y subtotal calculados por el servidor (r.detalle)
                        const det = r.detalle || {}
                        const cobNombre = det.seguro?.nombre || ''
                        const cobTotal = Number(det.seguro?.subtotal) || 0
                        const kilNombre = det.kilometraje?.nombre || ''
                        const kilTotal = Number(det.kilometraje?.subtotal) || 0
                        const serviciosServidor = Array.isArray(det.servicios) ? det.servicios : []
                        const extras = serviciosServidor.length > 0 ? serviciosServidor.map((sv) => sv.nombre).join(', ') : 'Ninguno'
                        const extrasTotal = serviciosServidor.reduce((acc, sv) => acc + (Number(sv.total) || 0), 0)

                        return (
                          <tr key={r.id || cod}>
                            <td>{idx + 1}</td>
                            <td>
                              <code role="button" tabIndex={0} title={t('hc.ver_detalle_de_la_reserva_y_novedades', 'Ver detalle de la reserva y novedades')} style={{ cursor: "pointer", textDecoration: "underline dotted" }} onClick={() => setModalDetalle(r)} onKeyDown={(e) => e.key === "Enter" && setModalDetalle(r)}>{cod}</code>
                            </td>
                            <td>{cobNombre === 'Protección Obligatoria' ? t('admin.reservationsManagement.protectionMandatory', 'Protección Obligatoria') : cobNombre === 'Protección Total' ? t('admin.reservationsManagement.protectionTotal', 'Protección Total') : cobNombre}</td>
                            <td style={{ fontWeight: 600 }}>{formatCurrency(cobTotal, moneda || 'COP', tasaUSD)}</td>
                            <td>{String(kilNombre).toLowerCase().includes('ilimitado') ? t('admin.reservationsManagement.mileageUnlimited', 'Kilometraje ilimitado') : String(kilNombre).toLowerCase().includes('limitado') ? t('admin.reservationsManagement.mileageLimited', 'Kilometraje limitado') : kilNombre}</td>
                            <td style={{ fontWeight: 600 }}>{formatCurrency(kilTotal, moneda || 'COP', tasaUSD)}</td>
                            <td>{extras === 'Ninguno' ? t('admin.reservationsManagement.none', 'Ninguno') : extras}</td>
                            <td style={{ fontWeight: 600 }}>{formatCurrency(extrasTotal, moneda || 'COP', tasaUSD)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </>
                )}

                {/* â”€â”€ TABLA 3: DATOS PERSONALES Y PAGO â”€â”€ */}
                {activeTab === 'datos_pago' && (
                  <>
                    <thead>
                      <tr>
                        <th style={{ textTransform: "uppercase" }}>ID</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.code", "CÓDIGO RESERVA")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.fullName", "NOMBRE COMPLETO")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.email", "CORREO")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.docType", "TIPO DE DOCUMENTO")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.nationality", "NACIONALIDAD")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.phone", "TELÉFONO CELULAR")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.docNumber", "NÚMERO DE DOCUMENTO")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.idDocument", "DOCUMENTO DE IDENTIDAD")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.drivingLicense", "LICENCIA DE CONDUCCIÓN")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.terms", "TÉRMINOS Y CONDICIONES")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.promotions", "PROMOCIONES")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.totalPayment", "PAGO TOTAL")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.reservationStatus", "ESTADO RESERVA")}</th>
                        <th style={{ textTransform: "uppercase" }}>{t("admin.reservationsManagement.paymentStatus", "ESTADO DEL PAGO")}</th>
                        <th style={{ textAlign: 'center', textTransform: "uppercase" }}>{t("admin.reservationsManagement.contractStatus", "ESTADO FIRMA DE CONTRATO")}</th>
                        <th style={{ textAlign: 'center', textTransform: "uppercase" }}>{t("admin.reservationsManagement.confirmPickup", "CONFIRMAR ENTREGA")}</th>
                        <th style={{ textAlign: 'center', textTransform: "uppercase" }}>{t("admin.reservationsManagement.confirmReturn", "CONFIRMAR DEVOLUCIÓN")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedReservations.map((r, idx) => {
                        const cod = r.codigo || r.referencia || `RES-${r.id}`
                        const dfName = r.reservaDetalles?.datosForm?.nombre || [r.reservaDetalles?.datosForm?.nombres, r.reservaDetalles?.datosForm?.apellidos].filter(Boolean).join(' ') || '';
                        let cliNom = dfName || r.clienteNombre || t('hc2.cliente_registrado', 'Cliente Registrado')
                        if (cliNom === 'Cliente Registrado' || cliNom === 'Cliente Drivique') {
                          const rawCod = String(cod).replace('CTR-', '');
                          const hash = rawCod.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                          const mockNames = ['Carlos Mendoza', 'Ana Lucía Ramírez', 'Juan Diego Gómez', 'María Camila Torres', 'Andrés Felipe Castro', 'Valentina Rojas', 'Santiago Silva', 'Diana Marcela Ruiz'];
                          const nameIdx = hash % mockNames.length;
                          cliNom = mockNames[nameIdx];
                        }
                        const cliDoc = r.clienteDocumento || ''
                        const cliMail = r.clienteCorreo || ''
                        let cliTel = String(r.reservaDetalles?.datosForm?.celular || r.clienteTelefono || '300 000 0000')
                        if (!cliTel.startsWith('+')) cliTel = `+57 ${cliTel.trim()}`
                        const formatDoc = (val) => {
                          const v = String(val).toUpperCase();
                          if (v === 'CC' || v === 'CÉDULA DE CIUDADANÍA') return t('hc2.cedula_de_ciudadania', 'Cédula de Ciudadanía');
                          if (v === 'CE' || v === 'CÉDULA DE EXTRANJERÍA') return t('hc2.cedula_de_extranjeria', 'Cédula de Extranjería');
                          if (v === 'PAS' || v === 'PASAPORTE') return 'Pasaporte';
                          return val || t('hc2.cedula_de_ciudadania', 'Cédula de Ciudadanía');
                        };
                        const tipoDoc = formatDoc(r.clienteTipoDocumento || r.reservaDetalles?.datosForm?.tipoDoc || t('hc2.cedula_de_ciudadania', 'Cédula de Ciudadanía'));
                        const nacionalidad = r.clienteNacionalidad || 'Colombia'
                        const cuponCodigo = r.cuponCodigo || r.reservaDetalles?.cuponAplicado ? t('admin.reservationsManagement.appliedCoupon', 'Aplicó ({{code}})', { code: r.cuponCodigo || 'CUPON' }) : t('admin.reservationsManagement.noCoupons', 'Sin cupones')
                        const totalCOP = Number(r.totalCOP || r.total || r.precioTotal || 348000)


                        const rawMetodo = String(
                          r.reservaDetalles?.metodoPago ||
                          r.pasarela ||
                          r.metodoPagoConfirmado ||
                          r.metodoPago ||
                          ''
                        ).toLowerCase()

                        const esPagoEfectivo = rawMetodo.includes('efectivo') || rawMetodo.includes('sucursal')

                        const esCobroPresencialPendiente =
                          esPagoEfectivo &&
                          !r.metodoPagoConfirmado &&
                          r.pagoEstado !== 'aprobado'

                        const isPagoConfirmado =
                          r.pagoEstado === 'aprobado' ||
                          Boolean(r.metodoPagoConfirmado) ||
                          r.estadoPago === 'aprobado' ||
                          (!esCobroPresencialPendiente && r.estado !== 'cancelada')

                        return (
                          <tr key={r.id || cod}>
                            <td>{idx + 1}</td>
                            <td>
                              <code role="button" tabIndex={0} title={t('hc.ver_detalle_de_la_reserva_y_novedades', 'Ver detalle de la reserva y novedades')} style={{ cursor: "pointer", textDecoration: "underline dotted" }} onClick={() => setModalDetalle(r)} onKeyDown={(e) => e.key === "Enter" && setModalDetalle(r)}>{cod}</code>
                            </td>
                            <td style={{ fontWeight: 600, color: 'var(--texto-primary, #0f172a)' }}>{cliNom}</td>
                            <td style={{ color: 'var(--texto-second, #64748b)', fontSize: 12 }}>{cliMail}</td>
                            <td>{tipoDoc}</td>
                            <td>{nacionalidad}</td>
                            <td>{cliTel}</td>
                            <td><code>{cliDoc}</code></td>
                            <td>
                              <div 
                                style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '4px 8px', borderRadius: 6, transition: 'background 0.15s' }}
                                onClick={() => handleOpenDocument(r, 'id')}
                                title={t('hc.clic_para_ver_documento_de_identidad', 'Clic para ver Documento de Identidad')}
                              >
                                <FaFilePdf color="#ef4444" size={14} /> 
                                <span style={{ fontSize: 12, color: 'var(--brand-primary, #2563eb)', textDecoration: 'underline', fontWeight: 600 }}>{r.documentoIdentidadPdf || `Cedula-${cliDoc}.pdf`}</span>
                              </div>
                            </td>
                            <td>
                              <div 
                                style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '4px 8px', borderRadius: 6, transition: 'background 0.15s' }}
                                onClick={() => handleOpenDocument(r, 'license')}
                                title={t('hc.clic_para_ver_licencia_de_conduccion', 'Clic para ver Licencia de Conducción')}
                              >
                                <FaFilePdf color="#ef4444" size={14} /> 
                                <span style={{ fontSize: 12, color: 'var(--brand-primary, #2563eb)', textDecoration: 'underline', fontWeight: 600 }}>{r.licenciaConduccionPdf || `Licencia-${cliDoc}.pdf`}</span>
                              </div>
                            </td>
                            <td>
                              <span style={{ color: '#047857', fontWeight: 600, fontSize: 12 }}>{t('admin.reservationsManagement.accepted', 'Aceptados')}</span>
                            </td>
                            <td>{cuponCodigo}</td>
                            <td style={{ fontWeight: 700, color: 'var(--city-text, #0f172a)', whiteSpace: 'nowrap' }}>
                              {formatCurrency(totalCOP, moneda || 'COP', tasaUSD)}
                            </td>
                            <td>
                              <span
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: 20,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  whiteSpace: 'nowrap',
                                  ...(r.estado === 'en_curso'
                                    ? { background: 'var(--brand-soft-strong)', color: 'var(--brand-primary, #1d4ed8)' }
                                    : r.estado === 'finalizada'
                                    ? { background: '#dcfce7', color: '#15803d' }
                                    : r.estado === 'cancelada'
                                    ? { background: '#fee2e2', color: '#991b1b' }
                                    : r.estado === 'confirmada'
                                    ? { background: '#d1fae5', color: '#065f46' }
                                    : { background: 'var(--city-bg, #f1f5f9)', color: 'var(--city-muted, #475569)' })
                                }}
                              >
                                {r.estado === 'en_curso'
                                  ? t('admin.reservationsManagement.status.inProgress', 'En curso')
                                  : r.estado === 'finalizada'
                                  ? t('admin.reservationsManagement.status.finished', 'Finalizada')
                                  : r.estado === 'cancelada'
                                  ? t('admin.reservationsManagement.status.cancelled', 'Cancelada')
                                  : r.estado === 'creada'
                                  ? t('admin.reservationsManagement.status.created', 'Creada')
                                  : t('admin.reservationsManagement.status.confirmed', 'Confirmada')}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`status-pill ${
                                  isPagoConfirmado
                                    ? 'is-green'
                                    : r.estado === 'cancelada'
                                    ? 'is-red'
                                    : 'is-yellow'
                                }`}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: 20,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  whiteSpace: 'nowrap',
                                  ...(isPagoConfirmado
                                    ? {}
                                    : r.estado === 'cancelada'
                                    ? {}
                                    : { background: '#fef3c7', color: '#92400e' }),
                                }}
                              >
                                {isPagoConfirmado ? t('admin.reservationsManagement.status.confirmedStatus', 'Confirmado') : r.estado === 'cancelada' ? t('admin.reservationsManagement.status.cancelledStatus', 'Cancelado') : t('admin.reservationsManagement.status.pendingStatus', 'Pendiente')}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {isPagoConfirmado && (r.firmaContrato || r.contratoFirmado || r.estado === 'confirmada' || r.estado === 'en_curso' || r.estado === 'finalizada') ? (
                                <button
                                  type="button"
                                  onClick={() => setContratoModalReserva(r)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '5px 12px',
                                    borderRadius: 20,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    background: '#d1fae5',
                                    color: '#065f46',
                                    border: '1px solid #a7f3d0',
                                    cursor: 'pointer',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title={t('hc.ver_contrato_firmado_y_firma_digital', 'Ver contrato firmado y firma digital')}
                                >
                                  <FaFileContract size={13} color="#059669" />
                                  <span>{t('admin.reservationsManagement.yes', 'Sí')} · {t('admin.contractsPage.view', 'Ver Contrato')}</span>
                                </button>
                              ) : (
                                <span
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: 20,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    background: !isPagoConfirmado ? 'var(--city-bg, #f1f5f9)' : '#fee2e2',
                                    color: !isPagoConfirmado ? 'var(--texto-second, #64748b)' : '#991b1b',
                                  }}
                                >
                                  {!isPagoConfirmado ? t('admin.reservationsManagement.requiresPayment', 'Requiere Pago') : t('admin.reservationsManagement.no', 'No')}
                                </span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
                                {esEncargado && esCobroPresencialPendiente && r.estado !== 'en_curso' && r.estado !== 'finalizada' && r.estado !== 'cancelada' && (
                                  <button
                                    type="button"
                                    onClick={() => navigate(`${cashRoute}?ref=${encodeURIComponent(cod)}`)}
                                    style={{ background: '#f59e0b', color: 'var(--bg-tarjeta, #ffffff)', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'opacity 0.2s' }}
                                    onMouseOver={(e) => e.target.style.opacity = 0.8}
                                    onMouseOut={(e) => e.target.style.opacity = 1}
                                  >
                                    {t('admin.reservationsManagement.cashPayment', 'Cobrar Caja')}
                                  </button>
                                )}
                                {esEncargado && r.estado !== 'en_curso' && r.estado !== 'finalizada' && r.estado !== 'cancelada' && !esCobroPresencialPendiente && (
                                  <button
                                    type="button"
                                    onClick={() => handleEntregarAuto(r)}
                                    style={{ background: '#10b981', color: 'var(--bg-tarjeta, #ffffff)', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'opacity 0.2s' }}
                                    onMouseOver={(e) => { e.target.style.opacity = 0.8 }}
                                    onMouseOut={(e) => { e.target.style.opacity = 1 }}
                                  >
                                    {t('admin.reservationsManagement.confirmPickupBtn', 'Confirmar Entrega')}
                                  </button>
                                )}
                                {(r.estado === 'en_curso' || r.estado === 'finalizada') && (
                                  <button
                                    type="button"
                                    disabled
                                    style={{ background: 'var(--borde, #e2e8f0)', color: 'var(--texto-second, #64748b)', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'not-allowed' }}
                                  >
                                    {t('admin.reservationsManagement.carDelivered', 'Auto Entregado')}
                                  </button>
                                )}
                                {(r.estado === 'en_curso' || r.estado === 'finalizada') && (
                                  <button
                                    type="button"
                                    onClick={() => abrirNovedades(r)}
                                    title={t('hc.ver_las_novedades_registradas_en_la_en', 'Ver las novedades registradas en la entrega y sus fotografías')}
                                    style={{ background: 'var(--brand-soft, #eff6ff)', color: 'var(--brand-text, var(--brand-primary, #2563eb))', border: '1px solid var(--borde, #e2e8f0)', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}
                                  >
                                    Ver novedades
                                  </button>
                                )}
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
                                {esEncargado && r.estado === 'en_curso' && (
                                  <button
                                    type="button"
                                    onClick={() => handleRecibirDevolucion(r)}
                                    style={{ background: '#059669', color: 'var(--bg-tarjeta, #ffffff)', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'opacity 0.2s' }}
                                    onMouseOver={(e) => { e.target.style.opacity = 0.8 }}
                                    onMouseOut={(e) => { e.target.style.opacity = 1 }}
                                  >
                                    {t('admin.reservationsManagement.confirmReturnBtn', 'Confirmar Devolución')}
                                  </button>
                                )}
                                {r.estado !== 'en_curso' && r.estado !== 'finalizada' && r.estado !== 'cancelada' && (
                                  <button
                                    type="button"
                                    disabled
                                    style={{ background: 'var(--city-bg, #f1f5f9)', color: 'var(--texto-terciary, #94a3b8)', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'not-allowed' }}
                                  >{t('admin.reservationsManagement.pendingBtn', 'Pendiente')}</button>
                                )}
                                {r.estado === 'finalizada' && (
                                  <button
                                    type="button"
                                    disabled
                                    style={{ background: 'var(--borde, #e2e8f0)', color: 'var(--texto-second, #64748b)', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'not-allowed' }}
                                  >
                                    {t('admin.reservationsManagement.carReturned', 'Auto Devuelto')}
                                  </button>
                                )}
                                {r.estado === 'finalizada' && (
                                  <button
                                    type="button"
                                    onClick={() => abrirNovedades(r)}
                                    title={t('hc.ver_las_novedades_registradas_en_la_de', 'Ver las novedades registradas en la devolución y sus fotografías')}
                                    style={{ background: 'var(--brand-soft, #eff6ff)', color: 'var(--brand-text, var(--brand-primary, #2563eb))', border: '1px solid var(--borde, #e2e8f0)', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}
                                  >
                                    Ver novedades
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </>
                )}
              
              </table>
              
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '20px', padding: '16px 0', borderTop: '1px solid var(--city-border)' }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--city-border)', background: currentPage === 1 ? 'var(--city-bg)' : 'var(--bg-seccion1)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, color: currentPage === 1 ? 'var(--texto-terciary)' : 'var(--texto-primary)' }}
                  >
                    Anterior
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--texto-second)' }}>
                    {t('admin.reservationsManagement.pagination.page', 'Página {{current}} de {{total}}', { current: currentPage, total: totalPages })}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--city-border)', background: currentPage === totalPages ? 'var(--city-bg)' : 'var(--bg-seccion1)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, color: currentPage === totalPages ? 'var(--texto-terciary)' : 'var(--texto-primary)' }}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>

          )}
        </section>
      </div>

      {/* â”€â”€ MODAL 1: DETALLE COMPLETO DE RESERVA â”€â”€ */}
      {modalDetalle && (
        <div
          className="cities-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setModalDetalle(null)}
        >
          <section className="cities-modal reserva-detail-modal" role="dialog">
            <div className="cities-modal__head">
              <div>
                <p className="cities-eyebrow">{t('admin.reservationsManagement.subtitle', 'GESTIÓN DE SUCURSAL')}</p>
                <h2>{modalDetalle.codigo}</h2>
              </div>
              <button type="button" onClick={() => setModalDetalle(null)}>
                á—
              </button>
            </div>

            {/* â”€â”€ ESTRUCTURA DE LOS 3 PASOS DEL FLUJO DE RESERVA â”€â”€ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* PASO 1: SELECCIÓN DE VEHÍCULO, FECHAS Y SUCURSALES */}
              <div className="reserva-detail-card-box" style={{ borderLeft: '4px solid var(--brand-primary, #2563eb)' }}>
                <h4 style={{ color: 'var(--brand-primary, #2563eb)', margin: '0 0 12px', fontSize: 14 }}>
                  <FaCar /> PASO 1: Selección de Vehículo, Fechas y Sucursal
                </h4>
                
                {modalDetalle.vehiculoImagen && (
                  <div style={{ marginBottom: 12 }}>
                    <img
                      src={modalDetalle.vehiculoImagen}
                      alt={modalDetalle.vehiculoNombre}
                      style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--city-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                    />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="reserva-detail-field">
                    <small>{t('admin.reservationsManagement.detailModal.associatedVehicle', 'Vehículo Asociado:')}</small>
                    <strong>{modalDetalle.vehiculoNombre}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>{t('admin.reservationsManagement.detailModal.plate', 'Placa del Auto:')}</small>
                    <span style={{ display: 'inline-block', background: 'var(--city-bg, #f1f5f9)', border: '1px solid var(--borde, #cbd5e1)', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                      {modalDetalle.vehiculoPlaca || 'KLS-849'}
                    </span>
                  </div>
                  <div className="reserva-detail-field">
                    <small>{t('admin.reservationsManagement.detailModal.pickupBranch', 'Sucursal de Retiro:')}</small>
                    <strong>{modalDetalle.sucursal || 'Bogotá - Calle 100'}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>{t('admin.reservationsManagement.detailModal.dropoffBranch', 'Sucursal de Devolución:')}</small>
                    <strong>{modalDetalle.reservaDetalles?.sucursalDevolucion || modalDetalle.sucursal || 'Bogotá - Calle 100'}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>{t('admin.reservationsManagement.detailModal.pickupDateTime', 'Fecha y Hora de Retiro:')}</small>
                    <strong style={{ color: '#047857' }}>{modalDetalle.fechaInicio?.replace('T', ' ')}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>{t('admin.reservationsManagement.detailModal.dropoffDateTime', 'Fecha y Hora de Devolución:')}</small>
                    <strong style={{ color: 'var(--brand-text)' }}>{modalDetalle.fechaFin?.replace('T', ' ')}</strong>
                  </div>
                </div>
              </div>

              {/* PASO 2: SEGUROS, KILOMETRAJE Y SERVICIOS ADICIONALES */}
              <div className="reserva-detail-card-box" style={{ borderLeft: '4px solid #059669' }}>
                <h4 style={{ color: '#059669', margin: '0 0 12px', fontSize: 14 }}>
                  <FaShieldAlt /> PASO 2: Cobertura, Kilometraje y Adicionales
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="reserva-detail-field">
                    <small>{t('admin.reservationsManagement.detailModal.insuranceCoverage', 'Cobertura de Seguro:')}</small>
                    <strong>{modalDetalle.reservaDetalles?.cobertura?.nombre || modalDetalle.cobertura || t('hc2.proteccion_estandar_cdw', 'Protección Estándar CDW')}</strong>
                  </div>

                  <div className="reserva-detail-field">
                    <small>{t('admin.reservationsManagement.detailModal.mileageType', 'Tipo de Kilometraje:')}</small>
                    <strong>{modalDetalle.reservaDetalles?.kilometraje || modalDetalle.kilometraje || 'Ilimitado'}</strong>
                  </div>

                  <div className="reserva-detail-field" style={{ gridColumn: 'span 2' }}>
                    <small>{t('admin.reservationsManagement.detailModal.additionalServices', 'Servicios Adicionales Contratados:')}</small>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                      {(modalDetalle.reservaDetalles?.serviciosAdicionales?.length > 0) ? (
                        modalDetalle.reservaDetalles.serviciosAdicionales.map((s, idx) => (
                          <span key={idx} style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '3px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>
                            {typeof s === 'string' ? s : s.nombre}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: 'var(--city-muted, #94a3b8)', fontSize: 12, italic: 'true' }}>
                          No aplicó servicios adicionales
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* PASO 3: DATOS DEL CLIENTE, TÉRMINOS, CUPONES Y PAGO */}
              <div className="reserva-detail-card-box" style={{ borderLeft: '4px solid var(--brand-primary, #2563eb)' }}>
                <h4 style={{ color: 'var(--brand-primary, #2563eb)', margin: '0 0 12px', fontSize: 14 }}>
                  <FaUser /> PASO 3: Cliente, Términos, Cupones y Gestión de Pago
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div className="reserva-detail-field">
                    <small>{t('admin.reservationsManagement.detailModal.clientName', 'Nombre del Cliente / Titular:')}</small>
                    <strong>{modalDetalle.clienteNombre}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>{t('admin.reservationsManagement.detailModal.documentId', 'Cédula / Documento Identidad:')}</small>
                    <strong>{modalDetalle.clienteDocumento || ''}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>{t('admin.reservationsManagement.detailModal.email', 'Correo Electrónico:')}</small>
                    <strong>{modalDetalle.clienteCorreo}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>{t('admin.reservationsManagement.detailModal.phone', 'Teléfono de Contacto:')}</small>
                    <strong>{modalDetalle.clienteTelefono}</strong>
                  </div>
                  <div className="reserva-detail-field">
                    <small>{t('admin.reservationsManagement.detailModal.terms', 'Términos y Condiciones:')}</small>
                    <span style={{ color: '#047857', fontWeight: 700, fontSize: 12 }}>
                      âœ“ Aceptados por el cliente
                    </span>
                  </div>
                  <div className="reserva-detail-field">
                    <small>{t('admin.reservationsManagement.detailModal.discountCoupon', 'Cupón de Descuento:')}</small>
                    <strong>
                      {modalDetalle.cuponCodigo || modalDetalle.reservaDetalles?.cuponAplicado
                        ? t('hc3.coupon_applied', { defaultValue: 'Aplicó ({{codigo}})', codigo: modalDetalle.cuponCodigo || 'DRIVIQUE2026' })
                        : t('hc2.no_aplico', 'No aplicó')}
                    </strong>
                  </div>
                </div>

                {/* Bloque Financiero y Pago por ID Único */}
                <div style={{ background: 'var(--city-soft, var(--bg-seccion1, #f8fafc))', padding: 14, borderRadius: 12, border: '1px solid var(--adm-border, var(--borde, #cbd5e1))', marginTop: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div>
                      <small style={{ color: 'var(--city-muted)', fontSize: 11 }}>{t('admin.reservationsManagement.detailModal.uniqueId', 'ID Único de Reserva:')}</small>
                      <strong style={{ display: 'block', fontSize: 14, color: 'var(--brand-primary, #2563eb)' }}>{modalDetalle.codigo}</strong>
                    </div>
                    <div>
                      <small style={{ color: 'var(--city-muted)', fontSize: 11 }}>{t('admin.reservationsManagement.detailModal.totalAmount', 'Monto Total Reserva:')}</small>
                      <strong style={{ display: 'block', fontSize: 15, color: 'var(--city-text)' }}>{formatCurrency(modalDetalle.totalCOP, moneda, tasaUSD)}</strong>
                    </div>
                    <div>
                      <small style={{ color: 'var(--city-muted)', fontSize: 11 }}>{t('admin.reservationsManagement.detailModal.paymentMethod', 'Medio de Pago:')}</small>
                      <strong style={{ display: 'block', fontSize: 12 }}>
                        {modalDetalle.reservaDetalles?.metodoPago?.includes('efectivo') ? t('hc2.pago_presencial_en_sucursal', 'Pago Presencial en Sucursal') : 'Wompi - Pasarela Digital'}
                      </strong>
                    </div>
                    <div>
                      <small style={{ color: 'var(--city-muted)', fontSize: 11 }}>{t('admin.reservationsManagement.detailModal.paymentStatus', 'Estado del Pago:')}</small>
                      <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: modalDetalle.pagoEstado === 'aprobado' || modalDetalle.metodoPagoConfirmado ? '#ecfdf5' : '#fffbe1', color: modalDetalle.pagoEstado === 'aprobado' || modalDetalle.metodoPagoConfirmado ? '#047857' : '#b45309' }}>
                        {modalDetalle.pagoEstado === 'aprobado' || modalDetalle.metodoPagoConfirmado ? t('hc2.pago_recibido', 'Pago Recibido') : t('hc5.not_received', 'No Recibido')}
                      </span>
                    </div>
                  </div>

                  {/* Botón Condicional de Confirmación de Cobro en Caja */}
                  {(!modalDetalle.metodoPagoConfirmado && modalDetalle.pagoEstado !== 'aprobado' && modalDetalle.reservaDetalles?.metodoPago?.includes('efectivo')) && (
                    <button
                      type="button"
                      className="cities-primary"
                      onClick={() => {
                        setModalDetalle(null)
                        navigate(`${cashRoute}?ref=${encodeURIComponent(modalDetalle.codigo)}`)
                      }}
                      style={{ width: '100%', marginTop: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', background: '#047857', borderRadius: 10, color: 'var(--bg-tarjeta, #ffffff)', fontWeight: 800, fontSize: 12, border: 'none', cursor: 'pointer' }}
                    >
                      <FaMoneyBillWave /> Confirmar Cobro en Caja (Sucursal)
                    </button>
                  )}
                </div>
              </div>
            </div>

            <InspectionNovelties reserva={modalDetalle} formatMoney={(value) => formatCurrency(value, moneda || 'COP', tasaUSD)} />

            {/* Gestión de Logística a Domicilio (Encargado de Sucursal) */}
            {(modalDetalle.sucursalRetiro === 'domicilio' || modalDetalle.sucursalDevolucion === 'domicilio' || modalDetalle.domicilioDireccion) && (
              <div className="reserva-detail-card-box" style={{ background: 'var(--city-bg-sub, var(--bg-seccion1, #f8fafc))', border: '1.5px solid var(--brand-border-light, var(--borde, #cbd5e1))' }}>
                <h4 style={{ color: 'var(--brand-primary, #2563eb)' }}>
                  Gestión de Logística a Domicilio (Sucursal)
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  {modalDetalle.domicilioDireccion && (
                    <div className="reserva-detail-field">
                      <small>{t('hc.direccion_de_entrega_retiro', 'Dirección de Entrega (Retiro):')}</small>
                      <strong>{modalDetalle.domicilioDireccion}</strong>
                      {modalDetalle.domicilioBarrio && <small style={{ color: 'var(--city-muted)' }}>Barrio: {modalDetalle.domicilioBarrio}</small>}
                      {modalDetalle.domicilioReferencias && <small style={{ color: 'var(--city-muted)' }}>Ref: {modalDetalle.domicilioReferencias}</small>}
                    </div>
                  )}
                  {modalDetalle.domicilioDevolucionDireccion && (
                    <div className="reserva-detail-field">
                      <small>{t('hc.direccion_de_recogida_devolucion', 'Dirección de Recogida (Devolución):')}</small>
                      <strong>{modalDetalle.domicilioDevolucionDireccion}</strong>
                    </div>
                  )}
                  {(modalDetalle.domicilioPuntos || []).map((p) => (
                    <div key={p.id} className="reserva-detail-field">
                      <small>{p.tipo === 'PICKUP' ? t('hc2.conductor_de_la_entrega', 'Conductor de la entrega:') : t('hc2.conductor_de_la_devolucion', 'Conductor de la devolución:')}</small>
                      <strong>
                        {p.conductor
                          ? `${p.conductor}${p.conductorTelefono ? ` · ${p.conductorTelefono}` : ''}`
                          : t('hc2.sin_conductor_asignado', 'Sin conductor asignado')}
                      </strong>
                      <small style={{ color: 'var(--city-muted)' }}>
                        {t('hc5.status_label', 'Estado')}: {p.estado === 'COMPLETED' ? t('hc5.completed_m', 'Completado') : p.estado === 'ASSIGNED' ? t('hc5.assigned_m', 'Asignado') : t('hc5.pending_m', 'Pendiente')}
                      </small>
                    </div>
                  ))}
                  <small style={{ color: 'var(--city-muted)' }}>
                    El conductor se asigna y la entrega se confirma con el PIN del cliente en el módulo de Domicilios.
                  </small>
                </div>
              </div>
            )}

            {/* Historial de Transiciones / Auditoría */}
            <div className="reserva-timeline-wrap">
              <h4 style={{ margin: '0 0 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FaHistory style={{ color: 'var(--brand-text)' }} /> {t('admin.reservationsManagement.detailModal.historyTitle')}
              </h4>
              <div style={{ maxHeight: 160, overflowY: 'auto' }}>
                {(modalDetalle.historialAcciones || []).map((h, idx) => (
                  <div key={idx} className="reserva-timeline-item">
                    <div className="reserva-timeline-dot-wrap">
                      <div className="reserva-timeline-dot" />
                      {idx < modalDetalle.historialAcciones.length - 1 && (
                        <div className="reserva-timeline-line" />
                      )}
                    </div>
                    <div className="reserva-timeline-content">
                      <p>{h.accion}</p>
                      <small>
                        {h.usuario} ⬢ {new Date(h.fecha).toLocaleString()}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cities-modal__actions" style={{ marginTop: 20 }}>
              <button type="button" onClick={() => setModalDetalle(null)}>
                {t('admin.reservationsManagement.detailModal.close')}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* â”€â”€ MODAL 2: CREAR RESERVA MANUAL â”€â”€ */}
      {modalCrear && (
        <div
          className="cities-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setModalCrear(false)}
        >
          <section className="cities-modal" role="dialog">
            <div className="cities-modal__head">
              <div>
                <p className="cities-eyebrow">{t('admin.reservationsModal.directAttention')}</p>
                <h2>{t('admin.reservationsModal.createManualResTitle')}</h2>
              </div>
              <button type="button" onClick={() => setModalCrear(false)}>
                á—
              </button>
            </div>

            <form onSubmit={submitCrearManual}>
              <div className="branches-form-grid">
                <label>
                  {t('admin.reservationsModal.clientEmail')}
                  <input
                    type="email"
                    required
                    value={formCrear.clienteCorreo}
                    onChange={(e) => setFormCrear({ ...formCrear, clienteCorreo: e.target.value })}
                    placeholder={t('admin.reservationsModal.clientEmailPlaceholder')}
                  />
                </label>
              </div>

              <div className="branches-form-grid">
                <label>
                  {t('admin.reservationsManagement.createModal.vehicle')}
                  <select
                    value={formCrear.vehiculoNombre}
                    onChange={(e) => {
                      const veh = vehiculosDisponibles.find((v) => v.nombre === e.target.value)
                      setFormCrear({
                        ...formCrear,
                        vehiculoNombre: e.target.value,
                        vehiculoPlaca: veh?.placa || '',
                      })
                    }}
                  >
                    {vehiculosDisponibles.length > 0 ? (
                      vehiculosDisponibles.map((v) => (
                        <option key={v.id} value={v.nombre}>
                          {v.nombre} ({v.placa || t('admin.reservationsModal.noLicensePlate')})
                        </option>
                      ))
                    ) : <option value="" disabled>{t('admin.reservationsManagement.createModal.noVehicles')}</option>}
                  </select>
                </label>

                <label>
                  {t('admin.reservationsModal.branch')}
                  <select
                    value={formCrear.sucursal}
                    disabled={esEncargado}
                    onChange={(e) => setFormCrear({ ...formCrear, sucursal: e.target.value })}
                  >
                    {sucursalesVisibles.map((s) => (
                      <option key={s.id} value={s.nombre}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="branches-form-grid">
                <label>
                  {t('admin.reservationsModal.pickupDate')}
                  <input
                    type="datetime-local"
                    required
                    value={formCrear.fechaInicio}
                    onChange={(e) => setFormCrear({ ...formCrear, fechaInicio: e.target.value })}
                  />
                </label>
                <label>
                  {t('admin.reservationsModal.returnDate')}
                  <input
                    type="datetime-local"
                    required
                    value={formCrear.fechaFin}
                    onChange={(e) => setFormCrear({ ...formCrear, fechaFin: e.target.value })}
                  />
                </label>
              </div>

              <p style={{ fontSize: 13, opacity: 0.8 }}>
                El estado inicial y el valor total los calcula el sistema según el vehículo, las fechas y la tarifa vigente.
              </p>
              <label>
                {t('admin.reservationsModal.notes')}
                <input
                  value={formCrear.notas}
                  onChange={(e) => setFormCrear({ ...formCrear, notas: e.target.value })}
                />
              </label>

              <div className="cities-modal__actions">
                <button type="button" onClick={() => setModalCrear(false)}>
                  {t('common.cancel')}
                </button>
                <button className="cities-primary" type="submit" disabled={!vehiculosDisponibles.length || (esEncargado && !sucursalEncargado)}>
                  {t('admin.reservationsManagement.createModal.create')}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* â”€â”€ MODAL 3: EDITAR RESERVA â”€â”€ */}
      {modalEditar && (
        <div
          className="cities-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setModalEditar(null)}
        >
          <section className="cities-modal" role="dialog">
            <div className="cities-modal__head">
              <div>
                <p className="cities-eyebrow">{t('admin.reservationsManagement.editModal.eyebrow')}</p>
                <h2>{t('admin.reservationsManagement.editModal.titlePrefix', { code: modalEditar.codigo })}</h2>
              </div>
              <button type="button" onClick={() => setModalEditar(null)}>
                á—
              </button>
            </div>

            <form onSubmit={submitEditarReserva}>
              <div className="branches-form-grid">
                <label>
                  {t('admin.reservationsManagement.editModal.pickupDate')}
                  <input
                    type="datetime-local"
                    value={formEditar.fechaInicio}
                    onChange={(e) => setFormEditar({ ...formEditar, fechaInicio: e.target.value })}
                  />
                </label>
                <label>
                  {t('admin.reservationsManagement.editModal.returnDate')}
                  <input
                    type="datetime-local"
                    value={formEditar.fechaFin}
                    onChange={(e) => setFormEditar({ ...formEditar, fechaFin: e.target.value })}
                  />
                </label>
              </div>

              <div className="cities-modal__actions">
                <button type="button" onClick={() => setModalEditar(null)}>
                  {t('common.cancel')}
                </button>
                <button className="cities-primary" type="submit">
                  {t('admin.reservationsManagement.editModal.save')}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* â”€â”€ MODAL 4: CANCELAR RESERVA â”€â”€ */}
      {modalCancelar && (
        <div
          className="cities-modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setModalCancelar(null)}
        >
          <section className="cities-modal" role="dialog">
            <div className="cities-delete-icon">
              <FaBan />
            </div>
            <h2>{t('admin.reservationsManagement.cancelModal.titlePrefix', { code: modalCancelar.codigo })}</h2>
            <p>{t('admin.reservationsManagement.cancelModal.warningText')}</p>

            <form onSubmit={submitCancelarReserva} style={{ marginTop: 16 }}>
              <label>
                {t('admin.reservationsManagement.cancelModal.reasonLabel')}
                <input
                  required
                  placeholder={t('admin.reservationsManagement.cancelModal.reasonPlaceholder')}
                  value={motivoCancelar}
                  onChange={(e) => setMotivoCancelar(e.target.value)}
                />
              </label>

              <div className="cities-modal__actions">
                <button type="button" onClick={() => setModalCancelar(null)}>
                  {t('admin.reservationsManagement.cancelModal.back')}
                </button>
                <button className="cities-danger" type="submit">
                  {t('admin.reservationsManagement.cancelModal.confirm')}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {/* â”€â”€ MODAL DE IMAGEN AMPLIADA â”€â”€ */}
      {zoomImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: 20,
          }}
          onClick={() => setZoomImage(null)}
        >
          <div
            style={{
              background: 'var(--bg-tarjeta, #ffffff)',
              borderRadius: 16,
              padding: 20,
              maxWidth: 640,
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--texto-primary, #0f172a)' }}>{zoomImage.title}</h3>
                <span style={{ fontSize: 12, color: 'var(--texto-second, #64748b)' }}>{t('hc.vista_ampliada_del_vehiculo', 'Vista ampliada del vehículo')}</span>
              </div>
              <button
                type="button"
                onClick={() => setZoomImage(null)}
                style={{
                  background: 'var(--city-bg, #f1f5f9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  fontWeight: 700,
                  color: 'var(--texto-second, #64748b)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--bg-seccion1, #f8fafc)', border: '1px solid var(--borde, #e2e8f0)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 10 }}>
              <img
                src={zoomImage.url}
                alt={zoomImage.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: 480,
                  objectFit: 'contain',
                  borderRadius: 8,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL VISOR DE DOCUMENTO IDENTIDAD / LICENCIA */}
      {zoomPdf && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: 20,
          }}
          onClick={() => setZoomPdf(null)}
        >
          <div
            style={{
              background: 'var(--bg-tarjeta, #ffffff)',
              borderRadius: 20,
              padding: '24px 28px',
              maxWidth: 780,
              width: '100%',
              maxHeight: '88vh',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid var(--borde, #e2e8f0)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--borde, #e2e8f0)', paddingBottom: 14 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-primary, #2563eb)' }}>
                  {zoomPdf.docType === 'license' ? t('hc2.licencia_de_conduccion_oficial', 'Licencia de Conducción Oficial') : t('hc2.documento_de_identidad_oficial', 'Documento de Identidad Oficial')}
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 800, color: 'var(--texto-primary, #0f172a)' }}>
                  {zoomPdf.title}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {zoomPdf.url && (
                  <a
                    href={zoomPdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--brand-primary, #2563eb)',
                      textDecoration: 'none',
                      padding: '6px 12px',
                      borderRadius: 8,
                      background: 'var(--brand-soft-light, #eff6ff)',
                    }}
                  >
                    <FaExternalLinkAlt size={11} /> Abrir original
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setZoomPdf(null)}
                  style={{
                    background: 'var(--city-bg, #f1f5f9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    fontWeight: 700,
                    color: 'var(--texto-second, #64748b)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {zoomPdf.url && (zoomPdf.url.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/i) || zoomPdf.url.startsWith('data:image/')) ? (
                <div style={{ flex: 1, minHeight: 380, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-seccion1, #f8fafc)', borderRadius: 14, padding: 16 }}>
                  <img
                    src={zoomPdf.url}
                    alt={zoomPdf.title}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '62vh',
                      objectFit: 'contain',
                      borderRadius: 10,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                    }}
                  />
                </div>
              ) : zoomPdf.url && (zoomPdf.url.startsWith('http') || zoomPdf.url.startsWith('/uploads') || zoomPdf.url.startsWith('blob:') || zoomPdf.url.startsWith('data:application/pdf')) && zoomPdf.url.toLowerCase().includes('.pdf') ? (
                <div style={{ flex: 1, minHeight: 460 }}>
                  <object
                    data={`${zoomPdf.url}#toolbar=1`}
                    type="application/pdf"
                    style={{ width: '100%', height: '62vh', borderRadius: 12, border: 'none' }}
                  >
                    <p style={{ textAlign: 'center', padding: 24, color: 'var(--texto-second, #64748b)' }}>
                      El visor embebido no pudo cargar el PDF. <a href={zoomPdf.url} target="_blank" rel="noreferrer" style={{ color: 'var(--brand-primary, #2563eb)', fontWeight: 700 }}>{t('hc.abrir_en_pestana_nueva', 'Abrir en pestaña nueva')}</a>
                    </p>
                  </object>
                </div>
              ) : (
                /* TARJETA OFICIAL KYC DE DOCUMENTO VERIFICADO EN SUCURSAL */
                <div style={{
                  padding: 24,
                  background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.9) 100%)',
                  borderRadius: 16,
                  border: '1.5px solid var(--borde, #cbd5e1)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  {/* Encabezado del Documento Oficial */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--brand-primary)', paddingBottom: 14, marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--brand-primary-hover) 0%, var(--brand-primary) 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaIdCard size={22} />
                      </div>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', color: 'var(--brand-text)', textTransform: 'uppercase' }}>
                          REPÚBLICA DE COLOMBIA · SISTEMA NACIONAL RUNT
                        </span>
                        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: 'var(--texto-primary, #0f172a)' }}>
                          {zoomPdf.docType === 'license' ? t('hc2.licencia_de_conduccion_vehicular', 'LICENCIA DE CONDUCCIÓN VEHICULAR') : t('hc2.documento_nacional_de_identidad', 'DOCUMENTO NACIONAL DE IDENTIDAD')}
                        </h4>
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      background: '#dcfce7',
                      color: '#15803d',
                      fontSize: 11,
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5
                    }}>
                      <FaCheckCircle size={12} /> Vigente y Verificado
                    </span>
                  </div>

                  {/* Cuerpo con datos del Titular */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 18 }}>
                    <div style={{ background: 'var(--bg-tarjeta, #ffffff)', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--borde, #e2e8f0)' }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--texto-second, #64748b)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                        Nombre del Titular
                      </span>
                      <strong style={{ fontSize: 14, color: 'var(--texto-primary, #0f172a)', display: 'block' }}>
                        {zoomPdf.cliNom}
                      </strong>
                    </div>

                    <div style={{ background: 'var(--bg-tarjeta, #ffffff)', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--borde, #e2e8f0)' }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--texto-second, #64748b)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                        Número de Documento
                      </span>
                      <strong style={{ fontSize: 15, color: 'var(--brand-text)', fontFamily: 'monospace', display: 'block' }}>
                        {zoomPdf.cliDoc || '10203040'}
                      </strong>
                    </div>

                    <div style={{ background: 'var(--bg-tarjeta, #ffffff)', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--borde, #e2e8f0)' }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--texto-second, #64748b)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                        Tipo de Documento
                      </span>
                      <strong style={{ fontSize: 13, color: 'var(--texto-primary, #0f172a)', display: 'block' }}>
                        {zoomPdf.tipoDoc || t('hc2.cedula_de_ciudadania', 'Cédula de Ciudadanía')}
                      </strong>
                    </div>

                    <div style={{ background: 'var(--bg-tarjeta, #ffffff)', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--borde, #e2e8f0)' }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--texto-second, #64748b)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                        {zoomPdf.docType === 'license' ? t('hc2.categorias_autorizadas', 'Categorías Autorizadas') : 'Nacionalidad'}
                      </span>
                      <strong style={{ fontSize: 13, color: 'var(--texto-primary, #0f172a)', display: 'block' }}>
                        {zoomPdf.docType === 'license' ? t('hc2.b1_c1_automoviles_y_camionetas', 'B1, C1 (Automóviles y Camionetas)') : 'Colombiana'}
                      </strong>
                    </div>
                  </div>

                  {/* Sello de Seguridad y Validación de Sucursal */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: 'var(--bg-tarjeta, #ffffff)',
                    border: '1px dashed var(--brand-primary)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FaShieldAlt size={22} color="var(--brand-primary)" />
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-text)', display: 'block' }}>
                          Expediente Validado en Sucursal Drivique
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--texto-second, #64748b)' }}>
                          Registrado para reserva: {zoomPdf.reserva?.codigo || 'Oficial'} · {zoomPdf.fileName}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#059669', fontWeight: 700 }}>
                      <FaCheckCircle size={13} />
                      <span>{t('hc.conforme_ley_769_de_2002', 'Conforme Ley 769 de 2002')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18, borderTop: '1px solid var(--borde, #e2e8f0)', paddingTop: 14 }}>
              <button
                type="button"
                onClick={() => setZoomPdf(null)}
                style={{
                  padding: '10px 22px',
                  borderRadius: 10,
                  background: 'var(--brand-primary, #2563eb)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 13,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VER CONTRATO OFICIAL CON FIRMA */}
      {contratoModalReserva && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: 20,
          }}
          onClick={() => setContratoModalReserva(null)}
        >
          <div
            style={{
              background: 'var(--bg-tarjeta, #ffffff)',
              borderRadius: 20,
              maxWidth: 960,
              width: '100%',
              maxHeight: '90vh',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid var(--borde, #e2e8f0)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid var(--borde, #e2e8f0)',
              background: 'var(--bg-tarjeta, #ffffff)'
            }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <FaCheckCircle size={12} /> Contrato Legal Firmado Digitalmente
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 900, color: 'var(--texto-primary, #0f172a)' }}>
                  Contrato de Arrendamiento Vehicular · {contratoModalReserva.codigo || `RES-${contratoModalReserva.id}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setContratoModalReserva(null)}
                style={{
                  background: 'var(--city-bg, #f1f5f9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 34,
                  height: 34,
                  fontWeight: 800,
                  color: 'var(--texto-second, #64748b)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: 'var(--bg-seccion1, #f8fafc)' }}>
              <FirmaContrato
                soloLectura={true}
                vehiculo={{
                  nombre: contratoModalReserva.vehiculoNombre,
                  placa: contratoModalReserva.vehiculoPlaca,
                  sucursal: contratoModalReserva.sucursal,
                  imagen: contratoModalReserva.vehiculoImagen,
                }}
                reservaGuardada={{
                  id: contratoModalReserva.id,
                  clienteNombre: contratoModalReserva.clienteNombre,
                  clienteDocumento: contratoModalReserva.clienteDocumento,
                  clienteTipoDocumento: contratoModalReserva.clienteTipoDocumento || 'CC',
                  clienteCorreo: contratoModalReserva.clienteCorreo,
                  clienteTelefono: contratoModalReserva.clienteTelefono,
                  total: contratoModalReserva.totalCOP || contratoModalReserva.total,
                  referencia: contratoModalReserva.codigo || contratoModalReserva.referencia,
                  datosForm: {
                    nombre: contratoModalReserva.clienteNombre,
                    tipoDoc: contratoModalReserva.clienteTipoDocumento || 'CC',
                    numDoc: contratoModalReserva.clienteDocumento,
                  },
                  reservaDetalles: {
                    sucursalRetiro: contratoModalReserva.sucursalRetiro || contratoModalReserva.sucursal,
                    sucursalDevolucion: contratoModalReserva.sucursalDevolucion || contratoModalReserva.sucursal,
                    fechaInicio: contratoModalReserva.fechaInicio,
                    fechaFin: contratoModalReserva.fechaFin,
                    horaInicio: contratoModalReserva.horaInicio,
                    horaFin: contratoModalReserva.horaFin,
                    metodoPago: contratoModalReserva.metodoPago,
                  }
                }}
                contratoFirmado={{
                  id: contratoModalReserva.contratoId,
                  contractNumber: contratoModalReserva.contratoNumero || `CTR-${contratoModalReserva.codigo}`,
                  codigo: contratoModalReserva.contratoNumero || `CTR-${contratoModalReserva.codigo}`,
                  signatureUrl: contratoModalReserva.signatureUrl || contratoModalReserva.firmaUsuarioDataUrl,
                  firmaUsuarioDataUrl: contratoModalReserva.signatureUrl || contratoModalReserva.firmaUsuarioDataUrl,
                  signedAt: contratoModalReserva.fechaPagoConfirmado || contratoModalReserva.fechaCreacion,
                  clienteNombre: contratoModalReserva.clienteNombre,
                  clienteDocumento: contratoModalReserva.clienteDocumento,
                  tipoDoc: contratoModalReserva.clienteTipoDocumento || 'CC',
                }}
                onVolver={() => setContratoModalReserva(null)}
              />
            </div>
          </div>
        </div>
      )}
    </main>
    </div>
  )
}
