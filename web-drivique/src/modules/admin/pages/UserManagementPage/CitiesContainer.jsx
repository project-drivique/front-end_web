import MenuConfiguracion from '../../../../components/MenuConfiguracion'
import { FaUserPlus, FaSearch, FaFileExcel, FaFilePdf, FaPrint, FaUsers, FaEnvelope, FaPhone, FaBuilding, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaIdCard, FaEdit, FaToggleOn, FaToggleOff, FaTrash } from 'react-icons/fa'
import { exportExcel, exportPdf, printTable } from '../../../../utils/listExportUtils'

export default function CitiesContainer({ docFilter, exportData, filtrados, handleToggleActivo, notice, openDocumentosModal, openEditarModal, roleFilter, search, setDocFilter, setErrorModal, setModalCrear, setModalEliminar, setNotice, setRoleFilter, setSearch, setStatusFilter, statusFilter, t }) {
  return (
    <div className="cities-container" style={{ maxWidth: '100%' }}>
            {/* Header Superior */}
            <header className="cities-topbar">
              <div>
                <p className="cities-eyebrow">{t('admin.management', 'Gestión de Usuarios')}</p>
                <h1>{t('admin.usersTitle', 'Control de Cuentas y Verificación')}</h1>
                <p className="cities-subtitle">
                  {t('admin.usersPage.subtitle')}
                </p>
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
                  <FaUserPlus /> {t('admin.newUser', 'Nuevo Usuario')}
                </button>
              </div>
            </header>
  
            {/* Notificación de Aviso */}
            {notice && (
              <div className="cities-notice" role="status">
                <span>{notice}</span>
                <button type="button" onClick={() => setNotice('')}>
                  á—
                </button>
              </div>
            )}
  
            {/* Tarjeta Principal */}
            <section className="cities-card">
              {/* Toolbar con Buscador y Filtros */}
              <div className="cities-toolbar">
                <label className="cities-search">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder={t('admin.searchUsers', 'Buscar por nombre, correo, teléfono o cédula...')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
  
                {/* Filtro por Rol */}
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="all">{t('admin.usersPage.allRoles')}</option>
                  <option value="cliente">{t('admin.usersPage.clients')}</option>
                  <option value="encargado">{t('admin.usersPage.branchManagers')}</option>
                  <option value="administrador">{t('admin.usersPage.administrators')}</option>
                </select>
  
                {/* Filtro por Estado de Cuenta */}
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">{t('admin.usersPage.allStatuses')}</option>
                  <option value="active">{t('admin.usersPage.activeAccounts')}</option>
                  <option value="inactive">{t('admin.usersPage.inactiveAccounts')}</option>
                </select>
  
                {/* Filtro por Documentos */}
                <select value={docFilter} onChange={(e) => setDocFilter(e.target.value)}>
                  <option value="all">{t('admin.usersPage.allDocs')}</option>
                  <option value="aprobado">{t('admin.usersPage.approvedDocs')}</option>
                  <option value="pendiente">{t('admin.usersPage.pendingDocs')}</option>
                  <option value="rechazado">{t('admin.usersPage.rejectedDocs')}</option>
                </select>
  
                {/* Botones de Exportación */}
                <div className="cities-export">
                  <button type="button" onClick={() => exportExcel(exportData)}>
                    <FaFileExcel /> {t('admin.usersPage.excel')}
                  </button>
                  <button type="button" onClick={() => exportPdf(exportData)}>
                    <FaFilePdf /> {t('admin.usersPage.pdf')}
                  </button>
                  <button type="button" onClick={() => printTable(exportData)}>
                    <FaPrint /> {t('admin.usersPage.print')}
                  </button>
                </div>
              </div>
  
              {/* Contador de Resultados */}
              <div className="cities-summary">
                <strong>{filtrados.length}</strong> {t('admin.usersFound', 'usuarios registrados')}
              </div>
  
              {/* Tabla Estilizada de Usuarios */}
              {filtrados.length === 0 ? (
                <div className="cities-empty">
                  <FaUsers />
                  <h2>{t('admin.usersPage.noUsersFound')}</h2>
                  <p>{t('admin.usersPage.adjustFilters')}</p>
                </div>
              ) : (
                <div className="cities-table-wrap">
                  <table className="user-mgmt-table">
                    <thead>
                      <tr>
                        <th>{t('admin.usersPage.tableUser')}</th>
                        <th>{t('admin.usersPage.tableId')}</th>
                        <th>{t('admin.usersPage.tableContact')}</th>
                        <th>{t('admin.usersPage.tableRoleBranch')}</th>
                        <th>{t('admin.usersPage.tableAccountStatus')}</th>
                        <th>{t('admin.usersPage.tableDocVerify')}</th>
                        <th>{t('admin.usersPage.tableActiveRes')}</th>
                        <th>{t('admin.usersPage.tableActions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtrados.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div className="cities-name" style={{ minWidth: 240, whiteSpace: 'nowrap' }}>
                              <span style={{ flexShrink: 0 }}>
                                <FaUsers />
                              </span>
                              <div>
                                <strong style={{ fontSize: 13.5, color: 'var(--city-text, #0f172a)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                  {u.nombre}
                                </strong>
                              </div>
                            </div>
                          </td>
  
                          <td>
                            <strong style={{ fontSize: 13, color: 'var(--city-text, #0f172a)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              {u.cedula}
                            </strong>
                          </td>
  
                          <td>
                            <div style={{ fontSize: 12.5, display: 'inline-flex', alignItems: 'center', flexWrap: 'nowrap', gap: '8px 16px', color: 'var(--city-text, #0f172a)', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                                <FaEnvelope style={{ color: 'var(--city-muted, #64748b)', fontSize: 11, flexShrink: 0 }} />
                                <span>{u.correo || 'No aplica'}</span>
                              </div>
                              {u.telefono && String(u.telefono).trim() !== '' && (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--city-muted, #64748b)', fontSize: 11.5, whiteSpace: 'nowrap' }}>
                                  <FaPhone style={{ fontSize: 10, flexShrink: 0 }} />
                                  <span>{u.telefono}</span>
                                </div>
                              )}
                            </div>
                          </td>
  
                          <td>
                            <div style={{ fontSize: 12.5, display: 'inline-flex', alignItems: 'center', flexWrap: 'nowrap', gap: '8px', whiteSpace: 'nowrap' }}>
                              <span style={{ textTransform: 'capitalize', color: 'var(--city-text, #0f172a)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {u.rol === 'encargado_sucursal' ? t('hc2.encargado_sucursal', 'Encargado Sucursal') : u.rol?.replace(/_/g, ' ') || t('hc5.user_word', 'Usuario')}
                              </span>
                              {u.sucursal ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--city-muted, #64748b)', fontSize: 12, whiteSpace: 'nowrap' }}>
                                  <FaBuilding style={{ fontSize: 11, flexShrink: 0 }} />
                                  <span>{u.sucursal}</span>
                                </span>
                              ) : (
                                <span style={{ color: 'var(--city-muted, #94a3b8)', fontSize: 11, italic: 'true' }}>
                                  No aplica
                                </span>
                              )}
                            </div>
                          </td>
  
                          <td>
                            <span className={`user-account-badge ${u.activo ? 'activo' : 'inactivo'}`}>
                              <span className="user-account-dot" />
                              {u.activo ? t('admin.usersPage.active') : t('admin.usersPage.inactive')}
                            </span>
                          </td>
  
                          <td>
                            {u.documentosEstado ? (
                              <span className={`doc-status-badge ${u.documentosEstado}`}>
                                {u.documentosEstado === 'aprobado' && <FaCheckCircle />}
                                {u.documentosEstado === 'pendiente' && <FaExclamationTriangle />}
                                {u.documentosEstado === 'rechazado' && <FaTimesCircle />}
                                {u.documentosEstado}
                              </span>
                            ) : '—'}
                          </td>
  
                          <td>
                            <span
                              style={{
                                fontSize: 13,
                                color: 'var(--city-text)',
                              }}
                            >
                              {u.reservasActivas} activas
                            </span>
                          </td>
  
                          <td>
                            <div className="cities-row-actions">
                              {/* Revisión de Documentos */}
                              <button
                                type="button"
                                onClick={() => openDocumentosModal(u)}
                                title={t('admin.usersPage.reviewDocsAction')}
                              >
                                <FaIdCard />
                              </button>
  
                              {/* Editar Usuario */}
                              <button
                                type="button"
                                onClick={() => openEditarModal(u)}
                                title={t('admin.usersPage.editUserAction')}
                              >
                                <FaEdit />
                              </button>
  
                              {/* Activar / Desactivar Toggle */}
                              <button
                                type="button"
                                onClick={() => handleToggleActivo(u)}
                                title={u.activo ? t('admin.usersPage.deactivateAction') : t('admin.usersPage.activateAction')}
                                style={{ color: u.activo ? '#16a34a' : '#94a3b8' }}
                              >
                                {u.activo ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                              </button>
  
                              {/* Eliminar Usuario */}
                              <button
                                className="is-danger"
                                type="button"
                                onClick={() => {
                                  setErrorModal('')
                                  setModalEliminar(u)
                                }}
                                title={t('admin.usersPage.deleteUserAction')}
                              >
                                <FaTrash />
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
  )
}
