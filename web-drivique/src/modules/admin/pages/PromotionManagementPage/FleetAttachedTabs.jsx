import { FaPlus } from 'react-icons/fa'

export default function FleetAttachedTabs({ activeTab, esEncargado, openCreate, setActiveTab, t, totalActivas, totalCupones, totalDestacadas, totalPromociones }) {
  return (
    <div className="fleet-attached-tabs" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div className="fleet-tabs-nav">
                <button
                  type="button"
                  onClick={() => setActiveTab('todos')}
                  className={`fleet-tab-btn ${activeTab === 'todos' ? 'is-active' : ''}`}
                >
                  {t('admin.promotions.tabs.all', 'Todas las Ofertas')} ({totalPromociones})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('cupones')}
                  className={`fleet-tab-btn ${activeTab === 'cupones' ? 'is-active' : ''}`}
                >
                  {t('admin.promotions.tabs.coupons', 'Solo Cupones')} ({totalCupones})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('promociones')}
                  className={`fleet-tab-btn ${activeTab === 'promociones' ? 'is-active' : ''}`}
                >
                  {t('admin.promotions.tabs.promotions', 'Solo Promociones')} ({totalPromociones - totalCupones})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('activas')}
                  className={`fleet-tab-btn ${activeTab === 'activas' ? 'is-active' : ''}`}
                >
                  {t('admin.promotions.tabs.active', 'Activas')} ({totalActivas})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('inactivas')}
                  className={`fleet-tab-btn ${activeTab === 'inactivas' ? 'is-active' : ''}`}
                >
                  {t('admin.promotions.tabs.inactive', 'Inactivas')} ({totalPromociones - totalActivas})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('destacadas')}
                  className={`fleet-tab-btn ${activeTab === 'destacadas' ? 'is-active' : ''}`}
                >
                  {t('admin.promotions.tabs.featured', 'Destacadas')} ({totalDestacadas})
                </button>
              </div>
  
              {/* BLUE ACTION BUTTON (SOLO PARA ENCARGADO DE SUCURSAL) */}
              {esEncargado && (
                <div className="fleet-tabs-action">
                  <button
                    type="button"
                    className="city-btn city-btn--primary"
                    onClick={openCreate}
                    style={{
                      background: 'var(--brand-primary, #2563eb)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '9px 18px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '13px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(var(--brand-primary-rgb), 0.25)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <FaPlus style={{ fontSize: 11 }} />
                    {t('admin.promotions.createBtn', 'Crear Promoción')}
                  </button>
                </div>
              )}
            </div>
  )
}
