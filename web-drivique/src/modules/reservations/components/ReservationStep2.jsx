import ProtectionPlans from './ProtectionPlans'
import MileageType from './MileageType'
import AdditionalServices from './AdditionalServices'

export default function ReservationStep2({ vehiculo, c, seguroIdx, setSeguroIdx, reserva, cambiarReserva, serviciosSeleccionados, toggleServicio }) {
  const dias = reserva.fechaInicio && reserva.fechaFin
    ? Math.max(1, Math.ceil((new Date(reserva.fechaFin) - new Date(reserva.fechaInicio)) / 86400000))
    : 1;

  return (
    <>
      <div id="campo-grupo">
        <ProtectionPlans seguroIdx={seguroIdx} onSeleccionar={setSeguroIdx} c={c} dias={dias} />
        <div style={{ marginTop: 40 }}>
          <MileageType
            vehiculo={vehiculo}
            tipoKm={reserva.tipoKm}
            onSeleccionar={val => cambiarReserva('tipoKm', val)}
            c={c}
            dias={dias}
          />
        </div>
      </div>
      <div id="campo-servicios" style={{ marginTop: 32 }}>
        <AdditionalServices
          servicios={vehiculo.servicios}
          seleccionados={serviciosSeleccionados}
          onToggle={toggleServicio}
          c={c}
          dias={dias}
        />
      </div>
    </>
  )
}

