import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FaIdCard,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaBuilding,
  FaExclamationTriangle,
  FaFileAlt,
  FaUserCheck,
  FaTimes,
  FaShieldAlt,
} from 'react-icons/fa'
import { useLanding } from '../../landing/LandingContext'
import { useAuthStore } from '../../../store/authStore'
import { documentVerificationService } from '../../../services/documentVerificationService'
import { showAlert } from '../../../utils/swalConfig'
import MenuConfiguracion from '../../../components/MenuConfiguracion'
import ManagementSidebar from '../components/ManagementSidebar'
import './CityManagementPage.css'
import './ReservationManagementPage.css'

export default function DocumentVerificationPage({ branchOnly = false }) {
  const { t } = useTranslation()
  const { tema } = useLanding()
  const user = useAuthStore((state) => state.usuario)
  const isBranchManager = branchOnly || user?.rol === 'encargado' || user?.rol === 'branch_manager' || user?.rol === 'encargado_sucursal'
  const sucursalAsignada = user?.sucursalAsignada || user?.sucursalId || user?.sucursal || 'Medellín - El Poblado'

  const [verifications, setVerifications] = useState(() => documentVerificationService.list(user))
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'pendiente' | 'aprobado' | 'rechazado'

  // Modal de Detalle / Revisión de Documento
  const [modalItem, setModalItem] = useState(null)
  const [observaciones, setObservaciones] = useState('')
  const [zoomImagen, setZoomImagen] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return verifications.filter((item) => {
      const matchStatus = statusFilter === 'all' || item.estado === statusFilter
      const matchQuery =
        !q ||
        item.clienteNombre.toLowerCase().includes(q) ||
        item.documentoIdentidad.toLowerCase().includes(q) ||
        item.reservaCodigo.toLowerCase().includes(q) ||
        item.numeroLicencia.toLowerCase().includes(q)

      return matchStatus && matchQuery
    })
  }, [verifications, search, statusFilter])

  const pendientesContador = useMemo(() => {
    return verifications.filter((v) => v.estado === 'pendiente').length
  }, [verifications])

  const handleOpenReview = (item) => {
    setModalItem(item)
    setObservaciones(item.observaciones || '')
  }

  const handleAprobarDocumento = async () => {
    if (!modalItem) return

    documentVerificationService.actualizarEstado(modalItem.id, 'aprobado', observaciones || 'Documentos verificados correctamente.', user?.nombre || 'Encargado')
    setVerifications(documentVerificationService.list(user))
    setModalItem(null)

    showAlert({ icon: 'success', title: 'Documentación Aprobada', text: `Los documentos de ${modalItem.clienteNombre} han sido aprobados.` })
  }

  const handleRechazarDocumento = async () => {
    if (!modalItem) return
    if (!observaciones.trim()) {
      showAlert({ icon: 'warning', title: 'Motivo requerido', text: 'Por favor indica la razón del rechazo (ej: foto de licencia borrosa, vencida, etc).' })
      return
    }

    documentVerificationService.actualizarEstado(modalItem.id, 'rechazado', observaciones, user?.nombre || 'Encargado')
    setVerifications(documentVerificationService.list(user))
    setModalItem(null)

    showAlert({ icon: 'error', title: 'Documentación Rechazada', text: `Se ha notificado el rechazo de documentos para la reserva ${modalItem.reservaCodigo}.` })
  }

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={branchOnly} />

      <main className="management-main" style={{ padding: '24px 32px' }}>
        {/* Encabezado */}
        <header className="management-header" style={{ marginBottom: 20 }}>
          <div>
            <p className="management-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaShieldAlt style={{ color: 'var(--brand-primary, #2563eb)' }} />
              <span>Sede: <strong>{isBranchManager ? sucursalAsignada : 'Todas las Sucursales'}</strong></span>
            </p>
            <h1>Validación de Documentos e Identidad</h1>
            <p className="cities-subtitle">
              Inspección de Licencias de Conducir y Documentos de Identidad cargados por clientes antes de la entrega del vehículo.
            </p>
          </div>

          <div className="management-header__actions">
            <MenuConfiguracion />
          </div>
        </header>

        {/* Tarjetas KPI de Verificación */}
        <div className="cash-kpi-bar" style={{ marginBottom: 24 }}>
          <div className="cash-kpi-item">
            <span className="cash-kpi-title">Pendientes por Auditar</span>
            <strong className={`cash-kpi-val ${pendientesContador > 0 ? 'warning' : 'success'}`} style={{ fontSize: 24 }}>
              {pendientesContador} expedientes
            </strong>
          </div>

          <div className="cash-kpi-item">
            <span className="cash-kpi-title">Aprobados en Sede</span>
            <strong className="cash-kpi-val success" style={{ fontSize: 22 }}>
              {verifications.filter((v) => v.estado === 'aprobado').length} verificados
            </strong>
          </div>

          <div className="cash-kpi-item">
            <span className="cash-kpi-title">Rechazados por Novedad</span>
            <strong className="cash-kpi-val info" style={{ fontSize: 22 }}>
              {verifications.filter((v) => v.estado === 'rechazado').length} rechazados
            </strong>
          </div>
        </div>

        {/* Filtros y Tabla Principal */}
        <section className="cities-card" style={{ padding: 24 }}>
          <div className="cash-toolbar-container" style={{ marginBottom: 20 }}>
            <div className="cash-toolbar-row1" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div className="cash-search-box" style={{ flex: 1, minWidth: 260 }}>
                <FaSearch className="cash-search-icon" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por cliente, cédula, licencia o código reserva..."
                />
              </div>

              <div className="cash-select-box">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">🔍 Todos los estados</option>
                  <option value="pendiente">⏳ Pendientes de Auditoría</option>
                  <option value="aprobado">✅ Documentos Aprobados</option>
                  <option value="rechazado">❌ Documentos Rechazados</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de Verificaciones */}
          <div className="cities-table-wrap">
            <table className="management-table">
              <thead>
                <tr>
                  <th>Reserva</th>
                  <th>Cliente / Conductor</th>
                  <th>Cédula / DNI</th>
                  <th>Licencia Conducir</th>
                  <th>Categoría</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 36 }}>
                      <FaIdCard style={{ fontSize: 36, color: '#94a3b8', marginBottom: 8 }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>No hay expedientes de documentación con los filtros actuales</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    let badgeClass = 'is-yellow'
                    let badgeLabel = 'Pendiente Audit'
                    if (item.estado === 'aprobado') {
                      badgeClass = 'is-green'
                      badgeLabel = 'Aprobado'
                    } else if (item.estado === 'rechazado') {
                      badgeClass = 'is-red'
                      badgeLabel = 'Rechazado'
                    }

                    return (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.reservaCodigo}</strong>
                        </td>
                        <td>
                          <div>
                            <strong>{item.clienteNombre}</strong>
                          </div>
                        </td>
                        <td>{item.documentoIdentidad}</td>
                        <td>
                          <code>{item.numeroLicencia}</code>
                        </td>
                        <td>{item.categoriaLicencia}</td>
                        <td>{item.fechaVencimientoLicencia}</td>
                        <td>
                          <span className={`status-pill ${badgeClass}`} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {badgeLabel}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="cities-primary"
                            onClick={() => handleOpenReview(item)}
                            style={{ padding: '6px 12px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                          >
                            <FaEye /> Auditar Fotos
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Modal de Auditoría de Documentación */}
        {modalItem && (
          <div className="cities-modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, zIndex: 1000 }}>
            <div className="cities-modal" style={{ width: '100%', maxWidth: 780, maxHeight: '90vh', overflowY: 'auto', padding: 26, borderRadius: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Expediente Digital: {modalItem.clienteNombre}</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Reserva <strong>{modalItem.reservaCodigo}</strong> · Sede {modalItem.sucursal}</p>
                </div>
                <button type="button" onClick={() => setModalItem(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>
                  <FaTimes />
                </button>
              </div>

              {/* Información General */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, padding: 14, background: '#f8fafc', borderRadius: 12, marginBottom: 20, fontSize: 12.5 }}>
                <div><strong>Tipo Doc:</strong> {modalItem.tipoDocumento}</div>
                <div><strong>No. Documento:</strong> {modalItem.documentoIdentidad}</div>
                <div><strong>Licencia:</strong> {modalItem.numeroLicencia}</div>
                <div><strong>Categoría:</strong> {modalItem.categoriaLicencia}</div>
                <div><strong>Vencimiento Licencia:</strong> {modalItem.fechaVencimientoLicencia}</div>
                <div><strong>Fecha Subida:</strong> {modalItem.fechaSubida}</div>
              </div>

              {/* Fotos del Documento y Licencia */}
              <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Inspección de Imágenes Subidas:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
                {modalItem.fotoLicenciaFrente && (
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: 12, padding: 10, textAlign: 'center', background: '#fff' }}>
                    <small style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>Licencia Conducir (Frente)</small>
                    <img
                      src={modalItem.fotoLicenciaFrente}
                      alt="Licencia Frente"
                      style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 8, cursor: 'zoom-in' }}
                      onClick={() => setZoomImagen(modalItem.fotoLicenciaFrente)}
                    />
                  </div>
                )}
                {modalItem.fotoLicenciaReverso && (
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: 12, padding: 10, textAlign: 'center', background: '#fff' }}>
                    <small style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>Licencia Conducir (Reverso)</small>
                    <img
                      src={modalItem.fotoLicenciaReverso}
                      alt="Licencia Reverso"
                      style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 8, cursor: 'zoom-in' }}
                      onClick={() => setZoomImagen(modalItem.fotoLicenciaReverso)}
                    />
                  </div>
                )}
                {modalItem.fotoCedulaFrente && (
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: 12, padding: 10, textAlign: 'center', background: '#fff' }}>
                    <small style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>Documento Identidad (Frente)</small>
                    <img
                      src={modalItem.fotoCedulaFrente}
                      alt="Cédula Frente"
                      style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 8, cursor: 'zoom-in' }}
                      onClick={() => setZoomImagen(modalItem.fotoCedulaFrente)}
                    />
                  </div>
                )}
              </div>

              {/* Observaciones y Dictamen */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#334155' }}>
                  Observaciones / Notas del Auditor de Sucursal:
                </label>
                <textarea
                  rows={3}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej: Licencia verificada y válida. Coincide con la cédula presentada..."
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button type="button" className="brand-secondary" onClick={() => setModalItem(null)}>
                  Cerrar sin cambiar
                </button>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={handleRechazarDocumento}
                    style={{ padding: '10px 16px', borderRadius: 10, background: '#ef4444', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <FaTimesCircle /> Rechazar Documentación
                  </button>
                  <button
                    type="button"
                    onClick={handleAprobarDocumento}
                    style={{ padding: '10px 16px', borderRadius: 10, background: '#16a34a', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <FaCheckCircle /> Aprobar Documentación
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Zoom de Imagen */}
        {zoomImagen && (
          <div className="cities-modal-backdrop" onClick={() => setZoomImagen(null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.85)' }}>
            <img src={zoomImagen} alt="Documento ampliado" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: 12, border: '3px solid #fff' }} />
          </div>
        )}
      </main>
    </div>
  )
}
