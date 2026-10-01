import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useHydration } from '../hooks/useHydration'
import { getRoleHome, hasValidRoleAccess, ROLES } from '../modules/auth/utils/accessControl'
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary'
import LoadingFallback from '../components/LoadingFallback/LoadingFallback'
import FloatingChatBot from '../components/FloatingChatBot/FloatingChatBot'

// Lazy Loading de Páginas Públicas y Autenticación
const LandingPage = lazy(() => import('../modules/landing/LandingPage'))
const LoginPage = lazy(() => import('../modules/auth/pages/LoginPage'))
const RegistrationPage = lazy(() => import('../modules/auth/pages/RegistrationPage'))
const RecoverPasswordPage = lazy(() => import('../modules/auth/pages/RecoverPasswordPage'))
const NewPasswordPage = lazy(() => import('../modules/auth/pages/NewPasswordPage'))
const Verify2FAPage = lazy(() => import('../modules/auth/pages/Verify2FAPage'))
const VerifyEmailPage = lazy(() => import('../modules/auth/pages/VerifyEmailPage'))
const VerifyRecoverPage = lazy(() => import('../modules/auth/pages/VerifyRecoverPage'))

// Lazy Loading de Catálogo y Reservas
const CatalogPage = lazy(() => import('../modules/catalog/pages/CatalogPage'))
const UserCatalogPage = lazy(() => import('../modules/catalog/pages/UserCatalogPage'))
const VehicleDetailsPage = lazy(() => import('../modules/catalog/pages/VehicleDetailsPage'))
const BranchesPage = lazy(() => import('../modules/catalog/pages/BranchesPage'))
const FavoritesPage = lazy(() => import('../modules/catalog/pages/FavoritesPage'))
const ReservationFlowPage = lazy(() => import('../modules/reservations/pages/ReservationFlowPage'))
const ReservationsPage = lazy(() => import('../modules/reservations/pages/ReservationsPage'))
const ContractSigningPage = lazy(() => import('../modules/contracts/pages/ContractSigningPage'))
const PaymentResponsePage = lazy(() => import('../modules/payments/pages/PaymentResponsePage'))
const ProfilePage = lazy(() => import('../modules/profile/pages/ProfilePage'))
const NotificationsPage = lazy(() => import('../modules/notifications/pages/NotificationsPage'))
const SupportPage = lazy(() => import('../modules/support/pages/SupportPage'))

// Lazy Loading de Administración y Sucursal
const AdminPage = lazy(() => import('../modules/admin/pages/AdminPage'))
const BranchManagerPage = lazy(() => import('../modules/admin/pages/BranchManagerPage'))
const BranchProfilePage = lazy(() => import('../modules/admin/pages/BranchProfilePage'))
const ManagementModulePage = lazy(() => import('../modules/admin/pages/ManagementModulePage'))
const CityManagementPage = lazy(() => import('../modules/admin/pages/CityManagementPage'))
const BranchManagementPage = lazy(() => import('../modules/admin/pages/BranchManagementPage'))
const VehicleManagementPage = lazy(() => import('../modules/admin/pages/VehicleManagementPage'))
const ReservationManagementPage = lazy(() => import('../modules/admin/pages/ReservationManagementPage'))
const CashCollectionPage = lazy(() => import('../modules/admin/pages/CashCollectionPage'))
const ContractManagementPage = lazy(() => import('../modules/admin/pages/ContractManagementPage'))
const IncidentManagementPage = lazy(() => import('../modules/admin/pages/IncidentManagementPage'))
const DeliveryManagementPage = lazy(() => import('../modules/admin/pages/DeliveryManagementPage'))
const UserManagementPage = lazy(() => import('../modules/admin/pages/UserManagementPage'))
const AdminRolesManagementPage = lazy(() => import('../modules/admin/pages/AdminRolesManagementPage'))
const PromotionManagementPage = lazy(() => import('../modules/admin/pages/PromotionManagementPage'))
const BrandManagementPage = lazy(() => import('../modules/admin/pages/BrandManagementPage'))
const ReportsManagementPage = lazy(() => import('../modules/admin/pages/ReportsManagementPage'))
const AuditLogManagementPage = lazy(() => import('../modules/admin/pages/AuditLogManagementPage'))
const BranchReviewsPage = lazy(() => import('../modules/admin/pages/BranchReviewsPage'))
const DocumentVerificationPage = lazy(() => import('../modules/admin/pages/DocumentVerificationPage'))
const BranchNotificationCenterPage = lazy(() => import('../modules/admin/pages/BranchNotificationCenterPage'))

