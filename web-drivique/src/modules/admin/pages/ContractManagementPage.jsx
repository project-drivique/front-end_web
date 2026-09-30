import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
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
import { useBrand } from "../../../contexts/BrandContext";
import { contractManagementService } from "../../../services/contractManagementService";
import {
  exportExcel,
  exportPdf,
  printTable,
} from "../../../utils/listExportUtils";
import { formatCurrency } from "../../../utils/currencyUtils";
import VEHICULOS_MOCK from "../../../mocks/vehicles.json";
import MenuConfiguracion from "../../../components/MenuConfiguracion";
import FirmaContrato from '@/modules/contracts/components/ContractSignature';
import ManagementSidebar from "../components/ManagementSidebar";
import "./CityManagementPage.css";
import "./ContractManagementPage.css";

export default function ContractManagementPage() {
  const { t, i18n } = useTranslation();
  const { tema } = useLanding();
  const user = useAuthStore((state) => state.usuario);
  const { brand } = useBrand();
  const esModoOscuro = tema === "oscuro";

  const esEncargado =
    user?.rol === "encargado" ||
    user?.rol === "branch_manager" ||
    user?.rol === "encargado_sucursal";
  const sucursalEncargado =
    user?.sucursalAsignada || user?.sucursalId || user?.sucursal || "";

  const [contratos, setContratos] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalDetalle, setModalDetalle] = useState(null);
  const [notice, setNotice] = useState("");

  const getVehiculoImagen = (c) => {
    if (!c) return "";
    if (c.vehiculoImagen) return c.vehiculoImagen;
    const vBrand = (c.vehiculoNombre || "").split(" ")[0].toLowerCase();
    const match = VEHICULOS_MOCK.find(
      (v) =>
        (v.id && c.vehiculoId && String(v.id) === String(c.vehiculoId)) ||
        (v.placa && c.vehiculoPlaca && v.placa.replace(/\s|-/g, "").toLowerCase() === c.vehiculoPlaca.replace(/\s|-/g, "").toLowerCase()) ||
        (v.nombre && c.vehiculoNombre && v.nombre.toLowerCase().includes(c.vehiculoNombre.toLowerCase())) ||
        (c.vehiculoNombre && v.nombre && c.vehiculoNombre.toLowerCase().includes(v.nombre.toLowerCase())) ||
        (vBrand && v.nombre && v.nombre.toLowerCase().includes(vBrand))
    );
    return match?.imagenes?.[0] || match?.imagen || VEHICULOS_MOCK[0]?.imagenes?.[0] || "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/a2cb0b378c25efdb1e116246f84149744c2f4081.jpg";
  };

  useEffect(() => {
    setContratos(contractManagementService.list(user));
  }, [user]);

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
      : t("admin.contractsPage.exportTitle", `Listado de Contratos - ${brand?.name || 'Drivique'}`).replaceAll("Drivique", brand?.name || 'Drivique'),
    headers: headersExport,
    rows: rowsExport,
    items: filtrados,
    filename: `contratos-drivique-${new Date().toISOString().slice(0, 10)}`,
  };

  const handleExportExcel = () => {
    exportExcel(exportData);
    contractManagementService.logAudit(
      t("admin.contractsPage.audit.exportExcel"),
      { id: "ALL", contratoNumero: t("admin.contractsPage.listLabel") },
      user,
    );
  };

  const handleExportPdf = () => {
    exportPdf(exportData);
    contractManagementService.logAudit(
      t("admin.contractsPage.audit.exportPdf"),
      { id: "ALL", contratoNumero: t("admin.contractsPage.listLabel") },
      user,
    );
  };

  const handlePrint = () => {
    printTable(exportData);
    contractManagementService.logAudit(
      t("admin.contractsPage.audit.print"),
      { id: "ALL", contratoNumero: t("admin.contractsPage.listLabel") },
      user,
    );
  };

  const handleDownloadSinglePdf = (contrato) => {
    contractManagementService.logAudit(t("admin.contractsPage.audit.download"), contrato, user);
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
    setNotice(t("admin.contractsPage.downloadSuccess", { contract: contrato.contratoNumero, defaultValue: `Contrato ${contrato.contratoNumero} descargado.` }));
  };

  const openDetalle = (contrato) => {
    contractManagementService.logAudit(
      t("admin.contractsPage.audit.view"),
      contrato,
      user,
    );
    setModalDetalle(contrato);
  };

  return (
    <div
      className={`management-shell contracts-page ${esModoOscuro ? "management-shell--dark" : ""}`}
    >
      <ManagementSidebar branchOnly={esEncargado} />
      <main className="management-main" style={{ padding: "24px 32px" }}>
        <div className="cities-container" style={{ maxWidth: "100%" }}>
          <header className="cities-topbar reservations-management-header">
            <div className="branch-topbar-brand-title">
              <span className="branch-topbar-badge">GESTIÓN DE SUCURSAL</span>
              <h1 className="branch-topbar-heading">Gestión de Contratos</h1>
            </div>
            <div className="cities-topbar__actions">
              <MenuConfiguracion />
            </div>
          </header>

          {notice && <div className="cities-notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label={t("common.close")}>×</button></div>}

          <section className="cities-card">
            <div className="cities-toolbar contracts-toolbar">
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
              <select
                className="contracts-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label={t("admin.contractsPage.allStates", "Todos los estados")}
              >
                <option value="all">{t("admin.contractsPage.allStates", "Todos los estados")}</option>
                <option value="vigente">{t("admin.contractsPage.states.vigente", "Vigente")}</option>
                <option value="cerrado">{t("admin.contractsPage.states.cerrado", "Cerrado")}</option>
                <option value="firmado">{t("admin.contractsPage.states.firmado", "Firmado")}</option>
              </select>
              <div className="cities-export contracts-export">

                <button
                  onClick={handleExportExcel}
                  title={t("admin.contractsPage.exportExcel")}
                >
                  <FaFileExcel style={{ color: "#27ae60" }} /> Excel
                </button>
                <button
                  onClick={handleExportPdf}
                  title={t("admin.contractsPage.exportPdf")}
                >
                  <FaFilePdf style={{ color: "#e74c3c" }} /> PDF
                </button>
                <button
                  onClick={handlePrint}
                  title={t("admin.contractsPage.printList")}
                >
                  <FaPrint /> {t('admin.print', 'Imprimir')}
                </button>
              </div>
            </div>

            <div className="contracts-summary">
                {filtrados.length}{" "}
                {t("admin.contractsPage.results", "contratos encontrados")}
            </div>
            <div className="cities-table-wrap contracts-table-wrap">
              <table className="cities-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>
                    {t("admin.contractsPage.fields.contractNumber", "No. Contrato")}
                  </th>
                  <th>CÓDIGO RESERVA</th>
                  <th style={{ textAlign: "center" }}>VER CONTRATO</th>
                  <th style={{ textAlign: "center" }}>DESCARGAR CONTRATO</th>
                  <th style={{ textAlign: "center" }}>IMPRIMIR CONTRATO</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length > 0 ? (
                  filtrados.map((c, index) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: "normal", color: "#374151" }}>
                        {index + 1}
                      </td>
                      <td style={{ fontWeight: "normal", color: "#374151" }}>
                        {c.contratoNumero || `CTR-${c.reservaCodigo}`}
                      </td>
                      <td style={{ fontWeight: "normal", color: "#374151" }}>
                        {c.reservaCodigo}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => openDetalle(c)}
                          style={{ padding: '6px 12px', fontSize: '13px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'normal', minWidth: '80px' }}
                        >
                          Ver
                        </button>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleDownloadSinglePdf(c)}
                          style={{ padding: '6px 12px', fontSize: '13px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'normal', minWidth: '100px' }}
                        >
                          Descargar
                        </button>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => {
                            const singleData = {
                              title: `Contrato - ${c.contratoNumero}`,
                              headers: headersExport,
                              rows: [[
                                c.contratoNumero, c.reservaCodigo, c.clienteNombre, c.clienteDocumento,
                                `${c.vehiculoNombre} (${c.vehiculoPlaca})`, c.sucursal,
                                c.fechaInicio ? String(c.fechaInicio).replace("T", " ") : "",
                                c.fechaFin ? String(c.fechaFin).replace("T", " ") : "",
                                t(`admin.contractsPage.states.${c.estado}`, c.estado), c.totalCOP,
                              ]],
                              items: [c],
                            };
                            printTable(singleData);
                          }}
                          style={{ padding: '6px 12px', fontSize: '13px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'normal', minWidth: '90px' }}
                        >
                          Imprimir
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
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
          <section className="cities-modal contracts-detail-modal">
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

              <div className="contracts-detail-body" style={{ background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', maxHeight: '75vh', overflowY: 'auto' }}>
                <FirmaContrato 
                  soloLectura={true}
                  vehiculo={{ 
                    nombre: modalDetalle.vehiculoNombre, 
                    placa: modalDetalle.vehiculoPlaca, 
                    sucursal: modalDetalle.sucursal 
                  }}
                  reservaGuardada={{
                    clienteNombre: modalDetalle.clienteNombre,
                    clienteDocumento: modalDetalle.clienteDocumento,
                    clienteCorreo: modalDetalle.clienteCorreo,
                    clienteTelefono: modalDetalle.clienteTelefono,
                    total: modalDetalle.totalCOP,
                    referencia: modalDetalle.reservaCodigo,
                    reservaDetalles: { sucursalRetiro: modalDetalle.sucursal, fechaInicio: modalDetalle.fechaInicio, fechaFin: modalDetalle.fechaFin }
                  }}
                  contratoFirmado={{
                    codigo: modalDetalle.contratoNumero || `CTR-${modalDetalle.reservaCodigo}`,
                    firmaUsuarioDataUrl: modalDetalle.firmaUsuarioDataUrl || 'mock',
                  }}
                />
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
                  {t("admin.contractsPage.downloadPdf", "Descargar Contrato")}
                </button>
              </div>
          </section>
        </div>
      )}
    </div>
  );
}
