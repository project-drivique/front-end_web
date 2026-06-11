import TarjetaVehiculo from './TarjetaVehiculo'

export default function GridVehiculos({ vehiculosPagina = [], esFavorito, toggleFavorito, c, dias, invitado = false }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '20px', alignItems: 'start' }}>
      {vehiculosPagina.map(vehiculo => (
        <TarjetaVehiculo
          key={vehiculo.id}
          vehiculo={vehiculo}
          esFavorito={esFavorito(vehiculo.id)}
          onFavorito={() => toggleFavorito(vehiculo.id)}
          c={c}
          dias={dias}
          invitado={invitado}
        />
      ))}
    </div>
  )
}