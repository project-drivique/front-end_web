import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FaCar,
  FaClipboardList,
  FaCashRegister,
  FaFileContract,
  FaExclamationTriangle,
  FaFileAlt,
  FaShieldAlt,
  FaCity,
  FaBuilding,
  FaUsers,
  FaUserShield,
  FaTags,
  FaPalette,
  FaArrowRight,
  FaSlidersH,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { adminDashboardService } from '../../../services/adminDashboardService'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import '../components/ManagementDashboard.css'

export default function ControlPanelPage({ branchOnly = false }) {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const usuario = useAuthStore((state) => state.usuario)
  const navigate = useNavigate()

  const [summary] = useState(() => adminDashboardService.getSummary(usuario))
  const isBranchManager = branchOnly || usuario?.rol === 'encargado' || usuario?.rol === 'branch_manager' || usuario?.rol === 'encargado_sucursal'

  const modules = [
    {
      id: 'vehicles',
      title: 'Flota y Vehículos',
      description: 'Gestión completa de autos, fichas técnicas, precios y estado de Pico y Placa.',
      icon: FaCar,
      count: `${summary.vehicleCount} autos`,
      route: isBranchManager ? '/encargado/vehicles' : '/admin/vehicles',
      color: '#2563eb',
    },
    {
      id: 'reservations',
      title: 'Gestión de Reservas',
      description: 'Administración de los 3 pasos de reserva, entregas, devoluciones y logística.',
      icon: FaClipboardList,
      count: `${summary.reservationCount} reservas`,
      route: isBranchManager ? '/encargado/reservations' : '/admin/reservations',
      color: '#059669',
    },
    {
      id: 'cashCollection',
      title: 'Cobro en Sucursal',
      description: 'Terminal de caja presencial para recibir efectivo en mostrador y emitir recibos.',
      icon: FaCashRegister,
      count: 'Caja activa',
      route: isBranchManager ? '/encargado/cobro-sucursal' : '/admin/cobro-sucursal',
      color: '#047857',
    },
    {
      id: 'contracts',
      title: 'Contratos de Alquiler',
      description: 'Revisión y firma digital de contratos de arrendamiento de vehículos.',
      icon: FaFileContract,
      count: 'Contratos vigentes',
      route: isBranchManager ? '/encargado/contracts' : '/admin/contracts',
      color: '#7c3aed',
    },
    {
      id: 'incidents',
      title: 'Incidencias y Novedades',
      description: 'Reporte de rayones, multas de tránsito y vehículos en taller de mantenimiento.',
      icon: FaExclamationTriangle,
      count: `${summary.maintenanceVehicles || 0} en taller`,
      route: isBranchManager ? '/encargado/incidents' : '/admin/incidents',
      color: '#dc2626',
    },
    {
      id: 'reports',
      title: 'Reportes y Métricas',
      description: 'Informes detallados de ingresos en caja, ocupación y rendimiento mensual.',
      icon: FaFileAlt,
      count: 'Informes de gestión',
      route: isBranchManager ? '/encargado/reports' : '/admin/reports',
      color: '#d97706',
    },
    {
      id: 'audit',
      title: 'Auditoría y Seguridad',
      description: 'Bitácora oficial de ingresos, inicios de sesión y acciones administrativas.',
      icon: FaShieldAlt,
      count: 'Seguridad activa',
      route: isBranchManager ? '/encargado/audit' : '/admin/audit',
      color: '#475569',
    },
  ]

  // Módulos exclusivos de Administrador Principal
  if (!isBranchManager) {
    modules.push(
      {
        id: 'branches',
        title: 'Gestión de Sucursales',
        description: 'Administración de sedes, encargados asignados, teléfonos y capacidad de parqueadero.',
        icon: FaBuilding,
        count: 'Sedes en Colombia',
        route: '/admin/branches',
        color: '#0284c7',
      },
      {
        id: 'cities',
        title: 'Ciudades y Operación',
        description: 'Configuración de ciudades donde opera Drivique.',
        icon: FaCity,
        count: 'Ciudades activas',
        route: '/admin/cities',
        color: '#0891b2',
      },
      {
        id: 'users',
        title: 'Usuarios y Clientes',
        description: 'Control de cuentas de clientes, documentos de identidad y licencias.',
        icon: FaUsers,
        count: 'Base de usuarios',
        route: '/admin/users',
        color: '#4f46e5',
      },
      {
        id: 'roles',
        title: 'Roles y Permisos',
        description: 'Administración de roles (Admin, Encargado) y permisos de acceso.',
        icon: FaUserShield,
        count: 'Matriz de permisos',
        route: '/admin/roles',
        color: '#9333ea',
      },
      {
        id: 'promotions',
        title: 'Promociones y Cupones',
        description: 'Creación de cupones de descuento y ofertas de catálogo.',
        icon: FaTags,
        count: 'Cupones activos',
        route: '/admin/promotions',
        color: '#ca8a04',
      },
      {
        id: 'brand',
        title: 'Identidad de Marca',
        description: 'Personalización de logotipo, colores e imagen institucional.',
        icon: FaPalette,
        count: 'Marca Drivique',
        route: '/admin/brand',
        color: '#db2777',
      }
    )
  }

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={branchOnly} />

      <main className="management-main" style={{ padding: '24px 32px' }}>
        <header className="management-header" style={{ marginBottom: 24 }}>
          <div>
            <p className="management-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaSlidersH style={{ color: 'var(--brand-primary, #2563eb)' }} />
              <span>{isBranchManager ? `Panel de Control Operativo · ${summary.branch || 'Sucursal'}` : 'Panel de Administración Central'}</span>
            </p>
            <h1>Panel de Control de Operaciones</h1>
            <p className="management-subtitle">
              Centro de mando administrativo: selecciona un módulo para gestionar vehículos, reservas, caja y contrataciones.
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

        {/* Grid de Módulos Operativos del Panel de Control */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {modules.map((m) => {
            const Icon = m.icon
            return (
              <article
                key={m.id}
                onClick={() => navigate(m.route)}
                style={{
                  background: 'var(--city-card, #ffffff)',
                  border: '1.5px solid var(--city-border, #cbd5e1)',
                  borderRadius: 16,
                  padding: 22,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.borderColor = m.color
                  e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.08)`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'var(--city-border, #cbd5e1)'
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${m.color}15`, color: m.color, display: 'grid', placeItems: 'center', fontSize: 20 }}>
                      <Icon />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: '#f1f5f9', color: '#475569' }}>
                      {m.count}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: 'var(--city-text, #0f172a)' }}>
                    {m.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: 12.5, color: 'var(--city-muted, #64748b)', lineHeight: 1.45 }}>
                    {m.description}
                  </p>
                </div>

                <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid var(--city-border, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: m.color }}>
                  <span>Abrir módulo</span>
                  <FaArrowRight style={{ fontSize: 11 }} />
                </div>
              </article>
            )
          })}
        </section>
      </main>
    </div>
  )
}
