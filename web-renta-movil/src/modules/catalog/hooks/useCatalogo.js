import { useState, useCallback } from 'react'
import { catalogoService } from '../../../services/catalogoService'

const FILTROS_INICIALES = {
  categoria:   '',
  precioMin:   '',
  precioMax:   '',
  transmision: '',
  combustible: '',
  fechaInicio: '',
  fechaFin:    '',
  orden:       'precio_asc',
}

export function useCatalogo(filtrosExternos = FILTROS_INICIALES) {
  const [vehiculos, setVehiculos] = useState([])
  const [cargando,  setCargando]  = useState(false)
  const [error,     setError]     = useState(null)
  const [filtros,   setFiltros]   = useState(filtrosExternos)
  const [favoritos, setFavoritos] = useState([])

  const cargarVehiculos = useCallback(async (params) => {
    setCargando(true)
    setError(null)
    try {
      const data = await catalogoService.getVehiculos(params ?? filtros)
      setVehiculos(data.vehiculos ?? data)
    } catch {
      setError('No se pudo cargar el catálogo. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }, [filtros])

  const actualizarFiltro = (campo, valor) =>
    setFiltros(prev => ({ ...prev, [campo]: valor }))

  const limpiarFiltros = () => setFiltros(FILTROS_INICIALES)

  const handleFavorito = async (vehiculoId) => {
    try {
      await catalogoService.toggleFavorito(vehiculoId)
      setFavoritos(prev =>
        prev.includes(vehiculoId)
          ? prev.filter(id => id !== vehiculoId)
          : [...prev, vehiculoId]
      )
    } catch {
      // el componente maneja el mensaje al visitante
    }
  }

  return {
    vehiculos,
    cargando,
    error,
    filtros,
    favoritos,
    actualizarFiltro,
    limpiarFiltros,
    handleFavorito,
    cargarVehiculos,
  }
}