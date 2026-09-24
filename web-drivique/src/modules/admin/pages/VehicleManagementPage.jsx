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
  const esEncargado =
    user?.rol === "encargado" ||
    user?.rol === "encargado_sucursal" ||
    user?.rol === "branch_manager";
  const [activeTab, setActiveTab] = useState(() => (esEncargado ? 'vehiculos' : 'sede_central'));
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
  const [zoomImage, setZoomImage] = useState(null);
  const branches = branchManagementService
    .list()
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
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

  const mockSedeCentral = useMemo(() => [
    {
      id: 1,
      nombre: 'Sede Central Principal Drivique',
      nit: '901.458.920-3',
      razonSocial: 'Drivique Colombia S.A.S.',
      direccion: 'Cl. 100 #19-61, Edificio Capital Tower, Bogotá D.C.',
      telefono: '+57 (601) 745-0000',
      correo: 'contacto@drivique.com.co',
      director: 'Carlos Eduardo Restrepo',
      estado: 'Activa'
    }
  ], []);

  const mockGruposFlota = useMemo(() => [
    {
      id: 1,
      codigo: 'FLT-ECO',
      nombre: 'Flota Económica (Hatchbacks & Compactos)',
      vehiculosCount: 12,
      sedesDisponibles: 'Todas las Sedes de Colombia',
      tarifaPromedio: 110000,
      estado: 'Activa'
    },
    {
      id: 2,
      codigo: 'FLT-SED',
      nombre: 'Flota Sedán (Confort & Ejecutivo)',
      vehiculosCount: 16,
      sedesDisponibles: 'Todas las Sedes de Colombia',
      tarifaPromedio: 160000,
      estado: 'Activa'
    },
    {
      id: 3,
      codigo: 'FLT-SUV',
      nombre: 'Flota SUV & 4x4 (Aventura & Familia)',
      vehiculosCount: 14,
      sedesDisponibles: 'Medellín, Bogotá, Cali y Cartagena',
      tarifaPromedio: 280000,
      estado: 'Activa'
    },
    {
      id: 4,
      codigo: 'FLT-ELE',
      nombre: 'Flota Eléctrica & Híbrida (Eco-Drive)',
      vehiculosCount: 6,
      sedesDisponibles: 'Medellín y Bogotá',
      tarifaPromedio: 240000,
      estado: 'Activa'
    }
  ], []);

  const filteredSedeCentral = useMemo(() => {
    const term = search.trim().toLowerCase();
    return mockSedeCentral.filter((sc) =>
      !term ||
      `${sc.id} ${sc.nombre} ${sc.nit} ${sc.razonSocial} ${sc.direccion} ${sc.director}`
        .toLowerCase()
        .includes(term)
    );
  }, [search, mockSedeCentral]);

  const filteredSucursales = useMemo(() => {
    const term = search.trim().toLowerCase();
    return branches.filter((b) =>
      !term ||
      `${b.id} ${b.nombre} ${b.ciudad} ${b.direccion} ${b.telefono}`
        .toLowerCase()
        .includes(term)
    );
  }, [search, branches]);

  const filteredFlotas = useMemo(() => {
    const term = search.trim().toLowerCase();
    return mockGruposFlota.filter((gf) =>
      !term ||
      `${gf.id} ${gf.codigo} ${gf.nombre} ${gf.sedesDisponibles}`
        .toLowerCase()
        .includes(term)
    );
  }, [search, mockGruposFlota]);

  const headers = [
    "ID",
    "Foto",
    t("admin.vehiclesManagement.fields.vehicle"),
    t("admin.vehiclesManagement.fields.plate"),
    t("admin.vehiclesManagement.fields.branch"),
    t("admin.vehiclesManagement.fields.category"),
    "Año",
    "Color",
    "Transmisión",
    "Combustible",
    t("admin.vehiclesManagement.fields.state"),
    t("admin.vehiclesManagement.fields.price"),
    t("admin.vehiclesManagement.fields.pico"),
  ];
  const rows = filtered.map((vehicle, idx) => [
    vehicle.id || (idx + 1),
    vehicle.imagenes?.[0] ? "Con Foto" : "Sin Foto",
    vehicle.nombre,
    vehicle.placa,
    vehicle.sucursal,
    vehicle.categoria,
    vehicle.año || "—",
    vehicle.color || "—",
    vehicle.transmision || "Automática",
    vehicle.combustible || "Gasolina",
    t(`admin.vehiclesManagement.states.${vehicle.estadoEfectivo}`),
    formatCurrency(
      vehicle.precioLimitado || vehicle.precio || 0,
      divisa,
      tasaUSD,
    ),
    vehicle.picoYPlaca?.dia
      ? `Aplica (${t(`vehiculo.picoYPlaca.dias.${vehicle.picoYPlaca.dia}`)})`
      : "No aplica",
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
              <p className="cities-eyebrow">{esEncargado ? `Sede: ${sucursalAsignada || 'Sucursal Local'}` : t("admin.management")}</p>
              <h1>{esEncargado ? "Flota de Sucursal" : "Gestión de Flotas"}</h1>
              <p className="cities-subtitle">
                {esEncargado
                  ? `Control y gestión del estado operativo de los vehículos asignados a ${sucursalAsignada || 'tu sucursal'}.`
                  : "Administración integral de vehículos, categorías, asignación por sucursal y estado de operación."}
              </p>
            </div>
            <div className="cities-topbar__actions">
              <MenuConfiguracion />
              <button
                className="cities-primary"
                type="button"
                onClick={() => {
                  if (activeTab === 'sede_central') {
                    showAlert({ icon: 'info', title: 'Editar Matriz', text: 'Editando parámetros corporativos de Drivique Colombia.' });
                  } else if (activeTab === 'sucursales') {
                    showAlert({ icon: 'info', title: 'Crear Sucursal', text: 'Para registrar nuevas sedes, dirígete al módulo de Sucursales.' });
                  } else if (activeTab === 'flotas') {
                    showAlert({ icon: 'info', title: 'Crear Grupo de Flota', text: 'Formulario de registro de nueva categoría de flota.' });
                  } else {
                    openCreate();
                  }
                }}
                disabled={esEncargado && activeTab === 'vehiculos' && !sucursalAsignada}
              >
                {activeTab === 'sede_central' && 'Editar Matriz'}
                {activeTab === 'sucursales' && '+ Crear Sucursal'}
                {activeTab === 'flotas' && '+ Crear Grupo'}
                {activeTab === 'vehiculos' && '+ Crear Vehículo'}
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
          {/* Pestañas de Secciones (Adaptadas al rol del usuario) */}
          <div className="fleet-attached-tabs">
            {!esEncargado && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('sede_central')}
                  className={`fleet-tab-btn ${activeTab === 'sede_central' ? 'is-active' : ''}`}
                >
                  Sede Central
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('sucursales')}
                  className={`fleet-tab-btn ${activeTab === 'sucursales' ? 'is-active' : ''}`}
                >
                  Sucursales
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('vehiculos')}
              className={`fleet-tab-btn ${activeTab === 'vehiculos' ? 'is-active' : ''}`}
            >
              {esEncargado ? "Flota de la Sucursal" : "Vehículos"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('flotas')}
              className={`fleet-tab-btn ${activeTab === 'flotas' ? 'is-active' : ''}`}
            >
              Categorías de Flotas
            </button>
          </div>

          {/* TAB 1: SEDE CENTRAL */}
          {activeTab === 'sede_central' && (
            <section className="cities-card attached-to-tabs">
              <div className="fleet-datatable-header">
                <div className="fleet-datatable-search">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar en Sede Central..."
                  />
                </div>
                <div className="export-pills-group">
                  <button type="button" className="export-pill export-pill--excel" onClick={() => exportExcel({ title: "Sede Central", headers: ["ID", "Nombre Sede", "NIT", "Razón Social", "Dirección", "Teléfono", "Correo", "Director", "Estado"], rows: filteredSedeCentral.map(sc => [sc.id, sc.nombre, sc.nit, sc.razonSocial, sc.direccion, sc.telefono, sc.correo, sc.director, sc.estado]), filename: "sede-central-drivique" })}>
                    <FaFileExcel aria-hidden="true" /> Excel
                  </button>
                  <button type="button" className="export-pill export-pill--pdf" onClick={() => exportPdf({ title: "Sede Central", headers: ["ID", "Nombre Sede", "NIT", "Razón Social", "Dirección", "Teléfono", "Correo", "Director", "Estado"], rows: filteredSedeCentral.map(sc => [sc.id, sc.nombre, sc.nit, sc.razonSocial, sc.direccion, sc.telefono, sc.correo, sc.director, sc.estado]), filename: "sede-central-drivique" })}>
                    <FaFilePdf aria-hidden="true" /> PDF
                  </button>
                  <button type="button" className="export-pill export-pill--print" onClick={() => printTable({ title: "Sede Central", headers: ["ID", "Nombre Sede", "NIT", "Razón Social", "Dirección", "Teléfono", "Correo", "Director", "Estado"], rows: filteredSedeCentral.map(sc => [sc.id, sc.nombre, sc.nit, sc.razonSocial, sc.direccion, sc.telefono, sc.correo, sc.director, sc.estado]) })}>
                    <FaPrint aria-hidden="true" /> Imprimir
                  </button>
                </div>
              </div>
              <div className="cities-table-wrap">
                <table className="fleet-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre Sede</th>
                      <th>NIT</th>
                      <th>Razón Social</th>
                      <th>Dirección Matriz</th>
                      <th>Teléfono</th>
                      <th>Correo</th>
                      <th>Director General</th>
                      <th>Estado</th>
                      <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSedeCentral.map((sc) => (
                      <tr key={sc.id}>
                        <td>{sc.id}</td>
                        <td>{sc.nombre}</td>
                        <td><code>{sc.nit}</code></td>
                        <td>{sc.razonSocial}</td>
                        <td>{sc.direccion}</td>
                        <td>{sc.telefono}</td>
                        <td>{sc.correo}</td>
                        <td>{sc.director}</td>
                        <td>
                          <span className="status-pill is-green" style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {sc.estado}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="cities-row-actions">
                            <button
                              type="button"
                              className="btn-row-action"
                              onClick={() => showAlert({ icon: 'info', title: 'Editar Matriz', text: 'Editando parámetros corporativos de Drivique Colombia.' })}
                            >
                              Editar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 2: SUCURSALES */}
          {activeTab === 'sucursales' && (
            <section className="cities-card attached-to-tabs">
              <div className="fleet-datatable-header">
                <div className="fleet-datatable-search">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar sucursal o ciudad..."
                  />
                </div>
                <div className="export-pills-group">
                  <button type="button" className="export-pill export-pill--excel" onClick={() => exportExcel({ title: "Sucursales", headers: ["ID", "Código", "Sucursal", "Ciudad", "Dirección", "Teléfono", "Capacidad", "Horario", "Estado"], rows: filteredSucursales.map((b, idx) => [b.id || (idx+1), `SEC-00${b.id||(idx+1)}`, b.nombre, b.ciudad||'Colombia', b.direccion||'', b.telefono||'', `${b.capacidadVehiculos||25} autos`, b.horario||'', b.estado]), filename: "sucursales-drivique" })}>
                    <FaFileExcel aria-hidden="true" /> Excel
                  </button>
                  <button type="button" className="export-pill export-pill--pdf" onClick={() => exportPdf({ title: "Sucursales", headers: ["ID", "Código", "Sucursal", "Ciudad", "Dirección", "Teléfono", "Capacidad", "Horario", "Estado"], rows: filteredSucursales.map((b, idx) => [b.id || (idx+1), `SEC-00${b.id||(idx+1)}`, b.nombre, b.ciudad||'Colombia', b.direccion||'', b.telefono||'', `${b.capacidadVehiculos||25} autos`, b.horario||'', b.estado]), filename: "sucursales-drivique" })}>
                    <FaFilePdf aria-hidden="true" /> PDF
                  </button>
                  <button type="button" className="export-pill export-pill--print" onClick={() => printTable({ title: "Sucursales", headers: ["ID", "Código", "Sucursal", "Ciudad", "Dirección", "Teléfono", "Capacidad", "Horario", "Estado"], rows: filteredSucursales.map((b, idx) => [b.id || (idx+1), `SEC-00${b.id||(idx+1)}`, b.nombre, b.ciudad||'Colombia', b.direccion||'', b.telefono||'', `${b.capacidadVehiculos||25} autos`, b.horario||'', b.estado]) })}>
                    <FaPrint aria-hidden="true" /> Imprimir
                  </button>
                </div>
              </div>
              <div className="cities-table-wrap">
                <table className="fleet-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Código Sede</th>
                      <th>Nombre Sucursal</th>
                      <th>Ciudad</th>
                      <th>Dirección Física</th>
                      <th>Teléfono Contacto</th>
                      <th>Capacidad Parqueadero</th>
                      <th>Horario Atención</th>
                      <th>Estado</th>
                      <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSucursales.map((b, idx) => (
                      <tr key={b.id || b.nombre}>
                        <td>{b.id || (idx + 1)}</td>
                        <td><code>SEC-00{b.id || (idx + 1)}</code></td>
                        <td>{b.nombre}</td>
                        <td>{b.ciudad || 'Colombia'}</td>
                        <td>{b.direccion || 'Dirección comercial de sede'}</td>
                        <td>{b.telefono || '300 000 0000'}</td>
                        <td>{b.capacidadVehiculos || 25} autos</td>
                        <td>{b.horario || 'Lun a Sáb 7:00 am - 7:00 pm'}</td>
                        <td>
                          <span className={`status-pill ${b.estado === 'inactiva' ? 'is-red' : 'is-green'}`} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {b.estado === 'inactiva' ? 'Inactiva' : 'Activa'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="cities-row-actions">
                            <button
                              type="button"
                              className="btn-row-action"
                              onClick={() => showAlert({ icon: 'info', title: 'Editar Sucursal', text: `Modificando parámetros de la ${b.nombre}.` })}
                            >
                              Editar
                            </button>
                            {!esEncargado && (
                              <button
                                type="button"
                                className="btn-row-action is-delete"
                                onClick={() => showAlert({ icon: 'warning', title: 'Eliminar Sucursal', text: `¿Deseas deshabilitar la ${b.nombre}?` })}
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
            </section>
          )}

          {/* TAB 3: CATEGORÍAS DE FLOTAS */}
          {activeTab === 'flotas' && (
            <section className="cities-card attached-to-tabs">
              <div className="fleet-datatable-header">
                <div className="fleet-datatable-search">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar grupo de flota..."
                  />
                </div>
                <div className="export-pills-group">
                  <button type="button" className="export-pill export-pill--excel" onClick={() => exportExcel({ title: "Categorías de Flotas", headers: ["ID", "Código", "Nombre Flota", "Vehículos", "Cobertura", "Tarifa Promedio", "Estado"], rows: filteredFlotas.map(gf => [gf.id, gf.codigo, gf.nombre, `${gf.vehiculosCount} unidades`, gf.sedesDisponibles, gf.tarifaPromedio, gf.estado]), filename: "flotas-drivique" })}>
                    <FaFileExcel aria-hidden="true" /> Excel
                  </button>
                  <button type="button" className="export-pill export-pill--pdf" onClick={() => exportPdf({ title: "Categorías de Flotas", headers: ["ID", "Código", "Nombre Flota", "Vehículos", "Cobertura", "Tarifa Promedio", "Estado"], rows: filteredFlotas.map(gf => [gf.id, gf.codigo, gf.nombre, `${gf.vehiculosCount} unidades`, gf.sedesDisponibles, gf.tarifaPromedio, gf.estado]), filename: "flotas-drivique" })}>
                    <FaFilePdf aria-hidden="true" /> PDF
                  </button>
                  <button type="button" className="export-pill export-pill--print" onClick={() => printTable({ title: "Categorías de Flotas", headers: ["ID", "Código", "Nombre Flota", "Vehículos", "Cobertura", "Tarifa Promedio", "Estado"], rows: filteredFlotas.map(gf => [gf.id, gf.codigo, gf.nombre, `${gf.vehiculosCount} unidades`, gf.sedesDisponibles, gf.tarifaPromedio, gf.estado]) })}>
                    <FaPrint aria-hidden="true" /> Imprimir
                  </button>
                </div>
              </div>
              <div className="cities-table-wrap">
                <table className="fleet-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Código Flota</th>
                      <th>Nombre del Grupo de Flota</th>
                      <th>Total Vehículos</th>
                      <th>Cobertura de Sedes</th>
                      <th>Tarifa Promedio / Día</th>
                      <th>Estado Operativo</th>
                      <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFlotas.map((gf) => (
                      <tr key={gf.id}>
                        <td>{gf.id}</td>
                        <td><code>{gf.codigo}</code></td>
                        <td>{gf.nombre}</td>
                        <td>{gf.vehiculosCount} unidades</td>
                        <td>{gf.sedesDisponibles}</td>
                        <td>{formatCurrency(gf.tarifaPromedio, divisa, tasaUSD)}</td>
                        <td>
                          <span className="status-pill is-green" style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {gf.estado}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="cities-row-actions">
                            <button
                              type="button"
                              className="btn-row-action"
                              onClick={() => showAlert({ icon: 'info', title: 'Editar Flota', text: `Modificando grupo ${gf.nombre}.` })}
                            >
                              Editar
                            </button>
                            {!esEncargado && (
                              <button
                                type="button"
                                className="btn-row-action is-delete"
                                onClick={() => showAlert({ icon: 'warning', title: 'Eliminar Flota', text: `¿Deseas eliminar el grupo ${gf.nombre}?` })}
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
            </section>
          )}

          {/* TAB 4: VEHÍCULOS */}
          {activeTab === 'vehiculos' && (
            <section className="cities-card attached-to-tabs">
              <div className={`fleet-toolbar ${esEncargado ? "fleet-toolbar--manager" : ""}`} style={{ marginBottom: 16 }}>
                <label className="cities-search">
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
                <div className="export-pills-group">
                  <button type="button" className="export-pill export-pill--excel" onClick={() => exportExcel(exportData)}>
                    <FaFileExcel aria-hidden="true" /> Excel
                  </button>
                  <button type="button" className="export-pill export-pill--pdf" onClick={() => exportPdf(exportData)}>
                    <FaFilePdf aria-hidden="true" /> PDF
                  </button>
                  <button type="button" className="export-pill export-pill--print" onClick={() => printTable(exportData)}>
                    <FaPrint aria-hidden="true" /> Imprimir
                  </button>
                </div>
              </div>
              <div className="cities-summary" style={{ margin: '8px 0 12px' }}>
                <span>{filtered.length}</span>{" "}
                {t("admin.vehiclesManagement.results")}
              </div>
              {filtered.length === 0 ? (
                <div className="cities-empty">
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
                        <th style={{ textAlign: 'center' }}>{t("admin.cities.fields.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((vehicle, idx) => (
                        <tr key={vehicle.id}>
                          <td>{vehicle.id || (idx + 1)}</td>
                          <td>
                            {vehicle.imagenes?.[0] ? (
                              <img
                                src={vehicle.imagenes[0]}
                                alt={vehicle.nombre || "Auto"}
                                title="Haz clic para ver foto completa"
                                onClick={() => setZoomImage({ url: vehicle.imagenes[0], title: `${vehicle.nombre || 'Vehículo'} (${vehicle.placa || 'Placa'})` })}
                                style={{
                                  width: 48,
                                  height: 34,
                                  borderRadius: 8,
                                  objectFit: 'cover',
                                  border: '1px solid #cbd5e1',
                                  display: 'block',
                                  cursor: 'zoom-in',
                                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'scale(1.15)';
                                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.18)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                            ) : (
                              <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
                            )}
                          </td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>
                            {vehicle.nombre}
                          </td>
                          <td>
                            <code>{vehicle.placa}</code>
                          </td>
                          <td>{vehicle.sucursal}</td>
                          <td>{vehicle.categoria}</td>
                          <td>{vehicle.año || '—'}</td>
                          <td>{vehicle.color || '—'}</td>
                          <td>{vehicle.transmision || 'Automática'}</td>
                          <td>{vehicle.combustible || 'Gasolina'}</td>
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
                            {vehicle.picoYPlaca?.dia ? (
                              <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>
                                Aplica ({t(`vehiculo.picoYPlaca.dias.${vehicle.picoYPlaca.dia}`)})
                              </span>
                            ) : (
                              <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                                No aplica
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="cities-row-actions">
                              <button
                                type="button"
                                className="btn-row-action"
                                onClick={() => openEdit(vehicle)}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="btn-row-action is-delete"
                                onClick={() =>
                                  setModal({ type: "delete", vehicle })
                                }
                              >
                                Eliminar
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

        {zoomImage && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: 20,
            }}
            onClick={() => setZoomImage(null)}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: 20,
                maxWidth: 640,
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{zoomImage.title}</h3>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Vista ampliada del vehículo</span>
                </div>
                <button
                  type="button"
                  onClick={() => setZoomImage(null)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    fontWeight: 700,
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ borderRadius: 12, overflow: 'hidden', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 10 }}>
                <img
                  src={zoomImage.url}
                  alt={zoomImage.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: 480,
                    objectFit: 'contain',
                    borderRadius: 8,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
