import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaCar,
  FaCheckCircle,
  FaDollarSign,
  FaCalendarCheck,
  FaClock,
  FaMoneyBillWave,
  FaPlus,
  FaTools,
  FaSearch,
  FaChartLine,
  FaSync,
  FaCalendarAlt,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { adminDashboardService } from '../../../services/adminDashboardService'
import { formatCurrency } from '../../../utils/currencyUtils'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from './ManagementSidebar'
import './ManagementDashboard.css'

function WeeklyGroupedBarChart({ data }) {
  const maxDataVal = Math.max(...data.map((d) => Math.max(d.entregas, d.devoluciones)), 4)
  const maxVal = Math.ceil(maxDataVal / 4) * 4
  const step = maxVal / 4
  const yTicks = [0, Math.round(step), Math.round(step * 2), Math.round(step * 3), maxVal]

  const svgWidth = 540
  const svgHeight = 210
  const marginTop = 30
  const marginBottom = 35
  const marginLeft = 35
  const marginRight = 15

  const chartWidth = svgWidth - marginLeft - marginRight
  const chartHeight = svgHeight - marginTop - marginBottom

  const numCategories = data.length || 7
  const categoryWidth = chartWidth / numCategories
  const barWidth = 14
  const barGap = 4

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* Grid lines and Y axis ticks */}
        {yTicks.map((tick) => {
          const yPos = marginTop + chartHeight * (1 - tick / maxVal)
          return (
            <g key={tick}>
              <line
                x1={marginLeft}
                y1={yPos}
                x2={svgWidth - marginRight}
                y2={yPos}
                stroke={tick === 0 ? '#94a3b8' : '#f1f5f9'}
                strokeWidth={tick === 0 ? '1.5' : '1'}
                strokeDasharray={tick === 0 ? 'none' : '4 4'}
              />
              <text
                x={marginLeft - 8}
                y={yPos + 4}
                fill="#64748b"
                fontSize="11"
                fontWeight="600"
                textAnchor="end"
              >
                {tick}
              </text>
            </g>
          )
        })}

        {/* Grouped Bars per Day */}
        {data.map((item, idx) => {
          const groupCenterX = marginLeft + idx * categoryWidth + categoryWidth / 2

          // Bar 1: Entregas
          const hEntregas = (item.entregas / maxVal) * chartHeight
          const yEntregas = marginTop + chartHeight - hEntregas
          const xEntregas = groupCenterX - barWidth - barGap / 2

          // Bar 2: Devoluciones
          const hDevoluciones = (item.devoluciones / maxVal) * chartHeight
          const yDevoluciones = marginTop + chartHeight - hDevoluciones
          const xDevoluciones = groupCenterX + barGap / 2

          return (
            <g key={item.day}>
              {/* Entregas Bar */}
              <rect
                x={xEntregas}
                y={yEntregas}
                width={barWidth}
                height={hEntregas}
                fill="#2563eb"
                rx="3"
                ry="3"
                style={{ transition: 'all 0.4s ease' }}
              >
                <title>{`Entregas ${item.day}: ${item.entregas}`}</title>
              </rect>
              {/* Entregas Value Label */}
              <text
                x={xEntregas + barWidth / 2}
                y={yEntregas - 4}
                fill="#2563eb"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
              >
                {item.entregas}
              </text>

              {/* Devoluciones Bar */}
              <rect
                x={xDevoluciones}
                y={yDevoluciones}
                width={barWidth}
                height={hDevoluciones}
                fill="#10b981"
                rx="3"
                ry="3"
                style={{ transition: 'all 0.4s ease' }}
              >
                <title>{`Devoluciones ${item.day}: ${item.devoluciones}`}</title>
              </rect>
              {/* Devoluciones Value Label */}
              <text
                x={xDevoluciones + barWidth / 2}
                y={yDevoluciones - 4}
                fill="#10b981"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
              >
                {item.devoluciones}
              </text>

              {/* Day Label (X Axis) */}
              <text
                x={groupCenterX}
                y={svgHeight - 10}
                fill="#475569"
                fontSize="12"
                fontWeight="700"
                textAnchor="middle"
              >
                {item.day}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function ManagementDashboard({ branchOnly = false }) {
  const { t } = useTranslation()
  const { tema, moneda, tasaUSD } = useLanding()
  const usuario = useAuthStore((state) => state.usuario)
  const navigate = useNavigate()

  const todayStr = new Date().toISOString().slice(0, 10)
  const [summary, setSummary] = useState(() => adminDashboardService.getSummary(usuario))
  const [weeklyData, setWeeklyData] = useState(() => adminDashboardService.getWeeklyActivity(usuario))
  const [activeTab, setActiveTab] = useState('entregas') // 'entregas' | 'devoluciones'
  const [searchTerm, setSearchTerm] = useState('')
  const [lastSync, setLastSync] = useState(new Date())

  // Calendario Fecha Seleccionada (Por defecto hoy)
  const [selectedDate, setSelectedDate] = useState(todayStr)

  // Sincronización en tiempo real (Polling cada 2.5s)
  useEffect(() => {
    const refreshData = () => {
      setSummary(adminDashboardService.getSummary(usuario))
      setWeeklyData(adminDashboardService.getWeeklyActivity(usuario))
      setLastSync(new Date())
    }

    refreshData()
    const timer = setInterval(refreshData, 2500)
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
  const incidentsRoute = isBranchManager ? '/encargado/incidents' : '/admin/incidents'

  // Filtrado de entregas y devoluciones por la fecha del calendario seleccionada
  const { dateDeliveriesList, dateReturnsList } = useMemo(() => {
    const reservations = summary.allBranchReservations || []
    const isCancelled = (st) => ['CANCELADA', 'CANCELADA_POR_TIEMPO'].includes(String(st).toUpperCase())

    const del = reservations.filter((r) => {
      if (isCancelled(r.estado)) return false
      const d = String(r.reservaDetalles?.fechaInicio || r.fechaInicio || '').slice(0, 10)
      return d === selectedDate
    })

    const ret = reservations.filter((r) => {
      if (isCancelled(r.estado)) return false
      const d = String(r.reservaDetalles?.fechaFin || r.fechaFin || '').slice(0, 10)
      return d === selectedDate
    })

    return { dateDeliveriesList: del, dateReturnsList: ret }
  }, [summary, selectedDate])

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

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={branchOnly} />

      <main className="management-main" style={{ padding: '28px 36px', background: 'var(--adm-bg, #f8fafc)', minHeight: '100vh' }}>
        {/* Cabecera Limpia con Indicador de Tiempo Real */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 20 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 20, marginBottom: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1d4ed8' }}>
                {isBranchManager ? `Sede: ${summary.branch || 'Sucursal Bogotá Aeropuerto'}` : 'Administración Central Drivique'}
              </span>
              <span style={{ fontSize: 11, color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
                <FaSync style={{ fontSize: 10, color: '#10b981' }} /> En Tiempo Real ({lastSync.toLocaleTimeString().slice(0, 5)})
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '2px 0 4px', letterSpacing: '-0.01em' }}>
              Dashboard Operativo
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
              Resumen en tiempo real de entregas, devoluciones y estado de la flota local.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <MenuConfiguracion />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#ffffff', padding: '6px 14px', borderRadius: 30, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                {(usuario?.nombre || usuario?.correo || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <strong style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'block', lineHeight: 1.1 }}>
                  {usuario?.nombre || 'Encargado de Sucursal'}
                </strong>
                <small style={{ fontSize: 11, color: '#64748b' }}>
                  {isBranchManager ? 'Administrador de Sucursal' : 'Admin Principal'}
                </small>
              </div>
            </div>
          </div>
        </header>

        {/* Acciones Rápidas Minimalistas */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate(cashRoute)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              background: '#2563eb',
              border: 'none',
              borderRadius: 10,
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
              transition: 'background 0.2s ease',
            }}
          >
            <FaMoneyBillWave /> Gestión de Pagos
          </button>

          <button
            type="button"
            onClick={() => navigate(reservationsRoute)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              background: '#0284c7',
              border: 'none',
              borderRadius: 10,
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)',
            }}
          >
            <FaPlus /> Crear Reserva Manual
          </button>

          <button
            type="button"
            onClick={() => navigate(incidentsRoute)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 10,
              color: '#334155',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <FaTools style={{ color: '#d97706' }} /> Reportar Incidencia / Taller
          </button>
        </div>

        {/* Tarjetas KPI Limpias (4 Métricas Clave) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          {/* KPI 1: Ingresos del Mes */}
          <div style={{ background: '#ffffff', padding: 18, borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Ingresos del Mes</span>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                <FaDollarSign />
              </div>
            </div>
            <strong style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', display: 'block' }}>
              {formatCurrency(summary.monthlyRevenue || 0, moneda, tasaUSD)}
            </strong>
            <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>Facturación acumulada en sede</span>
          </div>

          {/* KPI 2: Tasa de Ocupación */}
          <div style={{ background: '#ffffff', padding: 18, borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Tasa de Ocupación</span>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                <FaChartLine />
              </div>
            </div>
            <strong style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', display: 'block' }}>
              {occupancy}%
            </strong>
            <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>{rentedVehicles} de {totalVehicles} autos alquilados</span>
          </div>

          {/* KPI 3: Entregas de Hoy */}
          <div style={{ background: '#ffffff', padding: 18, borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Entregas de Hoy</span>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                <FaCalendarCheck />
              </div>
            </div>
            <strong style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', display: 'block' }}>
              {summary.todayDeliveries} recogidas
            </strong>
            <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>Clientes en mostrador</span>
          </div>

          {/* KPI 4: Devoluciones de Hoy */}
          <div style={{ background: '#ffffff', padding: 18, borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Devoluciones de Hoy</span>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                <FaCheckCircle />
              </div>
            </div>
            <strong style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', display: 'block' }}>
              {summary.todayReturns} retornos
            </strong>
            <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>Vehículos retornando a sede</span>
          </div>
        </div>

        {/* GRÁFICAS MINIMALISTAS Y 100% EN TIEMPO REAL */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 28 }}>
          
          {/* Gráfica 1: Ocupación y Estado de la Flota */}
          <div style={{ background: '#ffffff', padding: 22, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  Estado de la Flota
                </h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>Distribución de los {totalVehicles} vehículos de la sucursal</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '4px 10px', borderRadius: 20 }}>
                {totalVehicles} Autos
              </span>
            </div>

            {/* Barra de progreso combinada visual */}
            <div style={{ height: 12, borderRadius: 6, background: '#f1f5f9', overflow: 'hidden', display: 'flex', marginBottom: 20 }}>
              <div style={{ width: `${availPct}%`, background: '#10b981', transition: 'width 0.4s' }} title={`Disponibles: ${availPct}%`} />
              <div style={{ width: `${rentedPct}%`, background: '#2563eb', transition: 'width 0.4s' }} title={`En Alquiler: ${rentedPct}%`} />
              <div style={{ width: `${maintPct}%`, background: '#f59e0b', transition: 'width 0.4s' }} title={`En Taller: ${maintPct}%`} />
            </div>

            {/* Lista Desglosada Limpia */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Disponibles</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{availableVehicles} autos</strong>
                  <span style={{ fontSize: 11, color: '#64748b', marginLeft: 6 }}>({availPct}%)</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563eb' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>En Alquiler</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{rentedVehicles} autos</strong>
                  <span style={{ fontSize: 11, color: '#64748b', marginLeft: 6 }}>({rentedPct}%)</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>En Taller / Mantenimiento</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{maintenanceVehicles} autos</strong>
                  <span style={{ fontSize: 11, color: '#64748b', marginLeft: 6 }}>({maintPct}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfica 2: Diagrama de Barras Agrupadas Estándar */}
          <div style={{ background: '#ffffff', padding: 22, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  Actividad Semanal
                </h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>Entregas vs. Devoluciones de la semana</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: '#2563eb' }} /> Entregas
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: '#10b981' }} /> Devoluciones
                </span>
              </div>
            </div>

            {/* SVG Grouped Bar Chart */}
            <WeeklyGroupedBarChart data={weeklyData} />
          </div>

        </div>

        {/* TABLA OPERATIVA CON CALENDARIO SENCILLO Y BUSCADOR */}
        <section style={{ background: '#ffffff', padding: 22, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                Programación Operativa de Sucursal
              </h2>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                {selectedDate === todayStr ? 'Atención presencial programada para Hoy' : `Atención presencial programada para el ${selectedDate}`}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {/* Calendario Sencillo */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: '6px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}>
                <FaCalendarAlt style={{ color: '#2563eb', fontSize: 13 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Fecha:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
              </div>

              {/* Buscador en Vivo */}
              <div style={{ position: 'relative', minWidth: 200 }}>
                <FaSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 12 }} />
                <input
                  type="text"
                  placeholder="Buscar cliente, auto o placa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px 7px 30px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: 12,
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Botones de Pestaña */}
              <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 8 }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('entregas')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 12,
                    border: 'none',
                    background: activeTab === 'entregas' ? '#ffffff' : 'transparent',
                    color: activeTab === 'entregas' ? '#0f172a' : '#64748b',
                    boxShadow: activeTab === 'entregas' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  Entregas ({dateDeliveriesList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('devoluciones')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 12,
                    border: 'none',
                    background: activeTab === 'devoluciones' ? '#ffffff' : 'transparent',
                    color: activeTab === 'devoluciones' ? '#0f172a' : '#64748b',
                    boxShadow: activeTab === 'devoluciones' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  Devoluciones ({dateReturnsList.length})
                </button>
              </div>
            </div>
          </div>

          {filteredList.length === 0 ? (
            <div style={{ padding: '36px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
              <FaCalendarCheck style={{ fontSize: 28, color: '#94a3b8', marginBottom: 8 }} />
              <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#334155' }}>
                No hay {activeTab === 'entregas' ? 'entregas' : 'devoluciones'} {searchTerm ? 'que coincidan' : `para la fecha ${selectedDate}`}
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                {searchTerm ? 'Intenta borrar el texto del buscador.' : 'Selecciona otra fecha en el calendario.'}
              </p>
            </div>
          ) : (
            <div className="cities-table-wrap">
              <table className="branches-table" style={{ width: '100%', minWidth: 900 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', fontWeight: 700 }}>ID Reserva</th>
                    <th style={{ textAlign: 'left', fontWeight: 700 }}>Imagen</th>
                    <th style={{ textAlign: 'left', fontWeight: 700 }}>Vehículo</th>
                    <th style={{ textAlign: 'left', fontWeight: 700 }}>Placa</th>
                    <th style={{ textAlign: 'left', fontWeight: 700 }}>Cliente</th>
                    <th style={{ textAlign: 'left', fontWeight: 700 }}>Fecha / Hora</th>
                    <th style={{ textAlign: 'left', fontWeight: 700 }}>Medio Pago</th>
                    <th style={{ textAlign: 'left', fontWeight: 700 }}>Estado Pago</th>
                    <th style={{ textAlign: 'center', fontWeight: 700 }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((r) => {
                    const cod = r.codigo || r.referencia || `RES-${r.id}`
                    const rawMetodo = String(r.reservaDetalles?.metodoPago || r.pasarela || r.metodoPago || '').toLowerCase()
                    const esEfectivo = rawMetodo.includes('efectivo') || rawMetodo.includes('sucursal')
                    const textoMedio = esEfectivo ? 'Pago en Sucursal' : 'Wompi - Tarjeta'
                    const estaPagado = r.pagoEstado === 'aprobado' || Boolean(r.metodoPagoConfirmado) || r.estado === 'confirmada' || r.estado === 'en_curso' || r.estado === 'finalizada'
                    const fechaTxt = activeTab === 'entregas'
                      ? (r.reservaDetalles?.fechaInicio || r.fechaInicio || '')
                      : (r.reservaDetalles?.fechaFin || r.fechaFin || '')

                    return (
                      <tr key={r.id || cod}>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{cod}</td>

                        <td>
                          {r.vehiculoImagen ? (
                            <img
                              src={r.vehiculoImagen}
                              alt={r.vehiculoNombre || 'Auto'}
                              style={{
                                width: 40,
                                height: 26,
                                borderRadius: 4,
                                objectFit: 'cover',
                                border: '1px solid #e2e8f0',
                                display: 'block',
                              }}
                            />
                          ) : (
                            <div style={{ width: 30, height: 30, borderRadius: 6, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                              <FaCar />
                            </div>
                          )}
                        </td>

                        <td style={{ fontWeight: 600, color: '#0f172a' }}>
                          {r.vehiculoNombre || 'Mazda CX-5'}
                        </td>

                        <td>
                          <span style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                            {r.vehiculoPlaca || 'KLS-849'}
                          </span>
                        </td>

                        <td style={{ color: '#0f172a' }}>
                          {r.clienteNombre || r.datosForm?.nombres || 'Cliente Drivique'}
                        </td>

                        <td>
                          <span style={{ fontSize: 12, color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <FaClock />
                            {fechaTxt ? (fechaTxt.length > 10 ? `${fechaTxt.slice(0, 10)} ${fechaTxt.slice(11, 16)}` : fechaTxt) : '08:00 AM'}
                          </span>
                        </td>

                        <td style={{ fontSize: 12 }}>{textoMedio}</td>

                        <td>
                          <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: estaPagado ? '#ecfdf5' : '#fffbe1', color: estaPagado ? '#047857' : '#b45309', border: `1px solid ${estaPagado ? '#a7f3d0' : '#fde68a'}` }}>
                            {estaPagado ? 'Recibido' : 'No Recibido'}
                          </span>
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          {!estaPagado && esEfectivo ? (
                            <button
                              type="button"
                              onClick={() => navigate(`${cashRoute}?ref=${encodeURIComponent(cod)}`)}
                              style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '5px 12px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}
                            >
                              Cobrar en Caja
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => navigate(reservationsRoute)}
                              style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '5px 12px', borderRadius: 6, fontSize: 11.5, fontWeight: 500, cursor: 'pointer' }}
                            >
                              Ver Reserva
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
