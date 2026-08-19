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

      {/* Contenedor principal dividido en Lado Izquierdo (Cols 1 y 2) y Lado Derecho (Col 3) para independizar alturas, pero alineado en tercios exactos */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        
        {/* Lado Izquierdo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Fila superior del lado izquierdo: 2 columnas exactamente iguales (1/3 de la pantalla cada una) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Columna 1: Galería */}
            <div style={{
              background: c?.cardBg || 'var(--bg-tarjeta)',
              border: `1px solid ${c?.cardBorder || 'var(--borde)'}`,
              borderRadius: 20, padding: 24,
              display: 'flex', flexDirection: 'column', gap: 16,
              boxShadow: c?.isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 6px 20px rgba(0,0,0,0.03)',
              boxSizing: 'border-box',
              height: '100%'
            }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: c.textPrimary, margin: 0, letterSpacing: '-0.02em' }}>
                {vehiculo.nombre}
              </h2>
              <ImageGallery
                imagenes={vehiculo.imagenes}
                nombreVehiculo={vehiculo.nombre}
                calificacion={vehiculo.comentarios?.length ? vehiculo.calificacion : 0}
                compact={true}
                stretchThumbnails={true}
                c={c}
              />
            </div>

            {/* Columna 2: Descripción + Sucursal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box', height: '100%', justifyContent: 'space-between' }}>
              <DescriptionSection descripcion={vehiculo.descripcion} id={vehiculo.id} c={c} />
              <BranchInfo sucursalInfo={vehiculo.sucursalInfo} c={c} />
            </div>
          </div>

          {/* Fila inferior del lado izquierdo: Pico y Placa ocupa ambas columnas */}
          <div style={{ boxSizing: 'border-box' }}>
            <PicoYPlacaChecker c={c} compact={true} vehiculo={vehiculo} />
          </div>
        </div>

        {/* Lado Derecho (Columna 3: exactamente 1/3 de la pantalla) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, boxSizing: 'border-box' }}>
          {/* Características */}
          <VehicleCharacteristics vehiculo={vehiculo} c={c} showIcon={true} compact={true} />
          
          {/* Requisitos para Rentar */}
          <RentalRequirements vehiculo={vehiculo} c={c} compact={true} />
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

