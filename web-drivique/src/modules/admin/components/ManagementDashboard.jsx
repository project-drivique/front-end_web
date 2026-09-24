import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaCar,
  FaCheckCircle,
  FaClipboardList,
  FaDollarSign,
  FaCalendarCheck,
  FaClock,
  FaExclamationTriangle,
  FaBuilding,
  FaMoneyBillWave,
  FaPlus,
  FaTools,
  FaPhone,
  FaSearch,
  FaChartLine,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { accessAuditService } from '../../../services/accessAuditService'
import { adminDashboardService } from '../../../services/adminDashboardService'
import { formatCurrency } from '../../../utils/currencyUtils'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from './ManagementSidebar'
import './ManagementDashboard.css'

export default function ManagementDashboard({ branchOnly = false }) {
  const { t, i18n } = useTranslation()
  const { tema, moneda, tasaUSD } = useLanding()
  const usuario = useAuthStore((state) => state.usuario)
  const navigate = useNavigate()

  const [summary] = useState(() => adminDashboardService.getSummary(usuario))
  const [activeTab, setActiveTab] = useState('entregas') // 'entregas' | 'devoluciones'
  const audits = accessAuditService.listForUser(usuario).slice(0, 5)

  const isBranchManager = branchOnly || usuario?.rol === 'encargado' || usuario?.rol === 'branch_manager' || usuario?.rol === 'encargado_sucursal'
  const cashRoute = isBranchManager ? '/encargado/cobro-sucursal' : '/admin/cobro-sucursal'
  const reservationsRoute = isBranchManager ? '/encargado/reservations' : '/admin/reservations'
  const vehiclesRoute = isBranchManager ? '/encargado/vehicles' : '/admin/vehicles'
  const incidentsRoute = isBranchManager ? '/encargado/incidents' : '/admin/incidents'

  const occupancy = summary.occupancyRate || 0
  let occupancyClass = 'is-green'
  if (occupancy < 40) occupancyClass = 'is-red'
  else if (occupancy <= 70) occupancyClass = 'is-yellow'

  const deliveriesList = summary.todayDeliveriesList || []
  const returnsList = summary.todayReturnsList || []
  const displayedList = activeTab === 'entregas' ? deliveriesList : returnsList

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={branchOnly} />

      <main className="management-main" style={{ padding: '24px 32px' }}>
        {/* Cabecera Superior con Identificación de Sucursal */}
        <header className="management-header" style={{ marginBottom: 20 }}>
          <div>
            <p className="management-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {isBranchManager ? (
                <>
                  <FaBuilding style={{ color: 'var(--brand-primary, #2563eb)' }} />
                  <span>Sede Asignada: <strong>{summary.branch || 'Sucursal Principal'}</strong></span>
                </>
              ) : (
                'Administración Central Drivique Colombia'
              )}
            </p>
            <h1>Dashboard Operativo de Sucursal</h1>
            <p className="management-subtitle">
              Tablero de control en tiempo real: Entregas, devoluciones, ocupación de flota y recaudación en caja.
            </p>
          </div>

          <div className="management-header__actions">
            <MenuConfiguracion />
            <div className="management-user">
              <span>{(usuario?.nombre || usuario?.correo || 'U').charAt(0).toUpperCase()}</span>
              <div>
                <strong>{usuario?.nombre || usuario?.correo}</strong>
                <small>{isBranchManager ? 'Encargado de Sucursal' : 'Administrador Principal'}</small>
              </div>
            </div>
          </div>
        </header>

        {/* Accesos Rápidos Operativos del Encargado */}
        <section style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="cities-primary"
            onClick={() => navigate(cashRoute)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#047857', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}
          >
            <FaMoneyBillWave /> Cobro Presencial en Caja
          </button>
          <button
            type="button"
            className="cities-primary"
            onClick={() => navigate(reservationsRoute)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
          >
            <FaPlus /> Crear Reserva Manual
          </button>
          <button
            type="button"
            onClick={() => navigate(incidentsRoute)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 10, color: '#334155', fontWeight: 700, cursor: 'pointer' }}
          >
            <FaTools /> Reportar Incidencia / Taller
          </button>
        </section>

        {/* KPIs del Negocio y Operación (4 Tarjetas Principales) */}
        <section className="management-kpis" aria-label="Métricas Clave de la Sucursal">
          {/* KPI 1: Ingresos del Mes */}
          <article className="management-kpi management-kpi--monthlyRevenue">
            <div className="management-kpi__icon">
              <FaDollarSign />
            </div>
            <div>
              <p>Ingresos del Mes</p>
              <strong>{formatCurrency(summary.monthlyRevenue, moneda, tasaUSD)}</strong>
              <small>Facturación acumulada en la sede</small>
            </div>
          </article>

          {/* KPI 2: Tasa de Ocupación Flota */}
          <article className="management-kpi management-kpi--rentedVehicles">
            <div className="management-kpi__icon" style={{ background: occupancy > 70 ? '#dcfce7' : occupancy >= 40 ? '#fef3c7' : '#fee2e2', color: occupancy > 70 ? '#15803d' : occupancy >= 40 ? '#b45309' : '#b91c1c' }}>
              <FaChartLine />
            </div>
            <div>
              <p>Tasa de Ocupación</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <strong style={{ fontSize: 22 }}>{occupancy}%</strong>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: occupancy > 70 ? '#dcfce7' : '#fef3c7', color: occupancy > 70 ? '#15803d' : '#b45309' }}>
                  {occupancy > 70 ? 'Alta Ocupación' : occupancy >= 40 ? 'Ocupación Media' : 'Baja Ocupación'}
                </span>
              </div>
              <small>{summary.rentedVehicles} de {summary.vehicleCount} vehículos alquilados</small>
            </div>
          </article>

          {/* KPI 3: Entregas de Hoy */}
          <article className="management-kpi management-kpi--todayDeliveries">
            <div className="management-kpi__icon">
              <FaCalendarCheck />
            </div>
            <div>
              <p>Entregas de Hoy</p>
              <strong>{summary.todayDeliveries} recogidas</strong>
              <small>Clientes citados en mostrador</small>
            </div>
          </article>

          {/* KPI 4: Devoluciones de Hoy */}
          <article className="management-kpi management-kpi--availableVehicles">
            <div className="management-kpi__icon">
              <FaCheckCircle />
            </div>
            <div>
              <p>Devoluciones de Hoy</p>
              <strong>{summary.todayReturns} retornos</strong>
              <small>Vehículos retornando a sede</small>
            </div>
          </article>
        </section>

        {/* Tablas Operativas del Día (Entregas vs Devoluciones de Hoy) */}
        <section className="cities-card" style={{ marginTop: 24, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p className="cities-eyebrow">Operación Presencial en Sede</p>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Programación Operativa de Hoy</h2>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setActiveTab('entregas')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 12,
                  border: '1px solid var(--city-border)',
                  background: activeTab === 'entregas' ? 'var(--brand-primary, #2563eb)' : 'var(--city-bg, #fff)',
                  color: activeTab === 'entregas' ? '#fff' : 'var(--city-text, #0f172a)',
                  cursor: 'pointer',
                }}
              >
                🔑 Entregas de Hoy ({deliveriesList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('devoluciones')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 12,
                  border: '1px solid var(--city-border)',
                  background: activeTab === 'devoluciones' ? 'var(--brand-primary, #2563eb)' : 'var(--city-bg, #fff)',
                  color: activeTab === 'devoluciones' ? '#fff' : 'var(--city-text, #0f172a)',
                  cursor: 'pointer',
                }}
              >
                🏁 Devoluciones de Hoy ({returnsList.length})
              </button>
            </div>
          </div>

          {displayedList.length === 0 ? (
            <div className="cities-empty" style={{ padding: '36px 16px' }}>
              <FaCalendarCheck />
              <h3>No hay {activeTab === 'entregas' ? 'entregas' : 'devoluciones'} programadas para hoy</h3>
              <p>No se registran salidas ni retornos previstos en la agenda de hoy.</p>
            </div>
          ) : (
            <div className="cities-table-wrap">
              <table className="branches-table" style={{ minWidth: 1200 }}>
                <thead>
                  <tr>
                    <th>ID Reserva</th>
                    <th>Imagen Auto</th>
                    <th>Vehículo</th>
                    <th>Placa</th>
                    <th>Cliente</th>
                    <th>Hora Programada</th>
                    <th>Medio de Pago</th>
                    <th>Estado Pago</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedList.map((r) => {
                    const cod = r.codigo || r.referencia || `RES-${r.id}`
                    const rawMetodo = String(r.reservaDetalles?.metodoPago || r.pasarela || r.metodoPago || '').toLowerCase()
                    const esEfectivo = rawMetodo.includes('efectivo') || rawMetodo.includes('sucursal')
                    const textoMedio = esEfectivo ? 'Pago en Sucursal' : 'Wompi - Tarjeta'
                    const estaPagado = r.pagoEstado === 'aprobado' || Boolean(r.metodoPagoConfirmado) || r.estado === 'confirmada' || r.estado === 'en_curso' || r.estado === 'finalizada'

                    return (
                      <tr key={r.id || cod}>
                        <td>
                          <strong style={{ color: 'var(--city-text, #0f172a)', fontWeight: 700 }}>{cod}</strong>
                        </td>

                        {/* Imagen Aislada en su Propia Columna */}
                        <td>
                          {r.vehiculoImagen ? (
                            <img
                              src={r.vehiculoImagen}
                              alt={r.vehiculoNombre || 'Auto'}
                              style={{
                                width: 46,
                                height: 32,
                                borderRadius: 6,
                                objectFit: 'cover',
                                border: '1px solid var(--city-border)',
                                display: 'block',
                              }}
                            />
                          ) : (
                            <div className="cities-name" style={{ width: 34, height: 34 }}>
                              <span><FaCar /></span>
                            </div>
                          )}
                        </td>

                        <td>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--city-text, #0f172a)' }}>
                            {r.vehiculoNombre || 'Mazda CX-5'}
                          </span>
                        </td>

                        <td>
                          <span style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '3px 7px', borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>
                            {r.vehiculoPlaca || 'KLS-849'}
                          </span>
                        </td>

                        <td>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--city-text, #0f172a)' }}>
                            {r.clienteNombre || r.datosForm?.nombres || 'Cliente Drivique'}
                          </span>
                        </td>

                        <td>
                          <span style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                            <FaClock style={{ color: 'var(--city-muted)' }} />
                            {activeTab === 'entregas'
                              ? (r.reservaDetalles?.fechaInicio?.slice(11, 16) || '08:00 AM')
                              : (r.reservaDetalles?.fechaFin?.slice(11, 16) || '18:00 PM')}
                          </span>
                        </td>

                        <td>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>
                            {textoMedio}
                          </span>
                        </td>

                        <td>
                          <span style={{ padding: '4px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: estaPagado ? '#ecfdf5' : '#fffbe1', color: estaPagado ? '#047857' : '#b45309', border: `1px solid ${estaPagado ? '#a7f3d0' : '#fde68a'}` }}>
                            {estaPagado ? 'Recibido' : 'No Recibido'}
                          </span>
                        </td>

                        <td>
                          {!estaPagado && esEfectivo ? (
                            <button
                              type="button"
                              onClick={() => navigate(`${cashRoute}?ref=${encodeURIComponent(cod)}`)}
                              style={{ background: '#047857', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 7, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                            >
                              Cobrar en Caja
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => navigate(reservationsRoute)}
                              style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: 7, fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}
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

        {/* Auditoría Reciente de la Sede */}
        <section className="management-audit" style={{ marginTop: 24 }}>
          <div>
            <p className="management-eyebrow">Auditoría y Seguridad</p>
            <h2>Registros Recientes de Acceso en tu Sucursal</h2>
          </div>
          {audits.length === 0 ? (
            <p className="management-empty">No hay registros de auditoría recientes.</p>
          ) : (
            <div className="management-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Correo Usuario</th>
                    <th>Rol</th>
                    <th>Resultado</th>
                    <th>Dirección IP</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map((record) => (
                    <tr key={record.id}>
                      <td>{new Date(record.fecha).toLocaleString(i18n.language)}</td>
                      <td>{record.correo}</td>
                      <td>{record.rol}</td>
                      <td>
                        <span className={`management-result management-result--${record.resultado}`}>
                          {record.resultado}
                        </span>
                      </td>
                      <td>{record.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
