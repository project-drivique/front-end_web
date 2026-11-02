import MenuConfiguracion from '../../../../components/MenuConfiguracion'

export default function CitiesTopbar({ t, user }) {
  return (
    <header className="cities-topbar reservations-management-header">
              <div className="branch-topbar-brand-title">
                <span className="branch-topbar-badge">{t('admin.branchManagement', 'GESTION OPERATIVA')}</span>
                <h1 className="branch-topbar-heading">{t('admin.delivery.title', 'Domicilio Reserva')}</h1>
              </div>
              <div className="cities-topbar__actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <MenuConfiguracion />
                {user && (
                  <div className="branch-user-profile-chip">
                    <div className="branch-user-avatar">{(user?.nombre || user?.correo || 'A').charAt(0).toUpperCase()}</div>
                    <div className="branch-user-info-text">
                      <strong className="branch-user-name">
                        {(() => {
                          const nom = (user?.nombre || '').trim()
                          const ape = (user?.apellido || '').trim()
                          if (nom && ape && !nom.toLowerCase().includes(ape.toLowerCase())) return `${nom} ${ape}`
                          return nom || ape || user?.correo || 'Usuario'
                        })()}
                      </strong>
                      <span className="branch-user-role">{user?.rol || 'encargado_sucursal'}</span>
                    </div>
                  </div>
                )}
              </div>
            </header>
  )
}
