import { VEHICLE_STATES } from '../../../../services/vehicleManagementService'
import { exportExcel, exportPdf, printTable } from '../../../../utils/listExportUtils'
import { FaFileExcel, FaFilePdf, FaPrint, FaEye } from 'react-icons/fa'
import { formatCurrency } from '../../../../utils/currencyUtils'
import { hasMatchingBranch } from '../../../../services/accessAuditService'

export default function VehiculosActiveTab({ branchFilter, branches, esEncargado, filteredVehicles, moneda, openDetail, openEdit, search, setBranchFilter, setModal, setSearch, setStateFilter, setZoomImage, stateFilter, sucursalAsignada, t, tasaUSD, vehicleExportData, vehicleHeaders }) {
  return (
    <section className="cities-card attached-to-tabs">
                <div
                  className={`fleet-toolbar ${esEncargado ? "fleet-toolbar--manager" : ""}`}
                  style={{ marginBottom: 16 }}
                >
                  <label className="cities-search">
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={
                        esEncargado
                          ? t(
                              "admin.vehiclesManagement.searchManager",
                              t('hc2.buscar_por_vehiculo_placa_o_categoria', 'Buscar por vehículo, placa o categoría...')
                            )
                          : t(
                              "admin.vehiclesManagement.search",
                              t('hc2.buscar_por_vehiculo_placa_categoria_o_', 'Buscar por vehículo, placa, categoría o sucursal...')
                            )
                      }
                    />
                  </label>
  
                  {/* Filtro de Sucursal: Solo visible para Administrador General */}
                  {!esEncargado && (
                    <select
                      value={branchFilter}
                      onChange={(event) => setBranchFilter(event.target.value)}
                    >
                      <option value="all">
                        {t("admin.vehiclesManagement.allBranches", "Todas las sucursales")}
                      </option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.nombre}>
                          {branch.nombre}
                        </option>
                      ))}
                    </select>
                  )}
  
                  <select
                    value={stateFilter}
                    onChange={(event) => setStateFilter(event.target.value)}
                  >
                    <option value="all">
                      {t("admin.vehiclesManagement.allStates", "Todos los estados")}
                    </option>
                    {Object.values(VEHICLE_STATES).map((state) => (
                      <option key={state} value={state}>
                        {t(
                          `admin.vehiclesManagement.states.${state}`,
                          state === "disponible"
                            ? "Disponible"
                            : state === "reservado"
                            ? "Reservado"
                            : "Mantenimiento"
                        )}
                      </option>
                    ))}
                  </select>
  
                  <div className="export-pills-group">
                    <button
                      type="button"
                      className="export-pill export-pill--excel"
                      onClick={() => exportExcel(vehicleExportData)}
                    >
                      <FaFileExcel aria-hidden="true" /> {t('admin.vehiclesManagement.export.excel', 'Excel')}
                    </button>
                    <button
                      type="button"
                      className="export-pill export-pill--pdf"
                      onClick={() => exportPdf(vehicleExportData)}
                    >
                      <FaFilePdf aria-hidden="true" /> {t('admin.vehiclesManagement.export.pdf', 'PDF')}
                    </button>
                    <button
                      type="button"
                      className="export-pill export-pill--print"
                      onClick={() => printTable(vehicleExportData)}
                    >
                      <FaPrint aria-hidden="true" /> {t('admin.vehiclesManagement.export.print', 'Imprimir')}
                    </button>
                  </div>
                </div>
  
                <div className="cities-summary" style={{ margin: "8px 0 12px" }}>
                  <span>{filteredVehicles.length}</span>{" "}
                  {t("admin.vehiclesManagement.results", "resultados")}
                </div>
  
                {filteredVehicles.length === 0 ? (
                  <div className="cities-empty">
                    <h2>
                      {t(
                        "admin.vehiclesManagement.emptyTitle",
                        t('hc2.no_se_encontraron_vehiculos_registrado', 'No se encontraron vehículos registrados')
                      )}
                    </h2>
                  </div>
                ) : (
                  <div className="cities-table-wrap">
                    <table className="fleet-table">
                      <thead>
                        <tr>
                          {vehicleHeaders.map((header) => (
                            <th key={header} style={{ textTransform: "uppercase" }}>{header}</th>
                          ))}
                          <th style={{ textAlign: "center", textTransform: "uppercase" }}>
                            {t("admin.cities.fields.actions", "ACCIONES")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVehicles.map((vehicle, idx) => (
                          <tr key={vehicle.id}>
                            <td>{idx + 1}</td>
                            <td>
                              {vehicle.imagenes?.[0] ? (
                                <img
                                  src={vehicle.imagenes[0]}
                                  alt={vehicle.nombre || "Auto"}
                                  title={t('hc.haz_clic_para_ver_foto_completa', 'Haz clic para ver foto completa')}
                                  onClick={() =>
                                    setZoomImage({
                                      url: vehicle.imagenes[0],
                                      title: t('hc3.zoom_title', { defaultValue: '{{nombre}} ({{placa}})', nombre: vehicle.nombre || t('hc3.vehicle_word', 'Vehículo'), placa: vehicle.placa || t('hc3.plate_word', 'Placa') }),
                                    })
                                  }
                                  style={{
                                    width: 48,
                                    height: 34,
                                    borderRadius: 8,
                                    objectFit: "cover",
                                    border: "1px solid #cbd5e1",
                                    display: "block",
                                    cursor: "pointer",
                                  }}
                                />
                              ) : (
                                <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>
                              )}
                            </td>
                            <td style={{ fontWeight: 700, color: "#0f172a" }}>
                              {vehicle.nombre}
                            </td>
                            <td>
                              <code>{vehicle.placa}</code>
                            </td>
                            {/* Columna Sucursal: Solo mostrada para Administrador General */}
                            {!esEncargado && <td>{vehicle.sucursal}</td>}
                            <td>{vehicle.categoria}</td>
                            <td>{vehicle.ano || vehicle.año || "—"}</td>
                            <td>{vehicle.color || "—"}</td>
                            <td>{vehicle.transmision || t('hc2.automatica', 'Automática')}</td>
                            <td>{vehicle.combustible || "Gasolina"}</td>
                            <td>
                              {formatCurrency(
                                vehicle.precioLimitado || vehicle.precio || 0,
                                moneda,
                                tasaUSD
                              )}
                            </td>
                            <td>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "4px 10px",
                                  borderRadius: 20,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background: vehicle.picoYPlaca?.dia
                                    ? "rgba(239, 68, 68, 0.12)"
                                    : "rgba(34, 197, 94, 0.12)",
                                  color: vehicle.picoYPlaca?.dia ? "#dc2626" : "#16a34a",
                                  border: `1px solid ${
                                    vehicle.picoYPlaca?.dia
                                      ? "rgba(239, 68, 68, 0.25)"
                                      : "rgba(34, 197, 94, 0.25)"
                                  }`,
                                }}
                              >
                                {vehicle.picoYPlaca?.dia
                                  ? t("admin.vehiclesManagement.applies", "Sí aplica")
                                  : t("admin.vehiclesManagement.doesNotApply", "No aplica")}
                              </span>
                            </td>
                            <td>
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  padding: "4px 10px",
                                  borderRadius: 20,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  background: "var(--bg-seccion1, #f8fafc)",
                                  border: "1px solid var(--city-border, #e2e8f0)",
                                  color: "var(--texto-primary, #1e293b)",
                                }}
                              >
                                <span
                                  style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    backgroundColor:
                                      vehicle.estadoEfectivo === "disponible"
                                        ? "#10b981"
                                        : vehicle.estadoEfectivo === "reservado"
                                        ? "var(--brand-primary)"
                                        : "#ef4444",
                                  }}
                                />
                                {vehicle.estadoEfectivo === "disponible"
                                  ? t("admin.vehiclesManagement.states.disponible", "Disponible")
                                  : vehicle.estadoEfectivo === "reservado"
                                  ? t("admin.vehiclesManagement.states.reservado", "Reservado")
                                  : vehicle.estadoEfectivo === "mantenimiento" || vehicle.estadoEfectivo === "en mantenimiento"
                                  ? t("admin.vehiclesManagement.states.en mantenimiento", "En Mantenimiento")
                                  : vehicle.estadoEfectivo || t("admin.vehiclesManagement.states.disponible", "Disponible")}
                              </div>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <div className="cities-row-actions">
                                {esEncargado ? (
                                  <>
                                    <button
                                      type="button"
                                      className="btn-row-action"
                                      onClick={() => openEdit(vehicle)}
                                      disabled={!sucursalAsignada || !hasMatchingBranch(vehicle.sucursal, sucursalAsignada)}
                                    >
                                      {t("common.edit", "Editar")}
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-row-action is-delete"
                                      onClick={() =>
                                        setModal({ type: "delete", vehicle })
                                      }
                                      disabled={!sucursalAsignada || !hasMatchingBranch(vehicle.sucursal, sucursalAsignada)}
                                    >
                                      {t("common.delete", "Eliminar")}
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn-row-action"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 6,
                                      padding: '5px 12px',
                                      borderRadius: 8,
                                      background: 'var(--brand-soft-light, #eff6ff)',
                                      color: 'var(--brand-primary, #2563eb)',
                                      fontWeight: 700,
                                      border: '1px solid var(--brand-border-light, #bfdbfe)',
                                      cursor: 'pointer'
                                    }}
                                    onClick={() => openDetail(vehicle)}
                                  >
                                    <FaEye size={12} /> {t("common.viewDetail", "Ver Detalle")}
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
  )
}
