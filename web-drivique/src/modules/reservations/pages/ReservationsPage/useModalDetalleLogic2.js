import { showAlert, getErrorMessage } from '@/utils/swalConfig'
import { aCentavos, construirUrlCheckout } from '@/services/wompiService'

export default function useModalDetalleLogic2({ contrato, isPendingDocs, isPendingSchedule, reserva, reservaOriginal, setPagandoWompi, t }) {
  const handlePagarWompi = async (e) => {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }
  
      if (
        isPendingDocs ||
        reserva.estado === 'PENDING_DOCUMENT_REVIEW' ||
        reserva.status === 'PENDING_DOCUMENT_REVIEW' ||
        reservaOriginal?.estado === 'PENDING_DOCUMENT_REVIEW' ||
        reserva.estado === 'pendiente_documentos' ||
        reserva.estadoDocumentos === 'PENDIENTE'
      ) {
        showAlert({
          icon: 'info',
          title: t('hc6.docs_en_revision_titulo', { defaultValue: 'Documentos en revisión' }),
          text: t('hc6.docs_en_revision_alerta', {
            defaultValue: 'La sucursal aún está revisando tus documentos. Podrás pagar una vez que sean aprobados por el encargado de la sucursal.'
          })
        })
        return
      }
  
      if (
        isPendingSchedule ||
        reserva.estado === 'PENDING_SCHEDULE' ||
        reserva.status === 'PENDING_SCHEDULE' ||
        reserva.estado === 'pendiente_horario'
      ) {
        showAlert({
          icon: 'info',
          title: t('reservas.pendingScheduleTitle', { defaultValue: 'En espera de horario' }),
          text: t('reservas.pendingScheduleText', {
            defaultValue: 'Tu reserva fue registrada fuera del horario de atención de la sucursal. Se habilitará para pago al inicio de la jornada de atención.'
          })
        })
        return
      }
      setPagandoWompi(true)
      try {
        const baseRef = reserva.codigo || reserva.referencia || reserva.id || reservaOriginal?.referencia
        const attemptRef = `${baseRef}_${Date.now()}`
        sessionStorage.setItem('current_wompi_reference', baseRef)
        sessionStorage.setItem('current_wompi_attempt_ref', attemptRef)
        const rawTotal = reserva.total ?? reservaOriginal?.total ?? 0
        const totalNum = typeof rawTotal === 'number' ? rawTotal : parseFloat(String(rawTotal).replace(/[^0-9.-]+/g, '')) || 0
        const centavos = aCentavos(totalNum)
        const url = await construirUrlCheckout({
          reference: attemptRef,
          contractId: contrato?.id || null,
          amountInCents: centavos,
          redirectUrl: `${window.location.origin}/respuesta`,
        })
        window.location.href = url
      } catch (err) {
        console.error('Error al generar enlace Wompi:', err)
        setPagandoWompi(false)
        showAlert({
          icon: 'error',
          title: t('common.error', 'Error'),
          text: getErrorMessage(err, t('reservas.wompiError', { defaultValue: 'No se pudo conectar con la pasarela de pagos de Wompi. Por favor intenta nuevamente.' }))
        })
      }
    }
  
    const formatHoraAmPm = (hora24) => {
      if (!hora24) return ''
      const [h, m] = hora24.split(':').map(Number)
      const ampm = h >= 12 ? 'p. m.' : 'a. m.'
      let hour12 = h % 12
      if (hour12 === 0) hour12 = 12
      return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`
    }

  return { handlePagarWompi, formatHoraAmPm }
}
