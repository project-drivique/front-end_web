import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaClock, FaEye, FaSearch } from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { incidentService } from '../../../services/incidentService'
import { useBranchScope } from '../../../hooks/useBranchScope'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import IncidentDetailModal from '../../support/components/IncidentDetailModal'
import { CATEGORIES, PRIORITY, STATUS, categoryLabel, formatDateTime } from '../../support/lib/incidentLabels'
import './CityManagementPage.css'
import './IncidentManagementPage.css'

const pill = (palette) => ({
  display: 'inline-block', background: palette.bg, color: palette.color, padding: '3px 10px', borderRadius: 14, fontSize: 11, fontWeight: 800,
})

export default function IncidentManagementPage() {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const esModoOscuro = tema === 'oscuro'
  const { user, isBranchManager: esEncargado } = useBranchScope()

  const [incidencias, setIncidencias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('all')
  const [prioridad, setPrioridad] = useState('all')
  const [categoria, setCategoria] = useState('all')
  const [sede, setSede] = useState('all')
  const [detalleId, setDetalleId] = useState(null)

  const cargar = useCallback(async () => {
    try {
      setError('')
      setIncidencias(await incidentService.forStaff())
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const sedes = useMemo(() => [...new Set(incidencias.map((i) => i.branchName).filter(Boolean))].sort(), [incidencias])

  const filtradas = useMemo(() => {
    const term = search.trim().toLowerCase()
    return incidencias.filter((i) => (
      (estado === 'all' || i.status === estado)
      && (prioridad === 'all' || i.priority === prioridad)
      && (categoria === 'all' || i.category === categoria)
      && (sede === 'all' || i.branchName === sede)
      && (!term || [i.code, i.subject, i.reporterName, i.vehiclePlate, i.reservationCode].some((v) => String(v || '').toLowerCase().includes(term)))
    ))
  }, [incidencias, search, estado, prioridad, categoria, sede])

  const abiertas = incidencias.filter((i) => i.status === 'OPEN' || i.status === 'IN_REVIEW').length
  const vencidas = incidencias.filter((i) => i.slaBreached).length

  return (
    <div className={`management-shell ${esModoOscuro ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={esEncargado} />
      <main className="management-main" style={{ padding: '24px 32px' }}>
        <div className="cities-container" style={{ maxWidth: '100%' }}>
          <header className="cities-topbar reservations-management-header">
            <div className="branch-topbar-brand-title">
              <span className="branch-topbar-badge">{t('admin.branchManagement', 'GESTIÓN DE SUCURSAL')}</span>
              <h1 className="branch-topbar-heading">{t('admin.incidents.title', 'Incidencias de clientes')}</h1>
            </div>
            <div className="branch-topbar-actions">
              <MenuConfiguracion />
              {esEncargado && (
                <div className="branch-user-profile-chip">
                  <div className="branch-user-avatar">{(user?.nombre || user?.correo || 'A').charAt(0).toUpperCase()}</div>
                  <div className="branch-user-info-text">
                    <strong className="branch-user-name">{user?.nombre || user?.correo}</strong>
                    <span className="branch-user-role">{user?.rol || 'encargado_sucursal'}</span>
                  </div>
                </div>
              )}
            </div>
          </header>

          {error && <div className="cities-notice" role="alert"><span>{error}</span></div>}

          <section className="cities-card">
            <div className="cities-toolbar">
              <div className="cities-search">
                <FaSearch />
                <input type="text" placeholder="Buscar por código, asunto, cliente, placa o reserva..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select value={estado} onChange={(e) => setEstado(e.target.value)} aria-label="Estado">
                <option value="all">Todos los estados</option>
                {Object.entries(STATUS).map(([id, s]) => <option key={id} value={id}>{s.label}</option>)}
              </select>
              <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)} aria-label="Prioridad">
                <option value="all">Todas las prioridades</option>
                {Object.entries(PRIORITY).map(([id, p]) => <option key={id} value={id}>{p.label}</option>)}
              </select>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Categoría">
                <option value="all">Todas las categorías</option>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              {!esEncargado && (
                <select value={sede} onChange={(e) => setSede(e.target.value)} aria-label="Sede">
                  <option value="all">Todas las sedes</option>
                  {sedes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
            </div>

            <div style={{ color: '#0f172a', fontWeight: 900, textTransform: 'uppercase', padding: '8px 4px' }}>
              <strong>{filtradas.length} incidencias encontradas</strong>
              <span style={{ marginLeft: 16, fontWeight: 600, textTransform: 'none', opacity: 0.8 }}>
                {abiertas} abiertas · {vencidas} con atención vencida
              </span>
            </div>

            <div className="cities-table-wrap" style={{ overflowX: 'auto' }}>
              <table className="cities-table" style={{ whiteSpace: 'nowrap' }}>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Cliente</th>
                    <th>Categoría</th>
                    <th>Asunto</th>
                    <th>Reserva</th>
                    <th>Vehículo</th>
                    {!esEncargado && <th>Sede</th>}
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Atiende</th>
                    <th>SLA</th>
                    <th style={{ textAlign: 'center' }}>Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.length > 0 ? filtradas.map((i) => (
                    <tr key={i.id}>
                      <td style={{ fontWeight: 700 }}>{i.code}</td>
                      <td>{i.reporterName}</td>
                      <td>{categoryLabel(i.category)}</td>
                      <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.subject}</td>
                      <td>{i.reservationCode || '—'}</td>
                      <td>{i.vehiclePlate ? `${i.vehicleModel} (${i.vehiclePlate})` : '—'}</td>
                      {!esEncargado && <td>{i.branchName || '—'}</td>}
                      <td><span style={pill(PRIORITY[i.priority])}>{PRIORITY[i.priority]?.label}</span></td>
                      <td><span style={pill(STATUS[i.status])}>{STATUS[i.status]?.label}</span></td>
                      <td>{i.assignedToName || 'Sin asignar'}</td>
                      <td style={{ color: i.slaBreached ? '#b91c1c' : undefined }}>
                        {i.status === 'RESOLVED' || i.status === 'CLOSED' ? '—' : <><FaClock /> {formatDateTime(i.slaDueAt)}</>}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button type="button" onClick={() => setDetalleId(i.id)} title="Ver detalle" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary, #2563eb)' }}>
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={esEncargado ? 11 : 12} style={{ textAlign: 'center', padding: 24 }}>
                        {cargando ? 'Cargando...' : 'No hay incidencias para los filtros seleccionados.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {detalleId && <IncidentDetailModal incidentId={detalleId} mode="staff" onClose={() => setDetalleId(null)} onChanged={cargar} />}
    </div>
  )
}
