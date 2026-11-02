import MenuConfiguracion from '../../../../components/MenuConfiguracion'

export default function BranchTopbar({ esEncargado, t, user }) {
  return (
    <div className="branch-topbar">
              <div className="branch-topbar-brand-title">
                <span className="branch-topbar-badge">
                  {esEncargado
                    ? t("fleetVehicles.eyebrowManager", "GESTIÓN DE SUCURSAL")
                    : t("fleetVehicles.eyebrowAdmin", "ADMINISTRACIÓN GENERAL")}
                </span>
                <h1 className="branch-topbar-heading">
                  {esEncargado
                    ? t("fleetVehicles.title", "Flota y Vehículos")
                    : t("fleetVehicles.titleAdmin", "Gestión de Vehículos")}
                </h1>
              </div>
  
              <div className="branch-topbar-actions">
                <MenuConfiguracion />
                {user && (
                  <div className="branch-user-profile-chip">
                    <div className="branch-user-avatar">
                      {(user?.nombre || user?.correo || "A").charAt(0).toUpperCase()}
                    </div>
                    <div className="branch-user-info-text">
                      <strong className="branch-user-name">
                        {(() => {
                          const nom = (user?.nombre || '').trim()
                          const ape = (user?.apellido || '').trim()
                          if (nom && ape && !nom.toLowerCase().includes(ape.toLowerCase())) return `${nom} ${ape}`
                          return nom || ape || user?.correo || 'Usuario'
                        })()}
                      </strong>
                      <span className="branch-user-role">
                        {user?.rol || "administrador"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
  )
}
