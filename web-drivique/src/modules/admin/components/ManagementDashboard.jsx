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
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { adminDashboardService } from '../../../services/adminDashboardService'
import { formatCurrency } from '../../../utils/currencyUtils'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from './ManagementSidebar'
import './ManagementDashboard.css'

function WeeklyGroupedBarChart({ data = [] }) {
  const chartData = Array.isArray(data) && data.length > 0 ? data : [
    { day: 'Lun', entregas: 0, devoluciones: 0 },
    { day: 'Mar', entregas: 0, devoluciones: 0 },
    { day: 'Mié', entregas: 0, devoluciones: 0 },
    { day: 'Jue', entregas: 0, devoluciones: 0 },
    { day: 'Vie', entregas: 0, devoluciones: 0 },
    { day: 'Sáb', entregas: 0, devoluciones: 0 },
    { day: 'Dom', entregas: 0, devoluciones: 0 },
  ]
  const maxDataVal = Math.max(
    ...chartData.map((d) => Math.max(Number(d?.entregas) || 0, Number(d?.devoluciones) || 0)),
    4
  )
  const maxVal = Math.max(4, Math.ceil(maxDataVal / 4) * 4)
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

  const numCategories = chartData.length
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
        {chartData.map((item, idx) => {
          const groupCenterX = marginLeft + idx * categoryWidth + categoryWidth / 2
          const entregasVal = Number(item?.entregas) || 0
          const devolucionesVal = Number(item?.devoluciones) || 0

          // Bar 1: Entregas
          const hEntregas = (entregasVal / maxVal) * chartHeight
          const yEntregas = marginTop + chartHeight - hEntregas
          const xEntregas = groupCenterX - barWidth - barGap / 2

          // Bar 2: Devoluciones
          const hDevoluciones = (devolucionesVal / maxVal) * chartHeight
          const yDevoluciones = marginTop + chartHeight - hDevoluciones
          const xDevoluciones = groupCenterX + barGap / 2

          return (
            <g key={item.day || idx}>
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
                <title>{`Entregas ${item.day}: ${entregasVal}`}</title>
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
                {entregasVal}
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
                <title>{`Devoluciones ${item.day}: ${devolucionesVal}`}</title>
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
                {devolucionesVal}
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
  const [summary, setSummary] = useState(() => adminDashboardService.getSummary(usuario) || {})
  const [weeklyData, setWeeklyData] = useState(() => adminDashboardService.getWeeklyActivity(usuario) || [])
  const [activeTab, setActiveTab] = useState('entregas') // 'entregas' | 'devoluciones'
  const [searchTerm, setSearchTerm] = useState('')
  const [lastSync, setLastSync] = useState(new Date())

  // Sincronización en tiempo real (Polling cada 2.5s)
  useEffect(() => {
    const refreshData = () => {
      setSummary(adminDashboardService.getSummary(usuario) || {})
      setWeeklyData(adminDashboardService.getWeeklyActivity(usuario) || [])
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
                <FaSync style={{ fontSize: 10, color: '#10b981' }} /> En Tiempo Real ({(lastSync instanceof Date ? lastSync : new Date()).toLocaleTimeString().slice(0, 5)})
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

        {/* TABLA OPERATIVA CON BUSCADOR Y PESTAÑAS */}
        <section style={{ background: '#ffffff', padding: 22, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                Programación Operativa de Sucursal
              </h2>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                Atención presencial de entregas y devoluciones de la sede
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>

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
            <div style={{ padding: '44px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
              <FaCalendarCheck style={{ fontSize: 32, color: '#94a3b8', marginBottom: 10 }} />
              <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                No hay {activeTab === 'entregas' ? 'entregas' : 'devoluciones'} registradas
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No existen actividades pendientes en esta sección.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 980 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Código</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Foto</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vehículo</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Placa</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cliente</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fecha</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hora</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Medio de Pago</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estado</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((r, index) => {
                    const rawCod = r.codigo || r.referencia || `RES-${r.id}`
                    const rawMetodo = String(r.reservaDetalles?.metodoPago || r.pasarela || r.metodoPago || '').toLowerCase()
                    const esEfectivo = rawMetodo.includes('efectivo') || rawMetodo.includes('sucursal')
                    const textoMedio = esEfectivo ? 'Sucursal (Efectivo)' : 'Wompi (Tarjeta)'
                    const estaPagado = r.pagoEstado === 'aprobado' || Boolean(r.metodoPagoConfirmado) || r.estado === 'confirmada' || r.estado === 'en_curso' || r.estado === 'finalizada'
                    
                    const fechaRaw = activeTab === 'entregas'
                      ? (r.reservaDetalles?.fechaInicio || r.fechaInicio || '')
                      : (r.reservaDetalles?.fechaFin || r.fechaFin || '')
                    
                    const fechaSolo = fechaRaw ? fechaRaw.slice(0, 10) : 'N/A'
                    const horaSolo = fechaRaw && fechaRaw.length > 10 ? fechaRaw.slice(11, 16) : '08:00 AM'
                    const clienteNombre = r.clienteNombre || r.datosForm?.nombres || 'Cliente Drivique'

                    return (
                      <tr
                        key={r.id || rawCod || index}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* CÓDIGO */}
                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                          {rawCod}
                        </td>

                        {/* FOTO */}
                        <td style={{ padding: '12px 14px' }}>
                          {r.vehiculoImagen ? (
                            <img
                              src={r.vehiculoImagen}
                              alt={r.vehiculoNombre || 'Auto'}
                              style={{
                                width: 42,
                                height: 28,
                                borderRadius: 5,
                                objectFit: 'cover',
                                border: '1px solid #e2e8f0',
                                display: 'block',
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
                          )}
                        </td>

                        {/* VEHÍCULO */}
                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
                          {r.vehiculoNombre || 'Mazda CX-5'}
                        </td>

                        {/* PLACA */}
                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                          {r.vehiculoPlaca || 'KLS-849'}
                        </td>

                        {/* CLIENTE */}
                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 500, color: '#334155', whiteSpace: 'nowrap' }}>
                          {clienteNombre}
                        </td>

                        {/* FECHA */}
                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 500, color: '#334155', whiteSpace: 'nowrap' }}>
                          {fechaSolo}
                        </td>

                        {/* HORA */}
                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 500, color: '#334155', whiteSpace: 'nowrap' }}>
                          {horaSolo}
                        </td>

                        {/* MEDIO DE PAGO */}
                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 500, color: '#334155', whiteSpace: 'nowrap' }}>
                          {textoMedio}
                        </td>

                        {/* ESTADO */}
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: estaPagado ? '#ecfdf5' : '#fffbe1', color: estaPagado ? '#047857' : '#b45309', border: `1px solid ${estaPagado ? '#a7f3d0' : '#fde68a'}` }}>
                            {estaPagado ? 'Recibido' : 'No Recibido'}
                          </span>
                        </td>

                        {/* ACCIÓN */}
                        <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {!estaPagado && esEfectivo ? (
                            <button
                              type="button"
                              onClick={() => navigate(`${cashRoute}?ref=${encodeURIComponent(rawCod)}`)}
                              style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '5px 12px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 3px rgba(4,120,87,0.2)' }}
                            >
                              Cobrar en Caja
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => navigate(reservationsRoute)}
                              style={{ background: '#ffffff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '5px 12px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}
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
