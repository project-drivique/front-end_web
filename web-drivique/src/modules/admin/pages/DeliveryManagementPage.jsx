import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaSearch,
  FaMapMarkerAlt,
  FaUserTie,
  FaCalendarAlt,
  FaCar,
  FaExclamationTriangle,
  FaClipboardList,
  FaCheckCircle,
} from 'react-icons/fa'
import { useAuthStore } from '../../../../store/authStore'
import { reservationManagementService } from '../../../../services/reservationManagementService'
import './IncidentManagementPage.css' // Reusing some base styles from incidents

export default function DeliveryManagementPage() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.usuario)

  const esEncargado =
    user?.rol === 'encargado' ||
    user?.rol === 'encargado_sucursal' ||
    user?.rol === 'branch_manager'
  const sucursalEncargado = user?.sucursalId || user?.sucursal || user?.sucursalAsignada || ''
  const branchKey = String(sucursalEncargado).trim().toLocaleLowerCase()

  const [reservations, setReservations] = useState([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('pendientes')
  const [notice, setNotice] = useState('')
  const [modalAsignar, setModalAsignar] = useState(null)
  const [conductorNombre, setConductorNombre] = useState('')

  const loadReservations = () => {
    let all = reservationManagementService.listAll(user)
    
    // Filter only those with delivery services
    const deliveries = all.filter(r => {
      // Exclude invalid/canceled
      if (r.estado === 'cancelada') return false
      
      const hasEntrega = r.domicilioDireccion || r.serviciosSeleccionados?.some(s => s.id === 'srv-entrega-domicilio' || s.nombre?.toLowerCase().includes('entrega'))
      const hasDevolucion = r.domicilioDevolucionDireccion || r.serviciosSeleccionados?.some(s => s.id === 'srv-devolucion-domicilio' || s.nombre?.toLowerCase().includes('devolucion'))
      
      return hasEntrega || hasDevolucion
    }).map(r => {
      const hasEntrega = r.domicilioDireccion || r.serviciosSeleccionados?.some(s => s.id === 'srv-entrega-domicilio' || s.nombre?.toLowerCase().includes('entrega'))
      const hasDevolucion = r.domicilioDevolucionDireccion || r.serviciosSeleccionados?.some(s => s.id === 'srv-devolucion-domicilio' || s.nombre?.toLowerCase().includes('devolucion'))
      
      let tipoServicio = 'Entrega a Domicilio'
      let direccion = r.domicilioDireccion || 'No registrada'
      let fecha = r.fechaInicio
      
      if (hasEntrega && hasDevolucion) {
        tipoServicio = 'Entrega y Devolución'
        direccion = `Ent: ${r.domicilioDireccion || 'N/R'} | Dev: ${r.domicilioDevolucionDireccion || 'N/R'}`
      } else if (hasDevolucion && !hasEntrega) {
        tipoServicio = 'Devolución a Domicilio'
        direccion = r.domicilioDevolucionDireccion || 'No registrada'
        fecha = r.fechaFin
      }
      
      return {
        ...r,
        tipoServicio,
        direccionInfo: direccion,
        fechaEvento: fecha,
        // Domicilio status derived
        estadoDomicilio: r.domicilioConductor ? 'Asignado' : 'Pendiente'
      }
    })
    
    setReservations(deliveries)
  }

  useEffect(() => {
    loadReservations()
  }, [user])

  const filtrados = useMemo(() => {
    return reservations
      .filter((r) => {
        // Tab filter
        if (activeTab === 'pendientes' && r.estadoDomicilio === 'Asignado') return false
        if (activeTab === 'asignados' && r.estadoDomicilio !== 'Asignado') return false

        // Search
        if (search) {
          const lower = search.toLowerCase()
          return (
            r.codigo?.toLowerCase().includes(lower) ||
            r.vehiculoNombre?.toLowerCase().includes(lower) ||
            r.vehiculoPlaca?.toLowerCase().includes(lower) ||
            r.clienteNombre?.toLowerCase().includes(lower) ||
            r.domicilioConductor?.toLowerCase().includes(lower)
          )
        }
        return true
      })
      .sort((a, b) => new Date(a.fechaEvento) - new Date(b.fechaEvento))
  }, [reservations, search, activeTab])

  const openAsignarModal = (r) => {
    setModalAsignar(r)
    setConductorNombre(r.domicilioConductor || '')
  }

  const handleAsignar = (e) => {
    e.preventDefault()
    if (!conductorNombre.trim()) {
      alert('Debe ingresar el nombre del conductor')
      return
    }
    
    try {
      reservationManagementService.updateReservation(modalAsignar.id, {
        domicilioConductor: conductorNombre.trim()
      }, user)
      
      setNotice('Conductor asignado correctamente.')
      setModalAsignar(null)
      loadReservations()
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      alert('Error al asignar conductor: ' + err.message)
    }
  }

  return (
    <main className="cities-main-layout fade-in">
      <div className="cities-content-area">
        <header className="cities-header">
          <div className="cities-header-left">
            <span className="cities-eyebrow">GESTIÓN OPERATIVA</span>
            <h1 className="cities-title">
              Gestión de Domicilios
            </h1>
            <p className="cities-subtitle">
              Asignación de conductores para entregas y recogidas a domicilio.
            </p>
          </div>
        </header>

        <div className="cities-container" style={{ maxWidth: '100%' }}>
          {notice && (
            <div className="cities-notice" role="status">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice('')}>
                ×
              </button>
            </div>
          )}

          <div className="cities-tabs" style={{ display: 'flex', gap: 16, marginBottom: 16, borderBottom: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={() => setActiveTab('pendientes')}
              style={{
                padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, color: activeTab === 'pendientes' ? '#2563eb' : '#64748b',
                borderBottom: activeTab === 'pendientes' ? '2px solid #2563eb' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              Pendientes de Asignación
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('asignados')}
              style={{
                padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, color: activeTab === 'asignados' ? '#16a34a' : '#64748b',
                borderBottom: activeTab === 'asignados' ? '2px solid #16a34a' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              Conductores Asignados
            </button>
          </div>

          <section className="cities-card">
            <div className="cities-toolbar">
              <label className="cities-search">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Buscar por código, vehículo, placa o cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>

            <div className="cities-summary">
              <strong>{filtrados.length}</strong> domicilios encontrados
            </div>

            {filtrados.length === 0 ? (
              <div className="cities-empty">
                <FaMapMarkerAlt style={{ fontSize: 32, color: '#94a3b8', marginBottom: 16 }} />
                <h2>No se encontraron domicilios</h2>
                <p>No hay entregas o recogidas a domicilio con los criterios seleccionados.</p>
              </div>
            ) : (
              <div className="cities-table-wrap" style={{ overflowX: 'auto' }}>
                <table className="incidents-table" style={{ whiteSpace: 'nowrap' }}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>CÓDIGO RESERVA</th>
                      <th>VEHÍCULO</th>
                      <th>PLACA</th>
                      <th>TIPO SERVICIO</th>
                      <th>DIRECCIÓN</th>
                      <th>FECHA Y HORA</th>
                      <th>CLIENTE</th>
                      <th>SUCURSAL</th>
                      <th>CONDUCTOR</th>
                      <th>ESTADO</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((r, index) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600, color: 'var(--city-text)' }}>{index + 1}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{r.codigo}</td>
                        <td style={{ color: 'var(--city-text)' }}>{r.vehiculoNombre || r.vehiculo?.nombre}</td>
                        <td style={{ color: '#64748b' }}>{r.vehiculoPlaca || r.vehiculo?.placa}</td>
                        
                        <td style={{ fontWeight: 500, color: '#334155' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <FaCar style={{ color: '#64748b' }} /> {r.tipoServicio}
                          </span>
                        </td>
                        
                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.direccionInfo}>
                          {r.direccionInfo}
                        </td>
                        
                        <td style={{ color: '#64748b' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <FaCalendarAlt style={{ color: '#94a3b8' }}/> {new Date(r.fechaEvento).toLocaleDateString()}
                          </span>
                        </td>
                        
                        <td style={{ color: '#0f172a' }}>{r.clienteNombre}</td>
                        
                        <td>{r.sucursal}</td>
                        
                        <td style={{ fontWeight: 500, color: r.domicilioConductor ? '#0f172a' : '#94a3b8' }}>
                          {r.domicilioConductor || 'Sin asignar'}
                        </td>

                        <td>
                          <span
                            className="doc-status-badge"
                            style={{
                              background: r.estadoDomicilio === 'Asignado' ? '#dcfce7' : '#fef9c3',
                              color: r.estadoDomicilio === 'Asignado' ? '#15803d' : '#a16207',
                            }}
                          >
                            {r.estadoDomicilio === 'Asignado' ? <FaCheckCircle style={{ marginRight: 4 }} /> : <FaExclamationTriangle style={{ marginRight: 4 }} />}
                            {r.estadoDomicilio}
                          </span>
                        </td>
                        
                        <td>
                          <div className="cities-row-actions" style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => openAsignarModal(r)}
                              style={{ padding: '6px 12px', fontSize: '13px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', minWidth: '100px', display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                            >
                              <FaUserTie /> Asignar Conductor
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {modalAsignar && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(e) => e.target === e.currentTarget && setModalAsignar(null)}
          >
            <section className="cities-modal" style={{ maxWidth: 450 }}>
              <div className="cities-modal__head">
                <div>
                  <p className="cities-eyebrow">ASIGNACIÓN DE PERSONAL</p>
                  <h2>Asignar Conductor</h2>
                </div>
                <button type="button" onClick={() => setModalAsignar(null)}>×</button>
              </div>

              <div className="cities-modal__body" style={{ padding: '24px' }}>
                <div style={{ marginBottom: 20, padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#64748b', marginBottom: 4 }}>Reserva</p>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{modalAsignar.codigo}</p>
                  <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Servicio</p>
                      <p style={{ margin: 0, fontSize: 14, color: '#334155', fontWeight: 500 }}>{modalAsignar.tipoServicio}</p>
                    </div>
                  </div>
                </div>

                <form id="asignar-form" onSubmit={handleAsignar}>
                  <div className="cities-field">
                    <label>Nombre del Conductor</label>
                    <input
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      value={conductorNombre}
                      onChange={(e) => setConductorNombre(e.target.value)}
                      required
                      autoFocus
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 6 }}
                    />
                  </div>
                </form>
              </div>

              <div className="cities-modal__foot" style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setModalAsignar(null)}
                  style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 500, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="asignar-form"
                  style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#2563eb', color: 'white', fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <FaUserTie /> Guardar Asignación
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
