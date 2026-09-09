import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import VehicleDetailsModal from '../components/VehicleDetailsModal'
import CatalogPage from './CatalogPage'
import UserCatalogPage from './UserCatalogPage'

export default function VehicleDetailsPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  const token = useAuthStore((s) => s.token)
  const usuario = useAuthStore((s) => s.usuario)
  const esAutenticado = Boolean(token && usuario)

  const fromParam = searchParams.get('from')
  const fromState = location.state?.from

  const esDesdeSucursales =
    fromParam === 'sucursales' ||
    fromState === '/sucursales' ||
    (typeof fromState === 'string' && fromState.includes('/sucursales'))

  const handleCerrarModal = () => {
    if (esDesdeSucursales) {
      const sucursalTarget = searchParams.get('sucursal') || location.state?.sucursal || sessionStorage.getItem('drivique_sucursal_activa')
      const q = sucursalTarget ? `?sucursal=${encodeURIComponent(sucursalTarget)}` : ''
      navigate(`/sucursales${q}`, {
        state: { sucursal: sucursalTarget, from: '/sucursales' }
      })
    } else {
      navigate(esAutenticado ? '/home' : '/catalogo')
    }
  }

  const descuentoParam = searchParams.get('descuento')
  const promoCode = searchParams.get('promo')

  return (
    <>
      {/* Background Page */}
      {esAutenticado ? <UserCatalogPage /> : <CatalogPage />}

      {/* Vehicle Details Modal Overlay */}
      <VehicleDetailsModal
        isOpen={true}
        vehiculoId={id}
        descuentoParam={descuentoParam}
        promoCode={promoCode}
        onClose={handleCerrarModal}
      />
    </>
  )
}
