import { useEffect, useMemo, useState, useCallback } from 'react'
import { catalogoService } from '../../../services/catalogoService'

const FILTROS_BASE = {
  categoria: 'Todos',
  precioMin: '',
  precioMax: '',
  transmision: 'Todas',
  combustible: 'Todos',
  sucursal: 'Todas',
  orden: 'precio_asc',
}

export function useCatalogo({ esFavorito = () => false } = {}) {
  const [vehiculos, setVehiculos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  const [filtros, setFiltros] = useState(FILTROS_BASE)
  const [busquedaForm, setBusquedaForm] = useState({
    lugarRecogida: '',
    lugarDevolucion: '',
    fechaInicio: '',
    fechaFin: '',
    mismoLugar: true,
  })
  const [busquedaAplicada, setBusquedaAplicada] = useState({
    lugarRecogida: '',
    lugarDevolucion: '',
    fechaInicio: '',
    fechaFin: '',
    mismoLugar: true,
  })
  const [busquedaRealizada, setBusquedaRealizada] = useState(false)
  const [errorBusqueda, setErrorBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [soloFavoritos, setSoloFavoritos] = useState(false)

  const cargarVehiculos = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const data = await catalogoService.getVehiculos()
      const lista = Array.isArray(data) ? data : (data?.vehiculos ?? [])
      setVehiculos(lista)
    } catch {
      setError('No se pudo cargar el catálogo.')
      setVehiculos([])
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarVehiculos()
  }, [cargarVehiculos])

  const setFiltro = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }))
    setPagina(1)
  }

  const setForm = (campo, valor) => {
    setBusquedaForm(prev => ({ ...prev, [campo]: valor }))
    setErrorBusqueda('')
  }

  const handleBuscar = () => {
    if (!busquedaForm.lugarRecogida) return setErrorBusqueda('Selecciona lugar de recogida.')
    if (!busquedaForm.fechaInicio) return setErrorBusqueda('Selecciona fecha de recogida.')
    if (!busquedaForm.fechaFin) return setErrorBusqueda('Selecciona fecha de devolución.')
    if (busquedaForm.fechaFin <= busquedaForm.fechaInicio) {
      return setErrorBusqueda('La fecha de devolución debe ser posterior.')
    }

    setBusquedaAplicada({ ...busquedaForm })
    setBusquedaRealizada(true)
    setErrorBusqueda('')
    setPagina(1)
  }

  const limpiar = () => {
    setFiltros(FILTROS_BASE)
    setBusquedaForm({
      lugarRecogida: '',
      lugarDevolucion: '',
      fechaInicio: '',
      fechaFin: '',
      mismoLugar: true,
    })
    setBusquedaAplicada({
      lugarRecogida: '',
      lugarDevolucion: '',
      fechaInicio: '',
      fechaFin: '',
      mismoLugar: true,
    })
    setBusquedaRealizada(false)
    setErrorBusqueda('')
    setPagina(1)
    setSoloFavoritos(false)
  }

  const reintentar = () => cargarVehiculos()

  const dias = useMemo(() => {
    if (!busquedaAplicada.fechaInicio || !busquedaAplicada.fechaFin) return 0
    const a = new Date(busquedaAplicada.fechaInicio)
    const b = new Date(busquedaAplicada.fechaFin)
    return Math.max(0, Math.ceil((b - a) / 86400000))
  }, [busquedaAplicada])

  const resultado = useMemo(() => {
    let arr = [...vehiculos]

    if (filtros.categoria !== 'Todos') arr = arr.filter(v => v.categoria === filtros.categoria)
    if (filtros.transmision !== 'Todas') arr = arr.filter(v => v.transmision === filtros.transmision)
    if (filtros.combustible !== 'Todos') arr = arr.filter(v => v.combustible === filtros.combustible)
    if (filtros.sucursal !== 'Todas') arr = arr.filter(v => v.sucursal === filtros.sucursal)

    const min = filtros.precioMin ? Number(filtros.precioMin) : null
    const max = filtros.precioMax ? Number(filtros.precioMax) : null
    if (min !== null) arr = arr.filter(v => Number(v.precio) >= min)
    if (max !== null) arr = arr.filter(v => Number(v.precio) <= max)

    if (filtros.orden === 'precio_asc') arr.sort((a, b) => Number(a.precio) - Number(b.precio))
    if (filtros.orden === 'precio_desc') arr.sort((a, b) => Number(b.precio) - Number(a.precio))
    if (filtros.orden === 'calificacion') arr.sort((a, b) => Number(b.calificacion ?? 0) - Number(a.calificacion ?? 0))

    if (soloFavoritos) arr = arr.filter(v => esFavorito(v.id))

    return arr
  }, [vehiculos, filtros, soloFavoritos, esFavorito])

  const totalPaginas = Math.max(1, Math.ceil(resultado.length / 6))
  const vehiculosPagina = useMemo(() => {
    const inicio = (pagina - 1) * 6
    return resultado.slice(inicio, inicio + 6)
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
    dias,
    resultado,
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