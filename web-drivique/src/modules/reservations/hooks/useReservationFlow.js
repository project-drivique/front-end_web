import { useEffect } from 'react'



import { showAlert } from '@/utils/swalConfig'
import { reservationsService } from '@/services/reservationsService'


import { aCentavos } from '@/services/wompiService'
import { paymentFactory, PaymentContext } from '@/modules/payments/strategies'


import { promotionManagementService } from '../../../services/promotionManagementService'
import { diasDeAlquiler } from '../utils/pricing'

import { cotizarPrecio } from '@/services/pricingService'
import useReservationFlowLogic1 from './useReservationFlow/useReservationFlowLogic1'
import useReservationFlowLogic2 from './useReservationFlow/useReservationFlowLogic2'
import useReservationFlowLogic3 from './useReservationFlow/useReservationFlowLogic3'

export const TOTAL_PASOS = 3

const getItemPrice = (item) => Number(item?.precio ?? item?.dailyRate ?? item?.price ?? 0)

export const HORAS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, '0')
  return [`${h}:00`, `${h}:30`]
}).flat()

export function useReservationFlow() {
  const { t, navigate, usuario, actualizarUsuario, sedesCatalog, cargandoVehiculo, vehiculo, tarifaDiariaVehiculo, storageKey, cotizacion, setCotizacion, pantalla, setPantalla, seguroIdx, setSeguroIdx, serviciosSeleccionados, setServiciosSeleccionados, appliedPromotion, setAppliedPromotion, reserva, setReserva, branchObj, cityObj, opcionesEntrega, opcionesDevolucion, modalEditarOpen, setModalEditarOpen, modalEditarSeccion, setModalEditarSeccion, localReserva, setLocalReserva, localSeguroIdx, setLocalSeguroIdx, localServiciosSeleccionados, setLocalServiciosSeleccionados, modalError, setModalError, modalDetallesOpen, setModalDetallesOpen, resumenMovilAbierto, setResumenMovilAbierto, resumenMovilRef, abrirModalEditar, cambiarReserva, toggleServicio, errorPaso1, setErrorPaso1, datosForm, setDatosForm, errores, setErrores, exito, setExito, reservaCreada, setReservaCreada, contratoFirmado, setContratoFirmado, datosPago, setDatosPago, redirigiendoPago, setRedirigiendoPago, errorPago, setErrorPago, hoverWompi, setHoverWompi, hoverEfectivo, setHoverEfectivo, fechaLimitePago, setFechaLimitePago, docsVerificados, setDocsVerificados, procesandoReserva, setProcesandoReserva, isSubmittingRef, idUsuarioDocs } = useReservationFlowLogic1()

  const { irSiguiente, irAtras } = useReservationFlowLogic2({ navigate, pantalla, reserva, seguroIdx, setErrorPaso1, setPantalla, t, usuario })

  const { handleReservar, handleContratoFirmado } = useReservationFlowLogic3({ actualizarUsuario, appliedPromotion, branchObj, cotizacion, datosForm, docsVerificados, idUsuarioDocs, isSubmittingRef, navigate, procesandoReserva, reserva, sedesCatalog, seguroIdx, serviciosSeleccionados, setContratoFirmado, setDatosPago, setDocsVerificados, setErrores, setExito, setFechaLimitePago, setProcesandoReserva, setReservaCreada, storageKey, t, tarifaDiariaVehiculo, usuario, vehiculo })

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
      } catch {
        // Ignorar errores de sondeo
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [reservaCreada?.id, reservaCreada?.estado, reservaCreada?.status])

  const handlePagarConWompi = async () => {
    // Primero la sucursal valida los documentos y despues se puede pagar
    if (reservaCreada && (['PENDING_DOCUMENT_REVIEW', 'PENDIENTE_VALIDACION'].includes(reservaCreada.estado) || reservaCreada.status === 'PENDING_DOCUMENT_REVIEW')) {
      showAlert({
        icon: 'info',
        title: t('hc6.docs_en_revision_titulo', 'Documentos en revisión'),
        text: t('hc6.docs_en_revision_alerta', 'La sucursal aún está revisando tus documentos. Podrás pagar cuando sean aprobados.')
      })
      return
    }
    const infoPago = datosPago || (reservaCreada ? {
      referencia: reservaCreada.codigo || reservaCreada.id || reservaCreada.referencia,
      amountInCents: aCentavos(reservaCreada.total || 0)
    } : null)

    if (!infoPago || !infoPago.referencia) {
      showAlert({
        icon: 'warning',
        title: t('hc.informacion_de_pago_incompleta', 'Información de pago incompleta'),
        text: t('hc.no_se_pudo_recuperar_la_referencia_de_', 'No se pudo recuperar la referencia de la reserva para iniciar Wompi. Por favor intenta nuevamente.')
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
      const msg = err?.message || t('hc2.no_se_pudo_conectar_con_la_pasarela_de', 'No se pudo conectar con la pasarela de Wompi. Intenta de nuevo.')
      setErrorPago(msg)
      setRedirigiendoPago(false)
      showAlert({
        icon: 'error',
        title: t('hc.error_al_iniciar_pago_en_wompi', 'Error al iniciar pago en Wompi'),
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
          const rawDetail = error?.response?.data?.detail || error?.response?.data?.message || ''
          let friendlyDetail = rawDetail
          if (!friendlyDetail || friendlyDetail.toLowerCase().includes('conflicto con el estado actual') || friendlyDetail.toLowerCase().includes('conflict')) {
            friendlyDetail = t('promotions.couponRejectedDefault', 'Este cupón no se pudo aplicar a tu reserva. Es posible que ya lo hayas utilizado o no cumpla los requisitos de la reserva.')
          } else if (friendlyDetail.includes('Promotion already used')) {
            friendlyDetail = t('promotions.alreadyUsed', 'Ya has utilizado este cupón en una reserva anterior.')
          } else if (friendlyDetail.includes('Promotion is not active')) {
            friendlyDetail = t('promotions.notActive', 'El cupón no se encuentra activo o ha expirado.')
          } else if (friendlyDetail.includes('Promotion use limit reached')) {
            friendlyDetail = t('promotions.limitReached', 'Este cupón ha alcanzado el límite máximo de usos disponibles.')
          } else if (friendlyDetail.includes('Promotion conditions are not met')) {
            friendlyDetail = t('promotions.conditionsNotMet', 'La reserva no cumple las condiciones mínimas requeridas para este cupón.')
          }

          showAlert({
            icon: 'warning',
            title: t('promotions.couponCannotBeApplied', 'No se pudo aplicar el cupón'),
            text: friendlyDetail,
            confirmButtonText: t('common.accept', 'Aceptar')
          })
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
    procesandoReserva,
    cargandoVehiculo,
    usuario,
  }
}

