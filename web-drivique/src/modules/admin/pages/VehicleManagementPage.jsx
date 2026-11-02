

import { FaCar, FaEye, FaTimes } from 'react-icons/fa'






import { getPicoYPlacaInfo, vehicleManagementService } from '../../../services/vehicleManagementService'



import ManagementSidebar from "../components/ManagementSidebar";
import "./CityManagementPage.css";
import "./VehicleManagementPage.css";
import ZoomImage from './VehicleManagementPage/ZoomImage'
import DeleteCategoryType from './VehicleManagementPage/DeleteCategoryType'
import IncidentForm from './VehicleManagementPage/IncidentForm'
import DeleteType from './VehicleManagementPage/DeleteType'
import FleetModalForm from './VehicleManagementPage/FleetModalForm'
import VehiculosActiveTab from './VehicleManagementPage/VehiculosActiveTab'
import FlotasActiveTab from './VehicleManagementPage/FlotasActiveTab'
import FleetAttachedTabs from './VehicleManagementPage/FleetAttachedTabs'
import BranchTopbar from './VehicleManagementPage/BranchTopbar'
import useVehicleManagementLogic1 from './VehicleManagementPage/useVehicleManagementLogic1'






// eslint-disable-next-line no-unused-vars -- sin usar a la espera de la gestion de fotos de vehiculos
const textToList = (text) =>
  String(text || "")
    .split(",")
    .map((nombre) => nombre.trim())
    .filter(Boolean)
    .map((nombre) => ({ nombre, icono: "FaCheckCircle" }));



const normalizeBranch = (value) =>
  String(value || "").trim().toLocaleLowerCase();

export default function VehicleManagementPage() {
  const { t, tema, moneda, tasaUSD, user, esEncargado, sucursalAsignada, assignedBranchKey, activeTab, setActiveTab, setVehicles, search, setSearch, branchFilter, setBranchFilter, stateFilter, setStateFilter, modal, setModal, form, setForm, categoryForm, setCategoryForm, error, setError, notice, setNotice, zoomImage, setZoomImage, branches, fleetLookups, filteredVehicles, filteredCategories, getVehiclesInMyBranchCount, getTotalVehiclesInCategory, vehicleHeaders, vehicleExportData, categoryExportData, close, handleToggleCategory, activeCategoriesForForm, openCreate, openEdit, openDetail, openCreateCategory, openEditCategory, saveCategory, removeCategory } = useVehicleManagementLogic1()

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
          <BranchTopbar esEncargado={esEncargado} t={t} user={user} />

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
          <FleetAttachedTabs activeTab={activeTab} esEncargado={esEncargado} openCreate={openCreate} openCreateCategory={openCreateCategory} setActiveTab={setActiveTab} sucursalAsignada={sucursalAsignada} t={t} />

          {/* TAB 3: CATEGORÍAS (Diferenciadas estrictamente por rol) */}
          {activeTab === "flotas" && (
            <FlotasActiveTab categoryExportData={categoryExportData} esEncargado={esEncargado} filteredCategories={filteredCategories} getTotalVehiclesInCategory={getTotalVehiclesInCategory} getVehiclesInMyBranchCount={getVehiclesInMyBranchCount} handleToggleCategory={handleToggleCategory} moneda={moneda} openCreateCategory={openCreateCategory} openEditCategory={openEditCategory} search={search} setModal={setModal} setSearch={setSearch} sucursalAsignada={sucursalAsignada} t={t} tasaUSD={tasaUSD} />
          )}

          {/* TAB 4: VEHÍCULOS */}
          {activeTab === "vehiculos" && (
            <VehiculosActiveTab branchFilter={branchFilter} branches={branches} esEncargado={esEncargado} filteredVehicles={filteredVehicles} moneda={moneda} openDetail={openDetail} openEdit={openEdit} search={search} setBranchFilter={setBranchFilter} setModal={setModal} setSearch={setSearch} setStateFilter={setStateFilter} setZoomImage={setZoomImage} stateFilter={stateFilter} sucursalAsignada={sucursalAsignada} t={t} tasaUSD={tasaUSD} vehicleExportData={vehicleExportData} vehicleHeaders={vehicleHeaders} />
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

                  <FleetModalForm activeCategoriesForForm={activeCategoriesForForm} branches={branches} close={close} error={error} esEncargado={esEncargado} fleetLookups={fleetLookups} form={form} modal={modal} save={save} setForm={setForm} t={t} />
                </>
              ) : modal.type === "delete" ? (
                /* MODAL 2: CONFIRMAR ELIMINAR VEHÍCULO (ESTILO ALERT MODAL CATÁLOGO) */
                <DeleteType close={close} modal={modal} remove={remove} t={t} />
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
                  <IncidentForm categoryForm={categoryForm} close={close} saveCategory={saveCategory} setCategoryForm={setCategoryForm} t={t} />
                </>
              ) : modal.type === "delete_category" && !esEncargado ? (
                /* MODAL 4: CONFIRMAR ELIMINAR CATEGORÍA (ESTILO ALERT MODAL CATÁLOGO) */
                <DeleteCategoryType close={close} modal={modal} removeCategory={removeCategory} t={t} />
              ) : null}
            </section>
          </div>
        )}

        {/* MODAL 5: ZOOM DE IMAGEN */}
        {zoomImage && (
          <ZoomImage setZoomImage={setZoomImage} zoomImage={zoomImage} />
        )}
      </main>
    </div>
  );
}
