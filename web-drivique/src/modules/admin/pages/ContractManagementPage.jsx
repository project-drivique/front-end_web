import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaArrowLeft,
  FaFileContract,
  FaEye,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
  FaSearch,
  FaTimes,
  FaUser,
  FaBuilding,
  FaCalendarAlt,
  FaDownload,
  FaCar,
} from "react-icons/fa";
import { useLanding } from "../../landing/LandingContext";
import { useAuthStore } from "../../../store/authStore";
import { contractManagementService } from "../../../services/contractManagementService";
import {
  exportExcel,
  exportPdf,
  printTable,
} from "../../../utils/listExportUtils";
import { formatCurrency } from "../../../utils/currencyUtils";
import MenuConfiguracion from "../../../components/MenuConfiguracion";
import ManagementSidebar from "../components/ManagementSidebar";
import "./CityManagementPage.css";

export default function ContractManagementPage() {
  const { t } = useTranslation();
  const { tema } = useLanding();
  const user = useAuthStore((state) => state.usuario);
  const esModoOscuro = tema === "oscuro";

  const esEncargado =
    user?.rol === "encargado" ||
    user?.rol === "branch_manager" ||
    user?.rol === "encargado_sucursal";
  const sucursalEncargado =
    user?.sucursalAsignada || user?.sucursalId || user?.sucursal || "Neiva";

  const [contratos, setContratos] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalDetalle, setModalDetalle] = useState(null);
  const [notice, setNotice] = useState("");

  const cargarContratos = () => {
    const lista = contractManagementService.list(user);
    setContratos(lista);
  };

  useEffect(() => {
    cargarContratos();
  }, []);

  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    return contratos.filter((c) => {
      const matchSearch =
        !term ||
        `${c.contratoNumero} ${c.reservaCodigo} ${c.clienteNombre} ${c.clienteDocumento}`
          .toLowerCase()
          .includes(term);

      const matchStatus = statusFilter === "all" || c.estado === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [contratos, search, statusFilter]);

  const headersExport = [
    t("admin.contractsPage.fields.contractNumber", "No. Contrato"),
    t("admin.contractsPage.fields.reservationCode", "Reserva"),
    t("admin.contractsPage.fields.clientName", "Cliente"),
    t("admin.contractsPage.fields.clientDoc", "Documento"),
    t("admin.contractsPage.fields.vehicle", "Vehículo"),
    t("admin.contractsPage.fields.branch", "Sucursal"),
    t("admin.contractsPage.fields.startDate", "Inicio"),
    t("admin.contractsPage.fields.endDate", "Fin"),
    t("admin.contractsPage.fields.state", "Estado"),
    t("admin.contractsPage.fields.total", "Total COP"),
  ];

  const rowsExport = filtrados.map((c) => [
    c.contratoNumero,
    c.reservaCodigo,
    c.clienteNombre,
    c.clienteDocumento,
    `${c.vehiculoNombre} (${c.vehiculoPlaca})`,
    c.sucursal,
    c.fechaInicio ? String(c.fechaInicio).replace("T", " ") : "",
    c.fechaFin ? String(c.fechaFin).replace("T", " ") : "",
    t(`admin.contractsPage.states.${c.estado}`, c.estado),
    c.totalCOP,
  ]);

  const exportData = {
    title: esEncargado
      ? `${t("admin.contractsPage.title", "Gestión de Contratos")} - ${sucursalEncargado}`
      : t("admin.contractsPage.exportTitle", "Listado de Contratos - Drivique"),
    headers: headersExport,
    rows: rowsExport,
    items: filtrados,
    filename: `contratos-drivique-${new Date().toISOString().slice(0, 10)}`,
  };

  const handleExportExcel = () => {
    exportExcel(exportData);
    contractManagementService.logAudit(
      "Exportó listado de contratos a Excel",
      { id: "ALL", contratoNumero: "Listado" },
      user,
    );
  };

  const handleExportPdf = () => {
    exportPdf(exportData);
    contractManagementService.logAudit(
      "Exportó listado de contratos a PDF",
      { id: "ALL", contratoNumero: "Listado" },
      user,
    );
  };

  const handlePrint = () => {
    printTable(exportData);
    contractManagementService.logAudit(
      "Imprimió listado de contratos",
      { id: "ALL", contratoNumero: "Listado" },
      user,
    );
  };

  const handleDownloadSinglePdf = (contrato) => {
    contractManagementService.logAudit("Descargó contrato PDF", contrato, user);
    const singleData = {
      title: `${t("admin.contractsPage.detailsTitle", "Detalle de Contrato")} - ${contrato.contratoNumero}`,
      headers: headersExport,
      rows: [
        [
          contrato.contratoNumero,
          contrato.reservaCodigo,
          contrato.clienteNombre,
          contrato.clienteDocumento,
          `${contrato.vehiculoNombre} (${contrato.vehiculoPlaca})`,
          contrato.sucursal,
          contrato.fechaInicio ? String(contrato.fechaInicio).replace("T", " ") : "",
          contrato.fechaFin ? String(contrato.fechaFin).replace("T", " ") : "",
          t(`admin.contractsPage.states.${contrato.estado}`, contrato.estado),
          contrato.totalCOP,
        ],
      ],
      items: [contrato],
      filename: `${contrato.contratoNumero}-${contrato.clienteDocumento}`,
    };
    exportPdf(singleData);
    setNotice(`Contrato ${contrato.contratoNumero} descargado.`);
  };

  const openDetalle = (contrato) => {
    contractManagementService.logAudit(
      "Consultó detalle de contrato",
      contrato,
      user,
    );
    setModalDetalle(contrato);
  };

  return (
    <div
      className={`management-shell ${esModoOscuro ? "management-shell--dark" : ""}`}
    >
      <ManagementSidebar branchOnly={esEncargado} />
      <main className="management-main" style={{ padding: "24px 32px" }}>
        <div className="cities-container" style={{ maxWidth: "100%" }}>
          <header className="cities-topbar">
            <div>
              <p className="cities-eyebrow">
                {esEncargado
                  ? `Encargado de Sucursal (${sucursalEncargado})`
                  : t("admin.management", "Gestión Operativa")}
              </p>
              <h1>{t("admin.contractsPage.title", "Gestión de Contratos")}</h1>
              <p className="cities-subtitle">
                {t(
                  "admin.contractsPage.subtitle",
                  "Consulta y gestiona los contratos de alquiler, exporta la información e imprime documentos oficiales.",
                )}
              </p>
            </div>
            <div className="cities-topbar__actions">
              <MenuConfiguracion />
            </div>
          </header>

          {notice && (
            <div
              style={{
                padding: "12px 16px",
                background: "var(--city-bg)",
                border: "1px solid var(--city-border)",
                borderRadius: 8,
                marginBottom: 20,
                color: "var(--city-primary)",
                fontWeight: 500,
              }}
            >
              {notice}
            </div>
          )}

          <section className="cities-card">
            <div className="cities-toolbar">
              <div className="cities-search">
                <FaSearch />
                <input
                  type="text"
                  placeholder={t(
                    "admin.contractsPage.search",
                    "Buscar por reserva o documento...",
                  )}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="cities-export">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">
                    {t("admin.contractsPage.allStates", "Todos los estados")}
                  </option>
                  <option value="vigente">
                    {t("admin.contractsPage.states.vigente", "Vigente")}
                  </option>
                  <option value="cerrado">
                    {t("admin.contractsPage.states.cerrado", "Cerrado")}
                  </option>
                  <option value="firmado">
                    {t("admin.contractsPage.states.firmado", "Firmado")}
                  </option>
                </select>

                <button
                  onClick={handleExportExcel}
                  title="Exportar a Excel"
                >
                  <FaFileExcel style={{ color: "#27ae60" }} /> Excel
                </button>
                <button
                  onClick={handleExportPdf}
                  title="Exportar a PDF"
                >
                  <FaFilePdf style={{ color: "#e74c3c" }} /> PDF
                </button>
                <button
                  onClick={handlePrint}
                  title="Imprimir Listado"
                >
                  <FaPrint /> {t('admin.print', 'Imprimir')}
                </button>
              </div>
            </div>

            <div className="cities-table-wrap">
              <div className="cities-table-count" style={{ padding: '0 0 12px 0', fontSize: '12px', fontWeight: 600, color: 'var(--city-muted)' }}>
                {filtrados.length}{" "}
                {t("admin.contractsPage.results", "contratos encontrados")}
              </div>
              <table className="cities-table">
              <thead>
                <tr>
                  <th>
                    {t("admin.contractsPage.fields.contractNumber", "No. Contrato")}
                  </th>
                  <th>
                    {t("admin.contractsPage.fields.reservationCode", "Reserva")}
                  </th>
                  <th>{t("admin.contractsPage.fields.clientName", "Cliente")}</th>
                  <th>{t("admin.contractsPage.fields.clientDoc", "Documento")}</th>
                  <th>{t("admin.contractsPage.fields.vehicle", "Vehículo")}</th>
                  <th>{t("admin.contractsPage.fields.startDate", "Inicio")}</th>
                  <th>{t("admin.contractsPage.fields.state", "Estado")}</th>
                  <th style={{ textAlign: "center" }}>{t('admin.contractsPage.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length > 0 ? (
                  filtrados.map((c) => (
                    <tr key={c.id}>
                      <td
                        style={{
                          fontWeight: 600,
                          color: "var(--city-primary)",
                        }}
                      >
                        {c.contratoNumero}
                      </td>
                      <td>{c.reservaCodigo}</td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <FaUser style={{ color: "var(--city-text-muted)" }} />
                          {c.clienteNombre}
                        </div>
                      </td>
                      <td>{c.clienteDocumento}</td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <FaCar style={{ color: "var(--city-text-muted)" }} />
                          {c.vehiculoPlaca}
                        </div>
                      </td>
                      <td>{c.fechaInicio?.replace("T", " ")}</td>
                      <td>
                        <span className={`res-status res-status--${c.estado}`}>
                          {t(`admin.contractsPage.states.${c.estado}`, c.estado)}
                        </span>
                      </td>
                      <td>
                        <div
                          className="cities-row-actions"
                          style={{ justifyContent: "center" }}
                        >
                          <button
                            onClick={() => openDetalle(c)}
                            title={t(
                              "admin.contractsPage.viewDetails",
                              "Ver Detalle",
                            )}
                          >
                            <FaEye />
                          </button>
                          <button
                            className="is-danger"
                            onClick={() => handleDownloadSinglePdf(c)}
                            title={t(
                              "admin.contractsPage.downloadPdf",
                              "Descargar Contrato",
                            )}
                          >
                            <FaDownload />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">
                      <div className="cities-empty">
                        <FaFileContract className="cities-empty__icon" />
                        <h3>
                          {t(
                            "admin.contractsPage.emptyTitle",
                            "No se encontraron contratos",
                          )}
                        </h3>
                        <p>
                          {t(
                            "admin.contractsPage.emptySubtitle",
                            "Intenta ajustar los criterios de búsqueda.",
                          )}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </section>
        </div>
      </main>

      {modalDetalle && (
        <div
          className="cities-modal-backdrop"
          onMouseDown={(e) =>
            e.target === e.currentTarget && setModalDetalle(null)
          }
        >
          <section className="cities-modal" style={{ maxWidth: 800 }}>
            <div className="cities-modal__head">
              <div>
                <p className="cities-eyebrow">{modalDetalle.contratoNumero}</p>
                <h2>
                  {t("admin.contractsPage.detailsTitle", "Detalle de Contrato")}
                </h2>
              </div>
              <button type="button" onClick={() => setModalDetalle(null)}>
                <FaTimes />
              </button>
            </div>

            <div className="incident-form" style={{ marginTop: 20 }}>
              <div className="incident-grid-2">
                <div className="incident-field">
                  <span className="incident-field-label">
                    {t("admin.contractsPage.fields.reservationCode", "Reserva")}
                  </span>
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "var(--city-bg)",
                      borderRadius: 8,
                      border: "1px solid var(--city-border)",
                      fontWeight: 500,
                    }}
                  >
                    {modalDetalle.reservaCodigo}
                  </div>
                </div>
                <div className="incident-field">
                  <span className="incident-field-label">
                    {t("admin.contractsPage.fields.state", "Estado")}
                  </span>
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "var(--city-bg)",
                      borderRadius: 8,
                      border: "1px solid var(--city-border)",
                    }}
                  >
                    <span
                      className={`res-status res-status--${modalDetalle.estado}`}
                      style={{ display: "inline-block" }}
                    >
                      {t(
                        `admin.contractsPage.states.${modalDetalle.estado}`,
                        modalDetalle.estado,
                      )}
                    </span>
                  </div>
                </div>

                <div className="incident-field">
                  <span className="incident-field-label">
                    {t("admin.contractsPage.fields.clientName", "Cliente")}
                  </span>
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "var(--city-bg)",
                      borderRadius: 8,
                      border: "1px solid var(--city-border)",
                    }}
                  >
                    <FaUser
                      style={{
                        marginRight: 8,
                        color: "var(--city-text-muted)",
                      }}
                    />
                    {modalDetalle.clienteNombre}
                  </div>
                </div>
                <div className="incident-field">
                  <span className="incident-field-label">
                    {t("admin.contractsPage.fields.clientDoc", "Documento")}
                  </span>
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "var(--city-bg)",
                      borderRadius: 8,
                      border: "1px solid var(--city-border)",
                    }}
                  >
                    {modalDetalle.clienteDocumento}
                  </div>
                </div>

                <div className="incident-field">
                  <span className="incident-field-label">
                    {t("admin.contractsPage.fields.clientEmail", "Correo")}
                  </span>
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "var(--city-bg)",
                      borderRadius: 8,
                      border: "1px solid var(--city-border)",
                    }}
                  >
                    {modalDetalle.clienteCorreo}
                  </div>
                </div>
                <div className="incident-field">
                  <span className="incident-field-label">
                    {t("admin.contractsPage.fields.clientPhone", "Teléfono")}
                  </span>
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "var(--city-bg)",
                      borderRadius: 8,
                      border: "1px solid var(--city-border)",
                    }}
                  >
                    {modalDetalle.clienteTelefono}
                  </div>
                </div>

                <div className="incident-field">
                  <span className="incident-field-label">
                    {t("admin.contractsPage.fields.vehicle", "Vehículo")}
                  </span>
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "var(--city-bg)",
                      borderRadius: 8,
                      border: "1px solid var(--city-border)",
                    }}
                  >
                    <FaCar
                      style={{
                        marginRight: 8,
                        color: "var(--city-text-muted)",
                      }}
                    />
                    {modalDetalle.vehiculoNombre} ({modalDetalle.vehiculoPlaca})
                  </div>
                </div>
                <div className="incident-field">
                  <span className="incident-field-label">
                    {t("admin.contractsPage.fields.branch", "Sucursal")}
                  </span>
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "var(--city-bg)",
                      borderRadius: 8,
                      border: "1px solid var(--city-border)",
                    }}
                  >
                    <FaBuilding
                      style={{
                        marginRight: 8,
                        color: "var(--city-text-muted)",
                      }}
                    />
                    {modalDetalle.sucursal}
                  </div>
                </div>

                <div className="incident-field">
                  <span className="incident-field-label">
                    {t("admin.contractsPage.fields.startDate", "Inicio")}
                  </span>
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "var(--city-bg)",
                      borderRadius: 8,
                      border: "1px solid var(--city-border)",
                    }}
                  >
                    <FaCalendarAlt
                      style={{
                        marginRight: 8,
                        color: "var(--city-text-muted)",
                      }}
                    />
                    {modalDetalle.fechaInicio?.replace("T", " ")}
                  </div>
                </div>
                <div className="incident-field">
                  <span className="incident-field-label">
                    {t("admin.contractsPage.fields.endDate", "Fin")}
                  </span>
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "var(--city-bg)",
                      borderRadius: 8,
                      border: "1px solid var(--city-border)",
                    }}
                  >
                    <FaCalendarAlt
                      style={{
                        marginRight: 8,
                        color: "var(--city-text-muted)",
                      }}
                    />
                    {modalDetalle.fechaFin?.replace("T", " ")}
                  </div>
                </div>

                <div className="incident-field">
                  <span className="incident-field-label">
                    {t("admin.contractsPage.fields.total", "Total COP")}
                  </span>
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "var(--city-bg)",
                      borderRadius: 8,
                      border: "1px solid var(--city-border)",
                      fontWeight: 600,
                    }}
                  >
                    {formatCurrency(modalDetalle.totalCOP)}
                  </div>
                </div>
                <div className="incident-field">
                  <span className="incident-field-label">
                    {t(
                      "admin.contractsPage.fields.signatureDate",
                      "Fecha de firma",
                    )}
                  </span>
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "var(--city-bg)",
                      borderRadius: 8,
                      border: "1px solid var(--city-border)",
                    }}
                  >
                    {modalDetalle.fechaFirma ? new Date(modalDetalle.fechaFirma).toLocaleString("es-CO") : "Sin firma"}
                  </div>
                </div>
              </div>

              <div
                className="cities-modal__actions"
                style={{ marginTop: 24, display: "flex", gap: 12 }}
              >
                <button
                  type="button"
                  onClick={() => setModalDetalle(null)}
                  style={{ flex: 1 }}
                >
                  {t('admin.contractsPage.close')}
                </button>
                <button
                  type="button"
                  className="cities-primary"
                  onClick={() => handleDownloadSinglePdf(modalDetalle)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <FaDownload />{" "}
                  {t("admin.contractsPage.downloadPdf", "Descargar Contrato")}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
