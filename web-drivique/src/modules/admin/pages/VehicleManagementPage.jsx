import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCar, FaCheck, FaEye, FaFileExcel, FaFilePdf, FaPlus, FaPrint, FaTimes, FaTrash } from "react-icons/fa";
import { useLanding } from "../../landing/LandingContext";
import { useAuthStore } from "../../../store/authStore";
import { ROLES } from "../../auth/utils/accessControl";
import { branchManagementService } from "../../../services/branchManagementService";
import { branchCategoryService } from "../../../services/branchCategoryService";
import { hasMatchingBranch } from "../../../services/accessAuditService";
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
  marca: "",
  modelo: "",
  vin: "",
  kilometraje: 0,
  placa: "",
  categoria: "",
  transmision: "",
  combustible: "",
  color: "",
  ano: "",
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
// eslint-disable-next-line no-unused-vars -- sin usar a la espera de la gestion de fotos de vehiculos
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
    user?.sucursalAsignada || user?.branchName || user?.sucursal || user?.sucursalId || "";
  const assignedBranchKey = normalizeBranch(sucursalAsignada);

  // Pestañas activas: Inicia en 'vehiculos'
  const [activeTab, setActiveTab] = useState("vehiculos");

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
// eslint-disable-next-line no-unused-vars -- sin usar a la espera de la gestion de fotos de vehiculos
  const [updatingVehicleId, setUpdatingVehicleId] = useState(null);

  const [dataVersion, setDataVersion] = useState(0);
  useEffect(() => {
    Promise.all([
      branchManagementService.refresh(),
      vehicleManagementService.refresh(),
      branchCategoryService.refresh(),
    ])
      .then(([, vehiclesList, categoriesList]) => {
        setVehicles(vehiclesList);
        setCategories(categoriesList);
        setBranchCategoriesMap(branchCategoryService.getBranchCategoriesMap());
        setDataVersion((v) => v + 1);
      })
      .catch((caught) => console.error("No se pudo cargar la flota:", caught));
  }, []);

  const branches = useMemo(
    () =>
      branchManagementService
        .list()
        .filter((b) => b.estado !== "inactiva")
        .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [dataVersion]
  );
  const fleetLookups = useMemo(() => vehicleManagementService.lookups(), [dataVersion]);

  // Mapeo / Filtro de vehículos
  const filteredVehicles = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return vehicles
      .filter((vehicle) => {
        if (vehicle.activo === false || vehicle.isActive === false) return false;
        if (esEncargado && (!sucursalAsignada || !hasMatchingBranch(vehicle.sucursal, sucursalAsignada))) return false;

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

// eslint-disable-next-line no-unused-vars -- sin usar a la espera de la gestion de fotos de vehiculos
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
      vehicle.ano || vehicle.año || "—",
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
        ? t('hc3.fleet_title', { defaultValue: 'Flota de Vehículos - {{sucursal}}', sucursal: sucursalAsignada })
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
  const handleToggleCategory = async (catName, currentEnabled) => {
    const nextState = !currentEnabled;
    try {
      await branchCategoryService.toggleBranchCategory(sucursalAsignada, catName, nextState);
    } catch (caught) {
      setNotice(caught.message);
      return;
    }
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
    if (esEncargado && (!sucursalAsignada || !hasMatchingBranch(vehicle.sucursal, sucursalAsignada))) return;
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

  const openDetail = (vehicle) => {
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
    setModal({ type: "form", vehicle, readOnly: true });
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

// eslint-disable-next-line no-unused-vars -- sin usar a la espera de la gestion de fotos de vehiculos
  const handleQuickStatusChange = async (vehicleId, newState) => {
    try {
      setUpdatingVehicleId(vehicleId);
      if (vehicleManagementService.activeReservationCount(vehicleId) > 0 && newState !== "reservado") {
        alert(t('hc.no_puedes_cambiar_el_estado_manualment', 'No puedes cambiar el estado manualmente porque este vehículo tiene una reserva activa.'));
        return;
      }
      setVehicles(await vehicleManagementService.changeState(vehicleId, newState));
      setNotice(t('hc3.vehicle_state_updated', { defaultValue: 'Estado del vehículo actualizado a {{estado}}.', estado: newState === 'disponible' ? t('hc3.state_available', 'Disponible') : t('hc3.state_maintenance', 'Mantenimiento') }));
    } catch (caught) {
      console.error("Error updating status:", caught);
      alert(caught.message || t('hc2.no_se_pudo_cambiar_el_estado', 'No se pudo cambiar el estado.'));
    } finally {
      setUpdatingVehicleId(null);
    }
  };

  const saveCategory = async (e) => {
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
    try {
      const updated = await branchCategoryService.saveCategory(payload);
      setCategories(updated);
      setBranchCategoriesMap(branchCategoryService.getBranchCategoriesMap());
      setNotice(
        categoryForm.id
          ? t("categoriesManagement.updatedNotice", "Categoría actualizada correctamente")
          : t("categoriesManagement.createdNotice", "Categoría creada correctamente")
      );
      close();
    } catch (caught) {
      setError(caught.message);
    }
  };

  const removeCategory = async () => {
    if (!modal?.category?.id) return;
    try {
      const updated = await branchCategoryService.deleteCategory(modal.category.id);
      setCategories(updated);
      setBranchCategoriesMap(branchCategoryService.getBranchCategoriesMap());
      setNotice(t("categoriesManagement.deletedNotice", "Categoría eliminada correctamente"));
      close();
    } catch (caught) {
      setError(caught.message);
    }
  };

  const save = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      sucursal: esEncargado ? sucursalAsignada : form.sucursal,
    };
    try {
      if (modal.vehicle)
        setVehicles(await vehicleManagementService.update(modal.vehicle.id, payload));
      else setVehicles(await vehicleManagementService.create(payload));
      setNotice(
        t(
          modal.vehicle
            ? "admin.vehiclesManagement.messages.updated"
            : "admin.vehiclesManagement.messages.created",
          t('hc2.vehiculo_guardado_correctamente', 'Vehículo guardado correctamente')
        )
      );
      close();
    } catch (caught) {
      setError(
        t(
          `admin.vehiclesManagement.errors.${caught.message}`,
          caught.message || t('hc2.error_al_procesar_vehiculo', 'Error al procesar vehículo')
        )
      );
    }
  };

  const remove = async () => {
    if (esEncargado && normalizeBranch(modal.vehicle.sucursal) !== assignedBranchKey) return;
    try {
      setVehicles(await vehicleManagementService.remove(modal.vehicle.id));
      setNotice(
        t("admin.vehiclesManagement.messages.deleted", "Vehículo eliminado correctamente")
      );
      close();
    } catch (caught) {
      setModal(null);
      setNotice(caught.message);
    }
  };

// eslint-disable-next-line no-unused-vars -- sin usar a la espera de la gestion de fotos de vehiculos
  const addInsurance = () =>
    setForm({ ...form, seguros: [...form.seguros, { nombre: "", precio: 0 }] });

// eslint-disable-next-line no-unused-vars -- sin usar a la espera de la gestion de fotos de vehiculos
  const updateInsurance = (index, key, value) =>
    setForm({
      ...form,
      seguros: form.seguros.map((insurance, current) =>
        current === index
          ? { ...insurance, [key]: key === "precio" ? Number(value) : value }
          : insurance
      ),
    });

// eslint-disable-next-line no-unused-vars -- sin usar a la espera de la gestion de fotos de vehiculos
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
          t('hc2.las_imagenes_no_deben_superar_1mb', 'Las imágenes no deben superar 1MB')
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

// eslint-disable-next-line no-unused-vars -- sin usar a la espera de la gestion de fotos de vehiculos
  const handleReplaceImage = async (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setError(
        t(
          "admin.vehiclesManagement.errors.imageSize",
          t('hc2.las_imagenes_no_deben_superar_1mb', 'Las imágenes no deben superar 1MB')
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
      setError(t('hc.error_al_procesar_la_imagen_selecciona', 'Error al procesar la imagen seleccionada'));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

// eslint-disable-next-line no-unused-vars -- sin usar a la espera de la gestion de fotos de vehiculos
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
              {user && (
                <div className="branch-user-profile-chip">
                  <div className="branch-user-avatar">
                    {(user?.nombre || user?.correo || "A").charAt(0).toUpperCase()}
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
                    <span className="branch-user-role">
                      {user?.rol || "administrador"}
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
                á—
              </button>
            </div>
          )}

          {/* Pestañas de Secciones y Botón Crear a la derecha */}
          <div className="fleet-attached-tabs">
            <div className="fleet-tabs-nav">
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
              {activeTab === "flotas" && !esEncargado && (
                <button
                  className="cities-primary fleet-btn-create-tab"
                  type="button"
                  onClick={openCreateCategory}
                >
                  {t("fleetVehicles.createCategory", "+ Crear Categoría")}
                </button>
              )}
              {activeTab === "vehiculos" && esEncargado && (
                <button
                  className="cities-primary fleet-btn-create-tab"
                  type="button"
                  onClick={openCreate}
                  disabled={!sucursalAsignada}
                >
                  {t("fleetVehicles.createVehicle", "+ Crear Vehículo")}
                </button>
              )}
            </div>
          </div>

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
                                  {gf.descripcion}
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
                        {modal.readOnly ? <FaEye aria-hidden="true" /> : <FaCar aria-hidden="true" />}
                        {modal.readOnly ? t('hc2.modo_auditoria_admin_general_solo_lect', 'Modo Auditoría (Admin General) - Solo Lectura') : modal.vehicle ? t('hc2.modificacion_de_ficha', 'Modificación de Ficha') : "Registro de Flota"}
                      </span>
                      <h2 className="fleet-modal-title">
                        {modal.vehicle ? (form.nombre || t('hc2.editar_vehiculo', 'Editar Vehículo')) : t('hc2.nuevo_vehiculo', 'Nuevo Vehículo')}
                      </h2>
                      {modal.vehicle && (
                        <div className="fleet-modal-subtags">
                          <span className="fleet-badge-plate">{form.placa || t('hc2.sin_placa', 'SIN PLACA')}</span>
                          <span className="fleet-badge-branch">{form.sucursal || sucursalAsignada}</span>
                          {form.categoria && <span className="fleet-badge-cat">{form.categoria}</span>}
                        </div>
                      )}
                    </div>
                    <button type="button" className="fleet-modal-close-btn" onClick={close} aria-label={t('hc4.cerrar', 'Cerrar')}>
                      <FaTimes />
                    </button>
                  </div>

                  <form onSubmit={save} className="fleet-modal-form">
                    <div className="fleet-modal-body" style={{ padding: '24px 32px', background: 'var(--bg-tarjeta, #ffffff)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                        
                        {/* IMAGEN */}
                        <div style={{ gridColumn: '1 / -1', marginBottom: '8px' }}>
                          {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => (
                            <div key={idx} style={{ marginBottom: 12 }}>
                              <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>
                                {idx === 0
                                  ? t('hc.url_de_la_imagen_principal', 'URL de la imagen principal')
                                  : t('hc6.url_de_la_imagen_n', { defaultValue: 'URL de la imagen {{n}} (opcional)', n: idx + 1 })}
                              </label>
                              <input
                                type="url"
                                style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }}
                                placeholder="https://..."
                                value={form.imagenes?.[idx] || ""}
                                onChange={(e) => {
                                  const next = [...(form.imagenes || [])];
                                  while (next.length <= idx) next.push("");
                                  next[idx] = e.target.value;
                                  setForm({ ...form, imagenes: next });
                                }}
                              />
                            </div>
                          ))}
                          {(form.imagenes || []).some(Boolean) && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                              {(form.imagenes || []).slice(0, 8).map((url, idx) => url ? (
                                <img key={idx} src={url} alt={'Vista previa ' + (idx + 1)} style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 10 }} />
                              ) : null)}
                            </div>
                          )}
                        </div>

                        {/* INPUTS ESTILO REFERENCIA */}
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t('hc4.marca', 'Marca *')}</label>
                          <select disabled={Boolean(modal.vehicle)} required style={{ ...{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }, cursor: 'pointer' }} value={form.marca || ""} onChange={(e) => setForm({ ...form, marca: e.target.value })}>
                            <option value="" disabled>{t("admin.vehiclesManagement.modal.select", "Seleccionar")}</option>
                            {fleetLookups.brands.map((b) => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t('hc4.modelo', 'Modelo *')}</label>
                          <input disabled={Boolean(modal.vehicle)} required style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }} value={form.modelo || ""} onChange={(e) => setForm({ ...form, modelo: e.target.value })} />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>VIN (17 caracteres) *</label>
                          <input disabled={Boolean(modal.vehicle)} required minLength={17} maxLength={17} style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }} value={form.vin || ""} onChange={(e) => setForm({ ...form, vin: e.target.value.toUpperCase() })} />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t('hc4.kilometraje', 'Kilometraje *')}</label>
                          <input type="number" min="0" required style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }} value={form.kilometraje ?? 0} onChange={(e) => setForm({ ...form, kilometraje: e.target.value })} />
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
                            <input type="number" min="1990" max="2030" style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }} value={form.ano} onChange={(e) => setForm({ ...form, ano: e.target.value })} placeholder={t("admin.vehiclesManagement.modal.placeholderYear", "Ej: 2024")} required />
                          </div>
                        )}

                        {/* If esEncargado is false, Año gets pushed to next spot to keep grid aligned */}
                        {!esEncargado && (
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.year", "Año *")}</label>
                            <input type="number" min="1990" max="2030" style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none' }} value={form.ano} onChange={(e) => setForm({ ...form, ano: e.target.value })} placeholder={t("admin.vehiclesManagement.modal.placeholderYear", "Ej: 2024")} required />
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
                            {fleetLookups.transmissions.map((name) => <option key={name} value={name}>{name}</option>)}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.fuel", "Combustible *")}</label>
                          <select style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none', cursor: 'pointer' }} value={form.combustible} onChange={(e) => setForm({ ...form, combustible: e.target.value })} required>
                            <option value="" disabled>{t("admin.vehiclesManagement.modal.select", "Seleccionar")}</option>
                            {fleetLookups.fuels.map((name) => <option key={name} value={name}>{name}</option>)}
                          </select>
                        </div>

                        

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: 'var(--texto-second, #64748b)', marginBottom: '6px', fontWeight: 600 }}>{t("admin.vehiclesManagement.modal.restriction", "Pico y Placa *")}</label>
                          <select style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-seccion1, #f8fafc)', border: 'none', borderRadius: '6px', fontSize: '13px', color: 'var(--texto-primary, #334155)', outline: 'none', cursor: 'pointer' }} value={form.aplicaPicoYPlaca || ""} onChange={(e) => setForm({ ...form, aplicaPicoYPlaca: e.target.value })}>
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
                            <option value="mantenimiento">{t("admin.vehiclesManagement.states.en mantenimiento", "En Mantenimiento")}</option>
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
                      {modal.readOnly ? (
                        <button className="cities-primary" type="button" onClick={close}>
                          {t("common.close", "Cerrar Detalle")}
                        </button>
                      ) : (
                        <>
                          <button type="button" onClick={close} style={{ border: '1px solid var(--borde, #cbd5e1)', background: 'var(--bg-tarjeta, #ffffff)', borderRadius: '6px', padding: '8px 16px', color: 'var(--texto-primary, #475569)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-seccion1, #f1f5f9)'; e.currentTarget.style.borderColor = 'var(--texto-second, #94a3b8)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-tarjeta, #ffffff)'; e.currentTarget.style.borderColor = 'var(--borde, #cbd5e1)'; }}>
                            {t("common.cancel", "Cancelar")}
                          </button>
                          <button className="cities-primary" type="submit">
                            <FaCheck style={{ marginRight: 6 }} />
                            {t("admin.vehiclesManagement.modal.save", "Guardar vehículo")}
                          </button>
                        </>
                      )}
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
                      t('hc3.vehicle_delete_confirm', { defaultValue: '¿Estás seguro de que deseas eliminar el vehículo {{nombre}}? Esta acción no se puede deshacer.', nombre: modal.vehicle.nombre }),
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
                      á—
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
                          placeholder={t('hc.ej_camionetas_suv_sedan_ejecutivo', 'Ej: Camionetas SUV, Sedán Ejecutivo...')}
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
                          placeholder={t('hc.breve_explicacion_de_los_tipos_de_vehi', 'Breve explicación de los tipos de vehículos que comprende esta categoría...')}
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
                            t('hc2.valor_de_referencia_pre_cargado_al_cre', 'Valor de referencia pre-cargado al crear vehículos en esta categoría')
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
                            t('hc2.valor_sugerido_de_deposito_en_garantia', 'Valor sugerido de depósito en garantía')
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
                          boxShadow: "0 4px 12px rgba(var(--brand-primary-rgb),0.2)",
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
                      { defaultValue: '¿Estás seguro de que deseas eliminar la categoría "{{name}}"? Esta acción no se puede deshacer.', name: modal.category.nombre }
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
                  âœ•
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
