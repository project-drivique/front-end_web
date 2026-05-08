import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage  from '../modules/landing/LandingPage'
import RegistroPage from '../modules/auth/pages/RegistroPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<LandingPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}