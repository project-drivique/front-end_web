import MenuConfiguracion from '../../../../components/MenuConfiguracion'

export default function CitiesTopbar({ t, user }) {
  return (
    <header className="cities-topbar reservations-management-header">
              <div className="branch-topbar-brand-title">
                <span className="branch-topbar-badge">{t('admin.branchManagement', 'GESTIÓN DE SUCURSAL')}</span>
                <h1 className="branch-topbar-heading">{t('admin.documents.title', 'Validación de Documentos')}</h1>
              </div>
  
              <div className="cities-topbar__actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <MenuConfiguracion />
                <div className="doc-topbar-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--city-card, #ffffff)', border: '1.5px solid var(--city-border, #e2e8f0)', borderRadius: '30px', padding: '4px 16px 4px 6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--brand-primary)', color: 'var(--city-card, #ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                    {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="doc-topbar-profile-name" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--city-text, #0f172a)', lineHeight: '1.2' }}>
                      {(() => {
                        const nom = (user?.nombre || '').trim()
                        const ape = (user?.apellido || '').trim()
                        if (nom && ape && !nom.toLowerCase().includes(ape.toLowerCase())) return `${nom} ${ape}`
                        return nom || ape || user?.correo || 'Usuario'
                      })()}
                    </span>
                    <span className="doc-topbar-profile-role" style={{ fontSize: '11px', color: 'var(--city-muted, #64748b)', lineHeight: '1.2' }}>{user?.rol || 'encargado'}</span>
                  </div>
                </div>
              </div>
            </header>
  )
}
