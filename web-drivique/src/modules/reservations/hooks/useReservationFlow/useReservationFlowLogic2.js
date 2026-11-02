import { showAlert } from '@/utils/swalConfig'

const TOTAL_PASOS = 3

export default function useReservationFlowLogic2({ navigate, pantalla, reserva, seguroIdx, setErrorPaso1, setPantalla, t, usuario }) {
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
  
        const ahoraDate = new Date();
        const hoyLocalStr = `${ahoraDate.getFullYear()}-${String(ahoraDate.getMonth() + 1).padStart(2, '0')}-${String(ahoraDate.getDate()).padStart(2, '0')}`;
        const ahoraMins = ahoraDate.getHours() * 60 + ahoraDate.getMinutes();
  
        if (reserva.fechaInicio === hoyLocalStr && reserva.horaInicio) {
          const [hR, mR] = reserva.horaInicio.split(':').map(Number);
          if (hR * 60 + mR <= ahoraMins) {
            mostrarAlerta(t('reservas.errorHoraRetiroPasada', 'La hora de retiro seleccionada ya ha transcurrido. Por favor selecciona una hora posterior.'));
            return;
          }
        }
  
        if (reserva.fechaFin === hoyLocalStr && reserva.horaFin) {
          const [hD, mD] = reserva.horaFin.split(':').map(Number);
          if (hD * 60 + mD <= ahoraMins) {
            mostrarAlerta(t('reservas.errorHoraDevolucionPasada', 'La hora de devolución seleccionada ya ha transcurrido. Por favor selecciona una hora posterior.'));
            return;
          }
        }
  
        if (reserva.fechaInicio === reserva.fechaFin && reserva.horaInicio && reserva.horaFin) {
          const [hR, mR] = reserva.horaInicio.split(':').map(Number);
          const [hD, mD] = reserva.horaFin.split(':').map(Number);
          if (hD * 60 + mD < hR * 60 + mR) {
            mostrarAlerta(t('reservas.errorDevolucionAntesRetiro', 'La hora de devolución no puede ser anterior a la hora de retiro para el mismo día.'));
            return;
          }
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

  return { irSiguiente, irAtras }
}
