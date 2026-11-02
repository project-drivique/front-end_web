import { useTranslation } from 'react-i18next'
import { useLanding } from '../../../landing/LandingContext'
import { useAuthStore } from '../../../../store/authStore'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { branchManagementService } from '../../../../services/branchManagementService'
import { reservationManagementService } from '../../../../services/reservationManagementService'
import { hasMatchingBranch } from '../../../../services/accessAuditService'
import { formatCurrency } from '../../../../utils/currencyUtils'
import { showAlert } from '../../../../utils/swalConfig'
import { format } from 'date-fns'

export default function useCashCollectionLogic1({ branchOnly }) {
  const { t } = useTranslation()
    const { tema, moneda, tasaUSD } = useLanding()
    const user = useAuthStore((state) => state.usuario)
    const isBranchManager = branchOnly || user?.rol === 'encargado' || user?.rol === 'branch_manager' || user?.rol === 'encargado_sucursal'
    const sucursalAsignada = user?.sucursalAsignada || user?.sucursalId || user?.sucursal || ''
  
    // Estados de datos y filtros
    const [todasLasReservas, setTodasLasReservas] = useState([])
    const [search, setSearch] = useState('')
    const [filterTab, setFilterTab] = useState('todas') // 'pendientes' | 'cobradas' | 'todas' | 'digitales'
    const [comprobanteDigital, setComprobanteDigital] = useState(null)
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [dateRange] = useState({ start: '', end: '' })
    const [selectedMonth] = useState('todas') // 'todas' | '01'..'12'
    const [selectedYear] = useState('todas') // 'todas' | '2026'..
    const [selectedBranch, setSelectedBranch] = useState('todas') // 'todas' | nombre sucursal
    const [sortBy] = useState('codigo') // 'reciente' | 'antigua' | 'monto_desc' | 'monto_asc' | 'codigo'
  
    // Lista única de sucursales disponibles
    const listaSucursales = useMemo(() => {
      try {
        const fromService = (branchManagementService.list(user) || []).map((b) => b.nombre)
        const fromReservations = todasLasReservas
          .map((r) => r.sucursal || r.reservaDetalles?.sucursalRetiro || r.reservaDetalles?.sucursalPagoEfectivo)
          .filter(Boolean)
        const set = new Set([...fromService, ...fromReservations])
        return Array.from(set).filter(Boolean).sort()
      } catch {
        return []
      }
    }, [todasLasReservas, user])
  
    // Estado de Modal
    const [modalReserva, setModalReserva] = useState(null)
    const [observacionesCaja, setObservacionesCaja] = useState('')
    const [procesandoPago, setProcesandoPago] = useState(false)
    const [searchRefValue, setSearchRefValue] = useState('')
  
    // Cargar lista de reservas
    const cargarReservas = useCallback(async () => {
      try {
        setTodasLasReservas(await reservationManagementService.refresh())
      } catch (e) {
        console.error('No se pudieron cargar los cobros desde el servidor:', e)
      }
    }, [])
  
    useEffect(() => {
      cargarReservas()
    }, [cargarReservas])
  
    // Helper para evaluar si la reserva ya fue realmente cobrada en efectivo en mostrador
    const esCobradoEnSucursal = useCallback((r) => {
      return Boolean(
        r.fechaPagoConfirmado ||
        r.cajeroConfirmacion ||
        (r.metodoPagoConfirmado === 'efectivo' && r.estado?.toLowerCase() === 'confirmada')
      )
    }, [])
  
    // Filtrar reservas según sucursal asignada
    const reservasSucursal = useMemo(() => {
      if (isBranchManager && sucursalAsignada) {
        return todasLasReservas.filter((r) => {
          return (
            hasMatchingBranch(r.sucursal, sucursalAsignada) ||
            hasMatchingBranch(r.sucursalPagoEfectivo, sucursalAsignada) ||
            hasMatchingBranch(r.reservaDetalles?.sucursalPagoEfectivo, sucursalAsignada) ||
            hasMatchingBranch(r.reservaDetalles?.sucursalRetiro, sucursalAsignada) ||
            String(r.sucursal || '').trim().toLowerCase() === String(sucursalAsignada).trim().toLowerCase()
          )
        })
      }
      return todasLasReservas
    }, [todasLasReservas, isBranchManager, sucursalAsignada])
  
    // Métricas rápidas
    const todosLosPagos = useMemo(() => {
      return reservasSucursal.filter(r => r.estado !== 'cancelada')
    }, [reservasSucursal])
  
    const pendientesEfectivo = useMemo(() => {
      return todosLosPagos.filter((r) => {
        const metodo = r.reservaDetalles?.metodoPago || r.pasarela || r.metodoPagoConfirmado
        const estadoNorm = String(r.estado || '').toLowerCase()
        const esEfectivo = metodo === 'efectivo' || estadoNorm.includes('efectivo')
        const yaCobrado = esCobradoEnSucursal(r)
        return esEfectivo && !yaCobrado
      })
    }, [todosLosPagos, esCobradoEnSucursal])
  
    const cobradasHoy = useMemo(() => {
      const hoyUTC = new Date().toISOString().slice(0, 10)
      const hoyLocal = new Date().toLocaleDateString('en-CA')
  
      return reservasSucursal.filter((r) => {
        const yaCobrado = esCobradoEnSucursal(r)
        const fechaCobro = String(r.fechaPagoConfirmado || r.fechaCreacion || '').slice(0, 10)
        const esDeHoy = !fechaCobro || fechaCobro === hoyUTC || fechaCobro === hoyLocal
  
        return yaCobrado && esDeHoy
      })
    }, [reservasSucursal, esCobradoEnSucursal])
  
    const totalRecaudadoHoy = useMemo(() => {
      return cobradasHoy.reduce((acc, r) => acc + (Number(r.totalCOP) || 0), 0)
    }, [cobradasHoy])
  
    // Filtrado final y Ordenamiento de la tabla
    const listFiltrada = useMemo(() => {
      let base = [...todosLosPagos]
  
      if (filterTab === 'pendientes') {
        base = pendientesEfectivo
      } else if (filterTab === 'cobradas') {
        base = cobradasHoy
      } else if (filterTab === 'digitales') {
        base = base.filter(r => {
          const metodo = (r.reservaDetalles?.metodoPago || r.pasarela || r.metodoPagoConfirmado || '').toLowerCase()
          return metodo && !metodo.includes('efectivo')
        })
      }
  
      // Filtro por Sucursal seleccionada
      if (selectedBranch && selectedBranch !== 'todas') {
        base = base.filter((r) => {
          return (
            hasMatchingBranch(r.sucursal, selectedBranch) ||
            hasMatchingBranch(r.sucursalPagoEfectivo, selectedBranch) ||
            hasMatchingBranch(r.reservaDetalles?.sucursalPagoEfectivo, selectedBranch) ||
            hasMatchingBranch(r.reservaDetalles?.sucursalRetiro, selectedBranch) ||
            String(r.sucursal || '').trim().toLowerCase() === String(selectedBranch).trim().toLowerCase()
          )
        })
      }
  
      // Filtro por fecha Desde
      if (dateFrom) {
        base = base.filter((r) => {
          const fecha = String(r.fechaInicio || r.fechaCreacion || '').slice(0, 10)
          return fecha >= dateFrom
        })
      }
  
      // Filtro por fecha Hasta
      if (dateTo) {
        base = base.filter((r) => {
          const fecha = String(r.fechaInicio || r.fechaCreacion || '').slice(0, 10)
          return fecha <= dateTo
        })
      }
  
      // Filtro por Mes
      if (selectedMonth && selectedMonth !== 'todas') {
        base = base.filter((r) => {
          const fecha = String(r.fechaInicio || r.fechaCreacion || '')
          const month = fecha.slice(5, 7)
          return month === selectedMonth
        })
      }
  
      // Filtro por Año
      if (selectedYear && selectedYear !== 'todas') {
        base = base.filter((r) => {
          const fecha = String(r.fechaInicio || r.fechaCreacion || '')
          const year = fecha.slice(0, 4)
          return year === selectedYear
        })
      }
  
      // Filtro por Rango de Fechas del calendario unificado
      if (dateRange.start) {
        base = base.filter((r) => {
          const fecha = String(r.fechaInicio || r.fechaCreacion || '').slice(0, 10)
          if (dateRange.end) {
            return fecha >= dateRange.start && fecha <= dateRange.end
          }
          return fecha >= dateRange.start
        })
      }
  
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        base = base.filter((r) => {
          const cod = String(r.codigo || r.referencia || r.id || '').toLowerCase()
          const doc = String(r.clienteDocumento || '').toLowerCase()
          const tel = String(r.clienteTelefono || '').toLowerCase()
          const nom = String(r.clienteNombre || '').toLowerCase()
          const auto = String(r.vehiculoNombre || '').toLowerCase()
          const placa = String(r.vehiculoPlaca || '').toLowerCase()
          return (
            cod.includes(q) ||
            doc.includes(q) ||
            tel.includes(q) ||
            nom.includes(q) ||
            auto.includes(q) ||
            placa.includes(q)
          )
        })
      }
  
      // Ordenar por
      return base.sort((a, b) => {
        if (sortBy === 'antigua') {
          const fa = a.fechaInicio || a.fechaCreacion || ''
          const fb = b.fechaInicio || b.fechaCreacion || ''
          return fa.localeCompare(fb)
        }
        if (sortBy === 'monto_desc') {
          return Number(b.totalCOP || b.total || 0) - Number(a.totalCOP || a.total || 0)
        }
        if (sortBy === 'monto_asc') {
          return Number(a.totalCOP || a.total || 0) - Number(b.totalCOP || b.total || 0)
        }
        if (sortBy === 'codigo') {
          const ca = String(a.codigo || a.id || '')
          const cb = String(b.codigo || b.id || '')
          return ca.localeCompare(cb)
        }
        // 'reciente' por defecto
        const fa = a.fechaInicio || a.fechaCreacion || ''
        const fb = b.fechaInicio || b.fechaCreacion || ''
        return fb.localeCompare(fa)
      })
    }, [reservasSucursal, pendientesEfectivo, cobradasHoy, filterTab, selectedBranch, selectedMonth, selectedYear, dateRange, search, sortBy])
  
    // Configuración de exportación unificada (Excel, PDF, Imprimir)
    const exportHeaders = [
      'ID',
      t('hc2.codigo_reserva', 'CÓDIGO RESERVA'),
      'CLIENTE',
      t('hc2.telefono_57', 'TELÉFONO'),
      t('hc2.medio_de_pago', 'MEDIO DE PAGO'),
      t('hc2.monto_total', 'MONTO TOTAL'),
      t('hc2.estado_pago', 'ESTADO PAGO'),
    ]
  
    const exportRows = useMemo(() => {
      return listFiltrada.map((r, index) => {
        const rawMetodo = String(r.metodoPago || r.reservaDetalles?.metodoPago || r.pasarela || r.metodoPagoConfirmado || 'Wompi').toLowerCase()
        const esEfectivo = rawMetodo.includes('efectivo') || rawMetodo.includes('sucursal') || String(r.estado).toLowerCase().includes('efectivo')
        const esPagadaEnEfectivo = esEfectivo && esCobradoEnSucursal(r)
        const esPagadaDigital = !esEfectivo && (r.pagoEstado === 'aprobado' || r.estadoPago === 'aprobado' || r.estado === 'confirmada' || r.estado === 'en_curso' || r.estado === 'finalizada')
        const pagoConfirmado = esPagadaEnEfectivo || esPagadaDigital
  
        let tel = String(r.clienteTelefono || t('hc2.sin_telefono', 'Sin teléfono')).trim()
        if (tel !== 'Sin teléfono' && !tel.startsWith('+')) {
          tel = `+57 ${tel}`
        }
  
        let medioDisplay = esEfectivo ? t('admin.cash.paymentMethodBranch', 'Pago en Sucursal') : 'Wompi (Tarjeta)'
        if (!esEfectivo) {
          if (rawMetodo.includes('nequi')) medioDisplay = 'Wompi (Nequi)'
          else if (rawMetodo.includes('pse')) medioDisplay = 'Wompi (PSE)'
          else if (rawMetodo.includes('daviplata')) medioDisplay = 'Wompi (DaviPlata)'
          else if (rawMetodo.includes('bancolombia')) medioDisplay = 'Wompi (Bancolombia)'
          else if (rawMetodo !== 'wompi' && rawMetodo !== 'wompi (digital)') {
            medioDisplay = `Wompi (${rawMetodo.charAt(0).toUpperCase() + rawMetodo.slice(1)})`
          }
        }
  
        return [
          index + 1,
          r.codigo || r.referencia || r.id || 'N/A',
          r.clienteNombre || t('hc2.sin_nombre', 'Sin Nombre'),
          tel,
          medioDisplay,
          formatCurrency(Number(r.totalCOP || r.total || 0), moneda || 'COP', tasaUSD),
          pagoConfirmado ? t('admin.cash.statusPaid', 'Cobrado / Aprobado') : t('admin.cash.statusPending', 'Pendiente de Cobro'),
        ]
      })
    }, [listFiltrada, esCobradoEnSucursal, t, moneda, tasaUSD])
  
    const exportData = useMemo(() => ({
      title: t('admin.cash.exportTitle', 'Control de Caja y Cobro en Mostrador — Drivique'),
      headers: exportHeaders,
      rows: exportRows,
      items: listFiltrada,
      filename: `cobros-caja-drivique-${new Date().toISOString().slice(0, 10)}`,
    }), [exportHeaders, exportRows, listFiltrada, t])
  
    // Detectar ?ref=... en la URL
    useEffect(() => {
      const params = new URLSearchParams(window.location.search)
      const refParam = params.get('ref') || params.get('codigo')
      if (refParam) {
        const q = refParam.toLowerCase()
        const encontrada = reservasSucursal.find((r) => {
          const cod = String(r.codigo || r.id || r.referencia || '').toLowerCase()
          return cod === q || cod.includes(q)
        })
        if (encontrada) {
          setModalReserva(encontrada)
        }
      }
    }, [reservasSucursal])
  
    // Abrir Modal de Cobro / Detalle
    const openModalCobro = (reserva) => {
      setModalReserva(reserva)
      setObservacionesCaja(reserva.observacionesCaja || '')
    }
  
    // Confirmar pago en efectivo
    const handleConfirmarCobro = async () => {
      if (!modalReserva) return
  
      const ref = modalReserva.codigo || modalReserva.id
  
      setProcesandoPago(true)
      try {
        await reservationManagementService.confirmCashPayment(ref)
        await cargarReservas()
  
        setModalReserva((prev) => ({
          ...prev,
          estado: 'confirmada',
          fechaPagoConfirmado: new Date().toISOString(),
          cajeroConfirmacion: user?.nombre || user?.correo || t('hc2.encargado_de_sucursal', 'Encargado de Sucursal'),
          observacionesCaja,
        }))
  
        // El modal cambia automáticamente al estado de recibo al actualizarse el estado
      } catch (err) {
        console.error(err)
        showAlert({
          icon: 'error',
          title: t('hc.error_al_registrar_cobro', 'Error al registrar cobro'),
          text: err?.message || t('hc2.no_se_pudo_actualizar_el_estado_de_la_', 'No se pudo actualizar el estado de la reserva. Intenta nuevamente.'),
          confirmButtonText: t('hc4.cerrar', 'Cerrar'),
        })
      } finally {
        setProcesandoPago(false)
      }
    }
  
    const handleSearchRef = () => {
      if (!searchRefValue.trim()) {
        showAlert(t('hc.atencion', 'Atención'), t('hc2.debes_ingresar_una_referencia', 'Debes ingresar una referencia.'), 'warning')
        return
      }
      
      const ref = searchRefValue.trim()
      setSearch(ref)
    }
  
    const formatFecha = (val) => {
      if (!val) return format(new Date(), 'dd/MM/yyyy - HH:mm')
      try {
        const d = new Date(val)
        if (isNaN(d.getTime())) return format(new Date(), 'dd/MM/yyyy - HH:mm')
        return format(d, 'dd/MM/yyyy - HH:mm')
      } catch {
        return format(new Date(), 'dd/MM/yyyy - HH:mm')
      }
    }

  return { t, tema, moneda, tasaUSD, user, isBranchManager, setSearch, filterTab, setFilterTab, comprobanteDigital, setComprobanteDigital, dateFrom, setDateFrom, dateTo, setDateTo, selectedBranch, setSelectedBranch, listaSucursales, modalReserva, setModalReserva, observacionesCaja, setObservacionesCaja, procesandoPago, searchRefValue, setSearchRefValue, esCobradoEnSucursal, pendientesEfectivo, cobradasHoy, totalRecaudadoHoy, listFiltrada, exportData, openModalCobro, handleConfirmarCobro, handleSearchRef, formatFecha }
}
