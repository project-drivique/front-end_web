import { FaPlus, FaFileExcel, FaFilePdf, FaPrint } from 'react-icons/fa'
import { exportExcel, exportPdf, printTable } from '../../../../utils/listExportUtils'
import { branchCategoryService } from '../../../../services/branchCategoryService'
import { formatCurrency } from '../../../../utils/currencyUtils'

export default function FlotasActiveTab({ categoryExportData, esEncargado, filteredCategories, getTotalVehiclesInCategory, getVehiclesInMyBranchCount, handleToggleCategory, moneda, openCreateCategory, openEditCategory, search, setModal, setSearch, sucursalAsignada, t, tasaUSD }) {
  return (
    <section className="cities-card attached-to-tabs">
                <div className="fleet-datatable-header">
                  <div
                    className="fleet-datatable-search"
                    style={{ display: "flex", gap: "16px" }}
                  >
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t(
                        "categoriesManagement.searchPlaceholder",
                        t('hc2.buscar_categoria_por_nombre_o_descripc', 'Buscar categoría por nombre o descripción...')
                      )}
                    />
                    {!esEncargado && (
                      <button
                        type="button"
                        className="cities-primary"
                        onClick={openCreateCategory}
                        style={{ whiteSpace: "nowrap", padding: "0 24px" }}
                      >
                        <FaPlus style={{ marginRight: 8 }} />{" "}
                        {t("categoriesManagement.createTitle", "Crear Categoría")}
                      </button>
                    )}
                  </div>
  
                  {/* Botones de exportación: Solo para Administrador General */}
                  {!esEncargado && (
                    <div className="export-pills-group">
                      <button
                        type="button"
                        className="export-pill export-pill--excel"
                        onClick={() => exportExcel(categoryExportData)}
                      >
                        <FaFileExcel aria-hidden="true" /> {t('admin.vehiclesManagement.export.excel', 'Excel')}
                      </button>
                      <button
                        type="button"
                        className="export-pill export-pill--pdf"
                        onClick={() => exportPdf(categoryExportData)}
                      >
                        <FaFilePdf aria-hidden="true" /> {t('admin.vehiclesManagement.export.pdf', 'PDF')}
                      </button>
                      <button
                        type="button"
                        className="export-pill export-pill--print"
                        onClick={() => printTable(categoryExportData)}
                      >
                        <FaPrint aria-hidden="true" /> {t('admin.vehiclesManagement.export.print', 'Imprimir')}
                      </button>
                    </div>
                  )}
                </div>
  
                {filteredCategories.length === 0 ? (
                  <div className="cities-empty">
                    <h2>
                      {t(
                        "categoriesManagement.noCategoriesFound",
                        t('hc2.no_se_encontraron_categorias', 'No se encontraron categorías')
                      )}
                    </h2>
                  </div>
                ) : (
                  <div className="cities-table-wrap">
                    <table className="fleet-table">
                      <thead>
                        {esEncargado ? (
                          /* CABECERAS PARA ENCARGADO DE SUCURSAL */
                          <tr>
                            <th style={{ width: 60 }}>ID</th>
                            <th>{t("categoriesManagement.categoryName", "NOMBRE DE LA CATEGORÍA")}</th>
                            <th>{t("categoriesManagement.description", "DESCRIPCIÓN")}</th>
                            <th style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                              {t("categoriesManagement.vehiclesInMyBranch", "VEHÍCULOS EN MI SUCURSAL")}
                            </th>
                            <th style={{ textAlign: "center", minWidth: 200, whiteSpace: "nowrap" }}>
                              {t("categoriesManagement.offerThisCategory", "OFREZCO ESTA CATEGORÍA")}
                            </th>
                          </tr>
                        ) : (
                          /* CABECERAS PARA ADMINISTRADOR GENERAL */
                          <tr>
                            <th style={{ width: 60 }}>ID</th>
                            <th>{t("categoriesManagement.categoryName", "NOMBRE DE LA CATEGORÍA")}</th>
                            <th>{t("categoriesManagement.description", "DESCRIPCIÓN")}</th>
                            <th style={{ textAlign: "center" }}>
                              {t("categoriesManagement.branchesOffering", "SUCURSALES QUE LA OFRECEN")}
                            </th>
                            <th style={{ textAlign: "center" }}>
                              {t("categoriesManagement.totalVehicles", "TOTAL VEHÍCULOS")}
                            </th>
                            <th>{t("categoriesManagement.suggestedRate", "TARIFA BASE SUGERIDA")}</th>
                            <th>{t("categoriesManagement.suggestedDeposit", "DEPÓSITO SUGERIDO")}</th>
                            <th style={{ textAlign: "center" }}>
                              {t("categoriesManagement.status", "ESTADO")}
                            </th>
                            <th style={{ textAlign: "center" }}>
                              {t("admin.cities.fields.actions", "ACCIONES")}
                            </th>
                          </tr>
                        )}
                      </thead>
                      <tbody>
                        {filteredCategories.map((gf) => {
                          const isOfferedInMyBranch = branchCategoryService.isCategoryActiveForBranch(
                            sucursalAsignada,
                            gf.nombre
                          );
                          const vehiclesInBranch = getVehiclesInMyBranchCount(gf.nombre);
                          const totalVehicles = getTotalVehiclesInCategory(gf.nombre);
                          const ratio = branchCategoryService.getBranchesOfferingCategoryRatio(gf.nombre).formatted;
  
                          if (esEncargado) {
                            return (
                              /* FILA PARA ENCARGADO DE SUCURSAL */
                              <tr key={gf.id}>
                                <td>{gf.id}</td>
                                <td>
                                  <strong style={{ fontSize: 13.5, color: "var(--adm-text, #0f172a)", whiteSpace: "nowrap" }}>
                                    {gf.nombre}
                                  </strong>
                                </td>
                                <td>
                                  <span style={{ fontSize: 12.5, color: "var(--city-muted, #64748b)", lineHeight: 1.45 }}>
                                    {gf.descripcion || "—"}
                                  </span>
                                </td>
                                <td style={{ textAlign: "center" }}>
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      padding: "4px 12px",
                                      borderRadius: 12,
                                      background: vehiclesInBranch > 0 ? "rgba(var(--brand-primary-rgb), 0.08)" : "var(--city-card-alt, #f1f5f9)",
                                      color: vehiclesInBranch > 0 ? "var(--brand-primary, #2563eb)" : "var(--city-muted, #64748b)",
                                      fontWeight: 700,
                                      fontSize: 13,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {vehiclesInBranch}{" "}
                                    {vehiclesInBranch === 1 ? t('hc2.vehiculo_155', 'vehículo') : t('hc2.vehiculos', 'vehículos')}
                                  </span>
                                </td>
                                <td style={{ textAlign: "center" }}>
                                  <div className="branch-category-switch-wrap">
                                    <label className="branch-category-switch">
                                      <input
                                        type="checkbox"
                                        checked={isOfferedInMyBranch}
                                        onChange={() => handleToggleCategory(gf.nombre, isOfferedInMyBranch)}
                                      />
                                      <span className="branch-category-slider" />
                                    </label>
                                    <span
                                      className={`branch-category-switch-label ${
                                        isOfferedInMyBranch ? "is-active" : "is-inactive"
                                      }`}
                                    >
                                      {isOfferedInMyBranch
                                        ? `Sí (${t("categoriesManagement.offered", "Ofrecida")})`
                                        : `No (${t("categoriesManagement.notOffered", "No ofrecida")})`}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          }
  
                          /* FILA PARA ADMINISTRADOR GENERAL */
                          return (
                            <tr key={gf.id}>
                              <td>{gf.id}</td>
                              <td style={{ fontWeight: 700, color: "var(--adm-text, #0f172a)" }}>
                                {gf.nombre}
                              </td>
                              <td
                                style={{
                                  maxWidth: 260,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={gf.descripcion || "—"}
                              >
                                {gf.descripcion || "—"}
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    padding: "4px 10px",
                                    borderRadius: 12,
                                    background: "rgba(var(--brand-primary-rgb), 0.08)",
                                    color: "var(--brand-primary, #2563eb)",
                                    fontWeight: 700,
                                    fontSize: 12,
                                  }}
                                >
                                  {ratio}
                                </span>
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <span style={{ fontWeight: 600 }}>
                                  {totalVehicles} unidades
                                </span>
                              </td>
                              <td>
                                {gf.tarifaBaseSugerida
                                  ? formatCurrency(gf.tarifaBaseSugerida, moneda, tasaUSD)
                                  : "—"}
                              </td>
                              <td>
                                {gf.depositoGarantiaSugerido
                                  ? formatCurrency(gf.depositoGarantiaSugerido, moneda, tasaUSD)
                                  : "—"}
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <span
                                  className={`status-pill ${gf.activo !== false ? "is-green" : "is-red"}`}
                                  style={{
                                    padding: "4px 10px",
                                    borderRadius: 20,
                                    fontSize: 11,
                                    fontWeight: 700,
                                  }}
                                >
                                  {gf.activo !== false
                                    ? t("categoriesManagement.active", "Activa")
                                    : t("categoriesManagement.inactive", "Inactiva")}
                                </span>
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <div className="cities-row-actions">
                                  <button
                                    type="button"
                                    className="btn-row-action"
                                    onClick={() => openEditCategory(gf)}
                                  >
                                    {t("common.edit", "Editar")}
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-row-action is-delete"
                                    onClick={() =>
                                      setModal({ type: "delete_category", category: gf })
                                    }
                                  >
                                    {t("common.delete", "Eliminar")}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
  )
}
