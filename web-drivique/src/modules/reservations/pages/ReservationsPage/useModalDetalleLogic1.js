import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useBrand } from '@/contexts/BrandContext'
import { useAuthStore } from '@/store/authStore'
import { useState, useMemo, useRef, useEffect } from 'react'
import { showAlert } from '@/utils/swalConfig'
import { SUCURSALES } from '@/modules/catalog/constants'
import { contractService } from '@/services/contractService'
import filtrosReservas from '@/config/datos/reservationsFilters.json'

function useContratoReal(reservationId) {
  const [contract, setContract] = useState(null)
  useEffect(() => {
    if (!reservationId) return
    contractService.obtenerPorReserva(reservationId).then(setContract).catch(() => setContract(null))
  }, [reservationId])
  return contract
}
const CLASES_ESTADO = {
  ...Object.fromEntries(filtrosReservas.estados.map(({ valor, clase }) => [valor, clase])),
  pendiente_pago: 'estado-pendiente-pago',
  pending_payment: 'estado-pendiente-pago',
  PENDING_PAYMENT: 'estado-pendiente-pago',
  pendiente_firma: 'estado-pendiente-firma',
  pending_signature: 'estado-pendiente-firma',
  PENDING_SIGNATURE: 'estado-pendiente-firma',
  pendiente_documentos: 'estado-pendiente',
  pendiente_horario: 'estado-pendiente',
  pendiente_efectivo: 'estado-pendiente',
  PENDING_DOCUMENT_REVIEW: 'estado-pendiente',
  PENDING_SCHEDULE: 'estado-pendiente',
  CONFIRMED: 'estado-confirmada',
  ACTIVE: 'estado-en-curso',
  COMPLETED: 'estado-finalizada',
  CANCELLED: 'estado-cancelada',
  CANCELLED_TIMEOUT: 'estado-cancelada',
}

