import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaFileContract, FaFileExcel, FaFilePdf, FaPrint, FaSearch, FaTimes, FaReceipt } from "react-icons/fa";
import { useLanding } from "../../landing/LandingContext";
import { useAuthStore } from "../../../store/authStore";
import { useBrand } from "../../../contexts/BrandContext";
import { contractManagementService } from "../../../services/contractManagementService";
import { contractService } from "../../../services/contractService";
import {
  exportExcel,
  exportPdf,
  printTable,
} from "../../../utils/listExportUtils";

import MenuConfiguracion from "../../../components/MenuConfiguracion";
import FirmaContrato from '@/modules/contracts/components/ContractSignature';
import ManagementSidebar from "../components/ManagementSidebar";
import "./CityManagementPage.css";
import "./ContractManagementPage.css";

// La firma llega como instante UTC: se muestra en la hora local de quien la consulta, no la del servidor
const fechaFirmaLocal = (iso) => {
  const d = iso ? new Date(iso) : null
  if (!d || Number.isNaN(d.getTime())) return { fecha: '-', hora: '-' }
  const pad = (n) => String(n).padStart(2, '0')
  return {
    fecha: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    hora: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

export default function ContractManagementPage() {
  const { t } = useTranslation();
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


  useEffect(() => {
    contractManagementService.refresh().then(setContratos).catch((error) => console.error('No se pudieron cargar los contratos:', error));
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
    }).sort((a, b) => {
      const codeA = String(a.reservaCodigo || a.id || '');
      const codeB = String(b.reservaCodigo || b.id || '');
      return codeA.localeCompare(codeB);
    });
  }, [contratos, search, statusFilter]);

  const headersExport = [
    t("admin.contractsPage.fields.contractNumber", "Código Contrato"),
    t("admin.contractsPage.fields.reservationCode", "Código Reserva"),
    t("admin.contractsPage.fields.clientName", "Cliente"),
    t("admin.contractsPage.fields.clientDoc", "Documento"),
    t("admin.contractsPage.fields.vehicle", "Nombre Vehículo"),
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
  };

  const handleExportPdf = () => {
    exportPdf(exportData);
  };

  const handlePrint = () => {
    printTable(exportData);
  };

  const handleDownloadSinglePdf = async (contrato) => {
    try {
      if (contrato?.id) {
        const blob = await contractService.descargarPdf(contrato.id);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Contrato-${contrato.contratoNumero || contrato.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setNotice(t("admin.contractsPage.downloadSuccess", { contract: contrato.contratoNumero, defaultValue: `Contrato ${contrato.contratoNumero} descargado.` }));
        return;
      }
    } catch (err) {
      console.warn("Fallo al descargar PDF de backend, usando fallback:", err);
    }

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
              <span className="branch-topbar-badge">{t('admin.branchManagement', 'GESTIÓN DE SUCURSAL')}</span>
              <h1 className="branch-topbar-heading">{t('admin.contractsPage.title', 'Gestión de Contratos')}</h1>
            </div>
            <div className="branch-topbar-actions">
              <MenuConfiguracion />
              {esEncargado && (
                <div className="branch-user-profile-chip">
                  <div className="branch-user-avatar">
                    {(user?.nombre || user?.correo || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="branch-user-info-text">
                    <strong className="branch-user-name">
                      {(() => {
                        const nom = (user?.nombre || '').trim()
                        const ape = (user?.apellido || '').trim()
                        if (nom && ape && !nom.toLowerCase().includes(ape.toLowerCase())) return `${nom} ${ape}`
                        return nom || ape || user?.correo || 'Usuario'
                      })()}
                    </strong>
                    <span className="branch-user-role">{user?.rol || 'encargado_sucursal'}</span>
                  </div>
                </div>
              )}
            </div>
          </header>

          {notice && <div className="cities-notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label={t("common.close")}>á—</button></div>}

          <section className="cities-card">
            <div className="cities-toolbar contracts-toolbar">
              <div className="cities-search">
                <FaSearch />
                <input
                  type="text"
                  placeholder={t(
                    "admin.contractsPage.search",
                    t('hc2.buscar_por_reserva_o_documento', 'Buscar por reserva o documento...'),
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
                  type="button"
                  onClick={handleExportExcel}
                  title={t("admin.contractsPage.exportExcel")}
                >
                  <FaFileExcel /> Excel
                </button>
                <button
                  type="button"
                  onClick={handleExportPdf}
                  title={t("admin.contractsPage.exportPdf")}
                >
                  <FaFilePdf /> PDF
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  title={t("admin.contractsPage.printList")}
                >
                  <FaPrint /> {t('admin.print', 'Imprimir')}
                </button>
              </div>
            </div>

            <div className="contracts-summary" style={{ color: "#0f172a", fontWeight: "900", textTransform: "uppercase" }}><strong>
                {filtrados.length}{" "}
                {t("admin.contractsPage.results", "contratos encontrados")}</strong>
            </div>
            <div className="cities-table-wrap contracts-table-wrap" style={{ overflowX: 'auto' }}>
              <table className="cities-table" style={{ whiteSpace: 'nowrap' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{t('admin.contractsPage.fields.contractNumber', 'Código Contrato')}</th>
                  <th>{t('admin.contractsPage.fields.reservationCode', 'Código Reserva')}</th>
                  <th>{t('admin.contractsPage.fields.clientName', 'Nombre Completo')}</th>
                  <th>{t('admin.contractsPage.fields.image', 'Imagen')}</th>
                  <th>{t('admin.contractsPage.fields.vehicleName', 'Nombre Vehículo')}</th>
                  <th>{t('admin.contractsPage.fields.plate', 'Placa')}</th>
                  <th>{t('admin.contractsPage.fields.brand', 'Marca')}</th>
                  <th>{t('admin.contractsPage.fields.model', 'Modelo')}</th>
                  <th>{t('admin.contractsPage.fields.signatureDate', 'Fecha Firma')}</th>
                  <th>{t('admin.contractsPage.fields.signatureTime', 'Hora Firma')}</th>
                  <th style={{ textAlign: 'center' }}>{t('admin.contractsPage.fields.contractSigned', 'Estado Firma')}</th>
                  <th style={{ textAlign: 'center' }}>{t('admin.contractsPage.fields.viewContract', 'Ver Contrato')}</th>
                  <th style={{ textAlign: 'center' }}>{t('admin.contractsPage.fields.downloadContract', 'Descargar Contrato')}</th>
                  <th style={{ textAlign: 'center' }}>{t('admin.contractsPage.fields.printContract', 'Imprimir Contrato')}</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length > 0 ? (
                  filtrados.map((c, index) => {
                    const finalName = c.clienteNombre;
                    return (
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
                      <td style={{ fontWeight: "normal", color: "#374151" }}>
                        {finalName}
                      </td>
                      <td style={{ textAlign: "center", padding: "8px" }}>
                        {c.vehiculoImagen ? (
                          <img
                            src={c.vehiculoImagen}
                            alt={c.vehiculoNombre}
                            style={{
                              width: "60px",
                              height: "40px",
                              objectFit: "cover",
                              borderRadius: "6px",
                              border: "1px solid #e5e7eb"
                            }}
                          />
                        ) : (
                          <div style={{ width: "60px", height: "40px", background: "#f3f4f6", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#9ca3af" }}>
                            Auto
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: "normal", color: "#374151" }}>
                        {c.vehiculoNombre || '-'}
                      </td>
                      <td style={{ fontWeight: "normal", color: "#374151" }}>
                        {c.vehiculoPlaca || '-'}
                      </td>
                      <td style={{ fontWeight: "normal", color: "#374151" }}>
                        {c.vehiculoNombre ? c.vehiculoNombre.split(' ')[0] : '-'}
                      </td>
                      <td style={{ fontWeight: "normal", color: "#374151" }}>
                        {c.vehiculoNombre ? c.vehiculoNombre.split(' ').slice(1).join(' ') || '-' : '-'}
                      </td>
                      <td style={{ fontWeight: "normal", color: "#374151" }}>
                        {fechaFirmaLocal(c.fechaFirma).fecha}
                      </td>
                      <td style={{ fontWeight: "normal", color: "#374151" }}>
                        {fechaFirmaLocal(c.fechaFirma).hora}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '600', color: c.isSigned ? '#10b981' : '#ef4444' }}>
                        {c.isSigned ? t('common.yes', 'Sí') : t('common.no', 'No')}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          disabled={!c.isSigned}
                          onClick={() => openDetalle(c)}
                          style={{ padding: '6px 12px', fontSize: '13px', background: c.isSigned ? '#fff7ed' : '#e5e7eb', color: c.isSigned ? '#ea580c' : '#9ca3af', border: c.isSigned ? '1px solid #fed7aa' : 'none', borderRadius: '6px', cursor: c.isSigned ? 'pointer' : 'not-allowed', fontWeight: '500', minWidth: '80px', display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                        >
                          <FaReceipt /> {t('admin.contractsPage.view', 'Ver')}
                        </button>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          disabled={!c.isSigned}
                          onClick={() => handleDownloadSinglePdf(c)}
                          style={{ padding: '6px 12px', fontSize: '13px', background: c.isSigned ? '#faf5ff' : '#e5e7eb', color: c.isSigned ? '#9333ea' : '#9ca3af', border: c.isSigned ? '1px solid #e9d5ff' : 'none', borderRadius: '6px', cursor: c.isSigned ? 'pointer' : 'not-allowed', fontWeight: '500', minWidth: '100px', display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                        >
                          <FaFilePdf /> {t('admin.contractsPage.download', 'Descargar')}
                        </button>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          disabled={!c.isSigned}
                          onClick={() => {
                            const singleData = {
                              title: `${t('admin.contractsPage.detailsTitle', 'Contrato')} - ${c.contratoNumero}`,
                              headers: headersExport,
                              rows: [[
                                c.contratoNumero, c.reservaCodigo, c.clienteNombre, c.clienteDocumento,
                                `${c.vehiculoNombre} (${c.vehiculoPlaca})`, c.sucursal,
                                c.fechaInicio ? String(c.fechaInicio).replace('T', ' ') : '',
                                c.fechaFin ? String(c.fechaFin).replace('T', ' ') : '',
                                t(`admin.contractsPage.states.${c.estado}`, c.estado), c.totalCOP,
                              ]],
                              items: [c],
                            };
                            printTable(singleData);
                          }}
                          style={{ padding: '6px 12px', fontSize: '13px', background: c.isSigned ? 'var(--city-soft, #eff6ff)' : '#e5e7eb', color: c.isSigned ? 'var(--brand-primary)' : '#9ca3af', border: c.isSigned ? '1px solid var(--brand-border)' : 'none', borderRadius: '6px', cursor: c.isSigned ? 'pointer' : 'not-allowed', fontWeight: '500', minWidth: '90px', display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                        >
                          <FaPrint /> {t('admin.print', 'Imprimir')}
                        </button>
                      </td>
                    </tr>
                  )})
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
                            t('hc2.intenta_ajustar_los_criterios_de_busqu', 'Intenta ajustar los criterios de búsqueda.'),
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

              <div className="contracts-detail-body" style={{ background: 'var(--city-bg, #f8fafc)', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', maxHeight: '75vh', overflowY: 'auto' }}>
                <FirmaContrato 
                  soloLectura={true}
                  vehiculo={{ 
                    nombre: modalDetalle.vehiculoNombre, 
                    placa: modalDetalle.vehiculoPlaca, 
                    sucursal: modalDetalle.sucursal 
                  }}
                  reservaGuardada={{
                    id: modalDetalle.reservaId,
                    clienteNombre: modalDetalle.clienteNombre,
                    clienteDocumento: modalDetalle.clienteDocumento,
                    clienteTipoDocumento: modalDetalle.clienteTipoDocumento || 'CC',
                    clienteCorreo: modalDetalle.clienteCorreo,
                    clienteTelefono: modalDetalle.clienteTelefono,
                    total: modalDetalle.totalCOP,
                    referencia: modalDetalle.reservaCodigo,
                    datosForm: {
                      nombre: modalDetalle.clienteNombre,
                      tipoDoc: modalDetalle.clienteTipoDocumento || 'CC',
                      numDoc: modalDetalle.clienteDocumento,
                    },
                    reservaDetalles: { sucursalRetiro: modalDetalle.sucursal, fechaInicio: modalDetalle.fechaInicio, fechaFin: modalDetalle.fechaFin }
                  }}
                  contratoFirmado={{
                    id: modalDetalle.id,
                    contractNumber: modalDetalle.contratoNumero || `CTR-${modalDetalle.reservaCodigo}`,
                    codigo: modalDetalle.contratoNumero || `CTR-${modalDetalle.reservaCodigo}`,
                    signatureUrl: modalDetalle.signatureUrl || modalDetalle.firmaUsuarioDataUrl || '',
                    firmaUsuarioDataUrl: modalDetalle.signatureUrl || modalDetalle.firmaUsuarioDataUrl || '',
                    signedAt: modalDetalle.fechaFirma,
                    clienteNombre: modalDetalle.clienteNombre,
                    clienteDocumento: modalDetalle.clienteDocumento,
                    tipoDoc: modalDetalle.clienteTipoDocumento || 'CC',
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
