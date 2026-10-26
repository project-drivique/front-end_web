import { useAuthStore } from '../../../store/authStore'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { eachDayOfInterval, format, parseISO } from 'date-fns'
import { catalogService } from '../../../services/catalogService'
import { reservationsService } from '../../../services/reservationsService'
import { SUCURSALES } from '../constants'

const norm = (str) =>
  String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

export function matchesCategoria(vehicleCategory, filterCategory) {
  if (!filterCategory || filterCategory === 'Todos' || filterCategory === 'Todas') return true
  const v = norm(vehicleCategory)
  const f = norm(filterCategory)
  if (!v) return false
  if (v === f) return true
  if (f === 'sedan' && (v === 'sedan' || v === 'berlina')) return true
  if (f === 'suv' && (v === 'suv' || v === 'camioneta' || v === 'crossover' || v === '4x4')) return true
  if (f === 'economico' && (v === 'economico' || v === 'hatchback' || v === 'compacto' || v === 'urbano')) return true
  if (f === 'deportivo' && (v === 'deportivo' || v === 'lujo' || v === 'sport' || v === 'premium' || v === 'coupe')) return true
  return v.includes(f) || f.includes(v)
}

export function matchesCombustible(vehicleFuel, vehicleFuelCode, filterFuel) {
  if (!filterFuel || filterFuel === 'Todos' || filterFuel === 'Todas') return true
  const v = norm(vehicleFuel)
  const c = norm(vehicleFuelCode)
  const f = norm(filterFuel)
  if (!v && !c) return false
  if (v === f || c === f) return true
  if (f === 'gasolina' && (v === 'gasolina' || c === 'gasoline')) return true
  if (f === 'diesel' && (v === 'diesel' || c === 'diesel')) return true
  if (f === 'hibrido' && (v === 'hibrido' || c === 'hybrid')) return true
  if (f === 'electrico' && (v === 'electrico' || c === 'electric')) return true
  return v.includes(f) || f.includes(v)
}

export function matchesTransmision(vehicleTransmission, vehicleTransCode, filterTransmission) {
  if (!filterTransmission || filterTransmission === 'Todos' || filterTransmission === 'Todas') return true
  const v = norm(vehicleTransmission)
  const c = norm(vehicleTransCode)
  const f = norm(filterTransmission)
  if (!v && !c) return false
  if (v === f || c === f) return true
  if (f === 'automatica' && (v === 'automatica' || c === 'automatic')) return true
  if (f === 'manual' && (v === 'manual' || c === 'manual')) return true
  return v.includes(f) || f.includes(v)
}

const FILTROS_BASE = {
  ciudad: 'Todas',
  categoria: 'Todos',
  precioMin: '',
  precioMax: '',
  transmision: 'Todas',
  combustible: 'Todos',
  sucursal: 'Todas',
  orden: 'precio_asc',
}

