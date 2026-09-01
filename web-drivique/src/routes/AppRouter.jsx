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
import BranchManagerPage from '../modules/admin/pages/BranchManagerPage'
import ManagementModulePage from '../modules/admin/pages/ManagementModulePage'
import CityManagementPage from '../modules/admin/pages/CityManagementPage'
import BranchManagementPage from '../modules/admin/pages/BranchManagementPage'
import VehicleManagementPage from '../modules/admin/pages/VehicleManagementPage'
import ReservationManagementPage from '../modules/admin/pages/ReservationManagementPage'
import ContractManagementPage from '../modules/admin/pages/ContractManagementPage'
import IncidentManagementPage from '../modules/admin/pages/IncidentManagementPage'
import UserManagementPage from '../modules/admin/pages/UserManagementPage'
import AdminRolesManagementPage from '../modules/admin/pages/AdminRolesManagementPage'
import PromotionManagementPage from '../modules/admin/pages/PromotionManagementPage'
import BrandManagementPage from '../modules/admin/pages/BrandManagementPage'
import { getRoleHome, hasValidRoleAccess, ROLES } from '../modules/auth/utils/accessControl'
import BranchesPage from '../modules/catalog/pages/BranchesPage'
import ProfilePage from '../modules/profile/pages/ProfilePage'
import PaymentResponsePage from '../modules/payments/pages/PaymentResponsePage'
import ReservationsPage from '../modules/reservations/pages/ReservationsPage'
import FavoritesPage from '../modules/catalog/pages/FavoritesPage'
import NotificationsPage from '../modules/notifications/pages/NotificationsPage'
import SupportPage from '../modules/support/pages/SupportPage'
import FloatingChatBot from '../components/FloatingChatBot/FloatingChatBot'

function RutaPrivada({ children }) {
  const token    = useAuthStore((s) => s.token)
  const hydrated = useHydration()
  if (!hydrated) return null
  const esValido = token && token !== 'null' && token !== 'undefined'
  return esValido ? children : <Navigate to="/" replace />
}

function RutaPorRol({ children, roles }) {
  const token = useAuthStore((s) => s.token)
  const usuario = useAuthStore((s) => s.usuario)
  const hydrated = useHydration()
  if (!hydrated) return null
  const esValido = token && token !== 'null' && token !== 'undefined'
  if (!esValido) return <Navigate to="/login" replace />
  return roles.includes(usuario?.rol) && hasValidRoleAccess(usuario)
    ? children
    : <Navigate to="/login" replace />
}

function Ruta2FA({ children }) {
  const sesion2FA = useAuthStore((s) => s.sesion2FA)
  const token     = useAuthStore((s) => s.token)
  const usuario   = useAuthStore((s) => s.usuario)
  const hydrated  = useHydration()
  if (!hydrated) return null
  if (token) {
    return <Navigate to={getRoleHome(usuario?.rol)} replace />
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
    return <Navigate to={getRoleHome(usuario?.rol)} replace />
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
    return <Navigate to={getRoleHome(usuario?.rol)} replace />
  }
  return recuperacionCorreo ? children : <Navigate to="/login" replace />
}

function RouteTracker() {
  const location = useLocation()
  useEffect(() => {
    // No guardar rutas de autenticaciÃ³n, la raÃ­z, o rutas de respuesta de pagos/callback
    const ignorar = ['/', '/login', '/registro', '/recuperar', '/nueva-contrasena', '/verificar-2fa', '/verificar-correo', '/verificar-recuperacion', '/respuesta']
    if (!ignorar.includes(location.pathname)) {
      localStorage.setItem('last_path', location.pathname + location.search)
    }
  }, [location])
  return null
}

