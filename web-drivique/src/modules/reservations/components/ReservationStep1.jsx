import ImageGallery from '../../catalog/components/detail/ImageGallery'
import DescriptionSection from '../../catalog/components/detail/DescriptionSection'
import BranchInfo from '../../catalog/components/detail/BranchInfo'
import VehicleCharacteristics from '../../catalog/components/detail/VehicleCharacteristics'
import UnifiedReservationConfigCard from './UnifiedReservationConfigCard'
import SideSummary from './SideSummary'
import PicoYPlacaChecker from './PicoYPlacaChecker'
import RentalRequirements from '../../catalog/components/detail/RentalRequirements'

export default function ReservationStep1({ vehiculo, c, esModoOscuro, reserva, cambiarReserva, seguroIdx, serviciosSeleccionados, abrirModalEditar, pantalla, onContinuar }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Grid superior: galería / descripción / características */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Columnas 1-2: galería + descripción/sucursal */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>

            {/* Galería */}
            <div style={{
              background: c?.cardBg || 'var(--bg-tarjeta)',
              border: `1px solid ${c?.cardBorder || 'var(--borde)'}`,
              borderRadius: 20, padding: 24,
              display: 'flex', flexDirection: 'column', gap: 16,
              alignSelf: 'stretch',
              boxShadow: c?.isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 6px 20px rgba(0,0,0,0.03)',
            }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: c.textPrimary, margin: 0, letterSpacing: '-0.02em' }}>
                {vehiculo.nombre}
              </h2>
              <ImageGallery
                imagenes={vehiculo.imagenes}
                nombreVehiculo={vehiculo.nombre}
                calificacion={vehiculo.comentarios?.length ? vehiculo.calificacion : 0}
                c={c}
              />
            </div>

            {/* Descripción + Sucursal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <DescriptionSection descripcion={vehiculo.descripcion} id={vehiculo.id} c={c} />
              <BranchInfo sucursalInfo={vehiculo.sucursalInfo} c={c} />
            </div>
          </div>



          {/* Pico y Placa */}
          <div>
            <PicoYPlacaChecker c={c} />
          </div>
        </div>

        {/* Columna 3: Características y Requisitos */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <VehicleCharacteristics vehiculo={vehiculo} c={c} showIcon={false} compact={true} />
          <RentalRequirements c={c} />
        </div>
      </div>


      {/* Separador */}
      <hr style={{ border: 0, borderTop: `1px solid ${c.cardBorder}`, margin: '4px 0' }} />

      {/* Grid inferior: configuración + resumen lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Configuración (2 columnas) */}
        <div className="lg:col-span-2">
          <UnifiedReservationConfigCard
            vehiculo={vehiculo}
            reserva={reserva}
            onCambio={cambiarReserva}
            c={c}
          />
        </div>

        {/* Resumen lateral (1 columna) — solo informativo en paso 1 */}
        <div className="lg:col-span-1">
          <SideSummary
            vehiculo={vehiculo}
            reserva={reserva}
            seguroIdx={seguroIdx}
            serviciosSeleccionados={serviciosSeleccionados}
            onEditar={abrirModalEditar}
            onContinuar={onContinuar}
            pantalla={pantalla}
            c={c}
          />
        </div>
      </div>
    </div>
  )
}

