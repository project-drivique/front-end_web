import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaCar,
  FaCheckCircle,
  FaDollarSign,
  FaCalendarCheck,
  FaClock,
  FaBuilding,
  FaMoneyBillWave,
  FaPlus,
  FaTools,
  FaSearch,
  FaChartLine,
  FaChartPie,
  FaArrowUp,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { adminDashboardService } from '../../../services/adminDashboardService'
import { formatCurrency } from '../../../utils/currencyUtils'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from './ManagementSidebar'
import './ManagementDashboard.css'

export default function ManagementDashboard({ branchOnly = false }) {
  const { t } = useTranslation()
  const { tema, moneda, tasaUSD } = useLanding()
  const usuario = useAuthStore((state) => state.usuario)
  const navigate = useNavigate()

  const [summary] = useState(() => adminDashboardService.getSummary(usuario))
  const [activeTab, setActiveTab] = useState('entregas') // 'entregas' | 'devoluciones'
  const [searchTerm, setSearchTerm] = useState('')

  const isBranchManager = branchOnly || usuario?.rol === 'encargado' || usuario?.rol === 'branch_manager' || usuario?.rol === 'encargado_sucursal'
  const cashRoute = isBranchManager ? '/encargado/cobro-sucursal' : '/admin/cobro-sucursal'
  const reservationsRoute = isBranchManager ? '/encargado/reservations' : '/admin/reservations'
  const incidentsRoute = isBranchManager ? '/encargado/incidents' : '/admin/incidents'

  const occupancy = summary.occupancyRate || 0
  const deliveriesList = summary.todayDeliveriesList || []
  const returnsList = summary.todayReturnsList || []

  const rawList = activeTab === 'entregas' ? deliveriesList : returnsList

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

  // Datos para Gráfica de Flota
  const totalVehicles = summary.vehicleCount || 10
  const rentedVehicles = summary.rentedVehicles || 4
  const availableVehicles = summary.availableVehicles || 5
  const maintenanceVehicles = summary.maintenanceVehicles || 1

  const rentedPct = Math.round((rentedVehicles / totalVehicles) * 100)
  const availPct = Math.round((availableVehicles / totalVehicles) * 100)
  const maintPct = Math.max(0, 100 - rentedPct - availPct)

  // Datos para flujo semanal
  const weeklyData = [
    { day: 'Lun', entregas: 4, devoluciones: 3 },
    { day: 'Mar', entregas: 6, devoluciones: 5 },
    { day: 'Mié', entregas: 8, devoluciones: 7 },
    { day: 'Jue', entregas: 5, devoluciones: 6 },
    { day: 'Vie', entregas: 10, devoluciones: 8 },
    { day: 'Sáb', entregas: 12, devoluciones: 11 },
    { day: 'Dom', entregas: 7, devoluciones: 9 },
  ]
  const maxWeekly = 14

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={branchOnly} />

      <main className="management-main" style={{ padding: '24px 32px' }}>
        {/* Cabecera Superior Minimalista */}
        <header className="management-header" style={{ marginBottom: 20 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: 'rgba(37, 99, 235, 0.08)', borderRadius: 999, marginBottom: 8, border: '1px solid rgba(37, 99, 235, 0.2)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary, #2563eb)' }}>
                {isBranchManager ? `Sede Asignada: ${summary.branch || 'ALAMO BOGOTÁ - AEROPUERTO'}` : 'Administración Central Drivique'}
              </span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--adm-text, #0f172a)', margin: '4px 0 6px', letterSpacing: '-0.02em' }}>
              Dashboard Operativo de Sucursal
            </h1>
            <p className="management-subtitle" style={{ fontSize: 13.5, color: 'var(--adm-muted, #64748b)', margin: 0 }}>
              Tablero de control en tiempo real: Entregas, devoluciones, ocupación de flota y recaudación en caja.
            </p>
          </div>

          <div className="management-header__actions" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <MenuConfiguracion />
            <div className="management-user" style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--adm-card, #fff)', padding: '6px 14px 6px 6px', borderRadius: 999, border: '1px solid var(--adm-border, #e2e8f0)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}>
                {(usuario?.nombre || usuario?.correo || 'U').charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: 13, fontWeight: 800, color: 'var(--adm-text, #0f172a)', lineHeight: 1.1 }}>
                  {usuario?.nombre || 'Andrés Felipe Castro'}
                </strong>
                <small style={{ fontSize: 11, color: 'var(--brand-primary, #2563eb)', fontWeight: 700 }}>
                  {isBranchManager ? 'Encargado de Sucursal' : 'Administrador Principal'}
                </small>
              </div>
            </div>
          </div>
        </header>

        {/* Botones de Acción Rápida Operativos */}
        <section style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate(cashRoute)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 18px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
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
              padding: '11px 18px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)',
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
              padding: '11px 18px',
              background: 'var(--adm-card, #fff)',
              border: '1px solid var(--adm-border, #e2e8f0)',
              borderRadius: 12,
              color: 'var(--adm-text, #334155)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <FaTools style={{ color: '#f59e0b' }} /> Reportar Incidencia / Taller
          </button>
        </section>

        {/* Tarjetas KPI Principales (4 Métricas) */}
        <section className="management-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
          {/* KPI 1: Ingresos del Mes */}
          <article className="management-kpi" style={{ background: 'var(--adm-card, #fff)', padding: 20, borderRadius: 16, border: '1px solid var(--adm-border, #e2e8f0)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              <FaDollarSign />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--adm-muted, #64748b)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ingresos del Mes</p>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#10b981', background: '#d1fae5', padding: '2px 6px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <FaArrowUp style={{ fontSize: 8 }} /> +14%
                </span>
              </div>
              <strong style={{ fontSize: 22, fontWeight: 900, color: 'var(--adm-text, #0f172a)', display: 'block', margin: '4px 0 2px' }}>
                {formatCurrency(summary.monthlyRevenue || 0, moneda, tasaUSD)}
              </strong>
              <small style={{ fontSize: 11, color: 'var(--adm-muted, #94a3b8)' }}>Facturación acumulada en la sede</small>
            </div>
          </article>

          {/* KPI 2: Tasa de Ocupación */}
          <article className="management-kpi" style={{ background: 'var(--adm-card, #fff)', padding: 20, borderRadius: 16, border: '1px solid var(--adm-border, #e2e8f0)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: occupancy > 70 ? '#ecfdf5' : occupancy >= 40 ? '#fffbe1' : '#fef2f2', color: occupancy > 70 ? '#10b981' : occupancy >= 40 ? '#f59e0b' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              <FaChartLine />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--adm-muted, #64748b)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tasa de Ocupación</p>
                <span style={{ fontSize: 10, fontWeight: 800, color: occupancy > 70 ? '#047857' : '#b45309', background: occupancy > 70 ? '#d1fae5' : '#fef3c7', padding: '2px 6px', borderRadius: 999 }}>
                  {occupancy > 70 ? 'Alta' : occupancy >= 40 ? 'Media' : 'Baja'}
                </span>
              </div>
              <strong style={{ fontSize: 22, fontWeight: 900, color: 'var(--adm-text, #0f172a)', display: 'block', margin: '4px 0 2px' }}>
                {occupancy}%
              </strong>
              <small style={{ fontSize: 11, color: 'var(--adm-muted, #94a3b8)' }}>{rentedVehicles} de {totalVehicles} vehículos alquilados</small>
            </div>
          </article>

          {/* KPI 3: Entregas de Hoy */}
          <article className="management-kpi" style={{ background: 'var(--adm-card, #fff)', padding: 20, borderRadius: 16, border: '1px solid var(--adm-border, #e2e8f0)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              <FaCalendarCheck />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--adm-muted, #64748b)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Entregas de Hoy</p>
              <strong style={{ fontSize: 22, fontWeight: 900, color: 'var(--adm-text, #0f172a)', display: 'block', margin: '4px 0 2px' }}>
                {summary.todayDeliveries} recogidas
              </strong>
              <small style={{ fontSize: 11, color: 'var(--adm-muted, #94a3b8)' }}>Clientes citados en mostrador</small>
            </div>
          </article>

          {/* KPI 4: Devoluciones de Hoy */}
          <article className="management-kpi" style={{ background: 'var(--adm-card, #fff)', padding: 20, borderRadius: 16, border: '1px solid var(--adm-border, #e2e8f0)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              <FaCheckCircle />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--adm-muted, #64748b)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Devoluciones de Hoy</p>
              <strong style={{ fontSize: 22, fontWeight: 900, color: 'var(--adm-text, #0f172a)', display: 'block', margin: '4px 0 2px' }}>
                {summary.todayReturns} retornos
              </strong>
              <small style={{ fontSize: 11, color: 'var(--adm-muted, #94a3b8)' }}>Vehículos retornando a sede</small>
            </div>
          </article>
        </section>

        {/* SECCIÓN DE GRÁFICAS VISUALES DE SUCURSAL */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 28 }}>
          {/* Gráfica 1: Distribución y Estado de la Flota */}
          <div style={{ background: 'var(--adm-card, #fff)', padding: 24, borderRadius: 20, border: '1px solid var(--adm-border, #e2e8f0)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--adm-text, #0f172a)' }}>
                  Estado y Distribución de Flota
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--adm-muted, #64748b)' }}>
                  Situación de autos asignados a esta sucursal
                </p>
              </div>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(37, 99, 235, 0.08)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaChartPie />
              </div>
            </div>

            {/* Donut Chart SVG Container */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <svg width="140" height="140" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                  {/* Background Track */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--adm-border, #f1f5f9)"
                    strokeWidth="3.8"
                  />
                  {/* Segment 1: En Alquiler (Blue) */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3.8"
                    strokeDasharray={`${rentedPct}, 100`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.6s ease' }}
                  />
                  {/* Segment 2: Disponibles (Green) */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.8"
                    strokeDasharray={`${availPct}, 100`}
                    strokeDashoffset={`-${rentedPct}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.6s ease' }}
                  />
                  {/* Segment 3: En Taller (Amber) */}
                  {maintPct > 0 && (
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3.8"
                      strokeDasharray={`${maintPct}, 100`}
                      strokeDashoffset={`-${rentedPct + availPct}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 0.6s ease' }}
                    />
                  )}
                </svg>
                {/* Center text inside Donut */}
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--adm-text, #0f172a)', display: 'block', lineHeight: 1 }}>{totalVehicles}</span>
                  <small style={{ fontSize: 10, color: 'var(--adm-muted, #64748b)', fontWeight: 700, textTransform: 'uppercase' }}>Autos</small>
                </div>
              </div>

              {/* Interactive Legend List */}
              <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563eb' }} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>En Alquiler</span>
                  </div>
                  <strong style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{rentedVehicles} ({rentedPct}%)</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>Disponibles</span>
                  </div>
                  <strong style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{availableVehicles} ({availPct}%)</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>En Taller / Mant.</span>
                  </div>
                  <strong style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{maintenanceVehicles} ({maintPct}%)</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfica 2: Flujo Semanal de Entregas y Devoluciones */}
          <div style={{ background: 'var(--adm-card, #fff)', padding: 24, borderRadius: 20, border: '1px solid var(--adm-border, #e2e8f0)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--adm-text, #0f172a)' }}>
                  Flujo Semanal de Operaciones
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--adm-muted, #64748b)' }}>
                  Comparativa de Entregas vs Devoluciones por día
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, color: '#2563eb' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: '#2563eb' }} /> Entregas
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, color: '#10b981' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: '#10b981' }} /> Devoluciones
                </span>
              </div>
            </div>

            {/* Custom SVG Bar Chart */}
            <div style={{ height: 150, display: 'flex', alignItems: 'flex-end', gap: 12, padding: '10px 0 0', borderBottom: '1px solid #f1f5f9' }}>
              {weeklyData.map((item) => {
                const hEntregas = Math.round((item.entregas / maxWeekly) * 120)
                const hDevoluciones = Math.round((item.devoluciones / maxWeekly) * 120)
                return (
                  <div key={item.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 120 }}>
                      <div
                        title={`Entregas ${item.day}: ${item.entregas}`}
                        style={{
                          width: 14,
                          height: `${hEntregas}px`,
                          background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.4s ease',
                        }}
                      />
                      <div
                        title={`Devoluciones ${item.day}: ${item.devoluciones}`}
                        style={{
                          width: 14,
                          height: `${hDevoluciones}px`,
                          background: 'linear-gradient(180deg, #34d399 0%, #10b981 100%)',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.4s ease',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{item.day}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* TABLA OPERATIVA DEL DÍA CON BUSCADOR EN VIVO */}
        <section className="cities-card" style={{ padding: 24, borderRadius: 20, background: 'var(--adm-card, #fff)', border: '1px solid var(--adm-border, #e2e8f0)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-primary, #2563eb)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 2 }}>
                OPERACIÓN PRESENCIAL EN SUCURSAL
              </span>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 900, color: 'var(--adm-text, #0f172a)' }}>
                Programación Operativa de Hoy
              </h2>
            </div>

            {/* Selector de Pestaña + Buscador en Vivo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {/* Buscador en Vivo */}
              <div style={{ position: 'relative', minWidth: 240 }}>
                <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 13 }} />
                <input
                  type="text"
                  placeholder="Buscar cliente, auto o placa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    borderRadius: 10,
                    border: '1px solid var(--adm-border, #cbd5e1)',
                    background: 'var(--adm-bg, #f8fafc)',
                    fontSize: 12.5,
                    color: 'var(--adm-text, #0f172a)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Botones de Pestaña */}
              <div style={{ display: 'flex', background: '#f1f5f9', padding: 4, borderRadius: 10 }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('entregas')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 12,
                    border: 'none',
                    background: activeTab === 'entregas' ? '#2563eb' : 'transparent',
                    color: activeTab === 'entregas' ? '#fff' : '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  🔑 Entregas ({deliveriesList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('devoluciones')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 12,
                    border: 'none',
                    background: activeTab === 'devoluciones' ? '#2563eb' : 'transparent',
                    color: activeTab === 'devoluciones' ? '#fff' : '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  🏁 Devoluciones ({returnsList.length})
                </button>
              </div>
            </div>
          </div>

          {filteredList.length === 0 ? (
            <div className="cities-empty" style={{ padding: '40px 16px', textAlign: 'center', background: 'var(--adm-bg, #f8fafc)', borderRadius: 14, border: '1px solid var(--adm-border, #e2e8f0)' }}>
              <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 12px' }}>
                <FaCalendarCheck />
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: 'var(--adm-text, #0f172a)' }}>
                No hay {activeTab === 'entregas' ? 'entregas' : 'devoluciones'} {searchTerm ? 'que coincidan con la búsqueda' : 'programadas para hoy'}
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--adm-muted, #64748b)' }}>
                {searchTerm ? 'Intenta con otro término o limpia el filtro.' : 'No se registran salidas ni retornos previstos en la agenda de hoy.'}
              </p>
            </div>
          ) : (
            <div className="cities-table-wrap">
              <table className="branches-table" style={{ width: '100%', minWidth: 980 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', fontWeight: 800 }}>ID Reserva</th>
                    <th style={{ textAlign: 'left', fontWeight: 800 }}>Imagen</th>
                    <th style={{ textAlign: 'left', fontWeight: 800 }}>Vehículo</th>
                    <th style={{ textAlign: 'left', fontWeight: 800 }}>Placa</th>
                    <th style={{ textAlign: 'left', fontWeight: 800 }}>Cliente</th>
                    <th style={{ textAlign: 'left', fontWeight: 800 }}>Hora Cita</th>
                    <th style={{ textAlign: 'left', fontWeight: 800 }}>Medio de Pago</th>
                    <th style={{ textAlign: 'left', fontWeight: 800 }}>Estado Pago</th>
                    <th style={{ textAlign: 'center', fontWeight: 800 }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((r) => {
                    const cod = r.codigo || r.referencia || `RES-${r.id}`
                    const rawMetodo = String(r.reservaDetalles?.metodoPago || r.pasarela || r.metodoPago || '').toLowerCase()
                    const esEfectivo = rawMetodo.includes('efectivo') || rawMetodo.includes('sucursal')
                    const textoMedio = esEfectivo ? 'Pago en Sucursal' : 'Wompi - Tarjeta'
                    const estaPagado = r.pagoEstado === 'aprobado' || Boolean(r.metodoPagoConfirmado) || r.estado === 'confirmada' || r.estado === 'en_curso' || r.estado === 'finalizada'

                    return (
                      <tr key={r.id || cod}>
                        <td style={{ fontWeight: 700, color: 'var(--adm-text, #0f172a)' }}>{cod}</td>

                        <td>
                          {r.vehiculoImagen ? (
                            <img
                              src={r.vehiculoImagen}
                              alt={r.vehiculoNombre || 'Auto'}
                              style={{
                                width: 44,
                                height: 30,
                                borderRadius: 6,
                                objectFit: 'cover',
                                border: '1px solid #e2e8f0',
                                display: 'block',
                              }}
                            />
                          ) : (
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                              <FaCar />
                            </div>
                          )}
                        </td>

                        <td style={{ fontWeight: 600, color: 'var(--adm-text, #0f172a)' }}>
                          {r.vehiculoNombre || 'Mazda CX-5'}
                        </td>

                        <td>
                          <span style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.5px' }}>
                            {r.vehiculoPlaca || 'KLS-849'}
                          </span>
                        </td>

                        <td style={{ color: 'var(--adm-text, #0f172a)', fontWeight: 500 }}>
                          {r.clienteNombre || r.datosForm?.nombres || 'Cliente Drivique'}
                        </td>

                        <td>
                          <span style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--adm-muted, #64748b)', fontWeight: 600 }}>
                            <FaClock />
                            {activeTab === 'entregas'
                              ? (r.reservaDetalles?.fechaInicio?.slice(11, 16) || '08:00 AM')
                              : (r.reservaDetalles?.fechaFin?.slice(11, 16) || '18:00 PM')}
                          </span>
                        </td>

                        <td style={{ fontSize: 12, fontWeight: 500 }}>{textoMedio}</td>

                        <td>
                          <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800, background: estaPagado ? '#ecfdf5' : '#fffbe1', color: estaPagado ? '#047857' : '#b45309', border: `1px solid ${estaPagado ? '#a7f3d0' : '#fde68a'}` }}>
                            {estaPagado ? 'Recibido' : 'No Recibido'}
                          </span>
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          {!estaPagado && esEfectivo ? (
                            <button
                              type="button"
                              onClick={() => navigate(`${cashRoute}?ref=${encodeURIComponent(cod)}`)}
                              style={{ background: '#047857', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 6px rgba(4, 120, 87, 0.2)' }}
                            >
                              Cobrar en Caja
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => navigate(reservationsRoute)}
                              style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
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
