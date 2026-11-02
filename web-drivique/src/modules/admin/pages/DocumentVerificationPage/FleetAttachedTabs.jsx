export default function FleetAttachedTabs({ activeTab, conteoAprobados, conteoPendientes, conteoRechazados, setActiveTab, t, verifications }) {
  return (
    <div className="fleet-attached-tabs">
              <div className="fleet-tabs-nav">
                <button
                  type="button"
                  onClick={() => setActiveTab('todos')}
                  className={`fleet-tab-btn ${activeTab === 'todos' ? 'is-active' : ''}`}
                >
                  {t('admin.documents.tabs.all', 'Todos los Expedientes')} ({verifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('pendientes')}
                  className={`fleet-tab-btn ${activeTab === 'pendientes' ? 'is-active' : ''}`}
                >
                  {t('admin.documents.tabs.pending', 'Pendientes')} ({conteoPendientes})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('aprobados')}
                  className={`fleet-tab-btn ${activeTab === 'aprobados' ? 'is-active' : ''}`}
                >
                  {t('admin.documents.tabs.approved', 'Aprobados')} ({conteoAprobados})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('rechazados')}
                  className={`fleet-tab-btn ${activeTab === 'rechazados' ? 'is-active' : ''}`}
                >
                  {t('admin.documents.tabs.rejected', 'Rechazados')} ({conteoRechazados})
                </button>
              </div>
            </div>
  )
}
