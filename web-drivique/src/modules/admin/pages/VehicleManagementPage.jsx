import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaArrowLeft,
  FaCar,
  FaEdit,
  FaFileExcel,
  FaFilePdf,
  FaImage,
  FaPlus,
  FaPrint,
  FaSearch,
  FaTrash,
} from "react-icons/fa";
import { useLanding } from "../../landing/LandingContext";
import { useAuthStore } from "../../../store/authStore";
import { branchManagementService } from "../../../services/branchManagementService";
import {
  getPicoYPlacaInfo,
  VEHICLE_STATES,
  vehicleManagementService,
} from "../../../services/vehicleManagementService";
import {
  exportExcel,
  exportPdf,
  printTable,
} from "../../../utils/listExportUtils";
import { formatCurrency } from "../../../utils/currencyUtils";
import MenuConfiguracion from "../../../components/MenuConfiguracion";
import ManagementSidebar from "../components/ManagementSidebar";
import "./CityManagementPage.css";
import "./VehicleManagementPage.css";
import "./IncidentManagementPage.css";

const EMPTY = {
  nombre: "",
  placa: "",
  categoria: "Sedan",
  transmision: "Automática",
  combustible: "Gasolina",
  color: "",
  año: new Date().getFullYear(),
  sucursal: "",
  descripcion: "",
  estadoFlota: VEHICLE_STATES.AVAILABLE,
  puertas: 4,
  pasajeros: 5,
  maletero: 0,
  cilindraje: "",
  destacado: false,
  kmLimitado: 200,
  precioLimitado: 0,
  precioExcedente: 0,
  precioIlimitado: 0,
  caracteristicasTexto: "",
  equipamientoTecnologico: [],
  seguros: [{ nombre: "Protección Obligatoria", precio: 29000 }],
  imagenes: [],
};
const listToText = (items) =>
  (items || []).map((item) => item.nombre).join(", ");
const textToList = (text) =>
  String(text || "")
    .split(",")
    .map((nombre) => nombre.trim())
    .filter(Boolean)
    .map((nombre) => ({ nombre, icono: "FaCheckCircle" }));

