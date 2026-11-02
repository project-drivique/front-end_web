import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { adminDashboardService } from '../../../services/adminDashboardService'

import BranchDashboard from './BranchDashboard'

import ManagementSidebar from './ManagementSidebar'
import './ManagementDashboard.css'
import ZoomImage from './ManagementDashboard/ZoomImage'
import ManagementDashboardPart5 from './ManagementDashboard/ManagementDashboardPart5'
import ManagementDashboardPart4 from './ManagementDashboard/ManagementDashboardPart4'
import ManagementDashboardPart3 from './ManagementDashboard/ManagementDashboardPart3'
import ManagementDashboardPart2 from './ManagementDashboard/ManagementDashboardPart2'
import ManagementDashboardPart from './ManagementDashboard/ManagementDashboardPart'



export default function ManagementDashboard({ branchOnly = false }) {
  const { t } = useTranslation()
  const { tema, moneda, tasaUSD } = useLanding()
  const usuario = useAuthStore((state) => state.usuario)
  const navigate = useNavigate()

  const [summary, setSummary] = useState(() => adminDashboardService.getSummary(usuario) || {})
  const [weeklyData, setWeeklyData] = useState(() => adminDashboardService.getWeeklyActivity(usuario) || [])
  const [activeTab, setActiveTab] = useState('entregas') // 'entregas' | 'devoluciones'
  const [searchTerm, setSearchTerm] = useState('')
  const [lastSync, setLastSync] = useState(new Date())
  const [zoomImage, setZoomImage] = useState(null)

  // Sincronización en tiempo real (Polling cada 2.5s)
  useEffect(() => {
    const refreshData = () => {
      adminDashboardService.refresh().then(() => {
        setSummary(adminDashboardService.getSummary(usuario) || {})
        setWeeklyData(adminDashboardService.getWeeklyActivity(usuario) || [])
        setLastSync(new Date())
      }).catch((error) => console.error('No se pudo actualizar el tablero:', error))
    }

    refreshData()
    const timer = setInterval(refreshData, 30000)
    window.addEventListener('focus', refreshData)
    window.addEventListener('storage', refreshData)

    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', refreshData)
      window.removeEventListener('storage', refreshData)
    }
  }, [usuario])

  const isBranchManager = branchOnly || usuario?.rol === 'encargado' || usuario?.rol === 'branch_manager' || usuario?.rol === 'encargado_sucursal'

  const cashRoute = isBranchManager ? '/encargado/cobro-sucursal' : '/admin/cobro-sucursal'
  const reservationsRoute = isBranchManager ? '/encargado/reservations' : '/admin/reservations'

  // Listas de entregas y devoluciones operativas
  const { dateDeliveriesList, dateReturnsList } = useMemo(() => {
    const reservations = summary?.allBranchReservations || []
    const isCancelled = (st) => ['CANCELADA', 'CANCELADA_POR_TIEMPO'].includes(String(st || '').toUpperCase())

    const del = reservations.filter((r) => !isCancelled(r?.estado))
    const ret = reservations.filter((r) => !isCancelled(r?.estado))

    return { dateDeliveriesList: del, dateReturnsList: ret }
  }, [summary])

  const rawList = activeTab === 'entregas' ? dateDeliveriesList : dateReturnsList

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return rawList
    const q = searchTerm.toLowerCase().trim()
    return rawList.filter((r) => {
      const cod = (r.codigo || r.referencia || `RES-${r.id}`).toLowerCase()
      const cliente = (r.clienteNombre || r.datosForm?.nombres || '').toLowerCase()
      const auto = (r.vehiculoNombre || '').toLowerCase()
      const placa = (r.vehiculoPlaca || '').toLowerCase()
      return cod.includes(q) || cliente.includes(q) || auto.includes(q) || placa.includes(q)
    })
  }, [rawList, searchTerm])

  // Cálculo seguro de estadísticas de la flota en tiempo real
  const totalVehicles = Math.max(1, summary.vehicleCount || 1)
  const rentedVehicles = Math.min(totalVehicles, summary.rentedVehicles || 0)
  const maintenanceVehicles = Math.min(totalVehicles - rentedVehicles, summary.maintenanceVehicles || 0)
  const availableVehicles = Math.max(0, totalVehicles - rentedVehicles - maintenanceVehicles)

  const rentedPct = Math.round((rentedVehicles / totalVehicles) * 100)
  const availPct = Math.round((availableVehicles / totalVehicles) * 100)
  const maintPct = Math.max(0, 100 - rentedPct - availPct)

  const occupancy = summary.occupancyRate || rentedPct

  const isDark = tema === 'oscuro'
  const c = {
    bg: isDark ? '#07111f' : '#f8fafc',
    card: isDark ? '#0f1b2d' : '#ffffff',
    cardBorder: isDark ? '#26354d' : '#e2e8f0',
    cardShadow: isDark ? '0 4px 12px rgba(0,0,0,0.35)' : '0 1px 3px rgba(0,0,0,0.03)',
    text: isDark ? '#f8fafc' : '#0f172a',
    textSecondary: isDark ? '#cbd5e1' : '#334155',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    headerBadgeBg: isDark ? 'rgba(var(--brand-secondary-rgb), 0.45)' : 'linear-gradient(135deg, var(--brand-soft) 0%, var(--brand-soft-strong) 100%)',
    headerBadgeBorder: isDark ? 'var(--brand-secondary)' : 'var(--brand-border)',
    headerBadgeText: isDark ? 'var(--brand-border)' : 'var(--brand-primary-active)',
    userChipBg: isDark ? '#0f1b2d' : '#ffffff',
    userChipBorder: isDark ? '#26354d' : '#e2e8f0',
    buttonReportBg: isDark ? '#14243b' : '#ffffff',
    buttonReportBorder: isDark ? '#334155' : '#cbd5e1',
    buttonReportText: isDark ? '#e2e8f0' : '#334155',
    tagBg: isDark ? 'rgba(var(--brand-primary-rgb), 0.25)' : 'var(--brand-soft)',
    tagText: isDark ? 'var(--brand-accent)' : 'var(--brand-primary, #2563eb)',
    trackBg: isDark ? '#1e293b' : '#f1f5f9',
    tableTheadBg: isDark ? '#14243b' : '#f8fafc',
    tableBorder: isDark ? '#26354d' : '#e2e8f0',
    tableRowBorder: isDark ? '#1e293b' : '#f1f5f9',
    tableRowHover: isDark ? '#162338' : '#f8fafc',
    searchInputBg: isDark ? '#14243b' : '#f8fafc',
    searchInputBorder: isDark ? '#334155' : '#cbd5e1',
    tabContainerBg: isDark ? '#14243b' : '#f1f5f9',
    tabActiveBg: isDark ? 'var(--brand-primary)' : '#ffffff',
    tabActiveText: isDark ? '#ffffff' : '#0f172a',
    tabInactiveText: isDark ? '#94a3b8' : '#64748b',
    emptyBoxBg: isDark ? '#14243b' : '#f8fafc',
    emptyBoxBorder: isDark ? '#334155' : '#cbd5e1',
    zoomModalBg: isDark ? '#0f1b2d' : '#ffffff',
    zoomCloseBtnBg: isDark ? '#1e293b' : '#f1f5f9',
  }

  if (isBranchManager) {
    return <BranchDashboard branchOnly={branchOnly} />
  }

  return (
    <div className={`management-shell ${isDark ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={branchOnly} />

      <main className="management-main" style={{ padding: '28px 36px', background: c.bg, minHeight: '100vh', transition: 'background 0.2s ease' }}>
        {/* Cabecera Limpia con Indicador de Tiempo Real */}
        <ManagementDashboardPart c={c} isBranchManager={isBranchManager} lastSync={lastSync} summary={summary} t={t} usuario={usuario} />

        {/* Acciones Rápidas Minimalistas */}
        <ManagementDashboardPart2 cashRoute={cashRoute} navigate={navigate} reservationsRoute={reservationsRoute} />

        {/* Tarjetas KPI Limpias (4 Métricas Clave) — ICONO AL LADO DEL TÍTULO CON MISMO TAMAÑO */}
        <ManagementDashboardPart3 c={c} isBranchManager={isBranchManager} moneda={moneda} occupancy={occupancy} rentedVehicles={rentedVehicles} summary={summary} t={t} tasaUSD={tasaUSD} totalVehicles={totalVehicles} />

        {/* GRÁFICAS MINIMALISTAS Y 100% EN TIEMPO REAL */}
        <ManagementDashboardPart4 availPct={availPct} availableVehicles={availableVehicles} c={c} isBranchManager={isBranchManager} isDark={isDark} maintPct={maintPct} maintenanceVehicles={maintenanceVehicles} rentedPct={rentedPct} rentedVehicles={rentedVehicles} t={t} totalVehicles={totalVehicles} weeklyData={weeklyData} />

        {/* TABLA OPERATIVA CON BUSCADOR Y PESTAÑAS */}
        <ManagementDashboardPart5 activeTab={activeTab} c={c} cashRoute={cashRoute} dateDeliveriesList={dateDeliveriesList} dateReturnsList={dateReturnsList} filteredList={filteredList} isDark={isDark} navigate={navigate} reservationsRoute={reservationsRoute} searchTerm={searchTerm} setActiveTab={setActiveTab} setSearchTerm={setSearchTerm} setZoomImage={setZoomImage} t={t} />

        {/* MODAL DE ZOOM DE FOTO DE VEHÍCULO */}
        {zoomImage && (
          <ZoomImage c={c} setZoomImage={setZoomImage} zoomImage={zoomImage} />
        )}
      </main>
    </div>
  )
}
