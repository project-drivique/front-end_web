import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage             from '../modules/landing/LandingPage'
import RegistroPage            from '../modules/auth/pages/RegistroPage'
import LoginPage               from '../modules/auth/pages/LoginPage'
import RecuperarContrasenaPage from '../modules/auth/pages/RecuperarContrasenaPage'
import NuevaContrasenaPage     from '../modules/auth/pages/NuevaContrasenaPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                  element={<LandingPage />} />
        <Route path="/registro"          element={<RegistroPage />} />
        <Route path="/login"             element={<LoginPage />} />
        <Route path="/recuperar"         element={<RecuperarContrasenaPage />} />
        <Route path="/nueva-contrasena"  element={<NuevaContrasenaPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}