export default function VehicleManagementPage() {
  const { t } = useTranslation();
  const { tema, divisa, tasaUSD } = useLanding();
  const user = useAuthStore((state) => state.usuario);
  const [vehicles, setVehicles] = useState(() =>
    vehicleManagementService.list(),
  );
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const branches = branchManagementService
    .list()
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
  const esEncargado =
    user?.rol === "encargado" ||
    user?.rol === "encargado_sucursal" ||
    user?.rol === "branch_manager";
  const sucursalAsignada =
    user?.sucursal || user?.sucursalId || user?.sucursalAsignada;

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return vehicles
      .filter((vehicle) => {
        // Si es encargado de sucursal, solo gestiona vehículos de su sucursal asignada
        if (esEncargado && sucursalAsignada) {
          const vSuc = (vehicle.sucursal || "").toLowerCase();
          const userSuc = sucursalAsignada.toLowerCase();
          const matchBranch = vSuc.includes(userSuc) || userSuc.includes(vSuc);
          if (!matchBranch) return false;
        }

        const matchBranchFilter =
          branchFilter === "all" || vehicle.sucursal === branchFilter;
        const matchStateFilter =
          stateFilter === "all" || vehicle.estadoEfectivo === stateFilter;
        const matchSearch =
          !term ||
          `${vehicle.nombre} ${vehicle.placa} ${vehicle.categoria} ${vehicle.sucursal}`
            .toLocaleLowerCase()
            .includes(term);

        return matchBranchFilter && matchStateFilter && matchSearch;
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [
    branchFilter,
    search,
    stateFilter,
    vehicles,
    esEncargado,
    sucursalAsignada,
  ]);
  const headers = [
    t("admin.vehiclesManagement.fields.vehicle"),
    t("admin.vehiclesManagement.fields.plate"),
    t("admin.vehiclesManagement.fields.branch"),
    t("admin.vehiclesManagement.fields.category"),
    t("admin.vehiclesManagement.fields.state"),
    t("admin.vehiclesManagement.fields.price"),
    t("admin.vehiclesManagement.fields.pico"),
  ];
  const rows = filtered.map((vehicle) => [
    vehicle.nombre,
    vehicle.placa,
    vehicle.sucursal,
    vehicle.categoria,
    t(`admin.vehiclesManagement.states.${vehicle.estadoEfectivo}`),
    formatCurrency(
      vehicle.precioLimitado || vehicle.precio || 0,
      divisa,
      tasaUSD,
    ),
    vehicle.picoYPlaca.dia || "—",
  ]);
  const exportData = {
    title: t("admin.vehiclesManagement.exportTitle"),
    headers,
    rows,
    items: filtered,
    filename: "flota-drivique",
  };
  const close = () => {
    setModal(null);
    setError("");
  };
  const openCreate = () => {
    setForm({ ...EMPTY, sucursal: branches[0]?.nombre || "" });
    setModal({ type: "form" });
    setError("");
  };
  const openEdit = (vehicle) => {
    setForm({
      ...vehicle,
      estadoFlota: vehicle.estadoFlota,
      kmLimitado: vehicle.tarifas?.kmLimitado?.km || 0,
      precioLimitado:
        vehicle.tarifas?.kmLimitado?.precio || vehicle.precio || 0,
      precioExcedente: vehicle.tarifas?.kmLimitado?.excedente || 0,
      precioIlimitado: vehicle.tarifas?.kmIlimitado?.precio || 0,
      caracteristicasTexto: listToText(vehicle.caracteristicas),
      seguros: vehicle.seguros || [],
      imagenes: vehicle.imagenes || [],
    });
    setModal({ type: "form", vehicle });
    setError("");
  };
  const save = (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      caracteristicas: textToList(form.caracteristicasTexto),
    };
    try {
      if (modal.vehicle)
        vehicleManagementService.update(modal.vehicle.id, payload, user);
      else vehicleManagementService.create(payload, user);
      setVehicles(vehicleManagementService.list());
      setNotice(
        t(
          modal.vehicle
            ? "admin.vehiclesManagement.messages.updated"
            : "admin.vehiclesManagement.messages.created",
        ),
      );
      close();
    } catch (caught) {
      setError(t(`admin.vehiclesManagement.errors.${caught.message}`));
    }
  };
  const remove = () => {
    try {
      vehicleManagementService.remove(modal.vehicle.id, user);
      setVehicles(vehicleManagementService.list());
      setNotice(t("admin.vehiclesManagement.messages.deleted"));
      close();
    } catch (caught) {
      setModal(null);
      setNotice(
        t(`admin.vehiclesManagement.errors.${caught.message}`, {
          count: caught.count,
        }),
      );
    }
  };
  const addInsurance = () =>
    setForm({ ...form, seguros: [...form.seguros, { nombre: "", precio: 0 }] });
  const updateInsurance = (index, key, value) =>
    setForm({
      ...form,
      seguros: form.seguros.map((insurance, current) =>
        current === index
          ? { ...insurance, [key]: key === "precio" ? Number(value) : value }
          : insurance,
      ),
    });
  const loadImages = async (event) => {
    const files = [...event.target.files].slice(
      0,
      Math.max(0, 3 - form.imagenes.length),
    );
    if (files.some((file) => file.size > 1024 * 1024)) {
      setError(t("admin.vehiclesManagement.errors.imageSize"));
      return;
    }
    const images = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }),
      ),
    );
    setForm((current) => ({
      ...current,
      imagenes: [...current.imagenes, ...images].slice(0, 3),
    }));
  };
  const pico = getPicoYPlacaInfo(form.placa, form.sucursal);

  return (
    <div
      className={`management-shell ${tema === "oscuro" ? "management-shell--dark" : ""}`}
    >
      <ManagementSidebar />
      <main className="management-main" style={{ padding: "24px 32px" }}>
        <div className="cities-container" style={{ maxWidth: "100%" }}>
          <header className="cities-topbar">
            <div>
              <p className="cities-eyebrow">{t("admin.management")}</p>
              <h1>{t("admin.vehiclesManagement.title")}</h1>
              <p className="cities-subtitle">
                {t("admin.vehiclesManagement.subtitle")}
              </p>
            </div>
            <div className="cities-topbar__actions">
              <MenuConfiguracion />
              <button
                className="cities-primary"
                type="button"
                onClick={openCreate}
              >
                <FaPlus /> {t("admin.vehiclesManagement.create")}
              </button>
            </div>
          </header>
          {notice && (
            <div className="cities-notice" role="status">
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label={t("common.close")}
              >
                ×
              </button>
            </div>
          )}
          <section className="cities-card">
            <div className="fleet-toolbar">
              <label className="cities-search">
                <FaSearch />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("admin.vehiclesManagement.search")}
                />
              </label>
              <select
                value={branchFilter}
                onChange={(event) => setBranchFilter(event.target.value)}
              >
                <option value="all">
                  {t("admin.vehiclesManagement.allBranches")}
                </option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.nombre}>
                    {branch.nombre}
                  </option>
                ))}
              </select>
              <select
                value={stateFilter}
                onChange={(event) => setStateFilter(event.target.value)}
              >
                <option value="all">
                  {t("admin.vehiclesManagement.allStates")}
                </option>
                {Object.values(VEHICLE_STATES).map((state) => (
                  <option key={state} value={state}>
                    {t(`admin.vehiclesManagement.states.${state}`)}
                  </option>
                ))}
              </select>
              <div className="cities-export">
                <button type="button" onClick={() => exportExcel(exportData)}>
                  <FaFileExcel /> Excel
                </button>
                <button type="button" onClick={() => exportPdf(exportData)}>
                  <FaFilePdf /> PDF
                </button>
                <button type="button" onClick={() => printTable(exportData)}>
                  <FaPrint /> {t("admin.cities.print")}
                </button>
              </div>
            </div>
            <div className="cities-summary">
              <strong>{filtered.length}</strong>{" "}
              {t("admin.vehiclesManagement.results")}
            </div>
            {filtered.length === 0 ? (
              <div className="cities-empty">
                <FaCar />
                <h2>{t("admin.vehiclesManagement.emptyTitle")}</h2>
              </div>
            ) : (
              <div className="cities-table-wrap">
                <table className="fleet-table">
                  <thead>
                    <tr>
                      {headers.map((header) => (
                        <th key={header}>{header}</th>
                      ))}
                      <th>{t("admin.cities.fields.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td>
                          <div className="fleet-vehicle">
                            {vehicle.imagenes?.[0] ? (
                              <img src={vehicle.imagenes[0]} alt="" />
                            ) : (
                              <span>
                                <FaCar />
                              </span>
                            )}
                            <div>
                              <strong>{vehicle.nombre}</strong>
                              <small>
                                {vehicle.año} · {vehicle.color}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>{vehicle.placa}</strong>
                        </td>
                        <td>{vehicle.sucursal}</td>
                        <td>{vehicle.categoria}</td>
                        <td>
                          <span
                            className={`fleet-state is-${vehicle.estadoEfectivo}`}
                          >
                            {t(
                              `admin.vehiclesManagement.states.${vehicle.estadoEfectivo}`,
                            )}
                          </span>
                        </td>
                        <td>
                          {formatCurrency(
                            vehicle.precioLimitado || vehicle.precio || 0,
                            divisa,
                            tasaUSD,
                          )}
                        </td>
                        <td>
                          {vehicle.picoYPlaca.dia
                            ? t(
                                `vehiculo.picoYPlaca.dias.${vehicle.picoYPlaca.dia}`,
                              )
                            : "—"}
                        </td>
                        <td>
                          <div className="cities-row-actions">
                            <button
                              type="button"
                              onClick={() => openEdit(vehicle)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="is-danger"
                              type="button"
                              onClick={() =>
                                setModal({ type: "delete", vehicle })
                              }
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
        {modal && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(event) =>
              event.target === event.currentTarget && close()
            }
          >
            <section
              className="cities-modal fleet-modal"
              role="dialog"
              aria-modal="true"
            >
              {modal.type === "form" ? (
                <>
                  <div className="cities-modal__head">
                    <div>
                      <p className="cities-eyebrow">
                        {t("admin.vehiclesManagement.formLabel")}
                      </p>
                      <h2>
                        {t(
                          modal.vehicle
                            ? "admin.vehiclesManagement.editTitle"
                            : "admin.vehiclesManagement.createTitle",
                        )}
                      </h2>
                    </div>
                    <button type="button" onClick={close}>
                      ×
                    </button>
                  </div>
                  <form onSubmit={save} className="incident-form">
                    <div className="incident-field" style={{ marginBottom: 4 }}>
                      <span className="incident-field-label" style={{ fontSize: 13, color: '#2563eb', borderBottom: '1.5px solid var(--city-border)', paddingBottom: 6 }}>
                        {t("admin.vehiclesManagement.sections.general")}
                      </span>
                    </div>
                    <div className="incident-grid-2">
                      <div className="incident-field">
                        <span className="incident-field-label">{t("admin.vehiclesManagement.fields.vehicle")}</span>
                        <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                      </div>
                      <div className="incident-field">
                        <span className="incident-field-label">{t("admin.vehiclesManagement.fields.plate")}</span>
                        <input value={form.placa} onChange={(e) => setForm({ ...form, placa: e.target.value.toUpperCase() })} />
                        <small style={{ color: '#2563eb', fontSize: 11, fontWeight: 800, marginTop: 4 }}>
                          {pico.dia ? `${t("admin.vehiclesManagement.picoResult")}: ${t(`vehiculo.picoYPlaca.dias.${pico.dia}`)}` : t("admin.vehiclesManagement.picoPending")}
                        </small>
                      </div>
                      {[
                        ["sucursal", "branch"],
                        ["categoria", "category"],
                        ["transmision", "transmission"],
                        ["combustible", "fuel"],
                        ["color", "color"],
                      ].map(([key, label]) => (
                        <div className="incident-field" key={key}>
                          <span className="incident-field-label">{t(`admin.vehiclesManagement.fields.${label}`)}</span>
                          <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                        </div>
                      ))}
                      <div className="incident-field">
                        <span className="incident-field-label">{t("admin.vehiclesManagement.fields.year")}</span>
                        <input type="number" value={form.año} onChange={(e) => setForm({ ...form, año: e.target.value })} />
                      </div>
                    </div>

                    <div className="incident-field" style={{ margin: '16px 0 4px' }}>
                      <span className="incident-field-label" style={{ fontSize: 13, color: '#2563eb', borderBottom: '1.5px solid var(--city-border)', paddingBottom: 6 }}>
                        {t("admin.vehiclesManagement.sections.features")}
                      </span>
                    </div>
                    <div className="incident-grid-2">
                      {[
                        ["puertas", "doors"],
                        ["pasajeros", "passengers"],
                        ["maletero", "trunk"],
                      ].map(([key, label]) => (
                        <div className="incident-field" key={key}>
                          <span className="incident-field-label">{t(`admin.vehiclesManagement.fields.${label}`)}</span>
                          <input type="number" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                        </div>
                      ))}
                      <div className="incident-field">
                        <span className="incident-field-label">{t("admin.vehiclesManagement.fields.engine")}</span>
                        <input value={form.cilindraje} onChange={(e) => setForm({ ...form, cilindraje: e.target.value })} />
                      </div>
                    </div>
                    
                    <div className="incident-field">
                      <span className="incident-field-label">{t("admin.vehiclesManagement.fields.features")}</span>
                      <input value={form.caracteristicasTexto} onChange={(e) => setForm({ ...form, caracteristicasTexto: e.target.value })} placeholder={t("admin.vehiclesManagement.featuresHint")} />
                    </div>
                    <div className="incident-field">
                      <span className="incident-field-label">{t("admin.vehiclesManagement.fields.description")}</span>
                      <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} />
                    </div>

                    <div className="incident-field" style={{ margin: '16px 0 4px' }}>
                      <span className="incident-field-label" style={{ fontSize: 13, color: '#2563eb', borderBottom: '1.5px solid var(--city-border)', paddingBottom: 6 }}>
                        {t("admin.vehiclesManagement.sections.rates")}
                      </span>
                    </div>
                    <div className="incident-grid-2">
                      {[
                        ["kmLimitado", "limitedKm"],
                        ["precioLimitado", "limitedPrice"],
                        ["precioExcedente", "extraPrice"],
                        ["precioIlimitado", "unlimitedPrice"],
                      ].map(([key, label]) => (
                        <div className="incident-field" key={key}>
                          <span className="incident-field-label">{t(`admin.vehiclesManagement.fields.${label}`)}</span>
                          <input type="number" min="0" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                        </div>
                      ))}
                    </div>

                    <div className="fleet-insurances" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {form.seguros.map((insurance, index) => (
                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 40px', gap: 8, alignItems: 'end' }}>
                          <div className="incident-field">
                            <span className="incident-field-label">{t("admin.vehiclesManagement.insuranceName")}</span>
                            <input value={insurance.nombre} onChange={(e) => updateInsurance(index, "nombre", e.target.value)} />
                          </div>
                          <div className="incident-field">
                            <span className="incident-field-label">Precio</span>
                            <input type="number" value={insurance.precio} onChange={(e) => updateInsurance(index, "precio", e.target.value)} />
                          </div>
                          <button type="button" onClick={() => setForm({ ...form, seguros: form.seguros.filter((_, current) => current !== index) })} aria-label={t("common.delete")} style={{ height: 42, borderRadius: 10, border: '1px solid #fecaca', background: '#fff', color: '#b91c1c', cursor: 'pointer', marginBottom: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 'bold' }}>
                            ×
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={addInsurance} style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: '#2563eb', fontWeight: 800, cursor: 'pointer', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FaPlus /> {t("admin.vehiclesManagement.addInsurance")}
                      </button>
                    </div>

                    <div className="incident-field" style={{ margin: '16px 0 4px' }}>
                      <span className="incident-field-label" style={{ fontSize: 13, color: '#2563eb', borderBottom: '1.5px solid var(--city-border)', paddingBottom: 6 }}>
                        {t("admin.vehiclesManagement.sections.images")}
                      </span>
                    </div>
                    <label className="fleet-upload" style={{ border: '1.5px dashed #60a5fa', borderRadius: 12, padding: 24, textAlign: 'center', color: '#2563eb', cursor: 'pointer', display: 'block' }}>
                      <FaImage size={24} style={{ marginBottom: 8 }} />
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{t("admin.vehiclesManagement.uploadImages")}</div>
                      <input type="file" accept="image/*" multiple onChange={loadImages} style={{ display: 'none' }} />
                    </label>
                    <div className="fleet-images" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
                      {form.imagenes.map((image, index) => (
                        <div key={`${String(image).slice(-20)}-${index}`} style={{ position: 'relative' }}>
                          <img src={image} alt="" style={{ width: 140, height: 90, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--city-border)' }} />
                          <button type="button" onClick={() => setForm({ ...form, imagenes: form.imagenes.filter((_, current) => current !== index) })} style={{ position: 'absolute', top: -6, right: -6, width: 24, height: 24, borderRadius: '50%', background: '#b91c1c', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    {error && <p className="cities-error">{error}</p>}
                    
                    <div className="cities-modal__actions" style={{ marginTop: 24 }}>
                      <button type="button" onClick={close}>
                        {t("common.cancel")}
                      </button>
                      <button className="cities-primary" type="submit">
                        {t("common.save")}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="cities-delete-icon">
                    <FaTrash />
                  </div>
                  <h2>{t("admin.vehiclesManagement.deleteTitle")}</h2>
                  <p>
                    {t("admin.vehiclesManagement.deleteText", {
                      vehicle: modal.vehicle.nombre,
                    })}
                  </p>
                  <div className="cities-modal__actions">
                    <button type="button" onClick={close}>
                      {t("common.cancel")}
                    </button>
                    <button
                      className="cities-danger"
                      type="button"
                      onClick={remove}
                    >
                      {t("common.delete")}
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
