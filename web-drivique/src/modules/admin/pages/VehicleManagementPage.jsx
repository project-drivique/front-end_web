import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaCamera,
  FaCar,
  FaCheck,
  FaCogs,
  FaEdit,
  FaFileExcel,
  FaFilePdf,
  FaImage,
  FaListUl,
  FaLock,
  FaMoneyBillWave,
  FaPlus,
  FaPrint,
  FaShieldAlt,
  FaSyncAlt,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { useLanding } from "../../landing/LandingContext";
import { useAuthStore } from "../../../store/authStore";
import { ROLES } from "../../auth/utils/accessControl";
import { branchManagementService } from "../../../services/branchManagementService";
import { branchCategoryService } from "../../../services/branchCategoryService";
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

const EMPTY = {
  nombre: "",
  placa: "",
  categoria: "",
  transmision: "",
  combustible: "",
  color: "",
  año: "",
  sucursal: "",
  precioLimitado: "", // Used as Tarifa Diaria
  aplicaPicoYPlaca: "", // Pico y Placa manual override
  estadoEfectivo: "disponible", // Estado automático al crear
  imagenes: [],
};

const CATEGORY_EMPTY = {
  nombre: "",
  descripcion: "",
  tarifaBaseSugerida: "",
  depositoGarantiaSugerido: "",
  activo: true,
};

const listToText = (items) =>
  (items || []).map((item) => item.nombre).join(", ");
const textToList = (text) =>
  String(text || "")
    .split(",")
    .map((nombre) => nombre.trim())
    .filter(Boolean)
    .map((nombre) => ({ nombre, icono: "FaCheckCircle" }));

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const normalizeBranch = (value) =>
  String(value || "").trim().toLocaleLowerCase();

