import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
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
const normalizeBranch = (value) =>
  String(value || "").trim().toLocaleLowerCase();

export default function VehicleManagementPage() {
  const { t } = useTranslation();
  const { tema, divisa, tasaUSD } = useLanding();
  const user = useAuthStore((state) => state.usuario);
  const [activeTab, setActiveTab] = useState('sede_central');
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
  const assignedBranchKey = normalizeBranch(sucursalAsignada);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return vehicles
      .filter((vehicle) => {
        if (esEncargado && normalizeBranch(vehicle.sucursal) !== assignedBranchKey) return false;

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
    assignedBranchKey,
  ]);

  const mockSedeCentral = [
    {
      nit: '901.458.920-3',
      razonSocial: 'Drivique Colombia S.A.S.',
      matriz: 'Bogotá D.C. - Edificio Capital Tower, Cl. 100 #19-61',
      cobertura: '4 Ciudades Principales (Bogotá, Medellín, Cali, Cartagena)',
      sucursalesTotal: '12 Sucursales Activas',
      flotaTotal: '48 Vehículos Activos',
      director: 'Carlos Eduardo Restrepo (Admin General)',
      estado: 'Matriz Operativa'
    }
  ];

  const mockGruposFlota = [
    {
      codigo: 'FLT-ECO',
      nombre: 'Flota Económica (Hatchbacks & Compactos)',
      vehiculosCount: 12,
      sedesDisponibles: 'Todas las Sedes de Colombia',
      tarifaPromedio: 110000,
      estado: 'Activa'
    },
    {
      codigo: 'FLT-SED',
      nombre: 'Flota Sedán (Confort & Ejecutivo)',
      vehiculosCount: 16,
      sedesDisponibles: 'Todas las Sedes de Colombia',
      tarifaPromedio: 160000,
      estado: 'Activa'
    },
    {
      codigo: 'FLT-SUV',
      nombre: 'Flota SUV & 4x4 (Aventura & Familia)',
      vehiculosCount: 14,
      sedesDisponibles: 'Medellín, Bogotá, Cali y Cartagena',
      tarifaPromedio: 280000,
      estado: 'Activa'
    },
    {
      codigo: 'FLT-ELE',
      nombre: 'Flota Eléctrica & Híbrida (Eco-Drive)',
      vehiculosCount: 6,
      sedesDisponibles: 'Medellín y Bogotá',
      tarifaPromedio: 240000,
      estado: 'Activa'
    }
  ];
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
    setForm({
      ...EMPTY,
      sucursal: esEncargado ? sucursalAsignada || "" : branches[0]?.nombre || "",
    });
    setModal({ type: "form" });
    setError("");
  };
  const openEdit = (vehicle) => {
    if (esEncargado && normalizeBranch(vehicle.sucursal) !== assignedBranchKey) return;
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
      sucursal: esEncargado ? sucursalAsignada : form.sucursal,
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
    if (esEncargado && normalizeBranch(modal.vehicle.sucursal) !== assignedBranchKey) return;
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
              <h1>Gestión de Flotas</h1>
              <p className="cities-subtitle">
                Administración integral de vehículos, categorías, asignación por sucursal y estado de operación.
              </p>
            </div>
            <div className="cities-topbar__actions">
              <MenuConfiguracion />
              <button
                className="cities-primary"
                type="button"
                onClick={openCreate}
                disabled={esEncargado && !sucursalAsignada}
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
          {/* Barra de Pestañas Jerárquicas (Basado en la captura del usuario con colores Drivique) */}
          <div className="fleet-tab-bar" style={{ display: 'flex', gap: 24, borderBottom: '2px solid var(--adm-border, #cbd5e1)', marginBottom: 20, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setActiveTab('sede_central')}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px 4px',
                fontSize: 14,
                fontWeight: activeTab === 'sede_central' ? 700 : 500,
                color: activeTab === 'sede_central' ? 'var(--brand-primary, #2563eb)' : 'var(--adm-muted, #64748b)',
                borderBottom: activeTab === 'sede_central' ? '3px solid var(--brand-primary, #2563eb)' : '3px solid transparent',
                marginBottom: -2,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🏛️ 1º Sede Central (Corporativo)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sucursales')}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px 4px',
                fontSize: 14,
                fontWeight: activeTab === 'sucursales' ? 700 : 500,
                color: activeTab === 'sucursales' ? 'var(--brand-primary, #2563eb)' : 'var(--adm-muted, #64748b)',
                borderBottom: activeTab === 'sucursales' ? '3px solid var(--brand-primary, #2563eb)' : '3px solid transparent',
                marginBottom: -2,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🏢 2º Sucursales (Puntos Locales)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('flotas')}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px 4px',
                fontSize: 14,
                fontWeight: activeTab === 'flotas' ? 700 : 500,
                color: activeTab === 'flotas' ? 'var(--brand-primary, #2563eb)' : 'var(--adm-muted, #64748b)',
                borderBottom: activeTab === 'flotas' ? '3px solid var(--brand-primary, #2563eb)' : '3px solid transparent',
                marginBottom: -2,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🚚 3º Categorías de Flotas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('vehiculos')}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px 4px',
                fontSize: 14,
                fontWeight: activeTab === 'vehiculos' ? 700 : 500,
                color: activeTab === 'vehiculos' ? 'var(--brand-primary, #2563eb)' : 'var(--adm-muted, #64748b)',
                borderBottom: activeTab === 'vehiculos' ? '3px solid var(--brand-primary, #2563eb)' : '3px solid transparent',
                marginBottom: -2,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🚗 4º Vehículos (Unidades Físicas)
            </button>
          </div>

          {/* VISTA CONTENIDO TAB 1: SEDE CENTRAL (CORPORATIVO) */}
          {activeTab === 'sede_central' && (
            <section className="cities-card" style={{ padding: 24 }}>
              <div style={{ marginBottom: 18 }}>
                <p className="cities-eyebrow">Nivel 1 · Estructura Corporativa Principal</p>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Casa Matriz y Administración General</h2>
                <p className="cities-subtitle" style={{ marginTop: 4 }}>
                  Empresa raíz responsable de la operación nacional, normatividad, plataformas digitales y expansión de sedes.
                </p>
              </div>

              <div className="cities-table-wrap">
                <table className="fleet-table">
                  <thead>
                    <tr>
                      <th>NIT</th>
                      <th>Razón Social</th>
                      <th>Sede Matriz Principal</th>
                      <th>Cobertura Nacional</th>
                      <th>Sucursales</th>
                      <th>Flota Nacional</th>
                      <th>Director General</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSedeCentral.map((sc, idx) => (
                      <tr key={idx}>
                        <td><code>{sc.nit}</code></td>
                        <td><strong>{sc.razonSocial}</strong></td>
                        <td>{sc.matriz}</td>
                        <td>{sc.cobertura}</td>
                        <td><span style={{ fontWeight: 600 }}>{sc.sucursalesTotal}</span></td>
                        <td><span style={{ fontWeight: 600 }}>{sc.flotaTotal}</span></td>
                        <td>{sc.director}</td>
                        <td>
                          <span className="status-pill is-green" style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {sc.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* VISTA CONTENIDO TAB 2: SUCURSALES (PUNTOS COMERCIALES LOCALES) */}
          {activeTab === 'sucursales' && (
            <section className="cities-card" style={{ padding: 24 }}>
              <div style={{ marginBottom: 18 }}>
                <p className="cities-eyebrow">Nivel 2 · Red Comercial y Puntos de Atención</p>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Sucursales Descentralizadas por Ciudad</h2>
                <p className="cities-subtitle" style={{ marginTop: 4 }}>
                  Oficinas operativas abiertas al público en Colombia donde los clientes retiran, entregan autos y pagan en caja.
                </p>
              </div>

              <div className="cities-table-wrap">
                <table className="fleet-table">
                  <thead>
                    <tr>
                      <th>Código Sede</th>
                      <th>Nombre Sucursal</th>
                      <th>Ciudad</th>
                      <th>Dirección Física</th>
                      <th>Teléfono Contacto</th>
                      <th>Capacidad Parqueadero</th>
                      <th>Horario Atención</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.map((b) => (
                      <tr key={b.id || b.nombre}>
                        <td><code>SEC-00{b.id || 1}</code></td>
                        <td><strong>{b.nombre}</strong></td>
                        <td>{b.ciudad || 'Colombia'}</td>
                        <td>{b.direccion || 'Dirección comercial de sede'}</td>
                        <td>{b.telefono || '300 000 0000'}</td>
                        <td><span style={{ fontWeight: 600 }}>{b.capacidadVehiculos || 25} autos</span></td>
                        <td>{b.horario || 'Lun a Sáb 7:00 am - 7:00 pm'}</td>
                        <td>
                          <span className={`status-pill ${b.estado === 'inactiva' ? 'is-red' : 'is-green'}`} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {b.estado === 'inactiva' ? 'Inactiva' : 'Activa'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* VISTA CONTENIDO TAB 3: CATEGORÍAS DE FLOTAS (NIVEL DE AGRUPACIÓN) */}
          {activeTab === 'flotas' && (
            <section className="cities-card" style={{ padding: 24 }}>
              <div style={{ marginBottom: 18 }}>
                <p className="cities-eyebrow">Nivel 3 · Categorías e Inventario Agrupado</p>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Grupos de Flota Registrados</h2>
                <p className="cities-subtitle" style={{ marginTop: 4 }}>
                  Agrupación estratégica de vehículos según su gama, capacidad y tipo de experiencia ofrecida al cliente.
                </p>
              </div>

              <div className="cities-table-wrap">
                <table className="fleet-table">
                  <thead>
                    <tr>
                      <th>Código Flota</th>
                      <th>Nombre del Grupo de Flota</th>
                      <th>Total Vehículos</th>
                      <th>Cobertura de Sedes</th>
                      <th>Tarifa Promedio / Día</th>
                      <th>Estado Operativo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockGruposFlota.map((gf) => (
                      <tr key={gf.codigo}>
                        <td><code>{gf.codigo}</code></td>
                        <td><strong>{gf.nombre}</strong></td>
                        <td><span style={{ fontWeight: 600 }}>{gf.vehiculosCount} unidades</span></td>
                        <td>{gf.sedesDisponibles}</td>
                        <td><strong>{formatCurrency(gf.tarifaPromedio, divisa, tasaUSD)}</strong></td>
                        <td>
                          <span className="status-pill is-green" style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {gf.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* VISTA CONTENIDO TAB 4: VEHÍCULOS (UNIDADES FÍSICAS INDIVIDUALES) */}
          {activeTab === 'vehiculos' && (
            <section className="cities-card">
              <div className={`fleet-toolbar ${esEncargado ? "fleet-toolbar--manager" : ""}`}>
                <label className="cities-search">
                  <FaSearch />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t("admin.vehiclesManagement.search")}
                  />
                </label>
                {!esEncargado && (
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
                )}
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
                    <FaFileExcel aria-hidden="true" /> Excel
                  </button>
                  <button type="button" onClick={() => exportPdf(exportData)}>
                    <FaFilePdf aria-hidden="true" /> PDF
                  </button>
                  <button type="button" onClick={() => printTable(exportData)}>
                    <FaPrint aria-hidden="true" /> {t("admin.cities.print")}
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
          )}
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
                      <span className="incident-field-label" style={{ fontSize: 13, color: 'var(--brand-text)', borderBottom: '1.5px solid var(--city-border)', paddingBottom: 6 }}>
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
                        <small style={{ color: 'var(--brand-text)', fontSize: 11, fontWeight: 800, marginTop: 4 }}>
                          {pico.dia ? `${t("admin.vehiclesManagement.picoResult")}: ${t(`vehiculo.picoYPlaca.dias.${pico.dia}`)}` : t("admin.vehiclesManagement.picoPending")}
                        </small>
                      </div>
                      <div className="incident-field">
                        <span className="incident-field-label">
                          {t("admin.vehiclesManagement.fields.branch")}
                        </span>
                        {esEncargado ? (
                          <input value={sucursalAsignada || ""} readOnly />
                        ) : (
                          <select
                            value={form.sucursal}
                            onChange={(e) => setForm({ ...form, sucursal: e.target.value })}
                          >
                            {branches.map((branch) => (
                              <option key={branch.id} value={branch.nombre}>
                                {branch.nombre}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      {[
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
                      <span className="incident-field-label" style={{ fontSize: 13, color: 'var(--brand-text)', borderBottom: '1.5px solid var(--city-border)', paddingBottom: 6 }}>
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
                      <span className="incident-field-label" style={{ fontSize: 13, color: 'var(--brand-text)', borderBottom: '1.5px solid var(--city-border)', paddingBottom: 6 }}>
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
                            <span className="incident-field-label">{t("admin.vehiclesManagement.fields.price")}</span>
                            <input type="number" value={insurance.precio} onChange={(e) => updateInsurance(index, "precio", e.target.value)} />
                          </div>
                          <button type="button" onClick={() => setForm({ ...form, seguros: form.seguros.filter((_, current) => current !== index) })} aria-label={t("common.delete")} style={{ height: 42, borderRadius: 10, border: '1px solid #fecaca', background: '#fff', color: '#b91c1c', cursor: 'pointer', marginBottom: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 'bold' }}>
                            ×
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={addInsurance} style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: 'var(--brand-text)', fontWeight: 800, cursor: 'pointer', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FaPlus /> {t("admin.vehiclesManagement.addInsurance")}
                      </button>
                    </div>

                    <div className="incident-field" style={{ margin: '16px 0 4px' }}>
                      <span className="incident-field-label" style={{ fontSize: 13, color: 'var(--brand-text)', borderBottom: '1.5px solid var(--city-border)', paddingBottom: 6 }}>
                        {t("admin.vehiclesManagement.sections.images")}
                      </span>
                    </div>
                    <label className="fleet-upload" style={{ border: '1.5px dashed var(--brand-border)', borderRadius: 12, padding: 24, textAlign: 'center', color: 'var(--brand-text)', cursor: 'pointer', display: 'block' }}>
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
