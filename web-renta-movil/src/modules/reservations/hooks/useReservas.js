import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'

// ── Lógica de reserva extraída de VehiculoDetallePage ──
export function useReservas(vehiculo) {
  const navigate    = useNavigate()
  const { usuario } = useAuthStore()

  const [pantalla,    setPantalla]   = useState(1)
  const [seguroIdx,   setSeguroIdx]  = useState(0)
  const [reserva,     setReserva]    = useState({
    fechaInicio:        '',
    fechaFin:           '',
    horaInicio:         '07:30',
    horaFin:            '07:30',
    sucursalRetiro:     vehiculo?.sucursal || '',
    sucursalDevolucion: '',
    tipoKm:             'limitado',
  })
  const [modalEditar, setModalEditar] = useState(null)
  const [datosForm,   setDatosForm]   = useState({
    nombre:       '',
    correo:       usuario?.correo || '',
    celular:      '',
    nacionalidad: 'Colombia',
    tipoDoc:      'CC',
    numDoc:       '',
    vuelo:        false,
    numVuelo:     '',
    terminos:     false,
  })
  const [errores, setErrores] = useState({})
  const [exito,   setExito]   = useState(false)

  const handleCambioDato = (campo, valor) =>
    setDatosForm(prev => ({ ...prev, [campo]: valor }))

  const handleGuardarReserva = (nuevoEstado) =>
    setReserva(nuevoEstado)

  const handleReservar = () => {
    const e = {}
    if (!datosForm.nombre.trim())
      e.nombre = 'El nombre es obligatorio'
    if (!datosForm.correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosForm.correo))
      e.correo = 'Correo inválido'
    if (!datosForm.celular.trim() || datosForm.celular.length < 10)
      e.celular = 'Número inválido (10 dígitos)'
    if (!datosForm.numDoc.trim())
      e.numDoc = 'El número de documento es obligatorio'
    if (!datosForm.terminos)
      e.terminos = 'Debes aceptar los términos y condiciones'

    setErrores(e)
    if (Object.keys(e).length > 0) return

    setExito(true)
    setTimeout(() => navigate('/catalogo'), 3500)
  }

  const irPantalla2 = () => {
    setPantalla(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const volverAtras = () => {
    if (pantalla === 1) navigate('/catalogo')
    else setPantalla(1)
  }

  return {
    pantalla,
    seguroIdx,
    reserva,
    modalEditar,
    datosForm,
    errores,
    exito,
    setSeguroIdx,
    setModalEditar,
    handleCambioDato,
    handleGuardarReserva,
    handleReservar,
    irPantalla2,
    volverAtras,
  }
}

// ── Historial de reservas (para ReservasPage) ──
export function useHistorialReservas() {
  const [reservas,  setReservas]  = useState([])
  const [cargando,  setCargando]  = useState(false)
  const [error,     setError]     = useState(null)

  const cargarReservas = async () => {
    setCargando(true)
    setError(null)
    try {
      // TODO: conectar con reservasService cuando esté el backend
      setReservas([])
    } catch {
      setError('No se pudieron cargar las reservas.')
    } finally {
      setCargando(false)
    }
  }

  return { reservas, cargando, error, cargarReservas }
}