export default function VehicleManagementPage() {
  const { t } = useTranslation();
  const { tema, moneda, tasaUSD } = useLanding();
  const user = useAuthStore((state) => state.usuario);

  // Detección consistente de rol mediante accessControl / store
  const esEncargado =
    user?.rol === ROLES.BRANCH_MANAGER ||
    user?.rol === "encargado" ||
    user?.rol === "encargado_sucursal" ||
    user?.rol === "branch_manager";

  // Sucursal asignada para el encargado
  const sucursalAsignada =
    user?.sucursal || user?.sucursalId || user?.sucursalAsignada || "Alamo Bogotá - Aeropuerto";
  const assignedBranchKey = normalizeBranch(sucursalAsignada);

  // Pestañas activas: Encargado inicia en 'vehiculos' (o 'flotas'); Admin en 'sede_central'
  const [activeTab, setActiveTab] = useState(() => (esEncargado ? "vehiculos" : "sede_central"));

  const [vehicles, setVehicles] = useState(() => vehicleManagementService.list());
  const [categories, setCategories] = useState(() => branchCategoryService.listCategories());
  const [branchCategoriesMap, setBranchCategoriesMap] = useState(() =>
    branchCategoryService.getBranchCategoriesMap()
  );

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [categoryForm, setCategoryForm] = useState(CATEGORY_EMPTY);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [zoomImage, setZoomImage] = useState(null);
  
  // Agregar un estado local para la actualización rápida
  const [updatingVehicleId, setUpdatingVehicleId] = useState(null);

  const branches = useMemo(
    () =>
      branchManagementService
        .list()
        .filter((b) => b.estado !== "inactiva")
        .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    []
  );

  // Mapeo / Filtro de vehículos
  const filteredVehicles = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return vehicles
      .filter((vehicle) => {
        if (esEncargado && normalizeBranch(vehicle.sucursal) !== assignedBranchKey) return false;

        const matchBranchFilter =
          esEncargado || branchFilter === "all" || vehicle.sucursal === branchFilter;
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
  }, [branchFilter, search, stateFilter, vehicles, esEncargado, assignedBranchKey]);

  // Filtro de categorías
  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    return categories.filter(
      (gf) =>
        !term ||
        `${gf.id} ${gf.nombre} ${gf.descripcion}`.toLowerCase().includes(term)
    );
  }, [search, categories]);

  // Contar vehículos de una categoría en la sucursal del encargado
  const getVehiclesInMyBranchCount = (catName) => {
    const norm = normalize(catName);
    return vehicles.filter(
      (v) =>
        normalizeBranch(v.sucursal) === assignedBranchKey &&
        (normalize(v.categoria).includes(norm) || norm.includes(normalize(v.categoria)))
    ).length;
  };

  // Contar vehículos totales de una categoría en el sistema (Admin General)
  const getTotalVehiclesInCategory = (catName) => {
    const norm = normalize(catName);
    return vehicles.filter(
      (v) =>
        normalize(v.categoria).includes(norm) || norm.includes(normalize(v.categoria))
    ).length;
  };

  // Mock de Sede Central (solo visible para Administrador General)
  const mockSedeCentral = useMemo(
    () => [
      {
        id: 1,
        nombre: "Sede Central Principal Drivique",
        nit: "901.458.920-3",
        razonSocial: "Drivique Colombia S.A.S.",
        direccion: "Cl. 100 #19-61, Edificio Capital Tower, Bogotá D.C.",
        telefono: "+57 (601) 745-0000",
        correo: "contacto@drivique.com.co",
        director: "Carlos Eduardo Restrepo",
        estado: "Activa",
        descripcion:
          "Drivique es la empresa líder en soluciones de movilidad y alquiler de vehículos, ofreciendo un servicio premium con presencia a nivel nacional.",
        mision:
          "Brindar a nuestros clientes la mejor experiencia de alquiler de vehículos con un servicio ágil, seguro y de alta calidad.",
        vision:
          "Ser reconocidos para el 2030 como la principal empresa de movilidad y renta de autos en América Latina, destacando por nuestra innovación.",
      },
    ],
    []
  );

  const filteredSedeCentral = useMemo(() => {
    const term = search.trim().toLowerCase();
    return mockSedeCentral.filter(
      (sc) =>
        !term ||
        `${sc.id} ${sc.nombre} ${sc.nit} ${sc.razonSocial} ${sc.direccion} ${sc.director}`
          .toLowerCase()
          .includes(term)
    );
  }, [search, mockSedeCentral]);

  const filteredSucursales = useMemo(() => {
    const term = search.trim().toLowerCase();
    return branches.filter(
      (b) =>
        !term ||
        `${b.id} ${b.nombre} ${b.ciudad} ${b.direccion} ${b.telefono}`
          .toLowerCase()
          .includes(term)
    );
  }, [search, branches]);

  // Headers y exportables para tabla de vehículos (Condicionados por rol)
  const vehicleHeaders = useMemo(() => {
    return [
      "ID",
      t("admin.vehiclesManagement.fields.photo", "IMAGEN"),
      t("admin.vehiclesManagement.fields.vehicle", "NOMBRE VEHÍCULO"),
      t("admin.vehiclesManagement.fields.plate", "PLACA"),
      ...(!esEncargado ? [t("admin.vehiclesManagement.fields.branch", "SUCURSAL")] : []),
      t("admin.vehiclesManagement.fields.category", "CATEGORÍA"),
      t("admin.vehiclesManagement.fields.year", "AÑO"),
      t("admin.vehiclesManagement.fields.color", "COLOR"),
      t("admin.vehiclesManagement.fields.transmission", "TRANSMISIÓN"),
      t("admin.vehiclesManagement.fields.fuel", "COMBUSTIBLE"),
      t("admin.vehiclesManagement.fields.price", "TARIFA DIARIA"),
      t("admin.vehiclesManagement.fields.pico", "PICO Y PLACA"),
      t("admin.vehiclesManagement.fields.state", "ESTADO"),
    ];
  }, [esEncargado, t]);

  const vehicleRows = useMemo(() => {
    return filteredVehicles.map((vehicle, idx) => [
      idx + 1,
      vehicle.imagenes?.[0] ? t("admin.vehiclesManagement.withPhoto", "Con Foto") : t("admin.vehiclesManagement.withoutPhoto", "Sin Foto"),
      vehicle.nombre,
      vehicle.placa,
      ...(!esEncargado ? [vehicle.sucursal] : []),
      vehicle.categoria,
      vehicle.año || "—",
      vehicle.color || "—",
      vehicle.transmision || t("admin.vehiclesManagement.transmission.automatic", "Automática"),
      vehicle.combustible || t("admin.vehiclesManagement.fuel.gasoline", "Gasolina"),
      formatCurrency(
        vehicle.precioLimitado || vehicle.precio || 0,
        moneda,
        tasaUSD
      ),
      vehicle.aplicaPicoYPlaca === "Si" || vehicle.picoYPlaca?.dia
        ? t("admin.vehiclesManagement.applies", "Sí aplica")
        : t("admin.vehiclesManagement.doesNotApply", "No aplica"),
      t(`admin.vehiclesManagement.states.${vehicle.estadoEfectivo}`, vehicle.estadoEfectivo),
    ]);
  }, [filteredVehicles, esEncargado, moneda, tasaUSD, t]);

  const vehicleExportData = useMemo(() => {
    return {
      title: esEncargado
        ? `Flota de Vehículos - ${sucursalAsignada}`
        : t("admin.vehiclesManagement.exportTitle", "Gestión de Flota y Vehículos Drivique"),
      headers: vehicleHeaders,
      rows: vehicleRows,
      items: filteredVehicles,
      filename: `flota-drivique-${esEncargado ? "sucursal" : "general"}`,
    };
  }, [esEncargado, sucursalAsignada, vehicleHeaders, vehicleRows, filteredVehicles, t]);

  // Exportable para Categorías (Solo Admin General)
  const categoryHeaders = [
    "ID",
    t("categoriesManagement.categoryName", "Nombre de la Categoría"),
    t("categoriesManagement.description", "Descripción"),
    t("categoriesManagement.branchesOffering", "Sucursales que la ofrecen"),
    t("categoriesManagement.totalVehicles", "Total Vehículos"),
    t("categoriesManagement.suggestedRate", "Tarifa Base Sugerida"),
    t("categoriesManagement.suggestedDeposit", "Depósito Sugerido"),
    t("categoriesManagement.status", "Estado"),
  ];

  const categoryRows = filteredCategories.map((gf) => {
    const ratio = branchCategoryService.getBranchesOfferingCategoryRatio(gf.nombre).formatted;
    const count = getTotalVehiclesInCategory(gf.nombre);
    return [
      gf.id,
      gf.nombre,
      gf.descripcion,
      ratio,
      `${count} ${t("categoriesManagement.units", "unidades")}`,
      gf.tarifaBaseSugerida ? formatCurrency(gf.tarifaBaseSugerida, moneda, tasaUSD) : "—",
      gf.depositoGarantiaSugerido ? formatCurrency(gf.depositoGarantiaSugerido, moneda, tasaUSD) : "—",
      gf.activo !== false ? t("categoriesManagement.active", "Activa") : t("categoriesManagement.inactive", "Inactiva"),
    ];
  });

  const categoryExportData = {
    title: t("categoriesManagement.title", "Categorías de Vehículos"),
    headers: categoryHeaders,
    rows: categoryRows,
    items: filteredCategories,
    filename: "categorias-vehiculos-drivique",
  };

  const close = () => {
    setModal(null);
    setError("");
  };

  // Toggle de categoría para la sucursal del encargado
  const handleToggleCategory = (catName, currentEnabled) => {
    const nextState = !currentEnabled;
    branchCategoryService.toggleBranchCategory(sucursalAsignada, catName, nextState);
    setBranchCategoriesMap(branchCategoryService.getBranchCategoriesMap());
    setNotice(
      nextState
        ? t("categoriesManagement.enabledForBranchNotice", "Categoría habilitada para tu sucursal")
        : t("categoriesManagement.disabledForBranchNotice", "Categoría deshabilitada para tu sucursal")
    );
  };

  // Categorías activas disponibles en el formulario según la sucursal seleccionada
  const targetBranchForForm = esEncargado
    ? sucursalAsignada
    : form.sucursal || branches[0]?.nombre || "";
  const activeCategoriesForForm = useMemo(() => {
    return branchCategoryService.getBranchCategories(targetBranchForForm);
  }, [targetBranchForForm, branchCategoriesMap]);

  const openCreate = () => {
    const initialBranch = esEncargado ? sucursalAsignada : branches[0]?.nombre || "";
    const activeCats = branchCategoryService.getBranchCategories(initialBranch);
    setForm({
      ...EMPTY,
      sucursal: initialBranch,
      categoria: activeCats[0] || "",
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
    setModal({ type: "category_form" });
    setError("");
  };

  const openEditCategory = (category) => {
    setCategoryForm(category);
    setModal({ type: "category_form", category });
    setError("");
  };

  const handleQuickStatusChange = (vehicleId, newState) => {
    try {
      setUpdatingVehicleId(vehicleId);
      const vehicleToUpdate = vehicles.find((v) => Number(v.id) === Number(vehicleId));
      if (!vehicleToUpdate) throw new Error("Vehículo no encontrado");

      if (vehicleManagementService.activeReservationCount(vehicleId) > 0 && newState !== "reservado") {
         alert("No puedes cambiar el estado manualmente porque este vehículo tiene una reserva activa.");
         return;
      }

      const updatedData = { ...vehicleToUpdate, estadoFlota: newState };
      vehicleManagementService.update(vehicleId, updatedData, user);
      
      setVehicles(vehicleManagementService.list());
      setNotice(`Estado del vehículo actualizado a ${newState === "disponible" ? "Disponible" : "Mantenimiento"}.`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("No se pudo cambiar el estado.");
    } finally {
      setUpdatingVehicleId(null);
    }
  };

  const saveCategory = (e) => {
    e.preventDefault();
    const payload = {
      ...categoryForm,
      tarifaBaseSugerida: categoryForm.tarifaBaseSugerida
        ? Number(categoryForm.tarifaBaseSugerida)
        : null,
      depositoGarantiaSugerido: categoryForm.depositoGarantiaSugerido
        ? Number(categoryForm.depositoGarantiaSugerido)
        : null,
    };
    const updated = branchCategoryService.saveCategory(payload);
    setCategories(updated);
    setNotice(
      categoryForm.id
        ? t("categoriesManagement.updatedNotice", "Categoría actualizada correctamente")
        : t("categoriesManagement.createdNotice", "Categoría creada correctamente")
    );
    close();
  };

  const removeCategory = () => {
    if (!modal?.category?.id) return;
    const updated = branchCategoryService.deleteCategory(modal.category.id);
    setCategories(updated);
    setBranchCategoriesMap(branchCategoryService.getBranchCategoriesMap());
    setNotice(t("categoriesManagement.deletedNotice", "Categoría eliminada correctamente"));
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
          "Vehículo guardado correctamente"
        )
      );
      close();
    } catch (caught) {
      setError(
        t(
          `admin.vehiclesManagement.errors.${caught.message}`,
          caught.message || "Error al procesar vehículo"
        )
      );
    }
  };

  const remove = () => {
    if (esEncargado && normalizeBranch(modal.vehicle.sucursal) !== assignedBranchKey) return;
    try {
      vehicleManagementService.remove(modal.vehicle.id, user);
      setVehicles(vehicleManagementService.list());
      setNotice(
        t("admin.vehiclesManagement.messages.deleted", "Vehículo eliminado correctamente")
      );
      close();
    } catch (caught) {
      setModal(null);
      setNotice(
        t(`admin.vehiclesManagement.errors.${caught.message}`, {
          count: caught.count,
        })
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
          : insurance
      ),
    });

  const loadImages = async (event) => {
    const remainingSlots = Math.max(0, 3 - (form.imagenes?.length || 0));
    if (remainingSlots <= 0) {
      event.target.value = "";
      return;
    }
    const files = [...event.target.files].slice(0, remainingSlots);
    if (files.some((file) => file.size > 1024 * 1024)) {
      setError(
        t(
          "admin.vehiclesManagement.errors.imageSize",
          "Las imágenes no deben superar 1MB"
        )
      );
      event.target.value = "";
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
          })
      )
    );
    setForm((current) => ({
      ...current,
      imagenes: [...(current.imagenes || []), ...images].slice(0, 3),
    }));
    setError("");
    event.target.value = "";
  };

  const handleReplaceImage = async (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setError(
        t(
          "admin.vehiclesManagement.errors.imageSize",
          "Las imágenes no deben superar 1MB"
        )
      );
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => {
        const nextImgs = [...(current.imagenes || [])];
        nextImgs[index] = reader.result;
        return {
          ...current,
          imagenes: nextImgs,
        };
      });
      setError("");
    };
    reader.onerror = () => {
      setError("Error al procesar la imagen seleccionada");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const pico = getPicoYPlacaInfo(form.placa, form.sucursal);

  return (
    <div
      className={`management-shell ${tema === "oscuro" ? "management-shell--dark" : ""}`}
    >
      <ManagementSidebar branchOnly={esEncargado} />
      <main className="management-main" style={{ padding: "24px 32px" }}>
        <div className="cities-container" style={{ maxWidth: "100%" }}>
          {/* TOPBAR OPERATIVA UNIFICADA (Idéntica a Mi Sucursal y Dashboard) */}
          <div className="branch-topbar">
            <div className="branch-topbar-brand-title">
              <span className="branch-topbar-badge">
                {esEncargado
                  ? t("fleetVehicles.eyebrowManager", "GESTIÓN DE SUCURSAL")
                  : t("fleetVehicles.eyebrowAdmin", "ADMINISTRACIÓN GENERAL")}
              </span>
              <h1 className="branch-topbar-heading">
                {esEncargado
                  ? t("fleetVehicles.title", "Flota y Vehículos")
                  : t("fleetVehicles.titleAdmin", "Gestión de Vehículos")}
              </h1>
            </div>

            <div className="branch-topbar-actions">
              <MenuConfiguracion />
              {esEncargado && (
                <div className="branch-user-profile-chip">
                  <div className="branch-user-avatar">
                    {(user?.nombre || user?.correo || "A").charAt(0).toUpperCase()}
                  </div>
                  <div className="branch-user-info-text">
                    <strong className="branch-user-name">
                      {user?.nombre || "Andrés Felipe Castro"}
                    </strong>
                    <span className="branch-user-role">
                      {user?.rol || "encargado_sucursal"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {notice && (
            <div className="cities-notice" role="status">
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label={t("common.close", "Cerrar")}
              >
                ×
              </button>
            </div>
          )}

          {/* Pestañas de Secciones y Botón Crear Vehículo a la derecha */}
          <div className="fleet-attached-tabs">
            <div className="fleet-tabs-nav">
              {!esEncargado && (
                <button
                  type="button"
                  onClick={() => setActiveTab("sede_central")}
                  className={`fleet-tab-btn ${activeTab === "sede_central" ? "is-active" : ""}`}
                >
                  {t("fleetVehicles.tabHeadquarters", "Sede Central")}
                </button>
              )}
              {!esEncargado && (
                <button
                  type="button"
                  onClick={() => setActiveTab("sucursales")}
                  className={`fleet-tab-btn ${activeTab === "sucursales" ? "is-active" : ""}`}
                >
                  {t("fleetVehicles.tabBranches", "Sucursales")}
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab("flotas")}
                className={`fleet-tab-btn ${activeTab === "flotas" ? "is-active" : ""}`}
              >
                {t("fleetVehicles.tabCategories", "Categorías")}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("vehiculos")}
                className={`fleet-tab-btn ${activeTab === "vehiculos" ? "is-active" : ""}`}
              >
                {t("fleetVehicles.tabVehicles", "Vehículos")}
              </button>
            </div>

            <div className="fleet-tabs-action">
              {((!esEncargado) || (esEncargado && activeTab === "vehiculos")) && (
                <button
                  className="cities-primary fleet-btn-create-tab"
                  type="button"
                  onClick={() => {
                    if (activeTab === "sede_central") {
                      setNotice("Editando parámetros corporativos de Drivique Colombia.");
                    } else if (activeTab === "sucursales") {
                      setNotice("Para registrar nuevas sedes, dirígete al módulo de Sucursales.");
                    } else if (activeTab === "flotas") {
                      openCreateCategory();
                    } else {
                      openCreate();
                    }
                  }}
                  disabled={esEncargado && activeTab === "vehiculos" && !sucursalAsignada}
                >
                  {activeTab === "sede_central" && "Editar Matriz"}
                  {activeTab === "sucursales" && "+ Crear Sucursal"}
                  {activeTab === "flotas" && t("fleetVehicles.createCategory", "+ Crear Categoría")}
                  {activeTab === "vehiculos" && t("fleetVehicles.createVehicle", "+ Crear Vehículo")}
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: SEDE CENTRAL (SOLO ADMIN GENERAL) */}
          {activeTab === "sede_central" && !esEncargado && (
            <section className="cities-card attached-to-tabs">
              <div
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                {filteredSedeCentral.map((sc) => (
                  <div
                    key={sc.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "32px",
                      background: "var(--card-bg, #fff)",
                      padding: "40px",
                      borderRadius: "20px",
                      border: "1px solid var(--city-border)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "32px",
                        alignItems: "flex-start",
                        paddingBottom: "32px",
                        borderBottom: "1px solid var(--city-border)",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: "300px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "8px",
                          }}
                        >
                          <h2
                            style={{
                              margin: 0,
                              fontSize: "28px",
                              color: "var(--adm-text)",
                              fontWeight: 800,
                              letterSpacing: "-0.5px",
                            }}
                          >
                            {sc.razonSocial}
                          </h2>
                          <span
                            style={{
                              background: "#e0e7ff",
                              color: "var(--brand-primary)",
                              padding: "4px 12px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: 700,
                              letterSpacing: "0.5px",
                            }}
                          >
                            MATRIZ
                          </span>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "16px",
                            color: "var(--brand-text)",
                            lineHeight: 1.6,
                            maxWidth: "800px",
                          }}
                        >
                          {sc.descripcion}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                        gap: "32px",
                      }}
                    >
                      <div
                        style={{
                          padding: "32px",
                          borderRadius: "16px",
                          border: "1px solid #e2e8f0",
                          background:
                            "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "4px",
                            height: "100%",
                            background: "var(--brand-primary)",
                          }}
                        />
                        <h3
                          style={{
                            margin: "0 0 16px 0",
                            fontSize: "13px",
                            color: "var(--brand-text)",
                            textTransform: "uppercase",
                            letterSpacing: "1.5px",
                            fontWeight: 700,
                          }}
                        >
                          Nuestra Misión
                        </h3>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "15px",
                            color: "var(--adm-text)",
                            lineHeight: 1.7,
                          }}
                        >
                          {sc.mision}
                        </p>
                      </div>
                      <div
                        style={{
                          padding: "32px",
                          borderRadius: "16px",
                          border: "1px solid #e2e8f0",
                          background:
                            "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "4px",
                            height: "100%",
                            background: "var(--brand-accent, #6366f1)",
                          }}
                        />
                        <h3
                          style={{
                            margin: "0 0 16px 0",
                            fontSize: "13px",
                            color: "var(--brand-text)",
                            textTransform: "uppercase",
                            letterSpacing: "1.5px",
                            fontWeight: 700,
                          }}
                        >
                          Nuestra Visión
                        </h3>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "15px",
                            color: "var(--adm-text)",
                            lineHeight: 1.7,
                          }}
                        >
                          {sc.vision}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TAB 2: SUCURSALES (SOLO ADMIN GENERAL) */}
          {activeTab === "sucursales" && !esEncargado && (
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
                  <button
                    type="button"
                    className="export-pill export-pill--excel"
                    onClick={() =>
                      exportExcel({
                        title: "Sucursales",
                        headers: [
                          "ID",
                          "Código",
                          "Sucursal",
                          "Ciudad",
                          "Dirección",
                          "Teléfono",
                          "Capacidad",
                          "Horario",
                          "Estado",
                        ],
                        rows: filteredSucursales.map((b, idx) => [
                          b.id || idx + 1,
                          `SEC-00${b.id || idx + 1}`,
                          b.nombre,
                          b.ciudad || "Colombia",
                          b.direccion || "",
                          b.telefono || "",
                          `${b.capacidadVehiculos || 25} autos`,
                          b.horario || "",
                          b.estado,
                        ]),
                        filename: "sucursales-drivique",
                      })
                    }
                  >
                    <FaFileExcel aria-hidden="true" /> {t('admin.vehiclesManagement.export.excel', 'Excel')}
                  </button>
                  <button
                    type="button"
                    className="export-pill export-pill--pdf"
                    onClick={() =>
                      exportPdf({
                        title: "Sucursales",
                        headers: [
                          "ID",
                          "Código",
                          "Sucursal",
                          "Ciudad",
                          "Dirección",
                          "Teléfono",
                          "Capacidad",
                          "Horario",
                          "Estado",
                        ],
                        rows: filteredSucursales.map((b, idx) => [
                          b.id || idx + 1,
                          `SEC-00${b.id || idx + 1}`,
                          b.nombre,
                          b.ciudad || "Colombia",
                          b.direccion || "",
                          b.telefono || "",
                          `${b.capacidadVehiculos || 25} autos`,
                          b.horario || "",
                          b.estado,
                        ]),
                        filename: "sucursales-drivique",
                      })
                    }
                  >
                    <FaFilePdf aria-hidden="true" /> {t('admin.vehiclesManagement.export.pdf', 'PDF')}
                  </button>
                  <button
                    type="button"
                    className="export-pill export-pill--print"
                    onClick={() =>
                      printTable({
                        title: "Sucursales",
                        headers: [
                          "ID",
                          "Código",
                          "Sucursal",
                          "Ciudad",
                          "Dirección",
                          "Teléfono",
                          "Capacidad",
                          "Horario",
                          "Estado",
                        ],
                        rows: filteredSucursales.map((b, idx) => [
                          b.id || idx + 1,
                          `SEC-00${b.id || idx + 1}`,
                          b.nombre,
                          b.ciudad || "Colombia",
                          b.direccion || "",
                          b.telefono || "",
                          `${b.capacidadVehiculos || 25} autos`,
                          b.horario || "",
                          b.estado,
                        ]),
                      })
                    }
                  >
                    <FaPrint aria-hidden="true" /> {t('admin.vehiclesManagement.export.print', 'Imprimir')}
                  </button>
                </div>
              </div>
              <div className="cities-table-wrap">
                <table className="fleet-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>CÓDIGO SEDE</th>
                      <th>NOMBRE SUCURSAL</th>
                      <th>CIUDAD</th>
                      <th>DIRECCIÓN FÍSICA</th>
                      <th>TELÉFONO CONTACTO</th>
                      <th>CAPACIDAD PARQUEADERO</th>
                      <th>HORARIO ATENCIÓN</th>
                      <th>ESTADO</th>
                      <th style={{ textAlign: "center" }}>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSucursales.map((b, idx) => (
                      <tr key={b.id || b.nombre}>
                        <td>{b.id || idx + 1}</td>
                        <td>
                          <code>SEC-00{b.id || idx + 1}</code>
                        </td>
                        <td>{b.nombre}</td>
                        <td>{b.ciudad || "Colombia"}</td>
                        <td>{b.direccion || "Dirección comercial de sede"}</td>
                        <td>{b.telefono || "300 000 0000"}</td>
                        <td>{b.capacidadVehiculos || 25} autos</td>
                        <td>{b.horario || "Lun a Sáb 7:00 am - 7:00 pm"}</td>
                        <td>
                          <span
                            className={`status-pill ${b.estado === "inactiva" ? "is-red" : "is-green"}`}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {b.estado === "inactiva" ? "Inactiva" : "Activa"}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div className="cities-row-actions">
                            <button
                              type="button"
                              className="btn-row-action"
                              onClick={() =>
                                setNotice(`Modificando parámetros de la ${b.nombre}.`)
                              }
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

          {/* TAB 3: CATEGORÍAS (Diferenciadas estrictamente por rol) */}
          {activeTab === "flotas" && (
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
                      "Buscar categoría por nombre o descripción..."
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
                      "No se encontraron categorías"
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
                                  {gf.descripcion}
                                </span>
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    padding: "4px 12px",
                                    borderRadius: 12,
                                    background: vehiclesInBranch > 0 ? "rgba(37, 99, 235, 0.08)" : "var(--city-card-alt, #f1f5f9)",
                                    color: vehiclesInBranch > 0 ? "var(--brand-primary, #2563eb)" : "var(--city-muted, #64748b)",
                                    fontWeight: 700,
                                    fontSize: 13,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {vehiclesInBranch}{" "}
                                  {vehiclesInBranch === 1 ? "vehículo" : "vehículos"}
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
                              title={gf.descripcion}
                            >
                              {gf.descripcion}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <span
                                style={{
                                  display: "inline-flex",
                                  padding: "4px 10px",
                                  borderRadius: 12,
                                  background: "rgba(37, 99, 235, 0.08)",
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
                                ? formatCurrency(gf.tarifaBaseSugerida, divisa, tasaUSD)
                                : "—"}
                            </td>
                            <td>
                              {gf.depositoGarantiaSugerido
                                ? formatCurrency(gf.depositoGarantiaSugerido, divisa, tasaUSD)
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
          )}

          {/* TAB 4: VEHÍCULOS */}
          {activeTab === "vehiculos" && (
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
                            "Buscar por vehículo, placa o categoría..."
                          )
                        : t(
                            "admin.vehiclesManagement.search",
                            "Buscar por vehículo, placa, categoría o sucursal..."
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
                      "No se encontraron vehículos registrados"
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
                                title="Haz clic para ver foto completa"
                                onClick={() =>
                                  setZoomImage({
                                    url: vehicle.imagenes[0],
                                    title: `${vehicle.nombre || "Vehículo"} (${vehicle.placa || "Placa"})`,
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
                          <td>{vehicle.año || "—"}</td>
                          <td>{vehicle.color || "—"}</td>
                          <td>{vehicle.transmision || "Automática"}</td>
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
                                      ? "#3b82f6"
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
                              <button
                                type="button"
                                className="btn-row-action"
                                onClick={() => openEdit(vehicle)}
                              >
                                {t("common.edit", "Editar")}
                              </button>
                              <button
                                type="button"
                                className="btn-row-action is-delete"
                                onClick={() =>
                                  setModal({ type: "delete", vehicle })
                                }
                              >
                                {t("common.delete", "Eliminar")}
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

        {/* MODALES */}
        {modal && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(event) =>
              event.target === event.currentTarget && close()
            }
          >
            <section
              className={`cities-modal ${
                modal.type === "form"
                  ? "fleet-modal fleet-modal--custom"
                  : modal.type === "category_form"
                  ? "fleet-modal fleet-modal--category"
                  : "fleet-alert-modal-card"
              }`}
              role="dialog"
              aria-modal="true"
            >
              {/* MODAL 1: FORMULARIO DE VEHÍCULO (CREAR / EDITAR) */}
              {modal.type === "form" ? (
                <>
                  <div className="fleet-modal-header">
                    <div className="fleet-modal-header__info">
                      <span className="fleet-modal-eyebrow">
                        <FaCar aria-hidden="true" />
                        {modal.vehicle ? "Modificación de Ficha" : "Registro de Flota"}
                      </span>
                      <h2 className="fleet-modal-title">
                        {modal.vehicle ? (form.nombre || "Editar Vehículo") : "Nuevo Vehículo"}
                      </h2>
                      {modal.vehicle && (
                        <div className="fleet-modal-subtags">
                          <span className="fleet-badge-plate">{form.placa || "SIN PLACA"}</span>
                          <span className="fleet-badge-branch">{form.sucursal || sucursalAsignada}</span>
                          {form.categoria && <span className="fleet-badge-cat">{form.categoria}</span>}
                        </div>
                      )}
                    </div>
                    <button type="button" className="fleet-modal-close-btn" onClick={close} aria-label="Cerrar">
                      <FaTimes />
                    </button>
                  </div>

                  <form onSubmit={save} className="fleet-modal-form">
                    <div className="fleet-modal-body" style={{ padding: '24px 32px', background: 'var(--bg-tarjeta, #ffffff)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                        
                        {/* IMAGEN */}
                        <div style={{ gridColumn: '1 / -1', marginBottom: '8px' }}>
                          <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.images", "Imágenes del Vehículo (Máx. 3)")}</label>
                          <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                            {[0, 1, 2].map((idx) => {
                              const img = form.imagenes && form.imagenes[idx];
                              return img ? (
                                <div key={idx} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--borde, #e2e8f0)', flex: 1, height: '130px' }}>
                                  <img src={img} alt={`preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  <button type="button" onClick={() => setForm({ ...form, imagenes: form.imagenes.filter((_, i) => i !== idx) })} style={{ position: 'absolute', top: 6, right: 6, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}><FaTimes size={12} /></button>
                                </div>
                              ) : (
                                <label key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, height: '130px', background: 'var(--bg-seccion1, #f8fafc)', border: '2px dashed var(--brand-primary, #3b82f6)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center', padding: '8px' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-seccion1, #eff6ff)'; e.currentTarget.style.borderColor = 'var(--brand-primary, #2563eb)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-seccion1, #f8fafc)'; e.currentTarget.style.borderColor = 'var(--brand-primary, #3b82f6)'; }}>
                                  <FaPlus size={20} style={{ color: 'var(--brand-primary, #3b82f6)', marginBottom: '8px' }} />
                                  <div style={{ fontSize: '12px', color: 'var(--texto-primary, #475569)', fontWeight: 600 }}>{idx === 0 ? t("admin.vehiclesManagement.modal.mainImage", "Imagen Principal") : `${t("admin.vehiclesManagement.modal.image", "Imagen")} ${idx + 1}`}</div>
                                  <div style={{ fontSize: '10px', color: 'var(--texto-second, #94a3b8)', marginTop: '4px' }}>{t("admin.vehiclesManagement.modal.clickToUpload", "(Clic para subir)")}</div>
                                  <input type="file" accept="image/*" onChange={loadImages} style={{ display: "none" }} />
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* INPUTS ESTILO REFERENCIA */}
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.vehicleName", "Nombre Vehículo *")}</label>
                          <input style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder={t("admin.vehiclesManagement.modal.placeholderName", "Ej: Toyota Corolla 2024")} required />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.plate", "Placa *")}</label>
                          <input style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }} value={form.placa} onChange={(e) => setForm({ ...form, placa: e.target.value.toUpperCase() })} placeholder={t("admin.vehiclesManagement.modal.placeholderPlate", "Ej: ABC-123")} required />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.category", "Categoría *")}</label>
                          <select style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none', cursor: 'pointer' }} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} required disabled={!activeCategoriesForForm.length}>
                            <option value="" disabled>{t("admin.vehiclesManagement.modal.select", "Seleccionar")}</option>
                            {activeCategoriesForForm.map((catName) => <option key={catName} value={catName}>{catName}</option>)}
                          </select>
                        </div>

                        {!esEncargado ? (
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.branch", "Sucursal Asignada *")}</label>
                            <select style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none', cursor: 'pointer' }} value={form.sucursal} onChange={(e) => setForm({ ...form, sucursal: e.target.value, categoria: "" })} required>
                              <option value="" disabled>{t("admin.vehiclesManagement.modal.select", "Seleccionar")}</option>
                              {branches.map((b) => <option key={b.id} value={b.nombre}>{b.nombre}</option>)}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.year", "Año *")}</label>
                            <input type="number" min="1990" max="2030" style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }} value={form.año} onChange={(e) => setForm({ ...form, año: e.target.value })} placeholder={t("admin.vehiclesManagement.modal.placeholderYear", "Ej: 2024")} required />
                          </div>
                        )}

                        {/* If esEncargado is false, Año gets pushed to next spot to keep grid aligned */}
                        {!esEncargado && (
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.year", "Año *")}</label>
                            <input type="number" min="1990" max="2030" style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }} value={form.año} onChange={(e) => setForm({ ...form, año: e.target.value })} placeholder={t("admin.vehiclesManagement.modal.placeholderYear", "Ej: 2024")} required />
                          </div>
                        )}

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.color", "Color *")}</label>
                          <input style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }} value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder={t("admin.vehiclesManagement.modal.placeholderColor", "Ej: Blanco")} required />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.transmission", "Transmisión *")}</label>
                          <select style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none', cursor: 'pointer' }} value={form.transmision} onChange={(e) => setForm({ ...form, transmision: e.target.value })} required>
                            <option value="" disabled>{t("admin.vehiclesManagement.modal.select", "Seleccionar")}</option>
                            <option value="Automática">{t("admin.vehiclesManagement.transmission.auto", "Automática")}</option>
                            <option value="Manual">{t("admin.vehiclesManagement.transmission.manual", "Manual")}</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.fuel", "Combustible *")}</label>
                          <select style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none', cursor: 'pointer' }} value={form.combustible} onChange={(e) => setForm({ ...form, combustible: e.target.value })} required>
                            <option value="" disabled>{t("admin.vehiclesManagement.modal.select", "Seleccionar")}</option>
                            <option value="Gasolina">{t("admin.vehiclesManagement.fuel.gasoline", "Gasolina")}</option>
                            <option value="Diésel">{t("admin.vehiclesManagement.fuel.diesel", "Diésel")}</option>
                            <option value="Híbrido">{t("admin.vehiclesManagement.fuel.hybrid", "Híbrido")}</option>
                            <option value="Eléctrico">{t("admin.vehiclesManagement.fuel.electric", "Eléctrico")}</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.restriction", "Pico y Placa *")}</label>
                          <select style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none', cursor: 'pointer' }} value={form.aplicaPicoYPlaca} onChange={(e) => setForm({ ...form, aplicaPicoYPlaca: e.target.value })} required>
                            <option value="" disabled>{t("admin.vehiclesManagement.modal.select", "Seleccionar")}</option>
                            <option value="Si">{t("admin.vehiclesManagement.restriction.yes", "Sí aplica")}</option>
                            <option value="No">{t("admin.vehiclesManagement.restriction.no", "No aplica")}</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.dailyRate", "Tarifa Diaria ($) *")}</label>
                          <input type="number" min="0" style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }} value={form.precioLimitado} onChange={(e) => setForm({ ...form, precioLimitado: e.target.value })} placeholder="Ej: 150000" required />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.state", "Estado del Vehículo *")}</label>
                          <select
                            style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none', cursor: 'pointer' }}
                            value={form.estadoEfectivo || "disponible"}
                            onChange={(e) => setForm({ ...form, estadoEfectivo: e.target.value })}
                            required
                          >
                            <option value="disponible">{t("admin.vehiclesManagement.states.disponible", "Disponible")}</option>
                            <option value="reservado">{t("admin.vehiclesManagement.states.reservado", "Reservado")}</option>
                            <option value="en mantenimiento">{t("admin.vehiclesManagement.states.en mantenimiento", "En Mantenimiento")}</option>
                          </select>
                        </div>

                      </div>

                      {error && (
                        <div style={{ marginTop: 24, padding: '12px', background: '#fef2f2', color: '#991b1b', borderRadius: '6px', fontSize: '13px' }}>
                          <p style={{ margin: 0 }}>{error}</p>
                        </div>
                      )}
                    </div>

                    <div className="fleet-modal-footer" style={{ borderTop: '1px solid var(--borde, #e2e8f0)', padding: '16px 24px', background: 'var(--bg-seccion1, #f8fafc)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <button type="button" onClick={close} style={{ border: '1px solid var(--borde, #cbd5e1)', background: 'var(--bg-tarjeta, #ffffff)', borderRadius: '6px', padding: '8px 16px', color: 'var(--texto-primary, #475569)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-seccion1, #f1f5f9)'; e.currentTarget.style.borderColor = 'var(--texto-second, #94a3b8)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-tarjeta, #ffffff)'; e.currentTarget.style.borderColor = 'var(--borde, #cbd5e1)'; }}>
                        {t("common.cancel", "Cancelar")}
                      </button>
                      <button className="cities-primary" type="submit">
                        <FaCheck style={{ marginRight: 6 }} />
                        {t("admin.vehiclesManagement.modal.save", "Guardar vehículo")}
                      </button>
                    </div>
                  </form>
                </>
              ) : modal.type === "delete" ? (
                /* MODAL 2: CONFIRMAR ELIMINAR VEHÍCULO (ESTILO ALERT MODAL CATÁLOGO) */
                <div className="fleet-alert-content">
                  <button
                    type="button"
                    className="fleet-alert-close-btn"
                    onClick={close}
                    aria-label={t("common.close", "Cerrar")}
                  >
                    <FaTimes size={13} />
                  </button>
                  <div className="fleet-alert-icon-wrapper is-danger">
                    <FaTrash size={20} />
                  </div>
                  <h3 className="fleet-alert-title">
                    {t("admin.vehiclesManagement.deleteTitle", "Eliminar Vehículo")}
                  </h3>
                  <p className="fleet-alert-message">
                    {t(
                      "admin.vehiclesManagement.deleteText",
                      `¿Estás seguro de que deseas eliminar el vehículo ${modal.vehicle.nombre}? Esta acción no se puede deshacer.`,
                      { vehicle: modal.vehicle.nombre }
                    )}
                  </p>
                  <div className="fleet-alert-actions">
                    <button
                      type="button"
                      className="fleet-alert-btn-secondary"
                      onClick={close}
                    >
                      {t("common.cancel", "Cancelar")}
                    </button>
                    <button
                      className="fleet-alert-btn-danger"
                      type="button"
                      onClick={remove}
                    >
                      {t("common.delete", "Eliminar")}
                    </button>
                  </div>
                </div>
              ) : modal.type === "category_form" && !esEncargado ? (
                /* MODAL 3: CREAR / EDITAR CATEGORÍA (SOLO ADMIN GENERAL) */
                <>
                  <div className="cities-modal__head">
                    <div>
                      <p className="cities-eyebrow">
                        {t("categoriesManagement.title", "Categorías")}
                      </p>
                      <h2>
                        {modal.category
                          ? t("categoriesManagement.editTitle", "Editar Categoría")
                          : t("categoriesManagement.createTitle", "Nueva Categoría")}
                      </h2>
                    </div>
                    <button type="button" onClick={close}>
                      ×
                    </button>
                  </div>
                  <form
                    onSubmit={saveCategory}
                    className="incident-form"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 20,
                      padding: "10px 0",
                    }}
                  >
                    <div className="incident-field" style={{ marginBottom: 4 }}>
                      <span
                        className="incident-field-label"
                        style={{
                          fontSize: 14,
                          color: "var(--brand-primary)",
                          borderBottom: "2px solid var(--city-border)",
                          paddingBottom: 8,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {t("categoriesManagement.category", "Detalles de la Categoría")}
                      </span>
                    </div>

                    <div className="incident-grid-2" style={{ gap: "20px 24px" }}>
                      <div className="incident-field" style={{ gridColumn: "1 / -1" }}>
                        <span
                          className="incident-field-label"
                          style={{ fontWeight: 600, color: "var(--brand-text)" }}
                        >
                          {t("categoriesManagement.categoryName", "Nombre de la Categoría")} *
                        </span>
                        <input
                          value={categoryForm.nombre}
                          onChange={(e) =>
                            setCategoryForm({ ...categoryForm, nombre: e.target.value })
                          }
                          placeholder="Ej: Camionetas SUV, Sedán Ejecutivo..."
                          required
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            borderRadius: 10,
                            border: "1px solid var(--brand-border)",
                            fontSize: 15,
                            background: "var(--brand-surface)",
                          }}
                        />
                      </div>

                      <div className="incident-field" style={{ gridColumn: "1 / -1" }}>
                        <span
                          className="incident-field-label"
                          style={{ fontWeight: 600, color: "var(--brand-text)" }}
                        >
                          {t("categoriesManagement.description", "Descripción")} *
                        </span>
                        <textarea
                          value={categoryForm.descripcion}
                          onChange={(e) =>
                            setCategoryForm({ ...categoryForm, descripcion: e.target.value })
                          }
                          placeholder="Breve explicación de los tipos de vehículos que comprende esta categoría..."
                          rows={3}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            borderRadius: 10,
                            border: "1px solid var(--brand-border)",
                            fontSize: 15,
                            fontFamily: "inherit",
                            background: "var(--brand-surface)",
                            resize: "none",
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div className="incident-field" style={{ marginBottom: 4, marginTop: 10 }}>
                      <span
                        className="incident-field-label"
                        style={{
                          fontSize: 14,
                          color: "var(--brand-primary)",
                          borderBottom: "2px solid var(--city-border)",
                          paddingBottom: 8,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {t("categoriesManagement.suggestedRate", "Valores Sugeridos de Referencia")}
                      </span>
                    </div>

                    <div className="incident-grid-2" style={{ gap: "20px 24px" }}>
                      <div className="incident-field">
                        <span
                          className="incident-field-label"
                          style={{ fontWeight: 600, color: "var(--brand-text)" }}
                        >
                          {t("categoriesManagement.suggestedRate", "Tarifa Base Sugerida (COP)")}
                        </span>
                        <div style={{ position: "relative" }}>
                          <span
                            style={{
                              position: "absolute",
                              left: 16,
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: "var(--brand-secondary)",
                              fontWeight: 600,
                            }}
                          >
                            $
                          </span>
                          <input
                            type="number"
                            value={categoryForm.tarifaBaseSugerida || ""}
                            onChange={(e) =>
                              setCategoryForm({
                                ...categoryForm,
                                tarifaBaseSugerida: e.target.value,
                              })
                            }
                            placeholder="Ej: 160000"
                            style={{
                              width: "100%",
                              padding: "12px 16px 12px 36px",
                              borderRadius: 10,
                              border: "1px solid var(--brand-border)",
                              fontSize: 15,
                              background: "var(--brand-surface)",
                            }}
                          />
                        </div>
                        <small style={{ color: "var(--city-muted, #64748b)", fontSize: 11 }}>
                          {t(
                            "categoriesManagement.suggestedRateHint",
                            "Valor de referencia pre-cargado al crear vehículos en esta categoría"
                          )}
                        </small>
                      </div>

                      <div className="incident-field">
                        <span
                          className="incident-field-label"
                          style={{ fontWeight: 600, color: "var(--brand-text)" }}
                        >
                          {t("categoriesManagement.suggestedDeposit", "Depósito de Garantía Sugerido (COP)")}
                        </span>
                        <div style={{ position: "relative" }}>
                          <span
                            style={{
                              position: "absolute",
                              left: 16,
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: "var(--brand-secondary)",
                              fontWeight: 600,
                            }}
                          >
                            $
                          </span>
                          <input
                            type="number"
                            value={categoryForm.depositoGarantiaSugerido || ""}
                            onChange={(e) =>
                              setCategoryForm({
                                ...categoryForm,
                                depositoGarantiaSugerido: e.target.value,
                              })
                            }
                            placeholder="Ej: 700000"
                            style={{
                              width: "100%",
                              padding: "12px 16px 12px 36px",
                              borderRadius: 10,
                              border: "1px solid var(--brand-border)",
                              fontSize: 15,
                              background: "var(--brand-surface)",
                            }}
                          />
                        </div>
                        <small style={{ color: "var(--city-muted, #64748b)", fontSize: 11 }}>
                          {t(
                            "categoriesManagement.suggestedDepositHint",
                            "Valor sugerido de depósito en garantía"
                          )}
                        </small>
                      </div>

                      <div className="incident-field" style={{ gridColumn: "1 / -1" }}>
                        <span
                          className="incident-field-label"
                          style={{ fontWeight: 600, color: "var(--brand-text)" }}
                        >
                          {t("categoriesManagement.status", "Estado Operativo")}
                        </span>
                        <select
                          value={categoryForm.activo !== false ? "true" : "false"}
                          onChange={(e) =>
                            setCategoryForm({
                              ...categoryForm,
                              activo: e.target.value === "true",
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            borderRadius: 10,
                            border: "1px solid var(--brand-border)",
                            fontSize: 15,
                            background: "var(--brand-surface)",
                            fontWeight: 600,
                            color:
                              categoryForm.activo !== false
                                ? "var(--brand-green, #10b981)"
                                : "var(--brand-red, #ef4444)",
                          }}
                        >
                          <option value="true">
                            {t("categoriesManagement.active", "Activa")}
                          </option>
                          <option value="false">
                            {t("categoriesManagement.inactive", "Inactiva")}
                          </option>
                        </select>
                      </div>
                    </div>

                    <div
                      className="cities-modal__actions"
                      style={{
                        marginTop: 32,
                        paddingTop: 20,
                        borderTop: "1px solid var(--city-border)",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 16,
                      }}
                    >
                      <button
                        type="button"
                        onClick={close}
                        style={{
                          padding: "12px 24px",
                          borderRadius: 10,
                          fontWeight: 600,
                          background: "transparent",
                          color: "var(--brand-text)",
                          border: "1px solid var(--brand-border)",
                          cursor: "pointer",
                        }}
                      >
                        {t("common.cancel", "Cancelar")}
                      </button>
                      <button
                        type="submit"
                        style={{
                          padding: "12px 28px",
                          borderRadius: 10,
                          fontWeight: 600,
                          background: "var(--brand-primary)",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
                        }}
                      >
                        {t("common.save", "Guardar categoría")}
                      </button>
                    </div>
                  </form>
                </>
              ) : modal.type === "delete_category" && !esEncargado ? (
                /* MODAL 4: CONFIRMAR ELIMINAR CATEGORÍA (ESTILO ALERT MODAL CATÁLOGO) */
                <div className="fleet-alert-content">
                  <button
                    type="button"
                    className="fleet-alert-close-btn"
                    onClick={close}
                    aria-label={t("common.close", "Cerrar")}
                  >
                    <FaTimes size={13} />
                  </button>
                  <div className="fleet-alert-icon-wrapper is-danger">
                    <FaTrash size={20} />
                  </div>
                  <h3 className="fleet-alert-title">
                    {t("categoriesManagement.deleteTitle", "Eliminar Categoría")}
                  </h3>
                  <p className="fleet-alert-message">
                    {t(
                      "categoriesManagement.deleteConfirm",
                      `¿Estás seguro de que deseas eliminar la categoría "${modal.category.nombre}"? Esta acción no se puede deshacer.`,
                      { name: modal.category.nombre }
                    )}
                  </p>
                  <div className="fleet-alert-actions">
                    <button
                      type="button"
                      className="fleet-alert-btn-secondary"
                      onClick={close}
                    >
                      {t("common.cancel", "Cancelar")}
                    </button>
                    <button
                      className="fleet-alert-btn-danger"
                      type="button"
                      onClick={removeCategory}
                    >
                      {t("common.delete", "Eliminar")}
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        )}

        {/* MODAL 5: ZOOM DE IMAGEN */}
        {zoomImage && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(5px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 99999,
              padding: 20,
            }}
            onClick={() => setZoomImage(null)}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: 16,
                padding: 20,
                maxWidth: 640,
                width: "100%",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    {zoomImage.title}
                  </h3>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    Vista ampliada del vehículo
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setZoomImage(null)}
                  style={{
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    fontWeight: 700,
                    color: "#64748b",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                  }}
                >
                  ✕
                </button>
              </div>
              <div
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 10,
                }}
              >
                <img
                  src={zoomImage.url}
                  alt={zoomImage.title}
                  style={{
                    maxWidth: "100%",
                    maxHeight: 480,
                    objectFit: "contain",
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
