export default function FleetAttachedTabs({ activeTab, esEncargado, openCreate, openCreateCategory, setActiveTab, sucursalAsignada, t }) {
  return (
    <div className="fleet-attached-tabs">
              <div className="fleet-tabs-nav">
                <button
                  type="button"
                  onClick={() => setActiveTab("flotas")}
                  className={`fleet-tab-btn ${activeTab === "flotas" ? "is-active" : ""}`}
                >
                  {t("fleetVehicles.tabCategories", "Categorías")}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("vehiculos")}
                  className={`fleet-tab-btn ${activeTab === "vehiculos" ? "is-active" : ""}`}
                >
                  {t("fleetVehicles.tabVehicles", "Vehículos")}
                </button>
              </div>
  
              <div className="fleet-tabs-action">
                {activeTab === "flotas" && !esEncargado && (
                  <button
                    className="cities-primary fleet-btn-create-tab"
                    type="button"
                    onClick={openCreateCategory}
                  >
                    {t("fleetVehicles.createCategory", "+ Crear Categoría")}
                  </button>
                )}
                {activeTab === "vehiculos" && esEncargado && (
                  <button
                    className="cities-primary fleet-btn-create-tab"
                    type="button"
                    onClick={openCreate}
                    disabled={!sucursalAsignada}
                  >
                    {t("fleetVehicles.createVehicle", "+ Crear Vehículo")}
                  </button>
                )}
              </div>
            </div>
  )
}
