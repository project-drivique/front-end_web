import { useTranslation } from 'react-i18next'
import { useLanding } from '../../../landing/LandingContext'
import { useAuthStore } from '../../../../store/authStore'
import { ROLES } from '../../../auth/utils/accessControl'
import { useState, useEffect, useMemo } from 'react'
import { vehicleManagementService } from '../../../../services/vehicleManagementService'
import { branchCategoryService } from '../../../../services/branchCategoryService'
import { branchManagementService } from '../../../../services/branchManagementService'
import { hasMatchingBranch } from '../../../../services/accessAuditService'
import { formatCurrency } from '../../../../utils/currencyUtils'

const normalizeBranch = (value) =>
  String(value || "").trim().toLocaleLowerCase();
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
const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
const listToText = (items) =>
  (items || []).map((item) => item.nombre).join(", ");

export default function useVehicleManagementLogic1() {
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
        gf.descripcion || "—",
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

  return { t, tema, moneda, tasaUSD, user, esEncargado, sucursalAsignada, assignedBranchKey, activeTab, setActiveTab, setVehicles, search, setSearch, branchFilter, setBranchFilter, stateFilter, setStateFilter, modal, setModal, form, setForm, categoryForm, setCategoryForm, error, setError, notice, setNotice, zoomImage, setZoomImage, branches, fleetLookups, filteredVehicles, filteredCategories, getVehiclesInMyBranchCount, getTotalVehiclesInCategory, vehicleHeaders, vehicleExportData, categoryExportData, close, handleToggleCategory, activeCategoriesForForm, openCreate, openEdit, openDetail, openCreateCategory, openEditCategory, saveCategory, removeCategory }
}
