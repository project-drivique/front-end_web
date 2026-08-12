import VehicleCard from './VehicleCard'

export default function GridVehiculos({
  vehiculosPagina = [],
  esFavorito = () => false,
  toggleFavorito = () => {},
  c,
  dias,
  invitado = false,
  onGuestBlocked = () => {},
  onGuestFavorito = () => {},
}) {
  return (
    <div
      className="vehicle-grid"
      style={{
        display: 'grid',
        gap: '14px',
        alignItems: 'stretch',
        width: '100%',
      }}
    >
      {vehiculosPagina.map((vehiculo) => (
        <VehicleCard
          key={vehiculo.id}
          vehiculo={vehiculo}
          esFavorito={esFavorito(vehiculo.id)}
          onFavorito={() => toggleFavorito(vehiculo.id)}
          c={c}
          dias={dias}
          invitado={invitado}
          onGuestBlocked={onGuestBlocked}
          onGuestFavorito={onGuestFavorito}
        />
      ))}
    </div>
  )
}