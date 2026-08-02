import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useHydration } from '../hooks/useHydration'

import LandingPage from '../modules/landing/LandingPage'
import LoginPage from '../modules/auth/pages/LoginPage'
import RegistrationPage from '../modules/auth/pages/RegistrationPage'
import RecoverPasswordPage from '../modules/auth/pages/RecoverPasswordPage'
import NewPasswordPage from '../modules/auth/pages/NewPasswordPage'
import Verify2FAPage from '../modules/auth/pages/Verify2FAPage'
import VerifyEmailPage from '../modules/auth/pages/VerifyEmailPage'
import CatalogPage from '../modules/catalog/pages/CatalogPage'
import UserCatalogPage from '../modules/catalog/pages/UserCatalogPage'
import VehicleDetailPage from '../modules/catalog/pages/VehicleDetailPage'
import ReservationsPage from '../modules/reservations/pages/ReservationsPage'
import AdminPage from '../modules/admin/pages/AdminPage'
import BranchesPage from '../modules/catalog/pages/BranchesPage'
import ProfilePage from '../modules/profile/pages/ProfilePage'
import PaymentResponsePage from '../modules/payments/pages/PaymentResponsePage'

function RutaPrivada({ children }) {
  const token    = useAuthStore((s) => s.token)
  const hydrated = useHydration()
  if (!hydrated) return null
  return token ? children : <Navigate to="/" replace />
}

function Ruta2FA({ children }) {
  const sesion2FA = useAuthStore((s) => s.sesion2FA)
  const hydrated  = useHydration()
  if (!hydrated) return null
  return sesion2FA ? children : <Navigate to="/login" replace />
}

function RutaVerificacionCorreo({ children }) {
  const verificacionCorreo = useAuthStore((s) => s.verificacionCorreo)
  const hydrated = useHydration()
  if (!hydrated) return null
  return verificacionCorreo ? children : <Navigate to="/catalogo" replace />
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistrationPage />} />
        <Route path="/recuperar" element={<RecoverPasswordPage />} />
        <Route path="/nueva-contrasena" element={<NewPasswordPage />} />
        <Route path="/verificar-2fa" element={<Ruta2FA><Verify2FAPage /></Ruta2FA>} />
        <Route path="/verificar-correo" element={<RutaVerificacionCorreo><VerifyEmailPage /></RutaVerificacionCorreo>} />

        <Route path="/home" element={<RutaPrivada><UserCatalogPage /></RutaPrivada>} />
        <Route path="/admin" element={<RutaPrivada><AdminPage /></RutaPrivada>} />
        <Route path="/perfil" element={<RutaPrivada><ProfilePage /></RutaPrivada>} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/catalogo/:id" element={<VehicleDetailPage />} />
        <Route path="/sucursales" element={<BranchesPage />} />
        <Route path="/reservas" element={<RutaPrivada><ReservationsPage /></RutaPrivada>} />
        <Route path="/respuesta" element={<PaymentResponsePage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}