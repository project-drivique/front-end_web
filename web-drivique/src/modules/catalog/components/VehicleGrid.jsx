import VehicleCard from './VehicleCard'

export default function GridVehiculos({
  vehiculosPagina,
  vehiculos,
  esFavorito = () => false,
  toggleFavorito = () => {},
  c,
  dias,
  invitado = false,
  onGuestBlocked = () => {},
  onGuestFavorito = () => {},
}) {
  const lista = (vehiculosPagina && vehiculosPagina.length > 0) ? vehiculosPagina : (vehiculos || [])

  return (
    <div
      className="vehicle-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px',
        alignItems: 'stretch',
        width: '100%',
      }}
    >
      {lista.map((vehiculo) => (
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