import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from '../modules/landing/LandingPage.jsx'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}