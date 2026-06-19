import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

import LandingPage from '../modules/landing/LandingPage'
import LoginPage from '../modules/auth/pages/LoginPage'
import RegistroPage from '../modules/auth/pages/RegistroPage'
import RecuperarContrasenaPage from '../modules/auth/pages/RecuperarContrasenaPage'
import NuevaContrasenaPage from '../modules/auth/pages/NuevaContrasenaPage'
import Verificar2FAPage from '../modules/auth/pages/Verificar2FAPage'
import CatalogoPage from '../modules/catalog/pages/CatalogoPage'
import CatalogoUsuarioPage from '../modules/catalog/pages/CatalogoUsuarioPage'
import VehiculoDetallePage from '../modules/catalog/pages/VehiculoDetallePage'
import ReservasPage from '../modules/reservations/pages/ReservasPage'
import AdminPage from '../modules/admin/pages/AdminPage'
import SucursalesPage from '../modules/catalog/pages/SucursalesPage'
import PerfilPage from '../modules/profile/pages/PerfilPage'

function useHydrated() {
  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated())
  useEffect(() => {
    if (hydrated) return
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
    return unsub
  }, [hydrated])
  return hydrated
}

function RutaPrivada({ children }) {
  const token    = useAuthStore((s) => s.token)
  const hydrated = useHydrated()
  if (!hydrated) return null
  return token ? children : <Navigate to="/login" replace />
}

function Ruta2FA({ children }) {
  const sesion2FA = useAuthStore((s) => s.sesion2FA)
  const hydrated  = useHydrated()
  if (!hydrated) return null
  return sesion2FA ? children : <Navigate to="/login" replace />
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/recuperar" element={<RecuperarContrasenaPage />} />
        <Route path="/nueva-contrasena" element={<NuevaContrasenaPage />} />
        <Route path="/verificar-2fa" element={<Ruta2FA><Verificar2FAPage /></Ruta2FA>} />

        <Route path="/home" element={<RutaPrivada><CatalogoUsuarioPage /></RutaPrivada>} />
        <Route path="/admin" element={<RutaPrivada><AdminPage /></RutaPrivada>} />
        <Route path="/perfil" element={<RutaPrivada><PerfilPage /></RutaPrivada>} />
        <Route path="/catalogo" element={<CatalogoPage />} />
        <Route path="/catalogo/:id" element={<VehiculoDetallePage />} />
        <Route path="/sucursales" element={<SucursalesPage />} />
        <Route path="/reservas" element={<RutaPrivada><ReservasPage /></RutaPrivada>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}