export function useCatalogo({ esFavorito = () => false } = {}) {
  const { t } = useTranslation()
  const [vehiculos, setVehiculos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [reservas, setReservas] = useState([])

  const [filtros, setFiltros] = useState(FILTROS_BASE)
  const [busquedaForm, setBusquedaForm] = useState({
    ciudad: '',
    sucursal: '',
    fechaInicio: '',
    fechaFin: '',
  })
  const [busquedaAplicada, setBusquedaAplicada] = useState({
    ciudad: '',
    sucursal: '',
    fechaInicio: '',
    fechaFin: '',
  })
  const [busquedaRealizada, setBusquedaRealizada] = useState(false)
  const [errorBusqueda, setErrorBusqueda] = useState('')
  const [textoLibre, setTextoLibreState] = useState('')
  const [pagina, setPagina] = useState(1)
  const [soloFavoritos, setSoloFavoritos] = useState(() => {
    return sessionStorage.getItem('Drivique_soloFavoritos') === 'true'
  })

  useEffect(() => {
    sessionStorage.setItem('Drivique_soloFavoritos', soloFavoritos)
  }, [soloFavoritos])

  const cargarVehiculos = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const data = await catalogService.getVehiculos()
      const lista = Array.isArray(data) ? data : (data?.vehiculos ?? [])
      setVehiculos(lista)
    } catch {
      setError(t('catalogo.error'))
      setVehiculos([])
    } finally {
      setCargando(false)
    }
  }, [t])

  useEffect(() => {
     
    cargarVehiculos()
  }, [cargarVehiculos])

  // Las reservas propias solo existen con sesión: un invitado no debe pedirlas (daba 401 en cada visita al catálogo)
  const hayToken = useAuthStore((state) => Boolean(state.token))
  useEffect(() => {
    if (!hayToken) {
      setReservas([])
      return
    }
    reservationsService.getReservas()
      .then(setReservas)
      .catch(() => setReservas([]))
  }, [hayToken])

  const diasOcupadosPorVehiculo = useMemo(() => {
    const mapa = new Map()
    reservas.forEach(r => {
      if (!r.fechaInicio || !r.fechaFin) return
      const dias = eachDayOfInterval({ start: parseISO(r.fechaInicio), end: parseISO(r.fechaFin) })
      const set = mapa.get(r.vehiculoId) ?? new Set()
      dias.forEach(dia => set.add(format(dia, 'yyyy-MM-dd')))
      mapa.set(r.vehiculoId, set)
    })
    return mapa
  }, [reservas])

  const estaDisponibleEnRango = useCallback((vehiculoId, fechaInicio, fechaFin) => {
    const ocupados = diasOcupadosPorVehiculo.get(Number(vehiculoId))
    if (!ocupados || ocupados.size === 0) return true
    return !eachDayOfInterval({ start: parseISO(String(fechaInicio).slice(0, 10)), end: parseISO(String(fechaFin).slice(0, 10)) })
      .some(dia => ocupados.has(format(dia, 'yyyy-MM-dd')))
  }, [diasOcupadosPorVehiculo])

  const setFiltro = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }))
    setPagina(1)
  }

  const setForm = (campo, valor) => {
    setBusquedaForm(prev => ({ ...prev, [campo]: valor }))
    setErrorBusqueda('')
  }

  const setTextoLibre = (valor) => {
    setTextoLibreState(valor)
    setPagina(1)
  }

  const handleBuscar = () => {
    if (!busquedaForm.ciudad) {
      return setErrorBusqueda(t('catalogo.selectCityMsg', 'Por favor selecciona la ciudad y sucursal donde deseas consultar los vehículos disponibles.'))
    }
    if (!busquedaForm.sucursal) {
      return setErrorBusqueda(t('catalogo.selectBranchMsg', 'Por favor selecciona la sucursal de entrega para continuar con tu consulta de disponibilidad.'))
    }
    if (!busquedaForm.fechaInicio || !busquedaForm.fechaFin) {
      return setErrorBusqueda(t('catalogo.selectDatesMsg', 'Por favor indica la fecha de recogida y la fecha de devolución para comprobar la flota disponible.'))
    }
    if (busquedaForm.fechaFin <= busquedaForm.fechaInicio) {
      return setErrorBusqueda(t('catalogo.selectDateRangeMsg', 'La fecha de devolución debe ser posterior a la fecha de recogida. Revisa tu itinerario.'))
    }

    setBusquedaAplicada({ ...busquedaForm })
    setBusquedaRealizada(true)
    setErrorBusqueda('')
    setPagina(1)
  }

  const limpiar = () => {
    setFiltros(FILTROS_BASE)
    setBusquedaForm({
      ciudad: '',
      sucursal: '',
      fechaInicio: '',
      fechaFin: '',
    })
    setBusquedaAplicada({
      ciudad: '',
      sucursal: '',
      fechaInicio: '',
      fechaFin: '',
    })
    setBusquedaRealizada(false)
    setErrorBusqueda('')
    setTextoLibreState('')
    setPagina(1)
    setSoloFavoritos(false)
  }

  const reintentar = () => cargarVehiculos()

  const dias = useMemo(() => {
    if (!busquedaAplicada.fechaInicio || !busquedaAplicada.fechaFin) return 0
    const fInicio = busquedaAplicada.fechaInicio.split('T')[0]
    const fFin = busquedaAplicada.fechaFin.split('T')[0]
    if (fInicio === fFin) return 1
    const a = new Date(`${fInicio}T00:00:00`)
    const b = new Date(`${fFin}T00:00:00`)
    return Math.max(1, Math.round((b - a) / 86400000) + 1)
  }, [busquedaAplicada])

  // Se calculan juntos porque las tres banderas de "sin resultados" dependen de
  // pasos intermedios del mismo pipeline de filtrado que no queremos duplicar
  // ni recalcular por fuera.
  const { resultado, sinCoincidenciasTexto, sinDisponibilidadFechas, sinCoincidenciasFiltros } = useMemo(() => {
    let arr = [...vehiculos]

    if (filtros.ciudad !== 'Todas') {
      arr = arr.filter(v => {
        const suc = SUCURSALES.find(s => s.nombre === v.sucursal)
        return suc && suc.ciudad === filtros.ciudad
      })
    }

    if (filtros.categoria !== 'Todos') {
      arr = arr.filter(v => matchesCategoria(v.categoria, filtros.categoria))
    }
    if (filtros.transmision !== 'Todas') {
      arr = arr.filter(v => matchesTransmision(v.transmision, v.transmissionCode || v.transmisionCode, filtros.transmision))
    }
    if (filtros.combustible !== 'Todos') {
      arr = arr.filter(v => matchesCombustible(v.combustible, v.fuelTypeCode || v.combustibleCode, filtros.combustible))
    }

    if (filtros.sucursal !== 'Todas') {
      arr = arr.filter(v => v.sucursal === filtros.sucursal)
    }

    const min = filtros.precioMin ? Number(filtros.precioMin) : null
    const max = filtros.precioMax ? Number(filtros.precioMax) : null
    if (min !== null) arr = arr.filter(v => Number(v.precio) >= min)
    if (max !== null) arr = arr.filter(v => Number(v.precio) <= max)

    const hayFiltroSidebarActivo =
      filtros.ciudad !== 'Todas' ||
      filtros.categoria !== 'Todos' ||
      filtros.transmision !== 'Todas' ||
      filtros.combustible !== 'Todos' ||
      filtros.sucursal !== 'Todas' ||
      min !== null ||
      max !== null

    const sinFiltros = hayFiltroSidebarActivo && arr.length === 0 && vehiculos.length > 0

    // Guardamos el arreglo ANTES de aplicar el filtro de texto libre. Si el texto
    // no matchea nada, volvemos a este arreglo para no vaciar el grid de tarjetas.
    const arrAntesDeTexto = arr

    const hayTextoLibre = textoLibre.trim() !== ''
    let arrConTexto = arr

    if (hayTextoLibre) {
      const q = textoLibre.trim().toLowerCase()
      arrConTexto = arr.filter(v => {
        const nombre = (v.nombre || '').toLowerCase()
        const anio = String(v.año ?? v.anio ?? '').toLowerCase()
        const categoria = (v.categoria || '').toLowerCase()
        const sucursal = (v.sucursal || '').toLowerCase()
        const color = (v.color || '').toLowerCase()
        return (
          nombre.includes(q) ||
          anio.includes(q) ||
          categoria.includes(q) ||
          sucursal.includes(q) ||
          color.includes(q)
        )
      })
    }

    const sinMatch = hayTextoLibre && arrConTexto.length === 0

    // Si no hubo coincidencias con el texto, NO filtramos por texto: seguimos
    // mostrando arrAntesDeTexto (con el resto de filtros aplicados) y dejamos
    // que la UI avise con el modal de "sin resultados".
    arr = sinMatch ? arrAntesDeTexto : arrConTexto

    const arrAntesDeSucursal = arr

    if (busquedaRealizada && busquedaAplicada.sucursal) {
      arr = arr.filter(v => v.sucursal === busquedaAplicada.sucursal)
    }

    const sinVehiculosEnSucursal = busquedaRealizada && Boolean(busquedaAplicada.sucursal) && arr.length === 0

    if (sinVehiculosEnSucursal) {
      arr = arrAntesDeSucursal // Revertir para no vaciar la grilla
    }

    const hayRangoBuscado = busquedaRealizada && busquedaAplicada.fechaInicio && busquedaAplicada.fechaFin
    arr = arr.map(v => ({
      ...v,
      disponibleEnFechas: hayRangoBuscado
        ? estaDisponibleEnRango(v.id, busquedaAplicada.fechaInicio, busquedaAplicada.fechaFin)
        : true,
    }))

    // Hay vehículos en la sucursal buscada, pero TODOS quedaron ocupados en el
    // rango de fechas elegido. O bien, no hay NINGÚN vehículo en esa sucursal.
    // Seguimos mostrando las tarjetas (grises o el catálogo completo) y avisamos con el modal.
    const todosOcupados = hayRangoBuscado && Boolean(busquedaAplicada.sucursal) && arr.length > 0 && arr.every(v => !v.disponibleEnFechas)
    
    const sinDisponibilidad = sinVehiculosEnSucursal || todosOcupados

    if (filtros.orden === 'precio_asc') arr.sort((a, b) => Number(a.precio) - Number(b.precio))
    if (filtros.orden === 'precio_desc') arr.sort((a, b) => Number(b.precio) - Number(a.precio))
    if (filtros.orden === 'calificacion') arr.sort((a, b) => Number(b.calificacion ?? 0) - Number(a.calificacion ?? 0))

    if (soloFavoritos) arr = arr.filter(v => esFavorito(v.id))

    return {
      resultado: arr,
      sinCoincidenciasTexto: sinMatch,
      sinDisponibilidadFechas: sinDisponibilidad,
      sinCoincidenciasFiltros: sinFiltros,
    }
  }, [vehiculos, filtros, soloFavoritos, esFavorito, busquedaRealizada, busquedaAplicada, estaDisponibleEnRango, textoLibre])

   const POR_PAGINA = 8
const totalPaginas = Math.max(1, Math.ceil(resultado.length / POR_PAGINA))
const vehiculosPagina = useMemo(() => {
  const inicio = (pagina - 1) * POR_PAGINA
  return resultado.slice(inicio, inicio + POR_PAGINA)
}, [resultado, pagina])

  return {
    vehiculos,
    cargando,
    error,
    filtros,
    setFiltro,
    busquedaForm,
    setForm,
    busquedaAplicada,
    busquedaRealizada,
    textoLibre,
    setTextoLibre,
    dias,
    resultado,
    sinCoincidenciasTexto,
    sinDisponibilidadFechas,
    sinCoincidenciasFiltros,
    totalPaginas,
    vehiculosPagina,
    pagina,
    setPagina,
    errorBusqueda,
    handleBuscar,
    limpiar,
    reintentar,
    soloFavoritos,
    setSoloFavoritos
  }
}
