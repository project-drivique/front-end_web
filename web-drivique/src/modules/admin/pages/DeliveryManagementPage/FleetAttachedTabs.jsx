import { FaPlus } from 'react-icons/fa'

const INITIAL_CONDUCTOR = {
  nombre: '',
  email: '',
  tipoDoc: 'CC',
  numDoc: '',
  licencia: '',
  categoriaLic: 'B1',
  vencimientoLic: '',
  telefono: '',
  estado: 'disponible'
}

export default function FleetAttachedTabs({ activeTab, conductores, reservations, setActiveTab, setEditingConductor, setModalConductor, setNuevoConductor, t, totalAsignados, totalCompletados, totalPendientes }) {
  return (
    <div className="fleet-attached-tabs" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div className="fleet-tabs-nav">
                <button
                  type="button"
                  onClick={() => setActiveTab('todos')}
                  className={`fleet-tab-btn ${activeTab === 'todos' ? 'is-active' : ''}`}
                >
                  {t('admin.delivery.tabs.all', 'Todos los Domicilios Reserva')} ({reservations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('pendientes')}
                  className={`fleet-tab-btn ${activeTab === 'pendientes' ? 'is-active' : ''}`}
                >
                  {t('admin.delivery.tabs.pending', 'Pendientes')} ({totalPendientes})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('asignados')}
                  className={`fleet-tab-btn ${activeTab === 'asignados' ? 'is-active' : ''}`}
                >
                  {t('admin.delivery.tabs.assigned', 'Conductores Asignados')} ({totalAsignados})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('completados')}
                  className={`fleet-tab-btn ${activeTab === 'completados' ? 'is-active' : ''}`}
                >
                  {t('admin.delivery.tabs.completed', 'Completados')} ({totalCompletados})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('conductores')}
                  className={`fleet-tab-btn ${activeTab === 'conductores' ? 'is-active' : ''}`}
                >
                  {t('admin.delivery.tabs.drivers', 'Conductores')} ({conductores.length})
                </button>
              </div>
  
              {/* BOTÓN AZUL CREAR CONDUCTOR EN LA FILA DE SECCIONES A LA DERECHA */}
              <div className="fleet-tabs-action">
                <button
                  type="button"
                  className="city-btn city-btn--primary"
                  onClick={() => { setEditingConductor(null); setNuevoConductor(INITIAL_CONDUCTOR); setModalConductor(true); }}
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
                  {t('admin.delivery.createDriverBtn', 'Crear Conductor')}
                </button>
              </div>
            </div>
  )
}
