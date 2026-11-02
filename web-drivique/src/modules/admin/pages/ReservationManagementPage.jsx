import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

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
import { resolveDocumentUrl } from '../../../utils/documentUtils'

import { documentVerificationService } from '../../../services/documentVerificationService'

import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import { formatCurrency } from '../../../utils/currencyUtils'

import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './ReservationManagementPage.css'
import { askInspection } from '../components/InspectionFormModal'

import ReservationsMain from './ReservationManagementPage/ReservationsMain'

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

    const resolvedUrl = resolveDocumentUrl(docUrl)
    const esUrlValida = Boolean(resolvedUrl && (
      resolvedUrl.startsWith('data:') ||
      resolvedUrl.startsWith('blob:') ||
      resolvedUrl.startsWith('/uploads/') ||
      resolvedUrl.startsWith('/api/uploads/') ||
      resolvedUrl.startsWith('http://') ||
      resolvedUrl.startsWith('https://')
    ))

    setZoomPdf({
      url: esUrlValida ? resolvedUrl : '',
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
      <ReservationsMain abrirNovedades={abrirNovedades} activeTab={activeTab} branchFilter={branchFilter} cashRoute={cashRoute} contratoModalReserva={contratoModalReserva} currentPage={currentPage} dateFrom={dateFrom} dateTo={dateTo} esEncargado={esEncargado} filtradas={filtradas} formCrear={formCrear} formEditar={formEditar} handleEntregarAuto={handleEntregarAuto} handleExportExcel={handleExportExcel} handleExportPdf={handleExportPdf} handleOpenDocument={handleOpenDocument} handlePrint={handlePrint} handleRecibirDevolucion={handleRecibirDevolucion} modalCancelar={modalCancelar} modalCrear={modalCrear} modalDetalle={modalDetalle} modalEditar={modalEditar} moneda={moneda} motivoCancelar={motivoCancelar} navigate={navigate} notice={notice} paginatedReservations={paginatedReservations} search={search} setActiveTab={setActiveTab} setBranchFilter={setBranchFilter} setContratoModalReserva={setContratoModalReserva} setCurrentPage={setCurrentPage} setDateFrom={setDateFrom} setDateTo={setDateTo} setFormCrear={setFormCrear} setFormEditar={setFormEditar} setModalCancelar={setModalCancelar} setModalCrear={setModalCrear} setModalDetalle={setModalDetalle} setModalEditar={setModalEditar} setMotivoCancelar={setMotivoCancelar} setNotice={setNotice} setSearch={setSearch} setStatusFilter={setStatusFilter} setZoomImage={setZoomImage} setZoomPdf={setZoomPdf} statusFilter={statusFilter} submitCancelarReserva={submitCancelarReserva} submitCrearManual={submitCrearManual} submitEditarReserva={submitEditarReserva} sucursalEncargado={sucursalEncargado} sucursalesVisibles={sucursalesVisibles} t={t} tasaUSD={tasaUSD} totalPages={totalPages} user={user} vehiculosDisponibles={vehiculosDisponibles} zoomImage={zoomImage} zoomPdf={zoomPdf} />
    </div>
  )
}
