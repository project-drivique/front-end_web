import UnifiedReservationConfigCard from './UnifiedReservationConfigCard'
import SideSummary from './SideSummary'

export default function ReservationStep1({
  vehiculo,
  c,
  reserva,
  cambiarReserva,
  seguroIdx,
  serviciosSeleccionados,
  abrirModalEditar,
  pantalla,
  onContinuar,
  appliedPromotion,
  onApplyPromotion,
  onRemovePromotion
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Grid: Configuración de Reserva (Lado Izquierdo) + Resumen (Lado Derecho) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Configuración de Reserva */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <UnifiedReservationConfigCard
            vehiculo={vehiculo}
            reserva={reserva}
            onCambio={cambiarReserva}
            c={c}
          />
        </div>

        {/* Resumen lateral de Reserva */}
        <div className="hidden lg:block lg:col-span-1">
          <SideSummary
            vehiculo={vehiculo}
            reserva={reserva}
            seguroIdx={seguroIdx}
            serviciosSeleccionados={serviciosSeleccionados}
            onEditar={abrirModalEditar}
            onContinuar={onContinuar}
            pantalla={pantalla}
            appliedPromotion={appliedPromotion}
            onApplyPromotion={onApplyPromotion}
            onRemovePromotion={onRemovePromotion}
            c={c}
          />
        </div>
      </div>
    </div>
  )
}