function RutaPrivada({ children }) {
  const token    = useAuthStore((s) => s.token)
  const hydrated = useHydration()
  if (!hydrated) return null
  const esValido = token && token !== 'null' && token !== 'undefined'
  return esValido ? children : <Navigate to="/" replace />
}

function RutaLanding() {
  const token = useAuthStore((s) => s.token)
  const usuario = useAuthStore((s) => s.usuario)
  const hydrated = useHydration()
  if (!hydrated) return null
  const esValido = token && token !== 'null' && token !== 'undefined'
  if (esValido) {
    return <Navigate to={getRoleHome(usuario?.rol)} replace />
  }
  return <LandingPage />
}

function RutaCatalogo() {
  const token = useAuthStore((s) => s.token)
  const usuario = useAuthStore((s) => s.usuario)
  const hydrated = useHydration()
  if (!hydrated) return null
  const esValido = token && token !== 'null' && token !== 'undefined'
  if (esValido) {
    return <Navigate to={getRoleHome(usuario?.rol)} replace />
  }
  return <CatalogPage />
}

function RutaPublicaAuth({ children }) {
  const token = useAuthStore((s) => s.token)
  const usuario = useAuthStore((s) => s.usuario)
  const hydrated = useHydration()
  if (!hydrated) return null
  const esValido = token && token !== 'null' && token !== 'undefined'
  if (esValido) {
    return <Navigate to={getRoleHome(usuario?.rol)} replace />
  }
  return children
}

function RutaPorRol({ children, roles }) {
  const token = useAuthStore((s) => s.token)
  const usuario = useAuthStore((s) => s.usuario)
  const hydrated = useHydration()
  if (!hydrated) return null
  const esValido = token && token !== 'null' && token !== 'undefined'
  if (!esValido) return <Navigate to="/login" replace />
  const isMatch = roles.some(
    (r) =>
      r === usuario?.rol ||
      (r === ROLES.BRANCH_MANAGER && (usuario?.rol === 'encargado_sucursal' || usuario?.rol === 'encargado' || usuario?.rol === 'branch_manager')) ||
      (r === ROLES.ADMIN && (usuario?.rol === 'administrador' || usuario?.rol === 'admin'))
  )
  return isMatch && hasValidRoleAccess(usuario)
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
  const isAuthRoute = pathname === '/login'
    || pathname === '/registro'
    || pathname === '/recuperar'
    || pathname === '/nueva-contrasena'
    || pathname.startsWith('/verificar-')

  return (isManagementRoute || isAuthRoute) ? null : <FloatingChatBot />
}

