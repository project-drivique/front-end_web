import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore }            from '../store/authStore'
import LandingPage                 from '../modules/landing/LandingPage'
import LoginPage                   from '../modules/auth/pages/LoginPage'
import RegistroPage                from '../modules/auth/pages/RegistroPage'
import RecuperarContrasenaPage     from '../modules/auth/pages/RecuperarContrasenaPage'
import NuevaContrasenaPage         from '../modules/auth/pages/NuevaContrasenaPage'
import Verificar2FAPage            from '../modules/auth/pages/Verificar2FAPage'
import CatalogoPage                from '../modules/catalog/pages/CatalogoPage'
import VehiculoDetallePage         from '../modules/catalog/pages/VehiculoDetallePage'
import ReservasPage                from '../modules/reservations/pages/ReservasPage'

function RutaPrivada({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? children : <Navigate to="/login" replace />
}

// Ruta especial: solo accesible si hay una sesión 2FA pendiente
function Ruta2FA({ children }) {
  const sesion2FA = useAuthStore((s) => s.sesion2FA)
  return sesion2FA ? children : <Navigate to="/login" replace />
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                    element={<LandingPage />} />
        <Route path="/login"               element={<LoginPage />} />
        <Route path="/registro"            element={<RegistroPage />} />
        <Route path="/recuperar"           element={<RecuperarContrasenaPage />} />
        <Route path="/nueva-contrasena"    element={<NuevaContrasenaPage />} />
        <Route path="/verificar-2fa"       element={<Ruta2FA><Verificar2FAPage /></Ruta2FA>} />
        <Route path="/catalogo"            element={<CatalogoPage />} />
        <Route path="/catalogo/:id"        element={<VehiculoDetallePage />} />
        <Route path="/reservations/:id"    element={<RutaPrivada><ReservasPage /></RutaPrivada>} />
        <Route path="*"                    element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}