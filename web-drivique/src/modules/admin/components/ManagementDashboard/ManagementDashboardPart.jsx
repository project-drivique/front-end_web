import { FaSync } from 'react-icons/fa'
import MenuConfiguracion from '../../../../components/MenuConfiguracion'

export default function ManagementDashboardPart({ c, isBranchManager, lastSync, summary, t, usuario }) {
  return (
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
  )
}
