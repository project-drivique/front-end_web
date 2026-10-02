import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaBuilding,
  FaCar,
  FaClock,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaEye,
  FaFileExcel,
  FaFilePdf,
  FaPaperPlane,
  FaPhone,
  FaPlus,
  FaPrint,
  FaSearch,
  FaTrash,
  FaUser,
  FaUserShield,
  FaWrench,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { useBrand } from '../../../contexts/BrandContext'
import { incidentManagementService } from '../../../services/incidentManagementService'
import { vehicleManagementService } from '../../../services/vehicleManagementService'
import { branchManagementService } from '../../../services/branchManagementService'
import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './IncidentManagementPage.css'

export default function IncidentManagementPage() {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const { brand } = useBrand()
  const esModoOscuro = tema === 'oscuro'

  const esEncargado =
    user?.rol === 'encargado' ||
    user?.rol === 'encargado_sucursal' ||
    user?.rol === 'branch_manager'
  const sucursalEncargado = user?.sucursalId || user?.sucursal || user?.sucursalAsignada || ''
  const branchKey = String(sucursalEncargado).trim().toLocaleLowerCase()

  const [incidents, setIncidents] = useState([])
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('all')
  const [branchFilter, setBranchFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('incidentes')
  const [notice, setNotice] = useState('')
  const [errorModal, setErrorModal] = useState('')

  // Modales
  const [modalDetalle, setModalDetalle] = useState(null)
  const [modalCrear, setModalCrear] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(null)

  // Formularios
  const [formCrear, setFormCrear] = useState({
    vehiculoId: '',
    tipoIncidenciaId: 'choque',
    tipoIncidenciaNombre: t('admin.incidents.types.crash', 'Choque'),
    descripcion: '',
    prioridad: 'urgente',
    tiempoEstimado: t('admin.incidents.time.twoToFourHours', '2 a 4 horas'),
  })

  const [respuestaTexto, setRespuestaTexto] = useState('')
  const [nuevoEstadoModal, setNuevoEstadoModal] = useState('recibido')
  const [nuevaPrioridadModal, setNuevaPrioridadModal] = useState('urgente')

  const sucursales = useMemo(
    () => branchManagementService.list()
      .filter((branch) => !esEncargado || String(branch.nombre || '').trim().toLocaleLowerCase() === branchKey)
      .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [branchKey, esEncargado]
  )

  const vehiculos = useMemo(
    () => vehicleManagementService.list()
      .filter((vehicle) => !esEncargado || String(vehicle.sucursal || '').trim().toLocaleLowerCase() === branchKey)
      .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [branchKey, esEncargado]
  )

  const cargarIncidencias = () => {
    setIncidents(incidentManagementService.listForUser(user))
  }

  useEffect(() => {
    setIncidents(incidentManagementService.listForUser(user))
  }, [user])

  const getVehiculoImagen = (r) => {
    if (!r) return ''
    if (r.vehiculoImagen) return r.vehiculoImagen
    const vBrand = (r.vehiculo || '').split(' ')[0].toLowerCase()
    const match = vehiculos.find(
      (v) =>
        (v.id && r.vehiculoId && String(v.id) === String(r.vehiculoId)) ||
        (v.placa && r.placa && v.placa.replace(/\s|-/g, '').toLowerCase() === r.placa.replace(/\s|-/g, '').toLowerCase()) ||
        (v.nombre && r.vehiculo && v.nombre.toLowerCase().includes(r.vehiculo.toLowerCase())) ||
        (r.vehiculo && v.nombre && r.vehiculo.toLowerCase().includes(v.nombre.toLowerCase())) ||
        (vBrand && v.nombre && v.nombre.toLowerCase().includes(vBrand))
    )
    return match?.imagenes?.[0] || match?.imagen || vehiculos[0]?.imagenes?.[0] || 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/a2cb0b378c25efdb1e116246f84149744c2f4081.jpg'
  }

  // Filtrado dinámico
  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase()
    return incidents.filter((r) => {
      // Tab filter
      if (activeTab === 'incidentes' && r.estado === 'rechazado') return false
      if (activeTab === 'erroneos' && r.estado !== 'rechazado') return false

      const matchState = stateFilter === 'all' || r.estado === stateFilter
      const matchBranch = branchFilter === 'all' || r.sucursal === branchFilter

      const matchSearch =
        !term ||
        r.codigo?.toLowerCase().includes(term) ||
        r.vehiculo?.toLowerCase().includes(term) ||
        r.placa?.toLowerCase().includes(term) ||
        r.contactoNombre?.toLowerCase().includes(term) ||
        r.descripcion?.toLowerCase().includes(term)

      return matchState && matchBranch && matchSearch
    })
  }, [incidents, search, stateFilter, branchFilter, activeTab])

  // --- Handlers ---
  const handleCrearIncidencia = (e) => {
    e.preventDefault()
    try {
      setErrorModal('')
      incidentManagementService.createIncident(formCrear, user)
      setNotice(t('admin.incidents.createdSuccess', 'Reporte de incidencia registrado correctamente.'))
      setModalCrear(false)
      setFormCrear({
        vehiculoId: '',
        tipoIncidenciaId: 'choque',
        tipoIncidenciaNombre: t('admin.incidents.types.crash', 'Choque'),
        descripcion: '',
        prioridad: 'urgente',
        tiempoEstimado: t('admin.incidents.time.twoToFourHours', '2 a 4 horas'),
      })
      cargarIncidencias()
    } catch {
      setErrorModal(t('admin.incidents.createError', 'Error al crear el reporte de incidencia.'))
    }
  }

  const openDetalleModal = (r) => {
    setErrorModal('')
    setRespuestaTexto('')
    setNuevoEstadoModal(r.estado)
    setNuevaPrioridadModal(r.prioridad || 'media')
    setModalDetalle(r)
  }

  const handleResponderYActualizar = (e) => {
    e.preventDefault()
    if (!modalDetalle) return
    try {
      setErrorModal('')
      incidentManagementService.updateStatusAndRespond(
        modalDetalle.id,
        { nuevoEstado: nuevoEstadoModal, respuestaTexto, nuevaPrioridad: nuevaPrioridadModal },
        user
      )
      setNotice(
        t(
          'admin.incidents.updatedSuccess',
          `Reporte ${modalDetalle.codigo} actualizado a ${nuevoEstadoModal.toUpperCase()} y respuesta enviada por correo y notificación.`
        )
      )
      setModalDetalle(null)
      cargarIncidencias()
    } catch {
      setErrorModal(t('admin.incidents.updateError', 'Error al actualizar y responder el reporte.'))
    }
  }

  const handleQuickStatusChange = (incidentId, newStatus) => {
    try {
      incidentManagementService.updateStatusAndRespond(
        incidentId,
        { nuevoEstado: newStatus, respuestaTexto: `El estado ha sido actualizado a ${newStatus}.`, nuevaPrioridad: 'media' },
        user
      )
      setNotice(`Estado actualizado a ${newStatus} correctamente.`)
      cargarIncidencias()
    } catch {
      console.error('Error al cambiar estado rápidamente')
    }
  }

  const handleEliminarIncidencia = (r) => {
    try {
      setErrorModal('')
      incidentManagementService.removeIncident(r.id, user)
      setNotice(t('admin.incidents.deletedSuccess', `Reporte de incidencia ${r.codigo} eliminado.`))
      setModalEliminar(null)
      cargarIncidencias()
    } catch (err) {
      if (err.message === 'clientReportCannotBeDeleted') {
        setErrorModal(
          t(
            'admin.incidents.clientReportDeleteError',
            'Los reportes creados por los clientes no pueden ser eliminados por control de auditoría.'
          )
        )
      } else if (err.message === 'onlyReceivedOwnReportsCanBeDeleted') {
        setErrorModal(
          t(
            'admin.incidents.ownReportStateDeleteError',
            'No se puede eliminar un reporte propio que ya ha pasado a estado de revisión o reparación.'
          )
        )
      } else {
        setErrorModal(t('admin.incidents.deleteError', 'Error al eliminar el reporte.'))
      }
    }
  }

  // Exportación
  const headersExport = ['Código', 'Vehículo', 'Placa', 'Sucursal', 'Remitente', 'Origen', 'Prioridad', 'Estado', 'Descripción']
  const rowsExport = filtrados.map((r) => [
    r.codigo,
    r.vehiculo,
    r.placa,
    r.sucursal,
    r.contactoNombre,
    r.origen === 'cliente' ? 'Cliente' : 'Administrador',
    r.prioridad,
    r.estado,
    r.descripcion,
  ])

  const exportData = {
    title: `Reportes de Incidencias de Vehículos — ${brand?.name || 'Drivique'}`,
    headers: headersExport,
    rows: rowsExport,
    items: filtrados,
    filename: `incidencias-drivique-${new Date().toISOString().slice(0, 10)}`,
  }

  return (
    <div className={`management-shell ${esModoOscuro ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar />
      <main className="management-main" style={{ padding: '24px 32px' }}>
        <div className="cities-container" style={{ maxWidth: '100%' }}>
          {/* Header Superior */}
          <header className="cities-topbar reservations-management-header">
            <div className="branch-topbar-brand-title">
              <span className="branch-topbar-badge">{t('admin.branchManagement', 'GESTIÓN DE SUCURSAL')}</span>
              <h1 className="branch-topbar-heading">{t('admin.incidents.title', 'Gestión de Incidentes')}</h1>
            </div>

            <div className="cities-topbar__actions">
              <MenuConfiguracion />
              <button
                className="cities-primary"
                type="button"
                onClick={() => {
                  setErrorModal('')
                  setModalCrear(true)
                }}
              >
                <FaPlus /> {t('admin.incidents.newReport', 'Nuevo Reporte de Incidencia')}
              </button>
            </div>
          </header>

          {/* Notificación de Aviso */}
          {notice && (
            <div className="cities-notice" role="status">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice('')}>
                ×
              </button>
            </div>
          )}

          {/* TABS */}
          <div className="cities-tabs" style={{ display: 'flex', gap: 16, marginBottom: 16, borderBottom: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={() => setActiveTab('incidentes')}
              style={{
                padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, color: activeTab === 'incidentes' ? '#2563eb' : '#64748b',
                borderBottom: activeTab === 'incidentes' ? '2px solid #2563eb' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              {t('admin.incidents.tabIncidents', 'Reportes de Incidentes')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('erroneos')}
              style={{
                padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, color: activeTab === 'erroneos' ? '#2563eb' : '#64748b',
                borderBottom: activeTab === 'erroneos' ? '2px solid #2563eb' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              {t('admin.incidents.tabErrors', 'Informes Erróneos')}
            </button>
          </div>

          {/* Tarjeta Principal */}
          <section className="cities-card">
            {/* Toolbar con Buscador y Filtros */}
            <div className="cities-toolbar">
              <label className="cities-search">
                <FaSearch />
                <input
                  type="text"
                  placeholder={t('admin.incidents.searchPlaceholder', 'Buscar por código, vehículo, placa o cliente...')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>

              {/* Filtro Estado */}
              <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
                <option value="all">Todos los estados</option>
                <option value="recibido">Recibido</option>
                <option value="atendiendo">Atendiendo</option>
                <option value="resuelto">Resuelto</option>
                <option value="rechazado">Rechazado</option>
              </select>

              {/* Filtro Sucursal (Bloqueado para Encargado) */}
              {!esEncargado && (
                <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
                  <option value="all">{t('admin.incidents.allBranches', 'Todas las sucursales')}</option>
                  {sucursales.map((s) => (
                    <option key={s.id} value={s.nombre}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              )}



              {/* Botones de Exportación */}
              <div className="cities-export">
                <button type="button" onClick={() => exportExcel(exportData)}>
                  <FaFileExcel /> {t('admin.exportExcel', 'Excel')}
                </button>
                <button type="button" onClick={() => exportPdf(exportData)}>
                  <FaFilePdf /> {t('admin.exportPdf', 'PDF')}
                </button>
                <button type="button" onClick={() => printTable(exportData)}>
                  <FaPrint /> {t('admin.incidents.print', 'Imprimir')}
                </button>
              </div>
            </div>

            {/* Contador de Resultados */}
            <div className="cities-summary">
              <strong>{filtrados.length}</strong> {t('admin.incidents.registered', 'incidencias registradas')}
            </div>

            {/* Tabla Estilizada de Incidencias */}
            {filtrados.length === 0 ? (
              <div className="cities-empty">
                <FaExclamationTriangle />
                <h2>{t('admin.incidents.emptyTitle', 'No se encontraron reportes de incidencias')}</h2>
                <p>{t('admin.incidents.emptySubtitle', 'Intenta ajustar los criterios de búsqueda o los filtros seleccionados.')}</p>
              </div>
            ) : (
              <div className="cities-table-wrap" style={{ overflowX: 'auto' }}>
                <table className="incidents-table-v2" style={{ whiteSpace: 'nowrap', width: 'max-content', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>ID</th>
                      <th>CÓDIGO RESERVA</th>
                      <th>NOMBRE COMPLETO</th>
                      <th>VEHÍCULO</th>
                      <th>IMAGEN</th>
                      <th>PLACA</th>
                      <th>TIPO DE INCIDENTE</th>
                      <th>DESCRIPCIÓN PROBLEMA</th>
                      <th>FECHA DE REPORTE</th>
                      <th>HORA DE REPORTE</th>
                      <th>EVIDENCIA 1</th>
                      <th>EVIDENCIA 2</th>
                      <th>EVIDENCIA 3</th>
                      <th>TELÉFONO</th>
                      <th>CORREO</th>
                      <th style={{ textAlign: 'center' }}>ESTADO DE INCIDENTE</th>
                      <th style={{ textAlign: 'center' }}>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((r, index) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600, color: 'var(--city-text)', width: '40px' }}>{index + 1}</td>
                        <td style={{ fontWeight: 500, color: '#0f172a' }}>{r.codigoReserva || `RES-${r.id.split('-')[1] || Math.floor(Math.random() * 10000)}`}</td>
                        <td style={{ color: '#0f172a' }}>{r.contactoNombre}</td>
                        <td style={{ color: 'var(--city-text)' }}>{r.vehiculo}</td>
                        <td>
                            <img src={getVehiculoImagen(r)} alt={r.vehiculo} style={{ width: 44, height: 28, borderRadius: 6, objectFit: 'cover', border: '1px solid #cbd5e1' }} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/a2cb0b378c25efdb1e116246f84149744c2f4081.jpg' }} />
                        </td>
                        <td style={{ color: '#64748b' }}>{r.placa}</td>
                        
                        <td style={{ color: '#334155', fontWeight: 500 }}>{r.tipoIncidenciaNombre || r.tipoIncidenciaId || t('admin.incidents.types.mechanicalBreakdown', 'Avería Mecánica')}</td>
                        <td style={{ color: '#64748b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.descripcion || 'Problema reportado...'}</td>
                        <td style={{ color: '#0f172a' }}>{new Date(r.fechaIso || r.fechaRegistro || Date.now()).toLocaleDateString()}</td>
                        <td style={{ color: '#0f172a' }}>{new Date(r.fechaIso || r.fechaRegistro || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                        
                        <td>
                          {r.adjuntos?.[0] ? <img src={r.adjuntos[0]} style={{width: 36, height: 36, objectFit: 'cover', borderRadius: 4, border: '1px solid #e2e8f0'}} /> : <span style={{color: '#94a3b8', fontSize: 12}}>No img</span>}
                        </td>
                        <td>
                          {r.adjuntos?.[1] ? <img src={r.adjuntos[1]} style={{width: 36, height: 36, objectFit: 'cover', borderRadius: 4, border: '1px solid #e2e8f0'}} /> : <span style={{color: '#94a3b8', fontSize: 12}}>No img</span>}
                        </td>
                        <td>
                          {r.adjuntos?.[2] ? <img src={r.adjuntos[2]} style={{width: 36, height: 36, objectFit: 'cover', borderRadius: 4, border: '1px solid #e2e8f0'}} /> : <span style={{color: '#94a3b8', fontSize: 12}}>No img</span>}
                        </td>

                        <td style={{ color: '#475569' }}>{r.contactoTelefono || '+57 300 0000000'}</td>
                        <td style={{ color: '#64748b' }}>{r.contactoEmail}</td>
                        
                        <td style={{ textAlign: 'center' }}>
                          <select
                            value={['resuelto', 'atendiendo', 'rechazado', 'recibido'].includes(r.estado) ? r.estado : (r.estado === 'en_revision' || r.estado === 'en_reparacion' ? 'atendiendo' : 'recibido')}
                            onChange={(e) => handleQuickStatusChange(r.id, e.target.value)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: r.estado === 'resuelto' ? '#dcfce7' : r.estado === 'atendiendo' || r.estado === 'en_revision' || r.estado === 'en_reparacion' ? '#e0f2fe' : r.estado === 'rechazado' ? '#fee2e2' : '#f1f5f9',
                              color: r.estado === 'resuelto' ? '#15803d' : r.estado === 'atendiendo' || r.estado === 'en_revision' || r.estado === 'en_reparacion' ? '#0369a1' : r.estado === 'rechazado' ? '#991b1b' : '#475569',
                              fontWeight: 600,
                              fontSize: '13px',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="recibido">Recibido</option>
                            <option value="atendiendo">Atendiendo</option>
                            <option value="resuelto">Resuelto</option>
                            <option value="rechazado">Rechazado</option>
                          </select>
                        </td>
                        
                        <td style={{ textAlign: 'center' }}>
                          <div className="cities-row-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={() => openDetalleModal(r)}
                              style={{
                                width: 'auto',
                                height: 'auto',
                                padding: '8px 14px',
                                fontSize: '13px',
                                background: '#ffffff',
                                color: '#ca8a04',
                                border: '1.5px solid #fde047',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 4px rgba(250,204,21,0.1)',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseOver={(e) => { 
                                e.currentTarget.style.background = '#fefce8'; 
                                e.currentTarget.style.borderColor = '#facc15';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }}
                              onMouseOut={(e) => { 
                                e.currentTarget.style.background = '#ffffff'; 
                                e.currentTarget.style.borderColor = '#fde047'; 
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              <FaExclamationCircle /> Responder
                            </button>

                            {!esEncargado && (
                              <button
                                type="button"
                                onClick={() => {
                                  setErrorModal('')
                                  setModalEliminar(r)
                                }}
                                style={{ padding: '6px 12px', fontSize: '13px', background: 'transparent', color: '#dc2626', border: 'none', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}
                              >
                                Eliminar
                              </button>
                            )}
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

        {/* MODAL DETALLE Y RESPUESTA AL USUARIO */}
        {modalDetalle && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(e) => e.target === e.currentTarget && setModalDetalle(null)}
          >
            <section className="cities-modal" style={{ maxWidth: 680 }}>
              <div className="cities-modal__head">
                <div>
                  <p className="cities-eyebrow">{t('admin.incidents.detailTitle', 'Gestión de Incidencia')} {modalDetalle.codigo}</p>
                  <h2>{modalDetalle.vehiculo} ({modalDetalle.placa})</h2>
                </div>
                <button type="button" onClick={() => setModalDetalle(null)}>
                  ×
                </button>
              </div>

              {/* Banner de Vehículo con Imagen */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '14px 0', padding: '12px 16px', background: 'var(--city-soft)', borderRadius: 14, border: '1px solid var(--city-border)' }}>
                <img
                  src={getVehiculoImagen(modalDetalle)}
                  alt={modalDetalle.vehiculo}
                  style={{ width: 76, height: 50, objectFit: 'cover', borderRadius: 10, border: '1px solid #cbd5e1', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = 'https://pplx-res.cloudinary.com/image/upload/pplx_search_images/a2cb0b378c25efdb1e116246f84149744c2f4081.jpg'
                  }}
                />
                <div>
                  <h3 style={{ margin: '0 0 3px', fontSize: 16, fontWeight: 800, color: 'var(--city-text)' }}>{modalDetalle.vehiculo}</h3>
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Placa: <strong style={{ color: 'var(--brand-text)' }}>{modalDetalle.placa}</strong> • {modalDetalle.sucursal}</span>
                </div>
              </div>

              <div className="incident-grid-2" style={{ margin: '18px 0' }}>
                <div className="incident-info-card">
                  <span className="incident-info-card__label">{t('admin.incidents.sender', 'Remitente')}</span>
                  <p>{modalDetalle.contactoNombre}</p>
                  <small>{modalDetalle.contactoEmail}</small>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <small>{modalDetalle.contactoTelefono}</small>
                    <a 
                      href={`tel:${modalDetalle.contactoTelefono}`}
                      style={{ padding: '4px 8px', borderRadius: '4px', background: '#ecfeff', color: '#0891b2', border: '1px solid #cffafe', textDecoration: 'none', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}
                    >
                      <FaPhone /> {t('admin.incidents.call', 'Llamar')}
                    </a>
                  </div>
                </div>

                <div className="incident-info-card">
                  <span className="incident-info-card__label">{t('admin.incidents.locationPriority', 'Ubicación y Prioridad')}</span>
                  <p>{modalDetalle.sucursal}</p>
                  <span className={`priority-badge ${modalDetalle.prioridad}`} style={{ marginTop: 6 }}>
                    <FaClock /> {t('admin.incidents.estimatedTime', 'Tiempo estimado:')} {modalDetalle.tiempoEstimado}
                  </span>
                </div>
              </div>


              <div className="incident-field" style={{ margin: '4px 0 12px' }}>
                <span className="incident-field-label">{t('admin.incidents.problemDescription', 'Descripci\u00f3n del problema')}</span>
                <p style={{ background: 'var(--city-soft)', border: '1.5px solid var(--city-border)', padding: '12px 16px', borderRadius: 12, fontSize: 13, margin: 0 }}>
                  {modalDetalle.descripcion}
                </p>
              </div>

              {/* TIMELINE */}
              <span className="incident-field-label" style={{ display: 'block', marginBottom: 8 }}>{t('admin.incidents.historyTitle', 'Historial de respuestas')}</span>
              <div className="incident-timeline">
                {(modalDetalle.historial || []).map((h, i) => (
                  <div key={i} className="incident-timeline-item" style={{ borderLeftColor: h.color || 'var(--brand-primary)' }}>
                    <strong>{h.titulo} \u2014 {h.autor}</strong>
                    <p style={{ margin: '4px 0', fontSize: 12 }}>{h.descripcion}</p>
                    <small>{h.hora} ({new Date(h.fecha).toLocaleDateString()})</small>
                  </div>
                ))}
              </div>

              <form onSubmit={handleResponderYActualizar} className="incident-form">
                <div className="incident-grid-2">
                  <div className="incident-field">
                    <span className="incident-field-label">{t('admin.incidents.changeStatus', 'Cambiar estado')}</span>
                    <select
                      value={nuevoEstadoModal}
                      onChange={(e) => setNuevoEstadoModal(e.target.value)}
                    >
                      <option value="recibido">{t('admin.incidents.recibido', 'Recibido')}</option>
                      <option value="atendiendo">{t('admin.incidents.atendiendo', 'Atendiendo')}</option>
                      <option value="resuelto">{t('admin.incidents.resuelto', 'Resuelto')}</option>
                      <option value="rechazado">{t('admin.incidents.rechazado', 'Rechazado')}</option>
                    </select>
                  </div>
                  <div className="incident-notice-box" style={{ gridColumn: '1 / -1' }}>
                    <FaPaperPlane style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{t('admin.incidents.noticeEmailMsg', 'Se enviar\u00e1 correo y notificaci\u00f3n al usuario.')}</span>
                  </div>
                </div>
                <div className="incident-field">
                  <span className="incident-field-label">{t('admin.incidents.replyLabel', 'Mensaje de respuesta')}</span>
                  <textarea
                    required
                    rows={3}
                    placeholder={t('admin.incidents.replyPlaceholder', 'Escribe la respuesta oficial...')}
                    value={respuestaTexto}
                    onChange={(e) => setRespuestaTexto(e.target.value)}
                  />
                </div>
                {errorModal && <p className="cities-error">{errorModal}</p>}
                <div className="cities-modal__actions">
                  <button type="button" onClick={() => setModalDetalle(null)}>
                    {t('admin.incidents.cancel', 'Cancelar')}
                  </button>
                  <button type="submit" className="cities-primary">
                    <FaPaperPlane /> {t('admin.incidents.saveAndSend', 'Guardar y Enviar')}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* MODAL CREAR INCIDENCIA PROPIA */}
        {modalCrear && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(e) => e.target === e.currentTarget && setModalCrear(false)}
          >
            <section className="cities-modal" style={{ maxWidth: 700, padding: '24px 32px' }}>
              <div className="cities-modal__head" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 16 }}>
                <h2 style={{ fontSize: 20, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
                  <FaWrench style={{ color: '#3b82f6' }} /> {t('admin.incidents.createTitle', 'Formulario de Incidencia')}
                </h2>
                <button type="button" onClick={() => setModalCrear(false)} style={{ background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: '#64748b' }}>
                  ×
                </button>
              </div>

              <form onSubmit={handleCrearIncidencia} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Vehículo / Reserva asociada */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{t('admin.incidents.selectVehicle', 'Vehículo / Reserva asociada')}</span>
                    <select
                      required
                      value={formCrear.vehiculoId}
                      onChange={(e) => setFormCrear({ ...formCrear, vehiculoId: e.target.value })}
                      style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: 8, fontSize: 14, color: '#334155' }}
                    >
                      <option value="">{t('admin.incidents.chooseVehicle', 'Selecciona un vehículo de la flota...')}</option>
                      {vehiculos.map((v) => (
                        <option key={v.id} value={v.id}>{v.nombre}</option>
                      ))}
                    </select>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'flex-end' }}>
                    <input 
                      type="text" 
                      readOnly 
                      value={vehiculos.find(v => v.id === formCrear.vehiculoId)?.placa || ''}
                      placeholder="Placa del vehículo"
                      style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: 8, fontSize: 14, color: '#64748b' }}
                    />
                  </label>
                </div>

                {/* Tipo de Incidencia */}
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 12 }}>{t('admin.incidents.incidentType', 'Tipo de Incidencia')} <span style={{ color: '#ef4444' }}>*</span></span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[
                      { id: 'choque', label: t('admin.incidents.types.crash', 'Choque'), icon: <FaExclamationTriangle /> },
                      { id: 'averia_mecanica', label: t('admin.incidents.types.mechanicalBreakdown', 'Avería Mecánica'), icon: <FaWrench /> },
                      { id: 'pinchazo', label: t('admin.incidents.types.flatTire', 'Pinchazo'), icon: <FaCar /> },
                      { id: 'bateria_descargada', label: t('admin.incidents.types.deadBattery', 'Batería Descargada'), icon: <FaExclamationTriangle /> },
                      { id: 'falla_electrica', label: t('admin.incidents.types.electricalFailure', 'Falla Eléctrica'), icon: <FaExclamationTriangle /> },
                      { id: 'robo', label: t('admin.incidents.types.theft', 'Robo'), icon: <FaExclamationCircle /> },
                      { id: 'asistencia_general', label: t('admin.incidents.types.generalAssistance', 'Asistencia General'), icon: <FaExclamationCircle /> },
                      { id: 'otro_problema', label: t('admin.incidents.types.other', 'Otro'), icon: <FaExclamationCircle /> },
                    ].map(tipo => (
                      <button
                        key={tipo.id}
                        type="button"
                        onClick={() => {
                           let time = t('admin.incidents.time.twoToFourHours', '2 a 4 horas');
                           if (tipo.id === 'falla_electrica' || tipo.id === 'bateria_descargada') time = t('admin.incidents.time.oneToTwoHours', '1 a 2 horas');
                           if (tipo.id === 'asistencia_general') time = t('admin.incidents.time.oneHour', '1 hora');
                           if (tipo.id === 'otro_problema') time = t('admin.incidents.time.toBeDefined', 'Por definir');
                           setFormCrear({ ...formCrear, tipoIncidenciaId: tipo.id, tipoIncidenciaNombre: tipo.label, tiempoEstimado: time })
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 10,
                          background: formCrear.tipoIncidenciaId === tipo.id ? '#2563eb' : '#f8fafc',
                          color: formCrear.tipoIncidenciaId === tipo.id ? '#ffffff' : '#0f172a',
                          border: formCrear.tipoIncidenciaId === tipo.id ? '1px solid #2563eb' : '1px solid #e2e8f0',
                          cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.2s', justifyContent: 'center'
                        }}
                      >
                        {tipo.icon} {tipo.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notice Tiempo */}
                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <FaClock style={{ color: '#b45309', fontSize: 20, marginTop: 2 }} />
                  <div>
                    <span style={{ display: 'block', fontSize: 12, color: '#b45309', fontWeight: 600 }}>{t('admin.incidents.estimatedTime', 'Tiempo estimado de atención técnica:')}</span>
                    <strong style={{ color: '#92400e', fontSize: 14 }}>{formCrear.tiempoEstimado}</strong>
                  </div>
                </div>

                {/* Descripcion */}
                <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{t('admin.incidents.problemDescription', 'Descripción del problema')} <span style={{ color: '#ef4444' }}>*</span></span>
                  <textarea
                    required
                    rows={4}
                    placeholder={t('admin.incidents.describeSymptoms', 'Describe los síntomas...')}
                    value={formCrear.descripcion}
                    onChange={(e) => setFormCrear({ ...formCrear, descripcion: e.target.value })}
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: 8, fontSize: 14, resize: 'none', color: '#334155' }}
                  />
                </label>

                {/* Evidencias */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Evidencias (Imágenes / Videos opcionales)</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>Máx 3 fotos (1/3)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button type="button" style={{ width: 80, height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, background: '#f8fafc', border: '1.5px dashed #3b82f6', borderRadius: 12, color: '#3b82f6', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      <FaPlus style={{ fontSize: 16 }} /> Adjunto
                    </button>
                    <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 700 }}>✓ 1 evidencia(s) adjuntada(s)</span>
                  </div>
                </div>

                <hr style={{ borderColor: '#f1f5f9', margin: '4px 0', borderTop: 'none' }} />

                {/* Datos de contacto */}
                <div>
                  <h3 style={{ fontSize: 16, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 4px 0' }}>
                    <FaUser style={{ color: '#1e3a8a' }} /> Datos de contacto para seguimiento
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                    Precargados automáticamente desde tu perfil registrado (puedes editarlos si lo requieres).
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Nombre completo <span style={{ color: '#ef4444' }}>*</span></span>
                      <input type="text" readOnly value={user?.nombre || 'Administrador Interno'} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: 8, fontSize: 14, color: '#334155' }} />
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Teléfono <span style={{ color: '#ef4444' }}>*</span></span>
                        <input type="text" readOnly value={user?.telefono || '3100000000'} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: 8, fontSize: 14, color: '#334155' }} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Correo electrónico <span style={{ color: '#ef4444' }}>*</span></span>
                        <input type="email" readOnly value={user?.correo || 'admin@drivique.com'} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: 8, fontSize: 14, color: '#334155' }} />
                      </label>
                    </div>
                  </div>
                </div>

                {errorModal && <p className="cities-error">{errorModal}</p>}

                <button type="submit" style={{ background: '#16a34a', color: '#fff', padding: '14px', borderRadius: 10, fontSize: 15, fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer', marginTop: 8 }}>
                  <FaPaperPlane /> {t('admin.incidents.createBtn', 'Enviar Reporte de Incidencia')}
                </button>
              </form>
            </section>
          </div>
        )}

        {/* MODAL ELIMINAR REPORTES CON VALIDACIÓN */}
        {modalEliminar && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(e) => e.target === e.currentTarget && setModalEliminar(null)}
          >
            <section className="cities-modal">
              <div className="cities-delete-icon">
                <FaTrash />
              </div>
              <h2>{t('admin.incidents.deleteConfirmTitle', 'Confirmar Eliminación de Reporte')}</h2>
              <p>
                {t('admin.incidents.deleteConfirmDesc1', '¿Deseas eliminar el reporte')} <strong>{modalEliminar.codigo}</strong> (
                {modalEliminar.vehiculo})?
              </p>

              {/* VALIDACIÓN 1: CLIENTES */}
              {modalEliminar.origen === 'cliente' && (
                <div
                  style={{
                    background: '#fee2e2',
                    border: '1.5px solid #fca5a5',
                    color: '#991b1b',
                    padding: '12px 14px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 16,
                  }}
                >
                  <FaExclamationTriangle style={{ marginRight: 6 }} />
                  {t('admin.incidents.clientReportDeleteError', 'Los reportes creados por los clientes no pueden ser eliminados por control de auditoría.')}
                </div>
              )}

              {/* VALIDACIÓN 2: PROPIOS EN ESTADO DIFERENTE A RECIBIDO */}
              {modalEliminar.origen === 'administrador' && modalEliminar.estado !== 'recibido' && (
                <div
                  style={{
                    background: '#fee2e2',
                    border: '1.5px solid #fca5a5',
                    color: '#991b1b',
                    padding: '12px 14px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 16,
                  }}
                >
                  <FaExclamationTriangle style={{ marginRight: 6 }} />
                  {t('admin.incidents.ownReportStateDeleteError', 'No se puede eliminar un reporte propio que ya ha pasado a estado de revisión o reparación.')}
                </div>
              )}

              {errorModal && <p className="cities-error">{errorModal}</p>}

              <div className="cities-modal__actions">
                <button type="button" onClick={() => setModalEliminar(null)}>
                  Cancelar
                </button>
                <button
                  className="cities-danger"
                  type="button"
                  disabled={
                    modalEliminar.origen === 'cliente' ||
                    (modalEliminar.origen === 'administrador' && modalEliminar.estado !== 'recibido')
                  }
                  onClick={() => handleEliminarIncidencia(modalEliminar)}
                >
                  Confirmar Eliminación
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
