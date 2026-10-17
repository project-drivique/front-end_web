import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { showAlert } from '@/utils/swalConfig'
import { reservationsService } from '@/services/reservationsService'
import { catalogService } from '@/services/catalogService'
import { userService } from '@/services/userService'
import { generarReferenciaUnica, aCentavos } from '@/services/wompiService'
import { paymentFactory, PaymentContext } from '@/modules/payments/strategies'
import { SUCURSALES, CIUDADES } from '../../catalog/constants'
import { branchManagementService } from '../../../services/branchManagementService'
import { promotionManagementService } from '../../../services/promotionManagementService'
import { diasDeAlquiler } from '../utils/pricing'
import { vehicleManagementService } from '../../../services/vehicleManagementService'
import { getPlanesKilometraje, getCoberturasSeguro, getServiciosAdicionales, cotizarPrecio } from '@/services/pricingService'

export const TOTAL_PASOS = 3

const getItemPrice = (item) => Number(item?.precio ?? item?.dailyRate ?? item?.price ?? 0)

export const HORAS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, '0')
  return [`${h}:00`, `${h}:30`]
}).flat()

export function useReservationFlow() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario, actualizarUsuario } = useAuthStore()
  const [mileagePlans, setMileagePlans] = useState([])
  const [insuranceCoverages, setInsuranceCoverages] = useState([])
  const [additionalServices, setAdditionalServices] = useState([])
  const [sedesCatalog, setSedesCatalog] = useState([])

  useEffect(() => {
    catalogService.getSedes()
      .then((sedes) => setSedesCatalog(Array.isArray(sedes) ? sedes : []))
      .catch(() => setSedesCatalog([]))
  }, [])

  useEffect(() => {
    Promise.all([getPlanesKilometraje(), getCoberturasSeguro(), getServiciosAdicionales()])
      .then(([plans, coverages, services]) => {
        setMileagePlans(plans)
        setInsuranceCoverages(coverages)
        setAdditionalServices(services)
      })
      .catch(() => {
        setMileagePlans([])
        setInsuranceCoverages([])
        setAdditionalServices([])
      })
  }, [])

  let selectedVehicle = null
  try { selectedVehicle = JSON.parse(sessionStorage.getItem('drivique_selected_vehicle') || 'null') } catch { selectedVehicle = null }
  const baseVehiculo = vehicleManagementService.getById(id) || (String(selectedVehicle?.id) === String(id) ? selectedVehicle : null)
  const limitedMileagePlan = mileagePlans.find((plan) => plan.includedKm != null) || null
  const unlimitedMileagePlan = mileagePlans.find((plan) => plan.includedKm == null || /unlimited|ilimitado/i.test(plan.name || '')) || null
  const vehiculo = baseVehiculo ? {
    ...baseVehiculo,
    caracteristicas: baseVehiculo.caracteristicas || [],
    equipamientoTecnologico: baseVehiculo.equipamientoTecnologico || [],
    seguros: [...insuranceCoverages]
      .sort((a, b) => getItemPrice(a) - getItemPrice(b))
      .map((seguro) => ({ ...seguro, nombre: seguro.name, precio: getItemPrice(seguro), descripcion: seguro.description })),
    servicios: (additionalServices.length ? additionalServices : (baseVehiculo.servicios || []))
      .map((servicio) => ({ ...servicio, nombre: servicio.nombre || servicio.name, precio: getItemPrice(servicio) })),
    tarifas: {
      ...(baseVehiculo.tarifas || {}),
      kmLimitado: limitedMileagePlan
        ? { id: limitedMileagePlan.id, km: limitedMileagePlan.includedKm, precio: getItemPrice(limitedMileagePlan), excedente: Number(limitedMileagePlan.extraKmRate || 0) }
        : (baseVehiculo.tarifas?.kmLimitado || { km: 200, precio: 0, excedente: 850 }),
      kmIlimitado: unlimitedMileagePlan
        ? { id: unlimitedMileagePlan.id, precio: getItemPrice(unlimitedMileagePlan) }
        : (baseVehiculo.tarifas?.kmIlimitado || { precio: 35000 }),
    },
    imagenes: baseVehiculo.imagenes || (baseVehiculo.imagen ? [baseVehiculo.imagen] : []),
    sucursalInfo: baseVehiculo.sucursalInfo || {
      nombre: baseVehiculo.sucursal || '',
      direccion: '',
      horario: 'Lun a dom, 6:00 am - 10:00 pm'
    }
  } : null
  const tarifaDiariaVehiculo = Number(vehiculo?.precio ?? vehiculo?.dailyRate ?? vehiculo?.tarifaDiaria ?? 0)

  const storageKey = `drivique_reservation_state_v2_${id}`

  const getInitialState = () => {
    try {
      const saved = sessionStorage.getItem(storageKey)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Error reading sessionStorage', e)
    }
    return null
  }

  const savedState = getInitialState()

  const [cotizacion, setCotizacion] = useState(null)
  const [pantalla, setPantalla] = useState(savedState?.pantalla || 1)
  const [seguroIdx, setSeguroIdx] = useState(savedState?.seguroIdx !== undefined ? savedState.seguroIdx : null)
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState(savedState?.serviciosSeleccionados || [])
  const [appliedPromotion, setAppliedPromotion] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const codeFromUrl = params.get('promo') || params.get('cupon')
      if (codeFromUrl) {
        const found = promotionManagementService.list().find(
          (p) => p.codigo === codeFromUrl.toUpperCase() && p.activa
        )
        if (found) return found
      }
    } catch {
      // ignore
    }
    return null
  })

  useEffect(() => {
    if (!appliedPromotion && vehiculo) {
      const params = new URLSearchParams(window.location.search)
      const codeFromUrl = params.get('promo') || params.get('cupon')
      if (codeFromUrl) {
        promotionManagementService.refresh()
          .then(() => {
            const res = promotionManagementService.validateCode(codeFromUrl)
            if (res.promotion) setAppliedPromotion(res.promotion)
          })
          .catch((e) => console.warn('Could not auto-apply URL promo', e))
      }
    }
  }, [vehiculo, usuario, appliedPromotion])
  const [reserva, setReserva] = useState(savedState?.reserva ? { ...savedState.reserva, tipoKm: savedState.reserva.tipoKm || '' } : {
    fechaInicio: '', fechaFin: '',
    horaInicio: '', horaFin: '',
    sucursalRetiro: '',
    sucursalDevolucion: '',
    tipoKm: '',
    metodoPago: '',
    sucursalPagoEfectivo: '',
    domicilioCiudad: '',
    domicilioBarrio: '',
    domicilioDireccion: '',
    domicilioReferencias: '',
  })

  const carBranch = vehiculo?.sucursal
  const branchObj = SUCURSALES.find(s => s.nombre === carBranch)
  const cityObj = branchObj ? CIUDADES.find(c => c.nombre === branchObj.ciudad) : null

  useEffect(() => {
    if (carBranch) {
      setReserva((prev) => ({
        ...prev,
        sucursalRetiro: prev.sucursalRetiro || carBranch,
        sucursalDevolucion: prev.sucursalDevolucion || carBranch,
      }))
    }
  }, [carBranch])

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
        // Punto de pago: la sede del vehículo si recibe efectivo; si no, el primer punto autorizado
        const puntosEfectivo = branchManagementService.getCashAuthorized()
        act.sucursalPagoEfectivo = puntosEfectivo.some(b => b.nombre === vehiculo?.sucursal)
          ? vehiculo.sucursal
          : (puntosEfectivo[0]?.nombre || '')
        act.sucursalRetiro = vehiculo?.sucursal || ''
        act.sucursalDevolucion = vehiculo?.sucursal || ''
        act.domicilioCiudad = ''
        act.domicilioBarrio = ''
        act.domicilioDireccion = ''
        act.domicilioReferencias = ''
      }
      if (campo === 'sucursalRetiro' && valor === 'domicilio') {
        const b = SUCURSALES.find(s => s.nombre === vehiculo?.sucursal)
        act.domicilioCiudad = b?.ciudad || ''
      }
      if (campo === 'sucursalDevolucion' && valor === 'domicilio') {
        const b = SUCURSALES.find(s => s.nombre === vehiculo?.sucursal)
        act.domicilioCiudad = b?.ciudad || ''
      }
      if (act.sucursalRetiro === 'domicilio' || act.sucursalDevolucion === 'domicilio') {
        const b = SUCURSALES.find(s => s.nombre === vehiculo?.sucursal)
        act.domicilioCiudad = b?.ciudad || ''
      }
      return act
    })
    setErrorPaso1('')

    if (campo === 'metodoPago' && valor === 'efectivo' && vehiculo) {
      const sucursal = SUCURSALES.find(s => s.nombre === vehiculo.sucursal) || branchManagementService.getCashAuthorized().find(s => s.nombre === reserva.sucursalPagoEfectivo) || branchManagementService.getCashAuthorized()[0]
      if (sucursal) {
        showAlert({
          icon: 'info',
          title: t('vehiculo.cashBranchTitle'),
          background: 'var(--bg-tarjeta)',
          color: 'var(--texto-primary)',
          html: `<div style="font-size:13.5px;line-height:1.5;color:var(--texto-primary);">
            <p style="margin:0 0 14px;color:var(--texto-second);text-align:center;font-size:13px;line-height:1.45;">${t('vehiculo.cashBranchIntro')}</p>
            <div style="text-align:left;background:var(--bg-item);border:1px solid var(--borde);border-radius:12px;padding:12px 14px;">
              <p style="margin:0 0 4px;font-weight:700;color:var(--texto-primary);font-size:14px;">${sucursal.nombre}</p>
              <p style="margin:0 0 2px;color:var(--texto-second);font-size:12.5px;"><strong>${t('vehiculo.cashBranchCity')}:</strong> ${sucursal.ciudad}</p>
              <p style="margin:0;color:var(--texto-second);font-size:12.5px;"><strong>${t('vehiculo.cashBranchAddress')}:</strong> ${sucursal.direccion || t('vehiculo.cashBranchNoAddress')}</p>
            </div>
          </div>`,
          confirmButtonText: t('common.close'),
          width: 340,
        })
      }
    }
  }

  const toggleServicio = (nombre) => setServiciosSeleccionados(prev =>
    prev.includes(nombre) ? prev.filter(n => n !== nombre) : [...prev, nombre]
  )

  const [errorPaso1, setErrorPaso1] = useState('')
  const [datosForm, setDatosForm] = useState(savedState?.datosForm || {
    nombre: '', correo: '', celular: '',
    nacionalidad: '', tipoDoc: '', numDoc: '',
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
  const [docsVerificados, setDocsVerificados] = useState(false)

  const idUsuarioDocs = usuario?.id || usuario?.correo || null

  useEffect(() => {
    if (!idUsuarioDocs) {
      setDocsVerificados(false)
      return
    }
    let activo = true
    userService.getDocuments()
      .then((respuesta) => {
        if (!activo) return
        const documentos = Array.isArray(respuesta) ? respuesta : (respuesta?.documents || [])
        const aprobados = documentos.filter((doc) => String(doc.statusCode || '').toUpperCase() === 'APPROVED')
        const tieneIdentidad = aprobados.some((doc) => String(doc.documentType?.code || '').toUpperCase() !== 'DRIVER_LICENSE')
        const tieneLicencia = aprobados.some((doc) => String(doc.documentType?.code || '').toUpperCase() === 'DRIVER_LICENSE')
        setDocsVerificados(tieneIdentidad && tieneLicencia)
      })
      .catch(() => activo && setDocsVerificados(false))
    return () => { activo = false }
  }, [idUsuarioDocs])

  // Sincronizar estado con sessionStorage solo si se ha avanzado más allá del paso 1
  useEffect(() => {
    if (pantalla > 1) {
      const stateToSave = {
        pantalla,
        seguroIdx,
        serviciosSeleccionados,
        reserva,
        datosForm: {
          ...datosForm,
          cedulaPdf: null, // No podemos guardar archivos File
          licenciaPdf: null,
        }
      }
      sessionStorage.setItem(storageKey, JSON.stringify(stateToSave))
    } else {
      sessionStorage.removeItem(storageKey)
    }
  }, [pantalla, seguroIdx, serviciosSeleccionados, reserva, datosForm, storageKey])

  const limpiarTipoDocIdentidad = (tipo) => {
    if (!tipo) return ''
    const up = String(tipo).trim().toUpperCase()
    if (up === 'DRIVER_LICENSE' || up === 'LICENCIA' || up === 'DRIVER LICENSE' || up === 'LICENCIA_CONDUCCION') return ''
    if (up === 'PASSPORT') return 'PASAPORTE'
    return tipo
  }

  useEffect(() => {
    if (!usuario) return
    const tel = (usuario.telefono || '').replace(/\D/g, '')
    const celular = tel.startsWith('57') && tel.length > 10 ? tel.slice(2) : tel
    const nombreCompleto = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ')
    const docLimpio = limpiarTipoDocIdentidad(usuario.tipoDocumento)

    setDatosForm(prev => ({
      ...prev,
      nombre: prev.nombre || nombreCompleto,
      correo: prev.correo || usuario.correo || '',
      celular: prev.celular || celular,
      numDoc: prev.numDoc || usuario.cedula || '',
      nacionalidad: prev.nacionalidad || usuario.nacionalidad || '',
      tipoDoc: prev.tipoDoc || docLimpio || '',
    }))
  }, [usuario])

  // Datos personales guardados en el perfil del servidor: completan los campos que sigan vacíos
  useEffect(() => {
    if (!usuario) return undefined
    let activo = true
    userService.getProfile()
      .then(async (perfil) => {
        if (!activo || !perfil) return
        const nacionalidad = perfil.nationalityId ? await userService.nacionalidadNombreDesdeId(perfil.nationalityId).catch(() => '') : ''
        const tel = String(perfil.phone || '').replace(/\D/g, '')
        const celular = tel.startsWith('57') && tel.length > 10 ? tel.slice(2) : tel
        const tipoDoc = limpiarTipoDocIdentidad(perfil.documentTypeCode || '')
        const nombre = [perfil.firstName, perfil.lastName].filter(Boolean).join(' ')

        setDatosForm((prev) => ({
          ...prev,
          nombre: nombre || prev.nombre,
          correo: perfil.email || prev.correo || '',
          celular: celular || prev.celular,
          nacionalidad: nacionalidad || prev.nacionalidad,
          tipoDoc: tipoDoc || prev.tipoDoc,
          numDoc: perfil.documentNumber || prev.numDoc,
        }))
      })
      .catch(() => {})
    return () => { activo = false }
  }, [usuario?.correo, usuario?.id])

  const irSiguiente = () => {
    const mostrarAlerta = (mensajePersonalizado) => {
      showAlert({
        icon: 'info',
        title: t('vehiculo.missingDataTitle', 'Faltan datos por completar'),
        text: mensajePersonalizado || t('vehiculo.missingDataText', 'Completa la información requerida para continuar con tu reserva.'),
        confirmButtonText: t('common.close', 'Cerrar')
      })
    }

    if (pantalla === 1) {
      if (!reserva.metodoPago) {
        mostrarAlerta(t('reservas.errorMetodoPago', 'Debes seleccionar un método de pago.'));
        return;
      }
      if (!reserva.sucursalRetiro || !reserva.sucursalDevolucion) {
        mostrarAlerta(t('reservas.errorSucursales', 'Debes seleccionar el lugar de retiro y devolución.'));
        return;
      }
      if (!reserva.fechaInicio || !reserva.fechaFin) {
        mostrarAlerta(t('reservas.errorFechas', 'Debes seleccionar las fechas de inicio y devolución en el calendario.'));
        return;
      }
      if (!reserva.horaInicio) {
        mostrarAlerta(t('reservas.errorHoraRetiro', 'Por favor selecciona la hora de retiro del vehículo.'));
        return;
      }
      if (!reserva.horaFin) {
        mostrarAlerta(t('reservas.errorHoraDevolucion', 'Por favor selecciona la hora de devolución del vehículo.'));
        return;
      }
      if (reserva.sucursalRetiro === 'domicilio' || reserva.sucursalDevolucion === 'domicilio') {
        if (!reserva.domicilioBarrio?.trim() || !reserva.domicilioDireccion?.trim()) {
          mostrarAlerta(t('reservas.errorDomicilio', 'Para el servicio a domicilio, debes ingresar el barrio y la dirección de entrega/devolución.'));
          return;
        }
      }
    } else if (pantalla === 2) {
      if (seguroIdx === null) {
        mostrarAlerta(t('reservas.errorSeguro', 'Debes seleccionar una opción de protección/seguro.'));
        return;
      }
      if (!reserva.tipoKm) {
        mostrarAlerta(t('reservas.errorPlanKm', 'Debes seleccionar un plan de kilometraje.'));
        return;
      }
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

  const handleReservar = async () => {
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

    // ─── 1. Validación de Datos Personales y Documentación Obligatoria ─────────
    const e = {}

    if (!datosForm.nombre?.trim()) e.nombre = t('vehiculo.errors.nameRequired', 'El nombre es obligatorio.')
    if (!datosForm.nacionalidad?.trim()) e.nacionalidad = t('vehiculo.errors.nationalityRequired', 'Debes seleccionar tu nacionalidad.')
    if (!datosForm.tipoDoc?.trim()) e.tipoDoc = t('vehiculo.errors.docTypeRequired', 'Debes seleccionar el tipo de documento.')
    if (!datosForm.numDoc?.trim()) e.numDoc = t('vehiculo.errors.docRequired', 'El número de documento es obligatorio.')
    if (!datosForm.correo?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosForm.correo)) e.correo = t('vehiculo.errors.emailInvalid', 'El correo electrónico no es válido.')
    if (!datosForm.celular?.trim() || datosForm.celular.trim().length < 10) e.celular = t('vehiculo.errors.phoneInvalid', 'El número celular debe tener al menos 10 dígitos.')
    if (!docsVerificados && !datosForm.cedulaPdf) e.cedulaPdf = t('vehiculo.errors.cedulaPdfRequired', 'Debes subir tu documento de identidad en formato PDF.')
    if (!docsVerificados && !datosForm.licenciaPdf) e.licenciaPdf = t('vehiculo.errors.licenciaPdfRequired', 'Debes subir tu licencia de conducción en formato PDF.')
    if (!datosForm.terminos) e.terminos = t('vehiculo.errors.termsRequired', 'Debes aceptar los términos y condiciones.')

    setErrores(e)

    if (Object.keys(e).length > 0) {
      showAlert({
        icon: 'warning',
        title: 'Información incompleta',
        text: 'Por favor completa todos los campos obligatorios y adjunta los documentos requeridos para confirmar tu reserva.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#2563eb',
      })
      return
    }

    // ─── 2. Validación de Documentación KYC Rechazada / Observaciones ────────
    try {
      const documentos = await userService.getDocuments()
      const listaDocumentos = Array.isArray(documentos) ? documentos : (documentos?.documents || [])
      const hayDocumentosNuevos = datosForm.cedulaPdf instanceof File || datosForm.licenciaPdf instanceof File
      const rechazado = listaDocumentos.find((documento) => String(documento.statusCode || documento.status || documento.estado).toUpperCase() === 'REJECTED')
      if (!hayDocumentosNuevos && rechazado) {
        const confirmRechazado = await showAlert({
          icon: 'warning',
          title: 'Documentación con observaciones',
          text: rechazado?.reviewNotes || rechazado?.observaciones || 'Uno o más de tus documentos requiere corrección. Te recomendamos subir la versión corregida.',
          showCancelButton: true,
          confirmButtonText: 'Continuar de todos modos',
          cancelButtonText: 'Corregir documentos',
        })
        if (!confirmRechazado.isConfirmed) {
          return
        }
      }
    } catch {
      // Ignorar error al leer documentos para no bloquear el flujo
    }

    // ─── 3. Validación de Horario de Atención de la Sucursal ─────────────────
    const branchName = reserva.sucursalRetiro || vehiculo?.sucursal || vehiculo?.sucursalInfo?.nombre || ''
    const currentBranch = sedesCatalog.find(
      (s) => s.id === vehiculo?.sucursalId || s.name === branchName || s.nombre === branchName
    )

    let isOutsideSchedule = false
    let openingTimeStr = '08:00'
    let closingTimeStr = '18:00'

    if (currentBranch && currentBranch.openingTime && currentBranch.closingTime) {
      const openRaw = String(currentBranch.openingTime).slice(0, 5)
      const closeRaw = String(currentBranch.closingTime).slice(0, 5)
      openingTimeStr = openRaw
      closingTimeStr = closeRaw

      const is24Hours =
        (openRaw === '00:00' && (closeRaw === '23:59' || closeRaw === '24:00')) ||
        openRaw === closeRaw

      if (!is24Hours) {
        // Evaluar hora actual en zona horaria de Colombia (America/Bogota - UTC-5)
        const nowBogota = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'America/Bogota',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date())

        if (openRaw < closeRaw) {
          isOutsideSchedule = nowBogota < openRaw || nowBogota > closeRaw
        } else {
          isOutsideSchedule = nowBogota < openRaw && nowBogota > closeRaw
        }
      }
    }

    let outsideScheduleAccepted = false
    if (isOutsideSchedule) {
      const branchDisplay = currentBranch?.name || currentBranch?.nombre || branchName || 'la sucursal'
      const alertResult = await showAlert({
        icon: 'info',
        title: 'Sucursal fuera de horario de atención',
        html: `
          <div style="text-align: left; font-size: 14px; line-height: 1.6; color: var(--texto-primary, #1e293b);">
            <p style="margin-bottom: 12px;">
              La sucursal <strong>${branchDisplay}</strong> tiene un horario de atención de <strong>${openingTimeStr}</strong> a <strong>${closingTimeStr}</strong>.
            </p>
            <p style="margin-bottom: 12px; color: #b45309; background: #fef3c7; padding: 10px 14px; border-radius: 8px; border: 1px solid #fde68a;">
              ⏱️ En este momento se encuentra cerrada, pero puedes registrar tu reserva ahora y quedará en estado <strong>PENDIENTE</strong>.
            </p>
            <p style="margin: 0; color: var(--texto-second, #64748b); font-size: 13px;">
              Mañana a las <strong>${openingTimeStr}</strong> te notificaremos por correo electrónico, notificación web y push para que puedas continuar con tu reserva.
            </p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Registrar como pendiente',
        cancelButtonText: 'Regresar',
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#64748b',
        width: 480,
      })

      if (!alertResult.isConfirmed) {
        return
      }
      outsideScheduleAccepted = true
    }

    const tarifas = vehiculo.tarifas || {}
    const precioKm = reserva.tipoKm === 'ilimitado'
      ? Number(tarifas.kmIlimitado?.precio || 0)
      : (reserva.tipoKm === 'limitado' ? Number(tarifas.kmLimitado?.precio || 0) : 0)
    const dias = diasDeAlquiler(reserva)
    const precioSeguro = seguroIdx !== null ? getItemPrice(vehiculo.seguros[seguroIdx]) : 0
    const serviciosElegidos = (vehiculo.servicios || []).filter(s => serviciosSeleccionados.includes(s.nombre))
    const precioServicios = serviciosElegidos.reduce((suma, s) => suma + getItemPrice(s), 0)
    const subtotal = (tarifaDiariaVehiculo + precioKm + precioSeguro + precioServicios) * dias
    const finalTotalCop = cotizacion ? Number(cotizacion.estimatedTotal) : subtotal

    const referencia = generarReferenciaUnica()

    if (usuario && actualizarUsuario) {
      const partesNombre = (datosForm.nombre || '').trim().split(' ')
      const primerNombre = partesNombre.length > 1 ? partesNombre.slice(0, -1).join(' ') : partesNombre[0] || ''
      const primerApellido = partesNombre.length > 1 ? partesNombre[partesNombre.length - 1] : ''
      const datosPerfil = {
        nombre: primerNombre || datosForm.nombre || usuario.nombre,
        apellido: primerApellido || datosForm.apellido || usuario.apellido || '',
        cedula: datosForm.numDoc || usuario.cedula,
        telefono: datosForm.celular || usuario.telefono,
        nacionalidad: datosForm.nacionalidad || usuario.nacionalidad,
        tipoDocumento: datosForm.tipoDoc || usuario.tipoDocumento,
      }
      await userService.actualizarPerfil(datosPerfil)
      actualizarUsuario(datosPerfil)
    }

    let requiereValidacionDocs = false
    if (idUsuarioDocs && (datosForm.cedulaPdf || datosForm.licenciaPdf || !docsVerificados)) {
      if (datosForm.cedulaPdf instanceof File || datosForm.licenciaPdf instanceof File) {
        try {
          const { data: tipos } = await import('@/services/httpClient').then(({ api }) => api.get('/kyc/document-types'))
          const lista = Array.isArray(tipos) ? tipos : (tipos?.documentTypes || [])
          const codigoIdentidad = String(datosForm.tipoDoc || 'CC').trim().toUpperCase()
          const tipoCedula = lista.find((t) => String(t.code || '').toUpperCase() === codigoIdentidad)
          const tipoLicencia = lista.find((t) => String(t.code || '').toUpperCase() === 'DRIVER_LICENSE')
          if (datosForm.cedulaPdf instanceof File && tipoCedula?.id && vehiculo.sucursalId) {
            await userService.uploadTypedDocument({ documentTypeId: tipoCedula.id, documentNumber: datosForm.numDoc, branchId: vehiculo.sucursalId, frontFile: datosForm.cedulaPdf })
          }
          if (datosForm.licenciaPdf instanceof File && tipoLicencia?.id && vehiculo.sucursalId) {
            await userService.uploadTypedDocument({ documentTypeId: tipoLicencia.id, documentNumber: datosForm.numDoc, branchId: vehiculo.sucursalId, frontFile: datosForm.licenciaPdf })
          }
        } catch (docErr) {
          console.warn('Document upload warning:', docErr)
        }
      }
      requiereValidacionDocs = true
      setDocsVerificados(false)
    }

    const clienteNombreFinal = datosForm.nombre || [datosForm.nombres, datosForm.apellidos].filter(Boolean).join(' ') || usuario?.nombre || 'Cliente Drivique'
    const clienteCorreoFinal = datosForm.correo || datosForm.email || usuario?.correo || usuario?.email || ''
    const clienteTelFinal = datosForm.celular || datosForm.telefono || usuario?.telefono || ''
    const clienteDocFinal = datosForm.numDoc || datosForm.documento || datosForm.cedula || usuario?.cedula || ''

    try {
      let dRetiro = new Date(`${reserva.fechaInicio}T${reserva.horaInicio || '10:00'}:00`)
      let dDevolucion = new Date(`${reserva.fechaFin}T${reserva.horaFin || '10:00'}:00`)
      const ahora = Date.now()
      if (dRetiro.getTime() < ahora) {
        const hoyLocal = new Date()
        const fInicioStr = reserva.fechaInicio ? String(reserva.fechaInicio).split('T')[0] : ''
        const hoyStr = `${hoyLocal.getFullYear()}-${String(hoyLocal.getMonth() + 1).padStart(2, '0')}-${String(hoyLocal.getDate()).padStart(2, '0')}`
        if (fInicioStr === hoyStr) {
          dRetiro = new Date(ahora + 2 * 60 * 1000)
          if (dDevolucion.getTime() <= dRetiro.getTime()) {
            dDevolucion = new Date(dRetiro.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      }

      const datosParaBackend = {
        vehicleId: vehiculo.id,
        pickupDate: dRetiro.toISOString(),
        returnDate: dDevolucion.toISOString(),
        insuranceCoverageId: vehiculo.seguros[seguroIdx]?.id || null,
        mileagePlanId: reserva.tipoKm === 'ilimitado' ? (tarifas.kmIlimitado?.id || null) : (tarifas.kmLimitado?.id || null),
        additionalServiceIds: (vehiculo.servicios || []).filter(s => serviciosSeleccionados.includes(s.nombre)).map(s => s.id).filter(Boolean),
        couponCode: appliedPromotion ? appliedPromotion.codigo : null,
        cashPaymentBranchId: reserva.metodoPago === 'efectivo'
          ? (branchManagementService.getCashAuthorized().find(b => b.nombre === reserva.sucursalPagoEfectivo)?.id || vehiculo.sucursalId || null)
          : null,
        outsideScheduleAccepted: Boolean(outsideScheduleAccepted),
        customerInfo: {
          name: clienteNombreFinal,
          email: clienteCorreoFinal,
          phone: clienteTelFinal,
          document: clienteDocFinal,
          tipoDoc: datosForm.tipoDoc || usuario?.tipoDocumento || 'CC'
        },
        metodoPago: reserva.metodoPago,
        total: finalTotalCop,
        sucursalRetiro: reserva.sucursalRetiro,
        sucursalDevolucion: reserva.sucursalDevolucion
      }

      // ─── 3. Creación en Backend (Sin fallback silencioso) ─────────────────
      const holdResult = await reservationsService.crearReserva(datosParaBackend)
      const totalServidor = Number(holdResult?.totalEstimated) || finalTotalCop
      
      const refFinal = holdResult?.code || holdResult?.id || holdResult?.holdId || referencia
      if (holdResult?.cashPaymentExpiresAt) {
        setFechaLimitePago(holdResult.cashPaymentExpiresAt)
      } else if (holdResult?.fechaLimitePago) {
        setFechaLimitePago(holdResult.fechaLimitePago)
      }
      
      const estadoInicial = holdResult?.status || (outsideScheduleAccepted
        ? 'PENDING_SCHEDULE'
        : (requiereValidacionDocs ? 'PENDING_DOCUMENT_REVIEW' : (reserva.metodoPago === 'efectivo' ? 'PENDIENTE_EFECTIVO' : 'pendiente')))

      sessionStorage.setItem('current_wompi_reference', refFinal)
      setReservaCreada({
        ...holdResult,
        id: holdResult?.id || refFinal,
        referencia: refFinal,
        codigo: refFinal,
        horasLimitePago: 72,
        total: totalServidor,
        estado: estadoInicial,
        status: estadoInicial
      })
      setDatosPago({ referencia: refFinal, amountInCents: aCentavos(totalServidor) })
      setExito(true)

      sessionStorage.removeItem(storageKey)
    } catch (error) {
      console.error('Error creating reservation hold:', error)
      const errorMsg = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'No se pudo crear la reserva en el servidor. Por favor intenta de nuevo.'
      showAlert({
        icon: 'error',
        title: 'Error al registrar reserva',
        text: errorMsg
      })
    }
  }

  const handleContratoFirmado = () => {
    setContratoFirmado(true)
    setExito(true)
  }

  useEffect(() => {
    if (!reservaCreada?.id) return
    const esPendienteKyc =
      reservaCreada.estado === 'PENDING_DOCUMENT_REVIEW' ||
      reservaCreada.estado === 'PENDIENTE_VALIDACION' ||
      reservaCreada.status === 'PENDING_DOCUMENT_REVIEW'
    if (!esPendienteKyc) return

    const interval = setInterval(async () => {
      try {
        const updated = await reservationsService.getReservaById(reservaCreada.id)
        if (updated && updated.status && updated.status !== reservaCreada.status) {
          setReservaCreada(prev => ({
            ...prev,
            ...updated,
            estado: updated.status,
            status: updated.status,
            total: updated.totalEstimated != null ? Number(updated.totalEstimated) : prev.total,
          }))
          if (updated.status === 'PENDING_PAYMENT') {
            const tot = updated.totalEstimated != null ? Number(updated.totalEstimated) : reservaCreada.total
            setDatosPago({
              referencia: updated.code || reservaCreada.referencia || reservaCreada.id,
              amountInCents: aCentavos(tot)
            })
          }
        }
      } catch (e) {
        // Ignorar errores de sondeo
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [reservaCreada?.id, reservaCreada?.estado, reservaCreada?.status])

  const handlePagarConWompi = async () => {
    const infoPago = datosPago || (reservaCreada ? {
      referencia: reservaCreada.codigo || reservaCreada.id || reservaCreada.referencia,
      amountInCents: aCentavos(reservaCreada.total || 0)
    } : null)

    if (!infoPago || !infoPago.referencia) {
      showAlert({
        icon: 'warning',
        title: 'Información de pago incompleta',
        text: 'No se pudo recuperar la referencia de la reserva para iniciar Wompi. Por favor intenta nuevamente.'
      })
      return
    }

    setErrorPago('')
    setRedirigiendoPago(true)
    try {
      const wompiStrategy = paymentFactory.getStrategy('wompi')
      const context = new PaymentContext(wompiStrategy)
      const result = await context.execute({
        reference: infoPago.referencia,
        amountInCents: infoPago.amountInCents,
        redirectUrl: `${window.location.origin}/respuesta`,
      })
      if (result?.redirectUrl) {
        window.location.href = result.redirectUrl
      }
    } catch (err) {
      console.error('[Payment Strategy: Wompi] Error:', err)
      const msg = err?.message || 'No se pudo conectar con la pasarela de Wompi. Intenta de nuevo.'
      setErrorPago(msg)
      setRedirigiendoPago(false)
      showAlert({
        icon: 'error',
        title: 'Error al iniciar pago en Wompi',
        text: msg
      })
    }
  }

  const handlePagoEfectivo = async () => {
    if (!datosPago) return
    try {
      const cashStrategy = paymentFactory.getStrategy('cash')
      const context = new PaymentContext(cashStrategy)
      const result = await context.execute({
        reference: datosPago.referencia,
        amountInCents: datosPago.amountInCents,
      })
      console.log('[Payment Strategy: Cash]', result?.message, 'Referencia:', result?.reference)
    } catch (err) {
      console.error('[Payment Strategy: Cash] Error:', err)
    }
  }

  // Totales para footer móvil
  const tarifasTotal = vehiculo?.tarifas || {}
  const precioTotal = reserva.tipoKm === 'ilimitado'
    ? Number(tarifasTotal.kmIlimitado?.precio || 0)
    : (reserva.tipoKm === 'limitado' ? Number(tarifasTotal.kmLimitado?.precio || 0) : 0)
  const diasTotal = diasDeAlquiler(reserva)
  const precioSeguroTotal = seguroIdx !== null ? getItemPrice(vehiculo?.seguros[seguroIdx]) : 0
  const precioServiciosTotal = (vehiculo?.servicios || [])
    .filter(s => serviciosSeleccionados.includes(s.nombre))
    .reduce((suma, s) => suma + getItemPrice(s), 0)
  const subtotalD = (tarifaDiariaVehiculo + precioTotal) * diasTotal
  const subtotalS = precioSeguroTotal * diasTotal
  const subtotalSv = precioServiciosTotal * diasTotal
  const baseReservaT = subtotalD + subtotalS + subtotalSv
  const descuentoPromocion = cotizacion ? Number(cotizacion.discountAmount || 0) : 0
  const totalReservaBase = cotizacion ? Number(cotizacion.estimatedTotal) + descuentoPromocion : baseReservaT
  const totalReserva = totalReservaBase - descuentoPromocion

  // Cotización oficial del servidor (cargo administrativo, IVA, descuento y total)
  const seguroSel = seguroIdx !== null ? vehiculo?.seguros?.[seguroIdx] : null
  const planKmId = reserva.tipoKm === 'ilimitado' ? tarifasTotal.kmIlimitado?.id : tarifasTotal.kmLimitado?.id
  const serviciosIds = (vehiculo?.servicios || []).filter(s => serviciosSeleccionados.includes(s.nombre)).map(s => s.id).filter(Boolean)
  const claveCotizacion = JSON.stringify([vehiculo?.id, reserva.fechaInicio, reserva.horaInicio, reserva.fechaFin, reserva.horaFin, seguroSel?.id, planKmId, serviciosIds, appliedPromotion?.codigo])
  useEffect(() => {
    if (!vehiculo?.id || !seguroSel?.id || !planKmId || !reserva.fechaInicio || !reserva.fechaFin) {
      setCotizacion(null)
      return undefined
    }
    let activo = true
    const payload = {
      vehicleId: vehiculo.id,
      pickupDate: new Date(`${reserva.fechaInicio}T${reserva.horaInicio || '00:00'}:00`).toISOString(),
      returnDate: new Date(`${reserva.fechaFin}T${reserva.horaFin || '00:00'}:00`).toISOString(),
      insuranceId: seguroSel.id,
      mileagePlanId: planKmId,
      additionalServiceIds: serviciosIds,
    }
    cotizarPrecio({ ...payload, couponCode: appliedPromotion?.codigo })
      .catch((error) => {
        if (!appliedPromotion?.codigo) throw error
        // El servidor rechazó el cupón (vigencia, alcance, mínimo, audiencia o usos): se quita y se cotiza sin él
        if (activo) {
          setAppliedPromotion(null)
          showAlert({ icon: 'warning', title: error?.response?.data?.detail || t('promotions.couponRejected', 'El cupón no se pudo aplicar a esta reserva.') })
        }
        return cotizarPrecio(payload)
      })
      .then((resultado) => { if (activo) setCotizacion(resultado) })
      .catch(() => { if (activo) setCotizacion(null) })
    return () => { activo = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveCotizacion])

  const aplicarPromocion = (codigo) => {
    const result = promotionManagementService.validateCode(codigo)
    setAppliedPromotion(result.promotion)
    return result
  }

  const quitarPromocion = () => setAppliedPromotion(null)

  return {
    vehiculo, pantalla, setPantalla, reserva, setReserva, cambiarReserva,
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
    totalReserva, totalReservaBase, descuentoPromocion, diasTotal, TOTAL_PASOS,
    appliedPromotion, aplicarPromocion, quitarPromocion,
    cotizacion,
    usuario,
  }
}

