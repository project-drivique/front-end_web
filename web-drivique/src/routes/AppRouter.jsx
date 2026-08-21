import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useHydration } from '../hooks/useHydration'

import LandingPage from '../modules/landing/LandingPage'
import LoginPage from '../modules/auth/pages/LoginPage'
import RegistrationPage from '../modules/auth/pages/RegistrationPage'
import RecoverPasswordPage from '../modules/auth/pages/RecoverPasswordPage'
import NewPasswordPage from '../modules/auth/pages/NewPasswordPage'
import Verify2FAPage from '../modules/auth/pages/Verify2FAPage'
import VerifyEmailPage from '../modules/auth/pages/VerifyEmailPage'
import VerifyRecoverPage from '../modules/auth/pages/VerifyRecoverPage'
import CatalogPage from '../modules/catalog/pages/CatalogPage'
import UserCatalogPage from '../modules/catalog/pages/UserCatalogPage'
import ReservationFlowPage from '../modules/reservations/pages/ReservationFlowPage'
import VehicleDetailsPage from '../modules/catalog/pages/VehicleDetailsPage'
import AdminPage from '../modules/admin/pages/AdminPage'
import BranchesPage from '../modules/catalog/pages/BranchesPage'
import ProfilePage from '../modules/profile/pages/ProfilePage'
import PaymentResponsePage from '../modules/payments/pages/PaymentResponsePage'
import PlaceholderPage from '../components/PlaceholderPage'
import ReservationsPage from '../modules/reservations/pages/ReservationsPage'
import FavoritesPage from '../modules/catalog/pages/FavoritesPage'

function RutaPrivada({ children }) {
  const token    = useAuthStore((s) => s.token)
  const hydrated = useHydration()
  if (!hydrated) return null
  const esValido = token && token !== 'null' && token !== 'undefined'
  return esValido ? children : <Navigate to="/" replace />
}

function Ruta2FA({ children }) {
  const sesion2FA = useAuthStore((s) => s.sesion2FA)
  const token     = useAuthStore((s) => s.token)
  const usuario   = useAuthStore((s) => s.usuario)
  const hydrated  = useHydration()
  if (!hydrated) return null
  if (token) {
    const lastPath = localStorage.getItem('last_path')
    return <Navigate to={lastPath && lastPath !== '/' && lastPath !== '/login' ? lastPath : (usuario?.rol === 'administrador' ? '/admin' : '/home')} replace />
  }
  return sesion2FA ? children : <Navigate to="/login" replace />
}

function RutaVerificacionCorreo({ children }) {
  const verificacionCorreo = useAuthStore((s) => s.verificacionCorreo)
  const token              = useAuthStore((s) => s.token)
  const usuario            = useAuthStore((s) => s.usuario)
  const hydrated           = useHydration()
  if (!hydrated) return null
  if (token) {
    const lastPath = localStorage.getItem('last_path')
    return <Navigate to={lastPath && lastPath !== '/' && lastPath !== '/login' ? lastPath : (usuario?.rol === 'administrador' ? '/admin' : '/home')} replace />
  }
  return verificacionCorreo ? children : <Navigate to="/home" replace />
}

function RutaRecuperacionCorreo({ children }) {
  const recuperacionCorreo = useAuthStore((s) => s.recuperacionCorreo)
  const token              = useAuthStore((s) => s.token)
  const usuario            = useAuthStore((s) => s.usuario)
  const hydrated           = useHydration()
  if (!hydrated) return null
  if (token) {
    const lastPath = localStorage.getItem('last_path')
    return <Navigate to={lastPath && lastPath !== '/' && lastPath !== '/login' ? lastPath : (usuario?.rol === 'administrador' ? '/admin' : '/home')} replace />
  }
  return recuperacionCorreo ? children : <Navigate to="/login" replace />
}

function RouteTracker() {
  const location = useLocation()
  useEffect(() => {
    // No guardar rutas de autenticación, la raíz, o rutas de respuesta de pagos/callback
    const ignorar = ['/', '/login', '/registro', '/recuperar', '/nueva-contrasena', '/verificar-2fa', '/verificar-correo', '/verificar-recuperacion', '/respuesta']
    if (!ignorar.includes(location.pathname)) {
      localStorage.setItem('last_path', location.pathname + location.search)
    }
  }, [location])
  return null
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <RouteTracker />
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistrationPage />} />
        <Route path="/recuperar" element={<RecoverPasswordPage />} />
        <Route path="/nueva-contrasena" element={<NewPasswordPage />} />
        <Route path="/verificar-2fa" element={<Ruta2FA><Verify2FAPage /></Ruta2FA>} />
        <Route path="/verificar-correo" element={<RutaVerificacionCorreo><VerifyEmailPage /></RutaVerificacionCorreo>} />
        <Route path="/verificar-recuperacion" element={<RutaRecuperacionCorreo><VerifyRecoverPage /></RutaRecuperacionCorreo>} />

        <Route path="/home" element={<RutaPrivada><UserCatalogPage /></RutaPrivada>} />
        <Route path="/admin" element={<RutaPrivada><AdminPage /></RutaPrivada>} />
        <Route path="/perfil" element={<RutaPrivada><ProfilePage /></RutaPrivada>} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/catalogo/:id" element={<VehicleDetailsPage />} />
        <Route path="/sucursales" element={<BranchesPage />} />
        <Route path="/reservas/:id" element={<RutaPrivada><ReservationFlowPage /></RutaPrivada>} />
        <Route path="/reservas" element={<RutaPrivada><ReservationsPage /></RutaPrivada>} />
        <Route path="/favoritos" element={<RutaPrivada><FavoritesPage /></RutaPrivada>} />
        <Route path="/notificaciones" element={<RutaPrivada><PlaceholderPage /></RutaPrivada>} />
        <Route path="/soporte" element={<RutaPrivada><PlaceholderPage /></RutaPrivada>} />
        <Route path="/respuesta" element={<PaymentResponsePage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