export default function AppRouter() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <RouteTracker />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<RutaLanding />} />

            <Route path="/login" element={<RutaPublicaAuth><LoginPage /></RutaPublicaAuth>} />
            <Route path="/registro" element={<RutaPublicaAuth><RegistrationPage /></RutaPublicaAuth>} />
            <Route path="/recuperar" element={<RutaPublicaAuth><RecoverPasswordPage /></RutaPublicaAuth>} />
            <Route path="/nueva-contrasena" element={<RutaPublicaAuth><NewPasswordPage /></RutaPublicaAuth>} />
            <Route path="/verificar-2fa" element={<Ruta2FA><Verify2FAPage /></Ruta2FA>} />
            <Route path="/verificar-correo" element={<RutaVerificacionCorreo><VerifyEmailPage /></RutaVerificacionCorreo>} />
            <Route path="/verificar-recuperacion" element={<RutaRecuperacionCorreo><VerifyRecoverPage /></RutaRecuperacionCorreo>} />

            <Route path="/home" element={<RutaPrivada><UserCatalogPage /></RutaPrivada>} />
            <Route path="/admin" element={<RutaPorRol roles={[ROLES.ADMIN]}><AdminPage /></RutaPorRol>} />
            <Route path="/admin/cities" element={<RutaPorRol roles={[ROLES.ADMIN]}><CityManagementPage /></RutaPorRol>} />
            <Route path="/admin/branches" element={<RutaPorRol roles={[ROLES.ADMIN]}><BranchManagementPage /></RutaPorRol>} />
            <Route path="/admin/vehicles" element={<RutaPorRol roles={[ROLES.ADMIN]}><VehicleManagementPage /></RutaPorRol>} />
            <Route path="/admin/reservations" element={<RutaPorRol roles={[ROLES.ADMIN]}><ReservationManagementPage /></RutaPorRol>} />
            <Route path="/admin/cobro-sucursal" element={<RutaPorRol roles={[ROLES.ADMIN]}><CashCollectionPage /></RutaPorRol>} />
            <Route path="/admin/contracts" element={<RutaPorRol roles={[ROLES.ADMIN]}><ContractManagementPage /></RutaPorRol>} />
            <Route path="/admin/incidents" element={<RutaPorRol roles={[ROLES.ADMIN]}><IncidentManagementPage /></RutaPorRol>} />
            <Route path="/admin/deliveries" element={<RutaPorRol roles={[ROLES.ADMIN]}><DeliveryManagementPage /></RutaPorRol>} />
            <Route path="/admin/documents" element={<RutaPorRol roles={[ROLES.ADMIN]}><DocumentVerificationPage /></RutaPorRol>} />
            <Route path="/admin/reviews" element={<RutaPorRol roles={[ROLES.ADMIN]}><BranchReviewsPage /></RutaPorRol>} />
            <Route path="/admin/users" element={<RutaPorRol roles={[ROLES.ADMIN]}><UserManagementPage /></RutaPorRol>} />
            <Route path="/admin/roles" element={<RutaPorRol roles={[ROLES.ADMIN]}><AdminRolesManagementPage /></RutaPorRol>} />
            <Route path="/admin/promotions" element={<RutaPorRol roles={[ROLES.ADMIN]}><PromotionManagementPage /></RutaPorRol>} />
            <Route path="/admin/brand" element={<RutaPorRol roles={[ROLES.ADMIN]}><BrandManagementPage /></RutaPorRol>} />
            <Route path="/admin/reports" element={<RutaPorRol roles={[ROLES.ADMIN]}><ReportsManagementPage /></RutaPorRol>} />
            <Route path="/admin/audit" element={<RutaPorRol roles={[ROLES.ADMIN]}><AuditLogManagementPage /></RutaPorRol>} />
            <Route path="/admin/notifications" element={<RutaPorRol roles={[ROLES.ADMIN]}><BranchNotificationCenterPage branchOnly={false} /></RutaPorRol>} />
            <Route path="/admin/:moduleKey" element={<RutaPorRol roles={[ROLES.ADMIN]}><ManagementModulePage /></RutaPorRol>} />
            <Route path="/encargado" element={<RutaPorRol roles={[ROLES.BRANCH_MANAGER, ROLES.ADMIN]}><BranchManagerPage /></RutaPorRol>} />
            <Route path="/encargado/my-branch" element={<RutaPorRol roles={[ROLES.BRANCH_MANAGER, ROLES.ADMIN]}><BranchProfilePage /></RutaPorRol>} />
            <Route path="/encargado/vehicles" element={<RutaPorRol roles={[ROLES.BRANCH_MANAGER, ROLES.ADMIN]}><VehicleManagementPage /></RutaPorRol>} />
            <Route path="/encargado/reservations" element={<RutaPorRol roles={[ROLES.BRANCH_MANAGER, ROLES.ADMIN]}><ReservationManagementPage /></RutaPorRol>} />
            <Route path="/encargado/cobro-sucursal" element={<RutaPorRol roles={[ROLES.BRANCH_MANAGER, ROLES.ADMIN]}><CashCollectionPage branchOnly={true} /></RutaPorRol>} />
            <Route path="/encargado/contracts" element={<RutaPorRol roles={[ROLES.BRANCH_MANAGER, ROLES.ADMIN]}><ContractManagementPage /></RutaPorRol>} />
            <Route path="/encargado/incidents" element={<RutaPorRol roles={[ROLES.BRANCH_MANAGER, ROLES.ADMIN]}><IncidentManagementPage /></RutaPorRol>} />
            <Route path="/encargado/deliveries" element={<RutaPorRol roles={[ROLES.BRANCH_MANAGER, ROLES.ADMIN]}><DeliveryManagementPage /></RutaPorRol>} />
            <Route path="/encargado/documents" element={<RutaPorRol roles={[ROLES.BRANCH_MANAGER, ROLES.ADMIN]}><DocumentVerificationPage branchOnly={true} /></RutaPorRol>} />
            <Route path="/encargado/promotions" element={<RutaPorRol roles={[ROLES.BRANCH_MANAGER, ROLES.ADMIN]}><PromotionManagementPage /></RutaPorRol>} />
            <Route path="/encargado/reviews" element={<RutaPorRol roles={[ROLES.BRANCH_MANAGER, ROLES.ADMIN]}><BranchReviewsPage branchOnly={true} /></RutaPorRol>} />
            <Route path="/encargado/reports" element={<RutaPorRol roles={[ROLES.BRANCH_MANAGER, ROLES.ADMIN]}><ReportsManagementPage branchOnly={true} /></RutaPorRol>} />
            <Route path="/encargado/audit" element={<RutaPorRol roles={[ROLES.BRANCH_MANAGER, ROLES.ADMIN]}><AuditLogManagementPage branchOnly={true} /></RutaPorRol>} />
            <Route path="/encargado/notifications" element={<RutaPorRol roles={[ROLES.BRANCH_MANAGER, ROLES.ADMIN]}><BranchNotificationCenterPage branchOnly={true} /></RutaPorRol>} />
            <Route path="/encargado/:moduleKey" element={<RutaPorRol roles={[ROLES.BRANCH_MANAGER, ROLES.ADMIN]}><ManagementModulePage /></RutaPorRol>} />
            <Route path="/perfil" element={<RutaPrivada><ProfilePage /></RutaPrivada>} />
            <Route path="/catalogo" element={<RutaCatalogo />} />
            <Route path="/catalogo/:id" element={<VehicleDetailsPage />} />
            <Route path="/sucursales" element={<BranchesPage />} />
            <Route path="/reservas" element={<RutaPrivada><ReservationsPage /></RutaPrivada>} />
            <Route path="/reservas/:id" element={<RutaPrivada><ReservationFlowPage /></RutaPrivada>} />
            <Route path="/contrato/:id" element={<RutaPrivada><ContractSigningPage /></RutaPrivada>} />
            <Route path="/favoritos" element={<RutaPrivada><FavoritesPage /></RutaPrivada>} />
            <Route path="/notificaciones" element={<RutaPrivada><NotificationsPage /></RutaPrivada>} />
            <Route path="/cupones" element={<RutaPrivada><NotificationsPage defaultTab="promociones" /></RutaPrivada>} />
            <Route path="/promociones" element={<RutaPrivada><NotificationsPage defaultTab="promociones" /></RutaPrivada>} />
            <Route path="/soporte" element={<RutaPrivada><SupportPage /></RutaPrivada>} />
            <Route path="/respuesta" element={<PaymentResponsePage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <ContextualChatBot />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