export default function useModalDetalleLogic1({ autoDesbloquear, onCancelar, onClose, reserva }) {
  const navigate = useNavigate()
    const { t, i18n } = useTranslation()
    const { brand } = useBrand() || {}
    const usuario = useAuthStore(state => state.usuario)
    const [cancelando, setCancelando] = useState(false)
  
    const contrato = useContratoReal(reserva.id)
    const reservaOriginal = contrato?.contratoOriginal?.reserva
    const vehiculoOriginal = contrato?.contratoOriginal?.vehiculo || reserva.vehiculo
  
    const backendStatus = String(reserva.status || reserva.estadoRaw || '').toUpperCase()
    const isPendingPayment = backendStatus === 'PENDING_PAYMENT' || reserva.estado === 'PENDING_PAYMENT' || reserva.estado === 'pendiente_pago'
    const isPendingDocs = backendStatus === 'PENDING_DOCUMENT_REVIEW' || reserva.estado === 'PENDING_DOCUMENT_REVIEW' || reserva.estado === 'pendiente_documentos'
    const isPendingSchedule = backendStatus === 'PENDING_SCHEDULE' || reserva.estado === 'PENDING_SCHEDULE' || reserva.estado === 'pendiente_horario'
  
    const esEfectivo = Boolean(reserva.cashPaymentCode) || Boolean(reservaOriginal?.cashPaymentCode) || (reserva.metodoPago === 'efectivo' && !isPendingPayment)
    const rawEstadoModal = backendStatus || reservaOriginal?.estado || reserva.estado || ''
    const estadoNormModal = String(rawEstadoModal).toLowerCase()
    const contratoData = contrato
    const tieneContratoFirmado = Boolean(
      contratoData?.signatureUrl ||
      contratoData?.signedAt ||
      contratoData?.statusCode === 'ACTIVE' ||
      contratoData?.firmaUsuarioDataUrl
    )
  
    const esPagoConfirmadoModal =
      backendStatus === 'CONFIRMED' ||
      backendStatus === 'ACTIVE' ||
      backendStatus === 'COMPLETED' ||
      backendStatus === 'IN_PROGRESS' ||
      backendStatus === 'PENDING_SIGNATURE' ||
      estadoNormModal === 'confirmada' ||
      estadoNormModal === 'confirmed' ||
      estadoNormModal === 'activa' ||
      estadoNormModal === 'active' ||
      estadoNormModal === 'en_curso' ||
      estadoNormModal === 'en curso' ||
      estadoNormModal === 'finalizada' ||
      estadoNormModal === 'completada' ||
      estadoNormModal === 'completed' ||
      estadoNormModal === 'pagada' ||
      reservaOriginal?.pagoEstado === 'aprobado' ||
      reserva.pagoEstado === 'aprobado' ||
      Boolean(reservaOriginal?.fechaPagoConfirmado) ||
      Boolean(reserva.fechaPagoConfirmado)
  
    const esFinalizadaModal = ['finalizada', 'completada', 'finalizado', 'completado', 'completed'].includes(estadoNormModal) || backendStatus === 'COMPLETED'
  
    // Solo se cancela mientras no hay pago: pendiente de pago, en revisión de documentos o en espera del horario de la sucursal.
    // Con la reserva ya pagada, confirmada, en curso o finalizada el botón no se ofrece.
    const puedeCancelarModal = isPendingPayment || isPendingDocs || isPendingSchedule
  
    const handleCancelarReserva = async () => {
      const result = await showAlert({
        icon: 'warning',
        title: t('reservas.cancelTitle', { defaultValue: '¿Cancelar reserva?' }),
        text: t('reservas.cancelConfirmText', { defaultValue: '¿Estás seguro de que deseas cancelar esta reserva? Esta acción liberará el vehículo.' }),
        showCancelButton: true,
        confirmButtonText: t('reservas.yesCancel', { defaultValue: 'Sí, cancelar reserva' }),
        cancelButtonText: t('common.no', { defaultValue: 'No, mantener' }),
        confirmButtonColor: '#dc2626'
      })
      if (result?.isConfirmed) {
        setCancelando(true)
        try {
          await onCancelar(reserva.id)
          await showAlert({
            icon: 'success',
            title: t('reservas.cancelledTitle', { defaultValue: 'Reserva cancelada' }),
            text: t('reservas.cancelledDesc', { defaultValue: 'La reserva ha sido cancelada exitosamente.' })
          })
          onClose()
        } catch (err) {
          await showAlert({
            icon: 'error',
            title: t('common.error', { defaultValue: 'Error' }),
            text: err?.message || 'No se pudo cancelar la reserva.'
          })
        } finally {
          setCancelando(false)
        }
      }
    }
  
    // Regla estricta: Si no se ha firmado el contrato, la reserva NO debe salir confirmada
    const requiereFirmaModal = (backendStatus === 'PENDING_SIGNATURE' || esPagoConfirmadoModal) && !tieneContratoFirmado && !esFinalizadaModal
    const esConfirmadaModal = esPagoConfirmadoModal && (tieneContratoFirmado || esFinalizadaModal) && !requiereFirmaModal
  
    const esRawEnCursoModal =
      estadoNormModal === 'activa' ||
      estadoNormModal === 'active' ||
      estadoNormModal === 'en_curso' ||
      estadoNormModal === 'en curso' ||
      backendStatus === 'ACTIVE' ||
      backendStatus === 'IN_PROGRESS'
    const estaEnCursoModal = esRawEnCursoModal || estadoNormModal === 'en_curso' || estadoNormModal === 'activa'
  
    const estadoClaveModal = requiereFirmaModal
      ? 'PENDING_SIGNATURE'
      : (esConfirmadaModal
        ? (estaEnCursoModal ? 'activa' : (esFinalizadaModal ? 'finalizada' : 'confirmada'))
        : (isPendingPayment
          ? 'PENDING_PAYMENT'
          : (isPendingDocs
            ? 'PENDING_DOCUMENT_REVIEW'
            : (isPendingSchedule
              ? 'PENDING_SCHEDULE'
              : (reserva.estado || 'pendiente')))))
  
    const estado = {
      texto: t(`reservas.statuses.${estadoClaveModal}`, { defaultValue: t(`reservas.statuses.${reserva.estado}`, { defaultValue: t('reservas.statuses.pendiente') }) }),
      clase: CLASES_ESTADO[estadoClaveModal] || CLASES_ESTADO[reserva.estado] || CLASES_ESTADO.pendiente
    }
  
    const nombreAuto = reserva.vehiculo?.nombre || vehiculoOriginal?.nombre || (reserva.vehiculo?.marca ? `${reserva.vehiculo.marca} ${reserva.vehiculo.modelo || ''}` : t('hc2.vehiculo', 'Vehículo'))
    const imagenAuto = reserva.vehiculo?.imagenes?.[0] || vehiculoOriginal?.imagenes?.[0] || reserva.vehiculo?.imagen || vehiculoOriginal?.imagen
    const seguroIdx = reservaOriginal?.seguroIdx ?? reserva.seguroIdx ?? 0
    const proteccion = reserva.seguroNombre || reserva.reservaDetalles?.seguro || (vehiculoOriginal?.seguros?.[seguroIdx]?.nombre) || reservaOriginal?.reservaDetalles?.seguro || t('hc2.proteccion_basica_estandar', 'Protección Básica Estándar')
    const esDocumentosRechazados = !esConfirmadaModal && (
      reserva.estado === 'DOCUMENTOS_RECHAZADOS' ||
      backendStatus === 'DOCUMENTOS_RECHAZADOS' ||
      reservaOriginal?.estado === 'DOCUMENTOS_RECHAZADOS' ||
      reserva.estadoDocumentos === 'RECHAZADO' ||
      reservaOriginal?.estadoDocumentos === 'RECHAZADO'
    )
    const esPendienteHorario = !esConfirmadaModal && !isPendingPayment && !esDocumentosRechazados && (
      isPendingSchedule ||
      reserva.estado === 'PENDIENTE_HORARIO' ||
      reserva.estado === 'pendiente_horario'
    )
    const esPendienteValidacion = !esConfirmadaModal && !isPendingPayment && !esPendienteHorario && !esDocumentosRechazados && (
      isPendingDocs ||
      reserva.estado === 'PENDIENTE_VALIDACION' ||
      reserva.estado === 'pendiente_documentos' ||
      (reservaOriginal?.estado === 'PENDING_DOCUMENT_REVIEW' && !backendStatus) ||
      (reservaOriginal?.estadoDocumentos === 'PENDIENTE' && !backendStatus)
    )
  
    // Si el pago ya se confirmó (aunque falte firmar el contrato) no se muestra nada de "pendiente de pago" ni su plazo
    const esPendienteEfectivo = !esPagoConfirmadoModal && !esConfirmadaModal && !esPendienteValidacion && !esPendienteHorario && !esDocumentosRechazados && (
      reserva.estado === 'PENDIENTE_EFECTIVO' ||
      Boolean(reserva.cashPaymentCode) ||
      Boolean(reservaOriginal?.cashPaymentCode) ||
      (esEfectivo && (estadoNormModal === 'pendiente' || !reserva.estado))
    )
    const esPendienteWompi = !esEfectivo && !esPendienteEfectivo && !esPagoConfirmadoModal && !esConfirmadaModal && !esPendienteValidacion && !esPendienteHorario && !esDocumentosRechazados && (
      isPendingPayment ||
      estadoNormModal === 'pendiente' ||
      estadoNormModal === 'pending_payment' ||
      reserva.estado === 'PENDING_PAYMENT'
    )
  
    const sucursalPago = reservaOriginal?.reservaDetalles?.sucursalPagoEfectivo || reserva.vehiculo?.sucursal || ''
    const branchObj = SUCURSALES.find(s => s.nombre === sucursalPago)
    const ciudadPago = branchObj?.ciudad || reserva.vehiculo?.ciudad || 'Neiva'
    const direccionPago = branchObj?.direccion || 'Calle 9 # 8-25, Centro'
  
    // Normalización completa de la reserva para el contrato oficial
    const reservaParaContrato = useMemo(() => {
      const base = contrato?.contratoOriginal?.reserva || reservaOriginal || reserva || {}
      const df = base.datosForm || {}
      const rd = base.reservaDetalles || {}
      const nombreCliente = df.nombre || [df.nombres, df.apellidos].filter(Boolean).join(' ').trim() || base.clienteNombre || usuario?.nombre || t('hc2.cliente_drivique', 'Cliente Drivique')
      const correoCliente = df.correo || base.clienteCorreo || usuario?.correo || usuario?.email || ''
      const telCliente = df.celular || df.telefono || base.clienteTelefono || usuario?.telefono || ''
      const docCliente = df.numDoc || df.documento || base.clienteDocumento || usuario?.cedula || ''
      const ref = base.referencia || base.codigo || base.id || reserva.id
  
      const licName = df.licenciaPdf?.name || (typeof df.licenciaPdf === 'string' && df.licenciaPdf) 
      const cedName = df.cedulaPdf?.name || (typeof df.cedulaPdf === 'string' && df.cedulaPdf) 
  
      return {
        ...base,
        referencia: ref,
        codigo: ref,
        id: ref,
        total: base.total || base.totalCOP || reserva.total || 0,
        seguroIdx: base.seguroIdx ?? reserva.seguroIdx ?? 0,
        serviciosSeleccionados: base.serviciosSeleccionados || reserva.serviciosSeleccionados || [],
        datosForm: {
          ...df,
          nombre: nombreCliente,
          correo: correoCliente,
          celular: telCliente,
          telefono: telCliente,
          tipoDoc: df.tipoDoc || usuario?.tipoDocumento || 'CC',
          numDoc: docCliente,
          cedulaPdf: cedName,
          licenciaPdf: licName,
          direccion: df.direccion || usuario?.direccion || ''
        },
        reservaDetalles: {
          ...rd,
          fechaInicio: rd.fechaInicio || reserva.fechaInicio,
          fechaFin: rd.fechaFin || reserva.fechaFin,
          horaInicio: rd.horaInicio || '08:00',
          horaFin: rd.horaFin || '18:00',
          sucursalRetiro: rd.sucursalRetiro || reserva.sucursalRetiro || reserva.sucursal || reserva.vehiculo?.sucursal || '',
          sucursalDevolucion: rd.sucursalDevolucion || reserva.sucursalDevolucion || reserva.sucursal || reserva.vehiculo?.sucursal || '',
          metodoPago: rd.metodoPago || reserva.metodoPago || reserva.pasarela || (reserva.metodoPago === 'efectivo' ? 'efectivo' : 'tarjeta'),
          sucursalPagoEfectivo: rd.sucursalPagoEfectivo || reserva.sucursalPagoEfectivo || reserva.sucursal || reserva.vehiculo?.sucursal || ''
        }
      }
    }, [reserva, contrato, reservaOriginal, usuario])
  
    const totalCalculado = useMemo(() => {
      const rawTotal = Number(reserva.total || reservaOriginal?.total || reservaOriginal?.totalCOP || reservaParaContrato?.total || reserva.totalCOP || 0)
      if (rawTotal > 0) return rawTotal
  
      const v = reserva.vehiculo || vehiculoOriginal
      const precioDia = v?.precioDiario || v?.precio || 0
      const fInicio = reserva.fechaInicio || reserva.reservaDetalles?.fechaInicio
      const fFin = reserva.fechaFin || reserva.reservaDetalles?.fechaFin
      if (precioDia && fInicio && fFin) {
        const f1 = fInicio.split('T')[0]
        const f2 = fFin.split('T')[0]
        const diffDays = f1 === f2 ? 1 : Math.max(1, Math.round(Math.abs(new Date(`${f2}T00:00:00`) - new Date(`${f1}T00:00:00`)) / 86400000) + 1)
        return diffDays * precioDia
      }
      return rawTotal
    }, [reserva, reservaOriginal, reservaParaContrato, vehiculoOriginal])
  
    // Normalización completa del vehículo para el contrato oficial
  
    // Resolver Lugar de Retiro y Devolución
    const resolverLugar = (loc, dom) => {
      if (!loc) return sucursalPago
      if (loc === 'domicilio') {
        return dom ? `${t('reservas.atHome', 'A Domicilio')} (${dom})` : t('reservas.atHome', 'A Domicilio')
      }
      if (loc === 'aeropuerto') return 'Aeropuerto'
      if (loc === 'terminal') return 'Terminal'
      return loc
    }
  
    const lugarRetiroRaw = reserva.sucursalRetiro || reservaOriginal?.sucursalRetiro || reservaOriginal?.reservaDetalles?.sucursalRetiro || reserva.vehiculo?.sucursal || vehiculoOriginal?.sucursal || sucursalPago
    const domicilioRetiro = reserva.domicilioDireccion || reservaOriginal?.domicilioDireccion || reservaOriginal?.reservaDetalles?.domicilioDireccion
  
    const lugarDevolucionRaw = reserva.sucursalDevolucion || reservaOriginal?.sucursalDevolucion || reservaOriginal?.reservaDetalles?.sucursalDevolucion || lugarRetiroRaw
    // Si el retiro es a domicilio pero la devolución es en sucursal, no se arrastra la dirección del retiro
    const domicilioDevolucion = reserva.domicilioDevolucionDireccion || reservaOriginal?.domicilioDevolucionDireccion || (lugarDevolucionRaw === 'domicilio' ? domicilioRetiro : undefined)
  
    const lugarRetiro = resolverLugar(lugarRetiroRaw, domicilioRetiro)
    const lugarDevolucion = resolverLugar(lugarDevolucionRaw, domicilioDevolucion)
  
    const esDomicilioRetiro = lugarRetiroRaw === 'domicilio' || Boolean(domicilioRetiro)
    const esDomicilioDevolucion = lugarDevolucionRaw === 'domicilio' || Boolean(domicilioDevolucion)
    const esDomicilio = esDomicilioRetiro || esDomicilioDevolucion
  
    // Logística del domicilio según el servidor: conductor, estado y PIN (el PIN solo lo recibe el dueño de la reserva)
    const puntosDomicilio = (reserva.deliveryPoints || reservaOriginal?.deliveryPoints || []).filter((p) => p.modality === 'HOME_DELIVERY')
    const puntoActivo = puntosDomicilio.find((p) => p.deliveryStatus !== 'COMPLETED') || puntosDomicilio[puntosDomicilio.length - 1] || null
    const domicilioEstado = !puntoActivo || puntoActivo.deliveryStatus === 'PENDING'
      ? 'EN_PREPARACION'
      : puntoActivo.deliveryStatus === 'ASSIGNED'
        ? 'EN_CAMINO'
        : (puntoActivo.pointType === 'PICKUP' ? 'ENTREGADO' : 'RECOGIDO')
    const domicilioConductor = puntoActivo?.driverName || ''
    const domicilioTelefonoConductor = puntoActivo?.driverPhone || ''
    const domicilioPin = puntoActivo?.deliveryPin || ''
  
    const [revelarPin, setRevelarPin] = useState(false)
    const [verMasDomicilio, setVerMasDomicilio] = useState(false)
  
    // Resolver Medio / Canal de Pago
    const resolverMedioPago = () => {
      const rawEfectivo =
        esEfectivo ||
        reserva.metodoPago === 'efectivo' ||
        reservaOriginal?.reservaDetalles?.metodoPago === 'efectivo' ||
        reserva.metodoPagoConfirmado === 'efectivo' ||
        reservaOriginal?.metodoPagoConfirmado === 'efectivo' ||
        reserva.estado === 'PENDIENTE_EFECTIVO' ||
        reservaOriginal?.estado === 'PENDIENTE_EFECTIVO' ||
        reserva.pasarela === 'efectivo'
  
      if (rawEfectivo) {
        return t('hc2.efectivo_en_sucursal_245', 'Efectivo en sucursal')
      }
  
      const sub = String(
        reserva.medioPago ||
        reserva.subMetodoPago ||
        reserva.metodoPagoDetalle ||
        reserva.tipoPago ||
        reserva.wompiMetodo ||
        reserva.pasarelaMetodo ||
        reserva.formaPago ||
        reservaOriginal?.medioPago ||
        reservaOriginal?.subMetodoPago ||
        reservaOriginal?.reservaDetalles?.subMetodoPago ||
        reservaOriginal?.reservaDetalles?.medioPago ||
        ''
      ).toLowerCase().trim()
  
      if (sub.includes('nequi')) return t('hc2.pago_wompi_nequi', 'Pago Wompi - Nequi')
      if (sub.includes('daviplata')) return t('hc2.pago_wompi_daviplata', 'Pago Wompi - Daviplata')
      if (sub.includes('efectivo') && sub.includes('bancolombia')) return t('hc2.pago_wompi_efectivo_bancolombia', 'Pago Wompi - Efectivo Bancolombia')
      if (sub.includes('bancolombia')) return t('hc2.pago_wompi_bancolombia', 'Pago Wompi - Bancolombia')
      if (sub.includes('pse')) return t('hc2.pago_wompi_pse', 'Pago Wompi - PSE')
      if (sub.includes('tarjeta') || sub.includes('card') || sub.includes('credito') || sub.includes('debito')) return t('hc2.pago_wompi_tarjeta', 'Pago Wompi - Tarjeta')
  
      if (sub && sub !== 'wompi' && sub !== 'digital') {
        return t('hc3.wompi_method', { defaultValue: 'Pago Wompi - {{metodo}}', metodo: sub.charAt(0).toUpperCase() + sub.slice(1) })
      }
  
      return t('hc2.pago_wompi', 'Pago Wompi')
    }
  
    const medioPagoTexto = resolverMedioPago()
  
    const [pagandoWompi, setPagandoWompi] = useState(false)
    const wompiCardRef = useRef(null)
  
    useEffect(() => {
      if (isPendingPayment || autoDesbloquear) {
        const timer = setTimeout(() => {
          wompiCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }, 300)
        return () => clearTimeout(timer)
      }
    }, [isPendingPayment, autoDesbloquear])

  return { navigate, t, i18n, brand, cancelando, contrato, reservaOriginal, isPendingDocs, isPendingSchedule, esFinalizadaModal, puedeCancelarModal, handleCancelarReserva, requiereFirmaModal, esConfirmadaModal, estaEnCursoModal, estado, nombreAuto, imagenAuto, proteccion, esDocumentosRechazados, esPendienteHorario, esPendienteValidacion, esPendienteEfectivo, esPendienteWompi, sucursalPago, ciudadPago, direccionPago, totalCalculado, domicilioRetiro, domicilioDevolucion, lugarRetiro, lugarDevolucion, esDomicilioRetiro, esDomicilioDevolucion, esDomicilio, domicilioEstado, domicilioConductor, domicilioTelefonoConductor, domicilioPin, revelarPin, setRevelarPin, verMasDomicilio, setVerMasDomicilio, medioPagoTexto, pagandoWompi, setPagandoWompi, wompiCardRef }
}
