import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { showAlert } from '@/utils/swalConfig'
import { reservationService, HORAS_LIMITE_PAGO_EFECTIVO } from '@/services/reservationService'
import { documentsService } from '@/services/documentsService'
import { generarReferenciaUnica, aCentavos, construirUrlCheckout } from '@/services/wompiService'
import { RECARGOS_LOGISTICOS, SUCURSALES, CIUDADES } from '../../catalog/constants'
import VEHICULOS_MOCK from '@/mocks/vehicles.json'

export const TOTAL_PASOS = 3

export const HORAS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, '0')
  return [`${h}:00`, `${h}:30`]
}).flat()

export function useReservationFlow() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario, actualizarUsuario } = useAuthStore()

  const vehiculo = VEHICULOS_MOCK.find(v => v.id === Number(id))

  const [pantalla, setPantalla] = useState(1)
  const [seguroIdx, setSeguroIdx] = useState(null)
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([])
  const [reserva, setReserva] = useState({
    fechaInicio: '', fechaFin: '',
    horaInicio: '', horaFin: '',
    sucursalRetiro: '',
    sucursalDevolucion: '',
    tipoKm: '',
    metodoPago: '',
    domicilioCiudad: '',
    domicilioBarrio: '',
    domicilioDireccion: '',
    domicilioReferencias: '',
  })

  const carBranch = vehiculo?.sucursal
  const branchObj = SUCURSALES.find(s => s.nombre === carBranch)
  const cityObj = branchObj ? CIUDADES.find(c => c.nombre === branchObj.ciudad) : null

  const opcionesEntrega = vehiculo ? [
    { value: carBranch, label: t('vehiculo.pickupAtBranch', { sucursal: carBranch }) }
  ] : []
  if (vehiculo && reserva?.metodoPago !== 'efectivo') {
    opcionesEntrega.push({ value: 'domicilio', label: t('vehiculo.deliveryHome') })
    if (cityObj?.tieneAeropuerto) opcionesEntrega.push({ value: 'aeropuerto', label: t('vehiculo.deliveryAirport') })
    if (cityObj?.tieneTerminal) opcionesEntrega.push({ value: 'terminal', label: t('vehiculo.deliveryTerminal') })
  }

  const opcionesDevolucion = vehiculo ? [
    { value: carBranch, label: t('vehiculo.returnAtBranch', { sucursal: carBranch }) }
  ] : []
  if (vehiculo && reserva?.metodoPago !== 'efectivo') {
    opcionesDevolucion.push({ value: 'domicilio', label: t('vehiculo.returnHome') })
    if (cityObj?.tieneAeropuerto) opcionesDevolucion.push({ value: 'aeropuerto', label: t('vehiculo.returnAirport') })
    if (cityObj?.tieneTerminal) opcionesDevolucion.push({ value: 'terminal', label: t('vehiculo.returnTerminal') })
  }

  // Modal edición state
  const [modalEditarOpen, setModalEditarOpen] = useState(false)
  const [modalEditarSeccion, setModalEditarSeccion] = useState(null)
  const [localReserva, setLocalReserva] = useState({})
  const [localSeguroIdx, setLocalSeguroIdx] = useState(null)
  const [localServiciosSeleccionados, setLocalServiciosSeleccionados] = useState([])
  const [modalError, setModalError] = useState('')
  const [modalDetallesOpen, setModalDetallesOpen] = useState(false)
  const [resumenMovilAbierto, setResumenMovilAbierto] = useState(false)
  const resumenMovilRef = useRef(null)
  const prellenado = useRef(false)

  const abrirModalEditar = (seccion) => {
    setLocalReserva({ ...reserva })
    setLocalSeguroIdx(seguroIdx)
    setLocalServiciosSeleccionados([...serviciosSeleccionados])
    setModalError('')
    setModalEditarSeccion(seccion)
    setModalEditarOpen(true)
  }

  const cambiarReserva = (campo, valor) => {
    setReserva(prev => {
      const act = { ...prev, [campo]: valor }
      if (campo === 'metodoPago' && valor === 'efectivo') {
        act.domicilioCiudad = ''
        act.domicilioBarrio = ''
        act.domicilioDireccion = ''
        act.domicilioReferencias = ''
        if (act.sucursalRetiro === 'domicilio') act.sucursalRetiro = ''
        if (act.sucursalDevolucion === 'domicilio') act.sucursalDevolucion = ''
      }
      if (act.sucursalRetiro === 'domicilio') {
        const b = SUCURSALES.find(s => s.nombre === vehiculo?.sucursal)
        act.domicilioCiudad = b?.ciudad || ''
      }
      return act
    })
    setErrorPaso1('')

    if (campo === 'metodoPago' && valor === 'efectivo' && vehiculo) {
      const sucursal = SUCURSALES.find(s => s.nombre === vehiculo.sucursal)
      if (sucursal) {
        showAlert({
          icon: 'info',
          title: t('vehiculo.cashBranchTitle'),
          html: `<div style="text-align:left;font-size:14px;line-height:1.6;">
            <p style="margin:0 0 10px;">${t('vehiculo.cashBranchIntro')}</p>
            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:14px 16px;">
              <p style="margin:0 0 4px;font-weight:800;color:#1e3a8a;">${sucursal.nombre}</p>
              <p style="margin:0 0 4px;color:#334155;"><strong>${t('vehiculo.cashBranchCity')}:</strong> ${sucursal.ciudad}</p>
              <p style="margin:0;color:#334155;"><strong>${t('vehiculo.cashBranchAddress')}:</strong> ${sucursal.direccion || t('vehiculo.cashBranchNoAddress')}</p>
            </div>
          </div>`,
          confirmButtonText: t('common.close'),
          width: 480,
        })
      }
    }
  }

  const toggleServicio = (nombre) => setServiciosSeleccionados(prev =>
    prev.includes(nombre) ? prev.filter(n => n !== nombre) : [...prev, nombre]
  )

  const [errorPaso1, setErrorPaso1] = useState('')
  const [datosForm, setDatosForm] = useState({
    nombre: '', correo: '', celular: '',
    nacionalidad: 'Colombia', tipoDoc: 'CC', numDoc: '',
    vuelo: false, numVuelo: '', terminos: false,
    cedulaPdf: null, licenciaPdf: null,
  })
  const [errores, setErrores] = useState({})
  const [exito, setExito] = useState(false)
  const [reservaCreada, setReservaCreada] = useState(null)
  const [contratoFirmado, setContratoFirmado] = useState(false)
  const [datosPago, setDatosPago] = useState(null)
  const [redirigiendoPago, setRedirigiendoPago] = useState(false)
  const [errorPago, setErrorPago] = useState('')
  const [hoverWompi, setHoverWompi] = useState(false)
  const [hoverEfectivo, setHoverEfectivo] = useState(false)
  const [fechaLimitePago, setFechaLimitePago] = useState(null)

  const idUsuarioDocs = usuario?.id || usuario?.correo || null
  const docsVerificados = documentsService.tieneDocumentos(idUsuarioDocs)

  useEffect(() => {
    if (!usuario || prellenado.current) return
    prellenado.current = true
    const tel = (usuario.telefono || '').replace(/\D/g, '')
    const celular = tel.startsWith('57') && tel.length > 10 ? tel.slice(2) : tel
    const nombreCompleto = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ')
    setDatosForm(prev => ({
      ...prev,
      nombre: nombreCompleto || prev.nombre,
      correo: usuario.correo || prev.correo,
      celular: celular || prev.celular,
      numDoc: usuario.cedula || prev.numDoc,
      nacionalidad: usuario.nacionalidad || prev.nacionalidad || 'Colombia',
      tipoDoc: usuario.tipoDocumento || prev.tipoDoc || 'CC',
    }))
  }, [usuario])

  const irSiguiente = () => {
    if (pantalla === 1) {
      if (!reserva.metodoPago) { setErrorPaso1('Debes seleccionar un método de pago.'); return }
      if (!reserva.sucursalRetiro || !reserva.sucursalDevolucion) { setErrorPaso1(t('vehiculo.selectLocation')); return }
      if (!reserva.fechaInicio || !reserva.fechaFin) { setErrorPaso1(t('vehiculo.errors.datesRequired')); return }
      if (!reserva.horaInicio || !reserva.horaFin) { setErrorPaso1('Debes seleccionar la hora de recogida y devolución.'); return }
      if (reserva.sucursalRetiro === 'domicilio') {
        if (!reserva.domicilioBarrio?.trim() || !reserva.domicilioDireccion?.trim() || !reserva.domicilioReferencias?.trim()) {
          setErrorPaso1(t('vehiculo.errors.domicilioRequired')); return
        }
      }
    } else if (pantalla === 2) {
      if (seguroIdx === null) { setErrorPaso1('Debes seleccionar un plan de protección.'); return }
      if (!reserva.tipoKm) { setErrorPaso1('Debes seleccionar el tipo de kilometraje.'); return }
    }
    setErrorPaso1('')
    setPantalla(p => Math.min(TOTAL_PASOS, p + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const irAtras = () => {
    if (pantalla === 1) { navigate(usuario ? '/home' : '/catalogo'); return }
    setPantalla(p => p - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleReservar = () => {
    if (!usuario) {
      showAlert({
        icon: 'info',
        title: t('catalogo.guestMode'),
        text: t('catalogo.guestModeText'),
        confirmButtonText: t('catalogo.goToRegister'),
        showCancelButton: true,
        cancelButtonText: t('common.cancel'),
      }).then((result) => { if (result.isConfirmed) navigate('/registro') })
      return
    }

    const e = {}
    if (!datosForm.nombre.trim()) e.nombre = t('vehiculo.errors.nameRequired')
    if (!datosForm.correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosForm.correo)) e.correo = t('vehiculo.errors.emailInvalid')
    if (!datosForm.celular.trim() || datosForm.celular.length < 10) e.celular = t('vehiculo.errors.phoneInvalid')
    if (!datosForm.numDoc.trim()) e.numDoc = t('vehiculo.errors.docRequired')
    if (!docsVerificados && !datosForm.cedulaPdf) e.cedulaPdf = t('vehiculo.errors.cedulaPdfRequired', 'Debes subir tu cédula en formato PDF.')
    if (!docsVerificados && !datosForm.licenciaPdf) e.licenciaPdf = t('vehiculo.errors.licenciaPdfRequired', 'Debes subir tu licencia de conducción en formato PDF.')
    if (!datosForm.terminos) e.terminos = t('vehiculo.errors.termsRequired')
    setErrores(e)
    if (Object.keys(e).length > 0) return

    const tarifas = vehiculo.tarifas || {}
    const precioKm = reserva.tipoKm === 'ilimitado'
      ? (tarifas.kmIlimitado?.precio || 0)
      : (reserva.tipoKm === 'limitado' ? (tarifas.kmLimitado?.precio || 0) : 0)
    const dias = (reserva.fechaInicio && reserva.fechaFin)
      ? Math.max(1, Math.ceil((new Date(reserva.fechaFin) - new Date(reserva.fechaInicio)) / 86400000))
      : 1
    const precioSeguro = seguroIdx !== null ? (vehiculo.seguros[seguroIdx]?.precio ?? 0) : 0
    const serviciosElegidos = (vehiculo.servicios || []).filter(s => serviciosSeleccionados.includes(s.nombre))
    const precioServicios = serviciosElegidos.reduce((suma, s) => suma + s.precio, 0)
    const subtotal = (precioKm + precioSeguro + precioServicios) * dias
    const cargosAdmin = Math.round(subtotal * 0.10)
    const recargoRetiro = RECARGOS_LOGISTICOS[reserva.sucursalRetiro] || 0
    const recargoDevolucion = RECARGOS_LOGISTICOS[reserva.sucursalDevolucion] || 0
    const recargoLogistico = recargoRetiro + recargoDevolucion
    const subtotalPreIva = subtotal + cargosAdmin + recargoLogistico
    const ivaCop = Math.round(subtotalPreIva * 0.19)
    const totalCop = subtotalPreIva + ivaCop

    const referencia = generarReferenciaUnica()

    if (usuario && actualizarUsuario) {
      const partesNombre = (datosForm.nombre || '').trim().split(' ')
      const primerNombre = partesNombre.length > 1 ? partesNombre.slice(0, -1).join(' ') : partesNombre[0] || ''
      const primerApellido = partesNombre.length > 1 ? partesNombre[partesNombre.length - 1] : ''
      actualizarUsuario({
        nombre: usuario.nombre || primerNombre || datosForm.nombre,
        apellido: usuario.apellido || primerApellido || '',
        cedula: usuario.cedula || datosForm.numDoc,
        telefono: usuario.telefono || datosForm.celular,
        nacionalidad: usuario.nacionalidad || datosForm.nacionalidad,
        tipoDocumento: usuario.tipoDocumento || datosForm.tipoDoc,
      })
    }

    if (idUsuarioDocs && (datosForm.cedulaPdf || datosForm.licenciaPdf || !docsVerificados)) {
      documentsService.guardarDocumentos(idUsuarioDocs, {
        cedulaPdf: datosForm.cedulaPdf,
        licenciaPdf: datosForm.licenciaPdf,
      })
    }

    const reservaGuardada = reservationService.guardarReserva({
      referencia,
      vehiculoId: vehiculo.id,
      vehiculoNombre: vehiculo.nombre,
      estado: 'PENDIENTE',
      fechaReserva: new Date().toISOString(),
      datosForm,
      reservaDetalles: reserva,
      total: totalCop,
      seguroIdx,
      serviciosSeleccionados,
    })

    if (reservaGuardada.fechaLimitePago) setFechaLimitePago(reservaGuardada.fechaLimitePago)
    sessionStorage.setItem('current_wompi_reference', referencia)
    setReservaCreada(reservaGuardada)
    setDatosPago({ referencia, amountInCents: aCentavos(totalCop) })

    if (reserva.metodoPago === 'efectivo') {
      setContratoFirmado(false)
    } else {
      setExito(true)
    }
  }

  const handleContratoFirmado = () => {
    setContratoFirmado(true)
    setExito(true)
  }

  const handlePagarConWompi = async () => {
    if (!datosPago) return
    setErrorPago('')
    setRedirigiendoPago(true)
    try {
      const url = await construirUrlCheckout({
        reference: datosPago.referencia,
        amountInCents: datosPago.amountInCents,
        redirectUrl: `${window.location.origin}/respuesta`,
      })
      window.location.href = url
    } catch (err) {
      console.error('[Wompi] Error:', err)
      setErrorPago('No se pudo iniciar el pago. Intenta de nuevo.')
      setRedirigiendoPago(false)
    }
  }

  const handlePagoEfectivo = () => {
    if (!datosPago) return
    console.log('[Pago en efectivo] Pendiente. Referencia:', datosPago.referencia)
  }

  // Totales para footer móvil
  const tarifasTotal = vehiculo?.tarifas || {}
  const precioTotal = reserva.tipoKm === 'ilimitado'
    ? (tarifasTotal.kmIlimitado?.precio || 0)
    : (reserva.tipoKm === 'limitado' ? (tarifasTotal.kmLimitado?.precio || 0) : 0)
  const diasTotal = reserva.fechaInicio && reserva.fechaFin
    ? Math.max(1, Math.ceil((new Date(reserva.fechaFin) - new Date(reserva.fechaInicio)) / 86400000))
    : 1
  const precioSeguroTotal = seguroIdx !== null ? (vehiculo?.seguros[seguroIdx]?.precio ?? 0) : 0
  const precioServiciosTotal = (vehiculo?.servicios || [])
    .filter(s => serviciosSeleccionados.includes(s.nombre))
    .reduce((suma, s) => suma + s.precio, 0)
  const subtotalD = precioTotal * diasTotal
  const subtotalS = precioSeguroTotal * diasTotal
  const subtotalSv = precioServiciosTotal * diasTotal
  const cargosAdminT = Math.round((subtotalD + subtotalS + subtotalSv) * 0.10)
  const recargoLogT = (RECARGOS_LOGISTICOS[reserva.sucursalRetiro] || 0) + (RECARGOS_LOGISTICOS[reserva.sucursalDevolucion] || 0)
  const subtotalPreIvaT = subtotalD + subtotalS + subtotalSv + cargosAdminT + recargoLogT
  const ivaT = Math.round(subtotalPreIvaT * 0.19)
  const totalReserva = subtotalPreIvaT + ivaT

  return {
    vehiculo, pantalla, setPantalla, reserva, cambiarReserva,
    seguroIdx, setSeguroIdx, serviciosSeleccionados, setServiciosSeleccionados, toggleServicio,
    modalEditarOpen, setModalEditarOpen, modalEditarSeccion, setModalEditarSeccion,
    localReserva, setLocalReserva, localSeguroIdx, setLocalSeguroIdx,
    localServiciosSeleccionados, setLocalServiciosSeleccionados,
    modalError, setModalError, abrirModalEditar,
    modalDetallesOpen, setModalDetallesOpen,
    resumenMovilAbierto, setResumenMovilAbierto, resumenMovilRef,
    errorPaso1, setErrorPaso1,
    datosForm, setDatosForm, errores, setErrores,
    exito, reservaCreada, contratoFirmado, datosPago,
    redirigiendoPago, errorPago, setErrorPago,
    hoverWompi, setHoverWompi, hoverEfectivo, setHoverEfectivo,
    fechaLimitePago, docsVerificados,
    cityObj, opcionesEntrega, opcionesDevolucion,
    irSiguiente, irAtras, handleReservar, handleContratoFirmado,
    handlePagarConWompi, handlePagoEfectivo,
    totalReserva, diasTotal, TOTAL_PASOS,
    usuario,
  }
}

