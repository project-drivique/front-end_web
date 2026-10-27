import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaCheckCircle, FaDollarSign, FaCalendarCheck, FaMoneyBillWave, FaPlus, FaSearch, FaChartLine, FaSync } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { adminDashboardService } from '../../../services/adminDashboardService'
import { formatCurrency } from '../../../utils/currencyUtils'
import BranchDashboard from './BranchDashboard'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from './ManagementSidebar'
import './ManagementDashboard.css'

function WeeklyGroupedBarChart({ data = [], isDark = false }) {
  const { t } = useTranslation()
  const chartData = Array.isArray(data) && data.length > 0 ? data : t('vehiculo.calendarDays', 'Lun,Mar,Mié,Jue,Vie,Sáb,Dom').split(',').map((day) => ({ day, entregas: 0, devoluciones: 0 }))
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
                stroke={tick === 0 ? (isDark ? '#475569' : '#94a3b8') : (isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9')}
                strokeWidth={tick === 0 ? '1.5' : '1'}
                strokeDasharray={tick === 0 ? 'none' : '4 4'}
              />
              <text
                x={marginLeft - 8}
                y={yPos + 4}
                fill={isDark ? '#94a3b8' : '#64748b'}
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
                fill="var(--brand-primary, #2563eb)"
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
                fill="var(--brand-primary, #2563eb)"
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
                fill={isDark ? '#cbd5e1' : '#475569'}
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
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 20 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 16px', background: c.headerBadgeBg, border: `1px solid ${c.headerBadgeBorder}`, borderRadius: 24, marginBottom: 10, boxShadow: '0 1px 3px rgba(var(--brand-primary-rgb),0.08)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <strong style={{ fontSize: 13, fontWeight: 700, color: c.headerBadgeText, letterSpacing: '-0.01em' }}>
                {isBranchManager ? t('hc3.branch_subtitle', { defaultValue: 'Sucursal: {{sucursal}}', sucursal: summary?.branch || '' }) : t('hc2.administracion_central_drivique', 'Administración Central Drivique')}
              </strong>
              <span style={{ fontSize: 11, color: c.textMuted, display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 6, borderLeft: `1px solid ${c.cardBorder}`, paddingLeft: 10 }}>
                <FaSync style={{ fontSize: 10, color: '#10b981' }} /> En Tiempo Real ({(lastSync instanceof Date ? lastSync : new Date()).toLocaleTimeString().slice(0, 5)})
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: c.text, margin: '2px 0 4px', letterSpacing: '-0.01em' }}>
              Dashboard Operativo
            </h1>
            <p style={{ fontSize: 13, color: c.textMuted, margin: 0 }}>
              Resumen en tiempo real de entregas, devoluciones y estado de la flota local.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <MenuConfiguracion />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: c.userChipBg, padding: '6px 14px', borderRadius: 30, border: `1px solid ${c.userChipBorder}`, boxShadow: c.cardShadow }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brand-primary, #2563eb)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                {(usuario?.nombre || usuario?.correo || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <strong style={{ fontSize: 13, fontWeight: 700, color: c.text, display: 'block', lineHeight: 1.1 }}>
                  {usuario?.nombre || t('hc2.encargado_de_sucursal', 'Encargado de Sucursal')}
                </strong>
                <small style={{ fontSize: 11, color: c.textMuted }}>
                  {isBranchManager ? t('hc2.administrador_de_sucursal', 'Administrador de Sucursal') : 'Admin Principal'}
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
              background: 'var(--brand-primary, #2563eb)',
              border: 'none',
              borderRadius: 10,
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(var(--brand-primary-rgb), 0.25)',
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
              background: 'var(--brand-primary)',
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

        </div>

        {/* Tarjetas KPI Limpias (4 Métricas Clave) — ICONO AL LADO DEL TÍTULO CON MISMO TAMAÑO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          {/* KPI 1: Ingresos del Mes */}
          <div style={{ background: c.card, padding: 18, borderRadius: 14, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FaDollarSign style={{ fontSize: 13, color: 'var(--brand-primary, #2563eb)' }} aria-hidden="true" />
                <span style={{ fontSize: 13, fontWeight: 600, color: c.textMuted }}>{t('hc.ingresos_del_mes', 'Ingresos del Mes')}</span>
              </div>
            </div>
            <strong style={{ fontSize: 22, fontWeight: 800, color: c.text, display: 'block' }}>
              {formatCurrency(summary.monthlyRevenue || 0, moneda, tasaUSD)}
            </strong>
            <span style={{ fontSize: 11, color: c.textMuted, marginTop: 4, display: 'block' }}>{isBranchManager ? t('hc2.facturacion_acumulada_en_la_sucursal', 'Facturación acumulada en la sucursal') : t('hc2.facturacion_acumulada_de_todas_las_suc', 'Facturación acumulada de todas las sucursales')}</span>
          </div>

          {/* KPI 2: Tasa de Ocupación */}
          <div style={{ background: c.card, padding: 18, borderRadius: 14, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FaChartLine style={{ fontSize: 13, color: 'var(--brand-primary, #2563eb)' }} aria-hidden="true" />
                <span style={{ fontSize: 13, fontWeight: 600, color: c.textMuted }}>{t('hc.tasa_de_ocupacion', 'Tasa de Ocupación')}</span>
              </div>
            </div>
            <strong style={{ fontSize: 22, fontWeight: 800, color: c.text, display: 'block' }}>
              {occupancy}%
            </strong>
            <span style={{ fontSize: 11, color: c.textMuted, marginTop: 4, display: 'block' }}>{rentedVehicles} de {totalVehicles} vehículo{totalVehicles === 1 ? '' : 's'} alquilado{rentedVehicles === 1 ? '' : 's'}</span>
          </div>

          {/* KPI 3: Entregas de Hoy */}
          <div style={{ background: c.card, padding: 18, borderRadius: 14, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FaCalendarCheck style={{ fontSize: 13, color: '#10b981' }} aria-hidden="true" />
                <span style={{ fontSize: 13, fontWeight: 600, color: c.textMuted }}>{t('hc.entregas_de_hoy', 'Entregas de Hoy')}</span>
              </div>
            </div>
            <strong style={{ fontSize: 22, fontWeight: 800, color: c.text, display: 'block' }}>
              {summary.todayDeliveries} recogidas
            </strong>
            <span style={{ fontSize: 11, color: c.textMuted, marginTop: 4, display: 'block' }}>{t('hc.clientes_en_mostrador', 'Clientes en mostrador')}</span>
          </div>

          {/* KPI 4: Devoluciones de Hoy */}
          <div style={{ background: c.card, padding: 18, borderRadius: 14, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FaCheckCircle style={{ fontSize: 13, color: '#f59e0b' }} aria-hidden="true" />
                <span style={{ fontSize: 13, fontWeight: 600, color: c.textMuted }}>{t('hc.devoluciones_de_hoy', 'Devoluciones de Hoy')}</span>
              </div>
            </div>
            <strong style={{ fontSize: 22, fontWeight: 800, color: c.text, display: 'block' }}>
              {summary.todayReturns} retornos
            </strong>
            <span style={{ fontSize: 11, color: c.textMuted, marginTop: 4, display: 'block' }}>{isBranchManager ? t('hc2.vehiculos_retornando_a_la_sucursal', 'Vehículos retornando a la sucursal') : t('hc2.vehiculos_retornando_a_las_sucursales', 'Vehículos retornando a las sucursales')}</span>
          </div>
        </div>

        {/* GRÁFICAS MINIMALISTAS Y 100% EN TIEMPO REAL */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 28 }}>
          
          {/* Gráfica 1: Ocupación y Estado de la Flota */}
          <div style={{ background: c.card, padding: 22, borderRadius: 16, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: c.text }}>
                  Estado de la Flota
                </h3>
                <span style={{ fontSize: 12, color: c.textMuted }}>{isBranchManager ? t('hc3.fleet_dist_branch', { defaultValue: 'Distribución de los {{total}} vehículos de la sucursal', total: totalVehicles }) : t('hc3.fleet_dist_all', { defaultValue: 'Distribución de los {{total}} vehículos de todas las sucursales', total: totalVehicles })}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: c.tagText, background: c.tagBg, padding: '4px 10px', borderRadius: 20 }}>
                {totalVehicles} Vehículo{totalVehicles === 1 ? '' : 's'}
              </span>
            </div>

            {/* Barra de progreso combinada visual */}
            <div style={{ height: 12, borderRadius: 6, background: c.trackBg, overflow: 'hidden', display: 'flex', marginBottom: 20 }}>
              <div style={{ width: `${availPct}%`, background: '#10b981', transition: 'width 0.4s' }} title={`Disponibles: ${availPct}%`} />
              <div style={{ width: `${rentedPct}%`, background: 'var(--brand-primary, #2563eb)', transition: 'width 0.4s' }} title={`En Alquiler: ${rentedPct}%`} />
              <div style={{ width: `${maintPct}%`, background: '#f59e0b', transition: 'width 0.4s' }} title={`En Taller: ${maintPct}%`} />
            </div>

            {/* Lista Desglosada Limpia */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: c.textSecondary }}>{t('hc4.disponibles', 'Disponibles')}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{availableVehicles} autos</strong>
                  <span style={{ fontSize: 11, color: c.textMuted, marginLeft: 6 }}>({availPct}%)</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--brand-primary, #2563eb)' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: c.textSecondary }}>{t('hc.en_alquiler', 'En Alquiler')}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{rentedVehicles} autos</strong>
                  <span style={{ fontSize: 11, color: c.textMuted, marginLeft: 6 }}>({rentedPct}%)</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: c.textSecondary }}>{t('hc.en_taller_mantenimiento', 'En Taller / Mantenimiento')}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{maintenanceVehicles} autos</strong>
                  <span style={{ fontSize: 11, color: c.textMuted, marginLeft: 6 }}>({maintPct}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfica 2: Diagrama de Barras Agrupadas Estándar */}
          <div style={{ background: c.card, padding: 22, borderRadius: 16, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: c.text }}>
                  Actividad Semanal
                </h3>
                <span style={{ fontSize: 12, color: c.textMuted }}>{t('hc.entregas_vs_devoluciones_de_la_semana', 'Entregas vs. Devoluciones de la semana')}</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--brand-primary, #2563eb)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--brand-primary, #2563eb)' }} /> Entregas
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: '#10b981' }} /> Devoluciones
                </span>
              </div>
            </div>

            {/* SVG Grouped Bar Chart */}
            <WeeklyGroupedBarChart data={weeklyData} isDark={isDark} />
          </div>

        </div>

        {/* TABLA OPERATIVA CON BUSCADOR Y PESTAÑAS */}
        <section style={{ background: c.card, padding: 22, borderRadius: 16, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: c.text }}>
                Programación Operativa de Sucursal
              </h2>
              <span style={{ fontSize: 12, color: c.textMuted }}>
                Atención presencial de entregas y devoluciones de la sede
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>

              {/* Buscador en Vivo */}
              <div style={{ position: 'relative', minWidth: 200 }}>
                <FaSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: c.textMuted, fontSize: 12 }} />
                <input
                  type="text"
                  placeholder={t('hc.buscar_cliente_auto_o_placa', 'Buscar cliente, auto o placa...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px 7px 30px',
                    borderRadius: 8,
                    border: `1px solid ${c.searchInputBorder}`,
                    background: c.searchInputBg,
                    fontSize: 12,
                    color: c.text,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Botones de Pestaña */}
              <div style={{ display: 'flex', background: c.tabContainerBg, padding: 3, borderRadius: 8 }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('entregas')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 12,
                    border: 'none',
                    background: activeTab === 'entregas' ? c.tabActiveBg : 'transparent',
                    color: activeTab === 'entregas' ? c.tabActiveText : c.tabInactiveText,
                    boxShadow: activeTab === 'entregas' ? (isDark ? '0 1px 4px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.08)') : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
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
                    background: activeTab === 'devoluciones' ? c.tabActiveBg : 'transparent',
                    color: activeTab === 'devoluciones' ? c.tabActiveText : c.tabInactiveText,
                    boxShadow: activeTab === 'devoluciones' ? (isDark ? '0 1px 4px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.08)') : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Devoluciones ({dateReturnsList.length})
                </button>
              </div>
            </div>
          </div>

          {filteredList.length === 0 ? (
            <div style={{ padding: '44px 20px', textAlign: 'center', background: c.emptyBoxBg, borderRadius: 12, border: `1px dashed ${c.emptyBoxBorder}` }}>
              <FaCalendarCheck style={{ fontSize: 32, color: c.textMuted, marginBottom: 10 }} />
              <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: c.text }}>
                No hay {activeTab === 'entregas' ? 'entregas' : 'devoluciones'} registradas
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: c.textMuted }}>
                {searchTerm ? t('hc2.no_se_encontraron_resultados_para_tu_b', 'No se encontraron resultados para tu búsqueda.') : t('hc2.no_existen_actividades_pendientes_en_e', 'No existen actividades pendientes en esta sección.')}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: 12, border: `1px solid ${c.tableBorder}`, boxShadow: c.cardShadow }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 980 }}>
                <thead>
                  <tr style={{ background: c.tableTheadBg, borderBottom: `2px solid ${c.tableBorder}` }}>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', width: 50 }}>ID</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('hc.codigo_reserva', 'CÓDIGO RESERVA')}</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>IMAGEN</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('hc.nombre_vehiculo', 'NOMBRE VEHÍCULO')}</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>PLACA</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('hc2.nombre_completo', 'NOMBRE COMPLETO')}</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>FECHA</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>HORA</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('hc.medio_de_pago', 'MEDIO DE PAGO')}</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>ESTADO</th>
                    <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>{t('hc.accion', 'ACCIÓN')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((r, index) => {
                    const rawCod = r.codigo || r.referencia || `RES-${r.id}`
                    const rawMetodo = String(r.reservaDetalles?.metodoPago || r.pasarela || r.metodoPago || '').toLowerCase()
                    const esEfectivo = rawMetodo.includes('efectivo') || rawMetodo.includes('sucursal')
                    const textoMedio = esEfectivo ? t('hc2.sucursal_efectivo', 'Sucursal (Efectivo)') : 'Wompi (Tarjeta)'
                    const estaPagado = r.pagoEstado === 'aprobado' || Boolean(r.metodoPagoConfirmado) || r.estado === 'confirmada' || r.estado === 'en_curso' || r.estado === 'finalizada'
                    
                    const fechaRaw = activeTab === 'entregas'
                      ? (r.reservaDetalles?.fechaInicio || r.fechaInicio || '')
                      : (r.reservaDetalles?.fechaFin || r.fechaFin || '')
                    
                    const fechaSolo = fechaRaw ? fechaRaw.slice(0, 10) : 'N/A'
                    // La hora que el servidor ya entregó en hora local; la fecha sola no la trae
                    const horaSolo = (activeTab === 'entregas' ? r.horaInicio : r.horaFin) || (fechaRaw && fechaRaw.length > 10 ? fechaRaw.slice(11, 16) : '—')
                    const clienteNombre = r.clienteNombre || r.datosForm?.nombres || t('hc2.cliente_drivique', 'Cliente Drivique')

                    return (
                      <tr
                        key={r.id || rawCod || index}
                        style={{
                          borderBottom: `1px solid ${c.tableRowBorder}`,
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = c.tableRowHover)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* ID */}
                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 400, color: c.textMuted, textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {index + 1}
                        </td>

                        {/* CÓDIGO */}
                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: c.text, whiteSpace: 'nowrap' }}>
                          {rawCod}
                        </td>

                        {/* FOTO */}
                        <td style={{ padding: '12px 14px' }}>
                          {r.vehiculoImagen ? (
                            <img
                              src={r.vehiculoImagen}
                              alt={r.vehiculoNombre || 'Auto'}
                              title={t('hc.haz_clic_para_ver_foto_completa', 'Haz clic para ver foto completa')}
                              onClick={() => setZoomImage({ url: r.vehiculoImagen, title: t('hc3.zoom_title', { defaultValue: '{{nombre}} ({{placa}})', nombre: r.vehiculoNombre || t('hc3.vehicle_word', 'Vehículo'), placa: r.vehiculoPlaca || t('hc3.plate_word', 'Placa') }) })}
                              style={{
                                width: 44,
                                height: 30,
                                borderRadius: 6,
                                objectFit: 'cover',
                                border: `1px solid ${c.cardBorder}`,
                                display: 'block',
                                cursor: 'zoom-in',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.15)'
                                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.25)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)'
                                e.currentTarget.style.boxShadow = 'none'
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: 12, color: c.textMuted }}>—</span>
                          )}
                        </td>

                        {/* VEHÍCULO */}
                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: c.text, whiteSpace: 'nowrap' }}>
                          {r.vehiculoNombre || 'Mazda CX-5'}
                        </td>

                        {/* PLACA */}
                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 500, color: c.text, whiteSpace: 'nowrap' }}>
                          {r.vehiculoPlaca || 'KLS-849'}
                        </td>

                        {/* NOMBRE COMPLETO */}
                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 400, color: c.textSecondary, whiteSpace: 'nowrap' }}>
                          {clienteNombre}
                        </td>

                        {/* FECHA */}
                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 400, color: c.textSecondary, whiteSpace: 'nowrap' }}>
                          {fechaSolo}
                        </td>

                        {/* HORA */}
                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 400, color: c.textSecondary, whiteSpace: 'nowrap' }}>
                          {horaSolo}
                        </td>

                        {/* MEDIO DE PAGO */}
                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 400, color: c.textSecondary, whiteSpace: 'nowrap' }}>
                          {textoMedio}
                        </td>

                        {/* ESTADO */}
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            background: estaPagado ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#ecfdf5') : (isDark ? 'rgba(245, 158, 11, 0.2)' : '#fffbe1'),
                            color: estaPagado ? (isDark ? '#34d399' : '#047857') : (isDark ? '#fbbf24' : '#b45309'),
                            border: `1px solid ${estaPagado ? (isDark ? '#059669' : '#a7f3d0') : (isDark ? '#d97706' : '#fde68a')}`,
                          }}>
                            {estaPagado ? t('hc5.received', 'Recibido') : t('hc5.not_received', 'No Recibido')}
                          </span>
                        </td>

                        {/* ACCIÓN */}
                        <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {!estaPagado && esEfectivo ? (
                            <button
                              type="button"
                              onClick={() => navigate(`${cashRoute}?ref=${encodeURIComponent(rawCod)}`)}
                              style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(4,120,87,0.25)', transition: 'transform 0.15s ease' }}
                              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                            >
                              Cobrar en Caja
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => navigate(reservationsRoute)}
                              style={{ background: 'var(--brand-gradient, linear-gradient(135deg, var(--brand-primary-hover) 0%, var(--brand-primary) 100%))', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(var(--brand-primary-rgb),0.25)', transition: 'transform 0.15s ease' }}
                              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
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

        {/* MODAL DE ZOOM DE FOTO DE VEHÍCULO */}
        {zoomImage && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(5px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setZoomImage(null)}
          >
            <div
              style={{
                position: 'relative',
                background: c.zoomModalBg,
                border: `1px solid ${c.cardBorder}`,
                borderRadius: 16,
                padding: 20,
                maxWidth: 580,
                width: '100%',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: c.text }}>{zoomImage.title}</h3>
                <button
                  type="button"
                  onClick={() => setZoomImage(null)}
                  style={{
                    background: c.zoomCloseBtnBg,
                    border: 'none',
                    borderRadius: '50%',
                    width: 30,
                    height: 30,
                    fontWeight: 700,
                    color: c.textMuted,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              </div>
              <img
                src={zoomImage.url}
                alt={zoomImage.title}
                style={{
                  width: '100%',
                  maxHeight: 380,
                  objectFit: 'contain',
                  borderRadius: 10,
                  background: c.bg,
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