function ContextualChatBot() {
  const { pathname } = useLocation()
  const isManagementRoute = pathname === '/admin'
    || pathname.startsWith('/admin/')
    || pathname === '/encargado'
    || pathname.startsWith('/encargado/')
  return isManagementRoute ? null : <FloatingChatBot />
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
        <Route path="/admin" element={<RutaPorRol roles={[ROLES.ADMIN]}><AdminPage /></RutaPorRol>} />
        <Route path="/admin/cities" element={<RutaPorRol roles={[ROLES.ADMIN]}><CityManagementPage /></RutaPorRol>} />
        <Route path="/admin/branches" element={<RutaPorRol roles={[ROLES.ADMIN]}><BranchManagementPage /></RutaPorRol>} />
        <Route path="/admin/vehicles" element={<RutaPorRol roles={[ROLES.ADMIN]}><VehicleManagementPage /></RutaPorRol>} />
        <Route path="/admin/reservations" element={<RutaPorRol roles={[ROLES.ADMIN]}><ReservationManagementPage /></RutaPorRol>} />
        <Route path="/admin/contracts" element={<RutaPorRol roles={[ROLES.ADMIN]}><ContractManagementPage /></RutaPorRol>} />
        <Route path="/admin/incidents" element={<RutaPorRol roles={[ROLES.ADMIN]}><IncidentManagementPage /></RutaPorRol>} />
        <Route path="/admin/users" element={<RutaPorRol roles={[ROLES.ADMIN]}><UserManagementPage /></RutaPorRol>} />
        <Route path="/admin/roles" element={<RutaPorRol roles={[ROLES.ADMIN]}><AdminRolesManagementPage /></RutaPorRol>} />
        <Route path="/admin/promotions" element={<RutaPorRol roles={[ROLES.ADMIN]}><PromotionManagementPage /></RutaPorRol>} />
        <Route path="/admin/brand" element={<RutaPorRol roles={[ROLES.ADMIN]}><BrandManagementPage /></RutaPorRol>} />
        <Route path="/admin/:moduleKey" element={<RutaPorRol roles={[ROLES.ADMIN]}><ManagementModulePage /></RutaPorRol>} />
        <Route path="/encargado" element={<RutaPorRol roles={[ROLES.BRANCH_MANAGER]}><BranchManagerPage /></RutaPorRol>} />
        <Route path="/encargado/vehicles" element={<RutaPorRol roles={[ROLES.BRANCH_MANAGER]}><VehicleManagementPage /></RutaPorRol>} />
        <Route path="/encargado/reservations" element={<RutaPorRol roles={[ROLES.BRANCH_MANAGER]}><ReservationManagementPage /></RutaPorRol>} />
        <Route path="/encargado/contracts" element={<RutaPorRol roles={[ROLES.BRANCH_MANAGER]}><ContractManagementPage /></RutaPorRol>} />
        <Route path="/encargado/incidents" element={<RutaPorRol roles={[ROLES.BRANCH_MANAGER]}><IncidentManagementPage /></RutaPorRol>} />
        <Route path="/encargado/:moduleKey" element={<RutaPorRol roles={[ROLES.BRANCH_MANAGER]}><ManagementModulePage /></RutaPorRol>} />
        <Route path="/perfil" element={<RutaPrivada><ProfilePage /></RutaPrivada>} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/catalogo/:id" element={<VehicleDetailsPage />} />
        <Route path="/sucursales" element={<BranchesPage />} />
        <Route path="/reservas/:id" element={<RutaPrivada><ReservationFlowPage /></RutaPrivada>} />
        <Route path="/reservas" element={<RutaPrivada><ReservationsPage /></RutaPrivada>} />
        <Route path="/favoritos" element={<RutaPrivada><FavoritesPage /></RutaPrivada>} />
        <Route path="/notificaciones" element={<RutaPrivada><NotificationsPage /></RutaPrivada>} />
        <Route path="/soporte" element={<RutaPrivada><SupportPage /></RutaPrivada>} />
        <Route path="/respuesta" element={<PaymentResponsePage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ContextualChatBot />
    </BrowserRouter>
  )
}

