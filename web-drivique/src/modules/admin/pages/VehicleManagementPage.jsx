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
  categoria: "",
  transmision: "",
  combustible: "",
  color: "",
  año: "",
  sucursal: "",
  descripcion: "",
  estadoFlota: VEHICLE_STATES.AVAILABLE,
  puertas: "",
  pasajeros: "",
  maletero: "",
  cilindraje: "",
  destacado: false,
  kmLimitado: "",
  precioLimitado: "",
  precioExcedente: "",
  precioIlimitado: "",
  caracteristicasTexto: "",
  equipamientoTecnologico: [],
  seguros: [],
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
  const [activeTab, setActiveTab] = useState(() => (esEncargado ? 'flotas' : 'sede_central'));
  const [vehicles, setVehicles] = useState(() =>
    vehicleManagementService.list(),
  );
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const CATEGORY_EMPTY = {
    nombre: "",
    descripcion: "",
    coberturaSedes: "Todas las Sedes de Colombia",
    tarifaBaseDiaria: "",
    depositoGarantia: "",
    activo: true,
    vehiculosCount: 0
  };
  const [categoryForm, setCategoryForm] = useState(CATEGORY_EMPTY);
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
      estado: 'Activa',
      descripcion: 'Drivique es la empresa líder en soluciones de movilidad y alquiler de vehículos, ofreciendo un servicio premium con presencia a nivel nacional.',
      mision: 'Brindar a nuestros clientes la mejor experiencia de alquiler de vehículos con un servicio ágil, seguro y de alta calidad.',
      vision: 'Ser reconocidos para el 2030 como la principal empresa de movilidad y renta de autos en América Latina, destacando por nuestra innovación.'
    }
  ], []);

  const [mockGruposFlota, setMockGruposFlota] = useState([
    {
      id: 1,
      nombre: 'Económica (Compactos)',
      descripcion: 'Vehículos pequeños, ideales para la ciudad y ahorro de combustible.',
      coberturaSedes: 'Todas las Sedes de Colombia',
      tarifaBaseDiaria: 110000,
      depositoGarantia: 500000,
      activo: true,
      vehiculosCount: 12
    },
    {
      id: 2,
      nombre: 'Sedán Ejecutivo',
      descripcion: 'Mayor espacio interior y baúl, perfectos para viajes largos y negocios.',
      coberturaSedes: 'Todas las Sedes de Colombia',
      tarifaBaseDiaria: 160000,
      depositoGarantia: 700000,
      activo: true,
      vehiculosCount: 16
    },
    {
      id: 3,
      nombre: 'Camionetas SUV',
      descripcion: 'Vehículos altos y robustos para cualquier terreno o viajes familiares.',
      coberturaSedes: 'Medellín, Bogotá, Cali y Cartagena',
      tarifaBaseDiaria: 280000,
      depositoGarantia: 1200000,
      activo: true,
      vehiculosCount: 14
    },
    {
      id: 4,
      nombre: 'Eléctricos (Eco-Drive)',
      descripcion: 'Amigables con el medio ambiente, silenciosos y sin pico y placa.',
      coberturaSedes: 'Medellín y Bogotá',
      tarifaBaseDiaria: 240000,
      depositoGarantia: 1000000,
      activo: true,
      vehiculosCount: 6
    }
  ]);

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
      `${gf.id} ${gf.nombre} ${gf.descripcion}`
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
    t("admin.vehiclesManagement.fields.price"),
    t("admin.vehiclesManagement.fields.pico"),
    t("admin.vehiclesManagement.fields.state"),
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
    formatCurrency(
      vehicle.precioLimitado || vehicle.precio || 0,
      divisa,
      tasaUSD,
    ),
    vehicle.picoYPlaca?.dia
      ? `Aplica (${t(`vehiculo.picoYPlaca.dias.${vehicle.picoYPlaca.dia}`)})`
      : "No aplica",
    t(`admin.vehiclesManagement.states.${vehicle.estadoEfectivo}`),
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
  const openCreateCategory = () => {
    setCategoryForm(CATEGORY_EMPTY);
    setModal({ type: 'category_form' });
    setError('');
  };
  const openEditCategory = (category) => {
    setCategoryForm(category);
    setModal({ type: 'category_form', category });
    setError('');
  };
  const saveCategory = (e) => {
    e.preventDefault();
    if (modal.category) {
      setMockGruposFlota(mockGruposFlota.map(c => c.id === modal.category.id ? { ...categoryForm, id: c.id } : c));
      setNotice("Categoría actualizada correctamente");
    } else {
      setMockGruposFlota([...mockGruposFlota, { ...categoryForm, id: Date.now() }]);
      setNotice("Categoría creada correctamente");
    }
    close();
  };
  const removeCategory = () => {
    setMockGruposFlota(mockGruposFlota.filter(c => c.id !== modal.category.id));
    setNotice("Categoría eliminada correctamente");
    close();
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
              <p className="cities-eyebrow">{esEncargado ? `Sucursal: ${sucursalAsignada || 'Local'}` : t("admin.management")}</p>
              <h1>{esEncargado ? t("admin.nav.vehicles", "Flota y vehículos") : t("admin.vehiclesManagement.title", "Gestión de Vehículos")}</h1>
              <p className="cities-subtitle">
                {esEncargado
                  ? `Control y gestión del estado operativo de los vehículos asignados a ${sucursalAsignada || 'tu sucursal'}.`
                  : "Administración integral de vehículos, categorías, asignación por sucursal y estado de operación."}
              </p>
            </div>
            <div className="cities-topbar__actions">
              <MenuConfiguracion />
              {(!esEncargado || activeTab === 'vehiculos') && (
                <button
                  className="cities-primary"
                  type="button"
                  onClick={() => {
                    if (activeTab === 'sede_central') {
                      showAlert({ icon: 'info', title: 'Editar Matriz', text: 'Editando parámetros corporativos de Drivique Colombia.' });
                    } else if (activeTab === 'sucursales') {
                      showAlert({ icon: 'info', title: 'Crear Sucursal', text: 'Para registrar nuevas sedes, dirígete al módulo de Sucursales.' });
                    } else if (activeTab === 'flotas') {
                      showAlert({ icon: 'info', title: 'Crear Grupo de Vehículos', text: 'Formulario de registro de nueva categoría de vehículos.' });
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
              )}
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
              <button
                type="button"
                onClick={() => setActiveTab('sede_central')}
                className={`fleet-tab-btn ${activeTab === 'sede_central' ? 'is-active' : ''}`}
              >
                Sede Central
              </button>
            )}
            {!esEncargado && (
              <button
                type="button"
                onClick={() => setActiveTab('sucursales')}
                className={`fleet-tab-btn ${activeTab === 'sucursales' ? 'is-active' : ''}`}
              >
                Sucursales
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('flotas')}
              className={`fleet-tab-btn ${activeTab === 'flotas' ? 'is-active' : ''}`}
            >
              Categorías
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('vehiculos')}
              className={`fleet-tab-btn ${activeTab === 'vehiculos' ? 'is-active' : ''}`}
            >
              Vehículos
            </button>
          </div>

          {/* TAB 1: SEDE CENTRAL */}
          {activeTab === 'sede_central' && (
            <section className="cities-card attached-to-tabs">
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {filteredSedeCentral.map((sc) => (
                  <div key={sc.id} style={{ display: 'flex', flexDirection: 'column', gap: '32px', background: 'var(--card-bg, #fff)', padding: '40px', borderRadius: '20px', border: '1px solid var(--city-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    
                    {/* ENCABEZADO Y PERFIL CORPORATIVO */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-start', paddingBottom: '32px', borderBottom: '1px solid var(--city-border)' }}>
                      <div style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <h2 style={{ margin: 0, fontSize: '28px', color: 'var(--adm-text)', fontWeight: 800, letterSpacing: '-0.5px' }}>{sc.razonSocial}</h2>
                          <span style={{ background: '#e0e7ff', color: 'var(--brand-primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>MATRIZ</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '16px', color: 'var(--brand-text)', lineHeight: 1.6, maxWidth: '800px' }}>{sc.descripcion}</p>
                      </div>
                    </div>

                    {/* MISIÓN Y VISIÓN - TARJETAS PREMIUM */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                      <div style={{ padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--brand-primary)' }}></div>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--brand-text)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>Nuestra Misión</h3>
                        <p style={{ margin: 0, fontSize: '15px', color: 'var(--adm-text)', lineHeight: 1.7 }}>{sc.mision}</p>
                      </div>
                      <div style={{ padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--brand-accent, #6366f1)' }}></div>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--brand-text)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>Nuestra Visión</h3>
                        <p style={{ margin: 0, fontSize: '15px', color: 'var(--adm-text)', lineHeight: 1.7 }}>{sc.vision}</p>
                      </div>
                    </div>

                    {/* DATOS CORPORATIVOS - TARJETAS INDIVIDUALES */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', marginBottom: '-16px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--adm-text)', fontWeight: 800 }}>Información Operativa</h3>
                      {!esEncargado && (
                        <button
                          type="button"
                          onClick={() => showAlert({ icon: 'info', title: 'Editar Matriz', text: 'Editando parámetros corporativos de Drivique Colombia.' })}
                          style={{ background: 'transparent', border: 'none', color: 'var(--brand-primary)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                        >
                          Editar Datos
                        </button>
                      )}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                      <div style={{ padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--brand-primary)' }}></div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--brand-text)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>NIT</h3>
                        <p style={{ margin: 0, fontSize: '15px', color: 'var(--adm-text)', lineHeight: 1.7 }}>{sc.nit}</p>
                      </div>
                      
                      <div style={{ padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--brand-primary)' }}></div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--brand-text)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>Dirección Matriz</h3>
                        <p style={{ margin: 0, fontSize: '15px', color: 'var(--adm-text)', lineHeight: 1.7 }}>{sc.direccion}</p>
                      </div>
                      
                      <div style={{ padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--brand-primary)' }}></div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--brand-text)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>Teléfono Corporativo</h3>
                        <p style={{ margin: 0, fontSize: '15px', color: 'var(--adm-text)', lineHeight: 1.7 }}>{sc.telefono}</p>
                      </div>
                      
                      <div style={{ padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--brand-primary)' }}></div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--brand-text)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>Correo Electrónico</h3>
                        <p style={{ margin: 0, fontSize: '15px', color: 'var(--adm-text)', lineHeight: 1.7 }}>{sc.correo}</p>
                      </div>
                      
                      <div style={{ padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--brand-primary)' }}></div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--brand-text)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>Director General</h3>
                        <p style={{ margin: 0, fontSize: '15px', color: 'var(--adm-text)', lineHeight: 1.7 }}>{sc.director}</p>
                      </div>
                      
                      <div style={{ padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--brand-primary)' }}></div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--brand-text)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>Estado Operativo</h3>
                        <p style={{ margin: 0, fontSize: '15px', color: 'var(--adm-text)', lineHeight: 1.7 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 700 }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                            {sc.estado}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
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

          {/* TAB 3: CATEGORÍAS DE VEHÍCULOS */}
          {activeTab === 'flotas' && (
            <section className="cities-card attached-to-tabs">
              <div className="fleet-datatable-header">
                <div className="fleet-datatable-search" style={{ display: 'flex', gap: '16px' }}>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar grupo de vehículos..."
                  />
                  <button type="button" className="cities-primary" onClick={openCreateCategory} style={{ whiteSpace: 'nowrap', padding: '0 24px' }}>
                    <FaPlus style={{ marginRight: 8 }} /> Crear Categoría
                  </button>
                </div>
                <div className="export-pills-group">
                  <button type="button" className="export-pill export-pill--excel" onClick={() => exportExcel({ title: "Categorías de Vehículos", headers: ["ID", "Nombre", "Descripción", "Cobertura de Sedes", "Vehículos", "Tarifa Base Diaria", "Depósito de Garantía", "Estado"], rows: filteredFlotas.map(gf => [gf.id, gf.nombre, gf.descripcion, gf.coberturaSedes, `${gf.vehiculosCount} unidades`, gf.tarifaBaseDiaria, gf.depositoGarantia, gf.activo ? 'Activa' : 'Inactiva']), filename: "categorias-vehiculos-drivique" })}>
                    <FaFileExcel aria-hidden="true" /> Excel
                  </button>
                  <button type="button" className="export-pill export-pill--pdf" onClick={() => exportPdf({ title: "Categorías de Vehículos", headers: ["ID", "Nombre", "Descripción", "Cobertura de Sedes", "Vehículos", "Tarifa Base Diaria", "Depósito de Garantía", "Estado"], rows: filteredFlotas.map(gf => [gf.id, gf.nombre, gf.descripcion, gf.coberturaSedes, `${gf.vehiculosCount} unidades`, gf.tarifaBaseDiaria, gf.depositoGarantia, gf.activo ? 'Activa' : 'Inactiva']), filename: "categorias-vehiculos-drivique" })}>
                    <FaFilePdf aria-hidden="true" /> PDF
                  </button>
                  <button type="button" className="export-pill export-pill--print" onClick={() => printTable({ title: "Categorías de Vehículos", headers: ["ID", "Nombre", "Descripción", "Cobertura de Sedes", "Vehículos", "Tarifa Base Diaria", "Depósito de Garantía", "Estado"], rows: filteredFlotas.map(gf => [gf.id, gf.nombre, gf.descripcion, gf.coberturaSedes, `${gf.vehiculosCount} unidades`, gf.tarifaBaseDiaria, gf.depositoGarantia, gf.activo ? 'Activa' : 'Inactiva']) })}>
                    <FaPrint aria-hidden="true" /> Imprimir
                  </button>
                </div>
              </div>
              <div className="cities-table-wrap">
                <table className="fleet-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre de la Categoría</th>
                      <th>Descripción</th>
                      <th>Cobertura de Sedes</th>
                      <th>Total Vehículos</th>
                      <th>Tarifa Base Diaria</th>
                      <th>Depósito de Garantía</th>
                      <th>Estado Operativo</th>
                      <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFlotas.map((gf) => (
                      <tr key={gf.id}>
                        <td>{gf.id}</td>
                        <td>{gf.nombre}</td>
                        <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{gf.descripcion}</td>
                        <td>{gf.coberturaSedes}</td>
                        <td>{gf.vehiculosCount} unidades</td>
                        <td>{formatCurrency(gf.tarifaBaseDiaria, divisa, tasaUSD)}</td>
                        <td>{formatCurrency(gf.depositoGarantia, divisa, tasaUSD)}</td>
                        <td>
                          <span className={`status-pill ${gf.activo ? 'is-green' : 'is-red'}`} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {gf.activo ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="cities-row-actions">
                            <button
                              type="button"
                              className="btn-row-action"
                              onClick={() => openEditCategory(gf)}
                            >
                              Editar
                            </button>
                            {!esEncargado && (
                              <button
                                type="button"
                                className="btn-row-action is-delete"
                                onClick={() => setModal({ type: 'delete_category', category: gf })}
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
                                  cursor: 'pointer',
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
                            {formatCurrency(
                              vehicle.precioLimitado || vehicle.precio || 0,
                              divisa,
                              tasaUSD,
                            )}
                          </td>
                          <td>
                            {vehicle.picoYPlaca?.dia
                              ? `Aplica (${t(`vehiculo.picoYPlaca.dias.${vehicle.picoYPlaca.dia}`)})`
                              : "No aplica"}
                          </td>
                          <td>
                            {t(
                              `admin.vehiclesManagement.states.${vehicle.estadoEfectivo}`,
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
                        <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Toyota Corolla 2024" />
                      </div>
                      <div className="incident-field">
                        <span className="incident-field-label">{t("admin.vehiclesManagement.fields.plate")}</span>
                        <input value={form.placa} onChange={(e) => setForm({ ...form, placa: e.target.value.toUpperCase() })} placeholder="Ej: ABC-123" />
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
                        ["categoria", "category", "Ej: Sedan, SUV, Deportivo"],
                        ["transmision", "transmission", "Ej: Automática, Manual"],
                        ["combustible", "fuel", "Ej: Gasolina, Híbrido, Eléctrico"],
                        ["color", "color", "Ej: Blanco Perla, Gris Oscuro"],
                      ].map(([key, label, placeholder]) => (
                        <div className="incident-field" key={key}>
                          <span className="incident-field-label">{t(`admin.vehiclesManagement.fields.${label}`)}</span>
                          <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} />
                        </div>
                      ))}
                      <div className="incident-field">
                        <span className="incident-field-label">{t("admin.vehiclesManagement.fields.year")}</span>
                        <input type="number" value={form.año} onChange={(e) => setForm({ ...form, año: e.target.value })} placeholder="Ej: 2024" />
                      </div>
                    </div>

                    <div className="incident-field" style={{ margin: '16px 0 4px' }}>
                      <span className="incident-field-label" style={{ fontSize: 13, color: 'var(--brand-text)', borderBottom: '1.5px solid var(--city-border)', paddingBottom: 6 }}>
                        {t("admin.vehiclesManagement.sections.features")}
                      </span>
                    </div>
                    <div className="incident-grid-2">
                      {[
                        ["puertas", "doors", "Ej: 4"],
                        ["pasajeros", "passengers", "Ej: 5"],
                        ["maletero", "trunk", "Ej: 2"],
                      ].map(([key, label, placeholder]) => (
                        <div className="incident-field" key={key}>
                          <span className="incident-field-label">{t(`admin.vehiclesManagement.fields.${label}`)}</span>
                          <input type="number" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} />
                        </div>
                      ))}
                      <div className="incident-field">
                        <span className="incident-field-label">{t("admin.vehiclesManagement.fields.engine")}</span>
                        <input value={form.cilindraje} onChange={(e) => setForm({ ...form, cilindraje: e.target.value })} placeholder="Ej: 2.0L Turbo" />
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
                        ["kmLimitado", "limitedKm", "Ej: 200"],
                        ["precioLimitado", "limitedPrice", "Ej: 85000"],
                        ["precioExcedente", "extraPrice", "Ej: 500"],
                        ["precioIlimitado", "unlimitedPrice", "Ej: 120000"],
                      ].map(([key, label, placeholder]) => (
                        <div className="incident-field" key={key}>
                          <span className="incident-field-label">{t(`admin.vehiclesManagement.fields.${label}`)}</span>
                          <input type="number" min="0" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} />
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
              ) : modal.type === "delete" ? (
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
              ) : modal.type === "category_form" ? (
                <>
                  <div className="cities-modal__head">
                    <div>
                      <p className="cities-eyebrow">Formulario de Categoría</p>
                      <h2>{modal.category ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                    </div>
                    <button type="button" onClick={close}>×</button>
                  </div>
                  <form onSubmit={saveCategory} className="incident-form" style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '10px 0' }}>
                    <div className="incident-field" style={{ marginBottom: 4 }}>
                      <span className="incident-field-label" style={{ fontSize: 14, color: 'var(--brand-primary)', borderBottom: '2px solid var(--city-border)', paddingBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Detalles de la Categoría
                      </span>
                    </div>
                    <div className="incident-grid-2" style={{ gap: '20px 24px' }}>
                      <div className="incident-field" style={{ gridColumn: '1 / -1' }}>
                        <span className="incident-field-label" style={{ fontWeight: 600, color: 'var(--brand-text)' }}>Nombre de la Categoría</span>
                        <input value={categoryForm.nombre} onChange={(e) => setCategoryForm({ ...categoryForm, nombre: e.target.value })} placeholder="Ej: Hatchbacks & Compactos" required style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--brand-border)', fontSize: 15, background: 'var(--brand-surface)' }} />
                      </div>
                      <div className="incident-field" style={{ gridColumn: '1 / -1' }}>
                        <span className="incident-field-label" style={{ fontWeight: 600, color: 'var(--brand-text)' }}>Descripción</span>
                        <textarea value={categoryForm.descripcion} onChange={(e) => setCategoryForm({ ...categoryForm, descripcion: e.target.value })} placeholder="Breve explicación de los tipos de vehículos en esta categoría..." rows={3} style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--brand-border)', fontSize: 15, fontFamily: 'inherit', background: 'var(--brand-surface)', resize: 'none' }} required />
                      </div>
                      <div className="incident-field" style={{ gridColumn: '1 / -1' }}>
                        <span className="incident-field-label" style={{ fontWeight: 600, color: 'var(--brand-text)' }}>Cobertura de Sedes</span>
                        <input value={categoryForm.coberturaSedes} onChange={(e) => setCategoryForm({ ...categoryForm, coberturaSedes: e.target.value })} placeholder="Ej: Todas las Sedes de Colombia" required style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--brand-border)', fontSize: 15, background: 'var(--brand-surface)' }} />
                      </div>
                    </div>

                    <div className="incident-field" style={{ marginBottom: 4, marginTop: 10 }}>
                      <span className="incident-field-label" style={{ fontSize: 14, color: 'var(--brand-primary)', borderBottom: '2px solid var(--city-border)', paddingBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Tarifas y Operación
                      </span>
                    </div>
                    <div className="incident-grid-2" style={{ gap: '20px 24px' }}>
                      <div className="incident-field">
                        <span className="incident-field-label" style={{ fontWeight: 600, color: 'var(--brand-text)' }}>Tarifa Base Diaria (COP)</span>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-secondary)', fontWeight: 600 }}>$</span>
                          <input type="number" value={categoryForm.tarifaBaseDiaria} onChange={(e) => setCategoryForm({ ...categoryForm, tarifaBaseDiaria: e.target.value })} placeholder="110000" required style={{ width: '100%', padding: '12px 16px 12px 36px', borderRadius: 10, border: '1px solid var(--brand-border)', fontSize: 15, background: 'var(--brand-surface)' }} />
                        </div>
                      </div>
                      <div className="incident-field">
                        <span className="incident-field-label" style={{ fontWeight: 600, color: 'var(--brand-text)' }}>Depósito de Garantía (COP)</span>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-secondary)', fontWeight: 600 }}>$</span>
                          <input type="number" value={categoryForm.depositoGarantia} onChange={(e) => setCategoryForm({ ...categoryForm, depositoGarantia: e.target.value })} placeholder="500000" required style={{ width: '100%', padding: '12px 16px 12px 36px', borderRadius: 10, border: '1px solid var(--brand-border)', fontSize: 15, background: 'var(--brand-surface)' }} />
                        </div>
                      </div>
                      <div className="incident-field" style={{ gridColumn: '1 / -1' }}>
                        <span className="incident-field-label" style={{ fontWeight: 600, color: 'var(--brand-text)' }}>Estado Operativo</span>
                        <select value={categoryForm.activo} onChange={(e) => setCategoryForm({ ...categoryForm, activo: e.target.value === 'true' })} style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--brand-border)', fontSize: 15, background: 'var(--brand-surface)', fontWeight: 600, color: categoryForm.activo ? 'var(--brand-green, #10b981)' : 'var(--brand-red, #ef4444)' }}>
                          <option value="true">Activa</option>
                          <option value="false">Inactiva</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="cities-modal__actions" style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--city-border)', display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                      <button type="button" onClick={close} style={{ padding: '12px 24px', borderRadius: 10, fontWeight: 600, background: 'transparent', color: 'var(--brand-text)', border: '1px solid var(--brand-border)', cursor: 'pointer' }}>{t("common.cancel")}</button>
                      <button type="submit" style={{ padding: '12px 28px', borderRadius: 10, fontWeight: 600, background: 'var(--brand-primary)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}>{t("common.save")}</button>
                    </div>
                  </form>
                </>
              ) : modal.type === "delete_category" ? (
                <>
                  <div className="cities-delete-icon">
                    <FaTrash />
                  </div>
                  <h2>Eliminar Categoría</h2>
                  <p>¿Estás seguro de que deseas eliminar la categoría <strong>{modal.category.nombre}</strong>? Esta acción no se puede deshacer.</p>
                  <div className="cities-modal__actions">
                    <button type="button" onClick={close}>{t("common.cancel")}</button>
                    <button className="cities-danger" type="button" onClick={removeCategory}>{t("common.delete")}</button>
                  </div>
                </>
              ) : null}
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
