import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useState, useEffect, useRef } from 'react'
import { catalogService } from '@/services/catalogService'
import { getPlanesKilometraje, getCoberturasSeguro, getServiciosAdicionales } from '@/services/pricingService'
import { vehicleManagementService } from '../../../../services/vehicleManagementService'
import { promotionManagementService } from '../../../../services/promotionManagementService'
import { SUCURSALES, CIUDADES } from '../../../catalog/constants'
import { branchManagementService } from '../../../../services/branchManagementService'
import { showAlert } from '@/utils/swalConfig'
import { userService } from '@/services/userService'

const getItemPrice = (item) => Number(item?.precio ?? item?.dailyRate ?? item?.price ?? 0)

export default function useReservationFlowLogic1() {
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
  
    let selectedVehicle
    try { selectedVehicle = JSON.parse(sessionStorage.getItem('drivique_selected_vehicle') || 'null') } catch { selectedVehicle = null }
    const [vehiculoFetched, setVehiculoFetched] = useState(null)
    const [cargandoVehiculo, setCargandoVehiculo] = useState(!selectedVehicle && !vehicleManagementService.getById(id))
  
    useEffect(() => {
      if (!selectedVehicle && !vehicleManagementService.getById(id) && id) {
        setCargandoVehiculo(true)
        catalogService.getVehiculoById(id)
          .then((data) => {
            if (data) {
              setVehiculoFetched(data)
              try { sessionStorage.setItem('drivique_selected_vehicle', JSON.stringify(data)) } catch { /* sin sessionStorage solo se pierde la preselección del vehículo */ }
            }
          })
          .catch(() => {})
          .finally(() => setCargandoVehiculo(false))
      }
    }, [id])
  
    const baseVehiculo = vehicleManagementService.getById(id) || (String(selectedVehicle?.id) === String(id) ? selectedVehicle : null) || vehiculoFetched
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
    const [procesandoReserva, setProcesandoReserva] = useState(false)
    const isSubmittingRef = useRef(false)
  
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
          const validos = documentos.filter((doc) => {
            const st = String(doc.statusCode || '').toUpperCase()
            return st === 'APPROVED' || st === 'PENDING'
          })
          const tieneIdentidad = validos.some((doc) => String(doc.documentType?.code || '').toUpperCase() !== 'DRIVER_LICENSE')
          const tieneLicencia = validos.some((doc) => String(doc.documentType?.code || '').toUpperCase() === 'DRIVER_LICENSE')
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

  return { t, navigate, usuario, actualizarUsuario, sedesCatalog, cargandoVehiculo, vehiculo, tarifaDiariaVehiculo, storageKey, cotizacion, setCotizacion, pantalla, setPantalla, seguroIdx, setSeguroIdx, serviciosSeleccionados, setServiciosSeleccionados, appliedPromotion, setAppliedPromotion, reserva, setReserva, branchObj, cityObj, opcionesEntrega, opcionesDevolucion, modalEditarOpen, setModalEditarOpen, modalEditarSeccion, setModalEditarSeccion, localReserva, setLocalReserva, localSeguroIdx, setLocalSeguroIdx, localServiciosSeleccionados, setLocalServiciosSeleccionados, modalError, setModalError, modalDetallesOpen, setModalDetallesOpen, resumenMovilAbierto, setResumenMovilAbierto, resumenMovilRef, abrirModalEditar, cambiarReserva, toggleServicio, errorPaso1, setErrorPaso1, datosForm, setDatosForm, errores, setErrores, exito, setExito, reservaCreada, setReservaCreada, contratoFirmado, setContratoFirmado, datosPago, setDatosPago, redirigiendoPago, setRedirigiendoPago, errorPago, setErrorPago, hoverWompi, setHoverWompi, hoverEfectivo, setHoverEfectivo, fechaLimitePago, setFechaLimitePago, docsVerificados, setDocsVerificados, procesandoReserva, setProcesandoReserva, isSubmittingRef, idUsuarioDocs }
}
