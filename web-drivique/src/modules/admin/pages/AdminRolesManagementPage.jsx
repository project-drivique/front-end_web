import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FaBuilding,
  FaCheckCircle,
  FaEdit,
  FaExclamationTriangle,
  FaFileExcel,
  FaFilePdf,
  FaKey,
  FaPlus,
  FaPrint,
  FaSearch,
  FaShieldAlt,
  FaTimesCircle,
  FaToggleOff,
  FaToggleOn,
  FaTrash,
  FaUserPlus,
  FaUserShield,
  FaUsers,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { useLanding } from "../../landing/LandingContext";
import { useAuthStore } from "../../../store/authStore";
import { roleManagementService } from "../../../services/roleManagementService";
import { branchManagementService } from "../../../services/branchManagementService";
import {
  exportExcel,
  exportPdf,
  printTable,
} from "../../../utils/listExportUtils";
import MenuConfiguracion from "../../../components/MenuConfiguracion";
import ManagementSidebar from "../components/ManagementSidebar";
import "./CityManagementPage.css";
import "./AdminRolesManagementPage.css";

const MODULE_KEYS = [
  { key: "vehicles", labelKey: "admin.roles.modules.vehicles" },
  { key: "reservations", labelKey: "admin.roles.modules.reservations" },
  { key: "users", labelKey: "admin.roles.modules.users" },
  { key: "contracts", labelKey: "admin.roles.modules.contracts" },
  { key: "cities", labelKey: "admin.roles.modules.cities" },
  { key: "branches", labelKey: "admin.roles.modules.branches" },
  { key: "audit", labelKey: "admin.roles.modules.audit" },
];

export default function AdminRolesManagementPage() {
  const { t } = useTranslation();
  const { tema, divisa, tasaUSD } = useLanding();
  const user = useAuthStore((state) => state.usuario);
  const esModoOscuro = tema === "oscuro";

  const [activeTab, setActiveTab] = useState("accounts"); // 'accounts' | 'roles'
  const [accountsList, setAccountsList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [search, setSearch] = useState("");

  // Filtros Cuentas
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");

  const [notice, setNotice] = useState("");
  const [errorModal, setErrorModal] = useState("");

  // Modales Cuentas
  const [modalCrearCuenta, setModalCrearCuenta] = useState(false);
  const [modalEditarCuenta, setModalEditarCuenta] = useState(null);
  const [modalEliminarCuenta, setModalEliminarCuenta] = useState(null);

  // Modales Roles
  const [modalCrearRol, setModalCrearRol] = useState(false);
  const [modalEditarRol, setModalEditarRol] = useState(null);
  const [modalEliminarRol, setModalEliminarRol] = useState(null);

  // Formularios Cuentas
  const [formCuenta, setFormCuenta] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    rolId: "role-admin",
    sucursal: "Neiva",
  });

  // Formularios Roles
  const [formRol, setFormRol] = useState({
    nombre: "",
    descripcion: "",
    permisos: {
      vehicles: { ver: true, crear: false, editar: false, eliminar: false },
      reservations: { ver: true, crear: false, editar: false, eliminar: false },
      users: { ver: false, crear: false, editar: false, eliminar: false },
      contracts: { ver: false, crear: false, editar: false, eliminar: false },
      cities: { ver: false, crear: false, editar: false, eliminar: false },
      branches: { ver: false, crear: false, editar: false, eliminar: false },
      audit: { ver: false, crear: false, editar: false, eliminar: false },
    },
  });

  const sucursales = useMemo(
    () =>
      branchManagementService
        .list()
        .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [],
  );

  const cargarDatos = () => {
    setAccountsList(roleManagementService.listAccounts());
    setRolesList(roleManagementService.listRoles());
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrado de Cuentas
  const cuentasFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase();
    return accountsList.filter((acc) => {
      const matchRole =
        roleFilter === "all" ||
        acc.rolId === roleFilter ||
        acc.rolCodigo === roleFilter;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? acc.activo : !acc.activo);
      const matchBranch =
        branchFilter === "all" || acc.sucursal === branchFilter;

      const matchSearch =
        !term ||
        acc.nombre?.toLowerCase().includes(term) ||
        acc.correo?.toLowerCase().includes(term) ||
        acc.telefono?.toLowerCase().includes(term);

      return matchRole && matchStatus && matchBranch && matchSearch;
    });
  }, [accountsList, search, roleFilter, statusFilter, branchFilter]);

  // Filtrado de Roles
  const rolesFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rolesList.filter(
      (r) =>
        !term ||
        r.nombre?.toLowerCase().includes(term) ||
        r.descripcion?.toLowerCase().includes(term),
    );
  }, [rolesList, search]);

  // --- Handlers Cuentas ---
  const handleCrearCuenta = (e) => {
    e.preventDefault();
    try {
      setErrorModal("");
      const created = roleManagementService.createAccount(formCuenta, user);
      setNotice(
        t(
          "admin.roles.accountCreated",
          `Cuenta de ${formCuenta.nombre} creada exitosamente. Notificación con credenciales enviada.`,
        ),
      );
      setModalCrearCuenta(false);
      setFormCuenta({
        nombre: "",
        correo: "",
        telefono: "",
        rolId: "role-admin",
        sucursal: "Neiva",
      });
      cargarDatos();
    } catch (err) {
      if (err.message === "mailAlreadyExists") {
        setErrorModal(
          "El correo ya está asignado a otra cuenta administrativa.",
        );
      } else if (err.message === "branchRequiredForManager") {
        setErrorModal("Debes asignar una sucursal obligatoria al Encargado.");
      } else {
        setErrorModal("Error al crear la cuenta administrativa.");
      }
    }
  };

  const openEditarCuenta = (acc) => {
    setErrorModal("");
    setFormCuenta({
      id: acc.id,
      nombre: acc.nombre,
      correo: acc.correo,
      telefono: acc.telefono,
      rolId: acc.rolId,
      sucursal: acc.sucursal || "Neiva",
    });
    setModalEditarCuenta(acc);
  };

  const handleEditarCuenta = (e) => {
    e.preventDefault();
    try {
      setErrorModal("");
      roleManagementService.updateAccount(formCuenta.id, formCuenta, user);
      setNotice(
        t(
          "admin.roles.accountUpdated",
          `Cuenta de ${formCuenta.nombre} actualizada.`,
        ),
      );
      setModalEditarCuenta(null);
      cargarDatos();
    } catch (err) {
      if (err.message === "branchRequiredForManager") {
        setErrorModal("Debes asignar una sucursal obligatoria al Encargado.");
      } else {
        setErrorModal("Error al actualizar la cuenta.");
      }
    }
  };

  const handleToggleActivoCuenta = (acc) => {
    roleManagementService.toggleActiveAccount(acc.id, user);
    setNotice(
      t(
        acc.activo
          ? "admin.roles.accountDeactivated"
          : "admin.roles.accountActivated",
        `Cuenta de ${acc.nombre} ${acc.activo ? "desactivada" : "activada"}.`,
      ),
    );
    cargarDatos();
  };

  const handleEliminarCuenta = (acc) => {
    roleManagementService.removeAccount(acc.id, user);
    setNotice(
      t("admin.roles.accountDeleted", `Cuenta de ${acc.nombre} eliminada.`),
    );
    setModalEliminarCuenta(null);
    cargarDatos();
  };

  // --- Handlers Roles ---
  const handleCrearRol = (e) => {
    e.preventDefault();
    try {
      setErrorModal("");
      roleManagementService.createRole(formRol, user);
      setNotice(
        t(
          "admin.roles.roleCreated",
          `Rol ${formRol.nombre} creado exitosamente.`,
        ),
      );
      setModalCrearRol(false);
      cargarDatos();
    } catch (err) {
      if (err.message === "roleAlreadyExists") {
        setErrorModal("Ya existe un rol registrado con este nombre.");
      } else {
        setErrorModal("Error al crear el rol.");
      }
    }
  };

  const openEditarRol = (r) => {
    setErrorModal("");
    setFormRol({
      id: r.id,
      nombre: r.nombre,
      descripcion: r.descripcion,
      permisos: r.permisos,
    });
    setModalEditarRol(r);
  };

  const handleEditarRol = (e) => {
    e.preventDefault();
    try {
      setErrorModal("");
      roleManagementService.updateRole(formRol.id, formRol, user);
      setNotice(
        t(
          "admin.roles.roleUpdated",
          `Permisos del rol ${formRol.nombre} actualizados.`,
        ),
      );
      setModalEditarRol(null);
      cargarDatos();
    } catch (err) {
      setErrorModal("Error al actualizar el rol.");
    }
  };

  const handleEliminarRol = (r) => {
    try {
      setErrorModal("");
      roleManagementService.removeRole(r.id, user);
      setNotice(t("admin.roles.roleDeleted", `Rol ${r.nombre} eliminado.`));
      setModalEliminarRol(null);
      cargarDatos();
    } catch (err) {
      if (err.message === "roleHasAssignedAccounts") {
        setErrorModal(
          t(
            "admin.roles.hasAssignedAccounts",
            "No se puede eliminar un rol que tiene cuentas asignadas. Reasigna las cuentas primero.",
          ),
        );
      } else if (err.message === "systemRoleCannotBeDeleted") {
        setErrorModal("Los roles base del sistema no pueden ser eliminados.");
      } else {
        setErrorModal("Error al eliminar el rol.");
      }
    }
  };

  const handleTogglePermiso = (moduleKey, actionKey) => {
    setFormRol((prev) => {
      const currentModule = prev.permisos[moduleKey] || {
        ver: false,
        crear: false,
        editar: false,
        eliminar: false,
      };
      return {
        ...prev,
        permisos: {
          ...prev.permisos,
          [moduleKey]: {
            ...currentModule,
            [actionKey]: !currentModule[actionKey],
          },
        },
      };
    });
  };

  // --- Exportación ---
  const headersExportAccounts = [
    "Nombre",
    "Correo",
    "Teléfono",
    "Rol Asignado",
    "Sucursal",
    "Estado",
  ];
  const rowsExportAccounts = cuentasFiltradas.map((acc) => [
    acc.nombre,
    acc.correo,
    acc.telefono,
    acc.rolNombre,
    acc.sucursal || "N/A",
    acc.activo ? "Activo" : "Inactivo",
  ]);

  const exportDataAccounts = {
    title: "Cuentas Administrativas — Plataforma Drivique",
    headers: headersExportAccounts,
    rows: rowsExportAccounts,
    items: cuentasFiltradas,
    filename: `cuentas-admin-${new Date().toISOString().slice(0, 10)}`,
  };

  return (
    <div
      className={`management-shell ${esModoOscuro ? "management-shell--dark" : ""}`}
    >
      <ManagementSidebar />
      <main className="management-main" style={{ padding: "24px 32px" }}>
        <div className="cities-container" style={{ maxWidth: "100%" }}>
          {/* Header Superior */}
          <header className="cities-topbar">
            <div>
              <p className="cities-eyebrow">
                {t("admin.management", "Gestión de Seguridad")}
              </p>
              <h1>{t("admin.rolesTitle", "Administradores y Permisos")}</h1>
              <p className="cities-subtitle">
                {t(
                  "admin.rolesSubtitle",
                  "Control de acceso, creación de cuentas administrativas y matriz de permisos por rol.",
                )}
              </p>
            </div>

            <div className="cities-topbar__actions">
              <MenuConfiguracion />
              {activeTab === "accounts" ? (
                <button
                  className="cities-primary"
                  type="button"
                  onClick={() => {
                    setErrorModal("");
                    setFormCuenta({
                      nombre: "",
                      correo: "",
                      telefono: "",
                      rolId: rolesList[0]?.id || "role-admin",
                      sucursal: "Neiva",
                    });
                    setModalCrearCuenta(true);
                  }}
                >
                  <FaUserPlus /> {t("admin.roles.newAdminAccount")}
                </button>
              ) : (
                <button
                  className="cities-primary"
                  type="button"
                  onClick={() => {
                    setErrorModal("");
                    setFormRol({
                      nombre: "",
                      descripcion: "",
                      permisos: {
                        vehicles: {
                          ver: true,
                          crear: false,
                          editar: false,
                          eliminar: false,
                        },
                        reservations: {
                          ver: true,
                          crear: false,
                          editar: false,
                          eliminar: false,
                        },
                        users: {
                          ver: false,
                          crear: false,
                          editar: false,
                          eliminar: false,
                        },
                        contracts: {
                          ver: false,
                          crear: false,
                          editar: false,
                          eliminar: false,
                        },
                        cities: {
                          ver: false,
                          crear: false,
                          editar: false,
                          eliminar: false,
                        },
                        branches: {
                          ver: false,
                          crear: false,
                          editar: false,
                          eliminar: false,
                        },
                        audit: {
                          ver: false,
                          crear: false,
                          editar: false,
                          eliminar: false,
                        },
                      },
                    });
                    setModalCrearRol(true);
                  }}
                >
                  <FaPlus /> {t("admin.roles.createNewRole")}
                </button>
              )}
            </div>
          </header>

          {/* Notificación de Aviso */}
          {notice && (
            <div className="cities-notice" role="status">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice("")}>
                Ã—
              </button>
            </div>
          )}

          {/* Pestañas de Navegación */}
          <div className="roles-tabs">
            <button
              type="button"
              className={`roles-tab-btn ${activeTab === "accounts" ? "is-active" : ""}`}
              onClick={() => setActiveTab("accounts")}
            >
              <FaUserShield /> {t("admin.roles.adminAccountsTab", { count: accountsList.length })}
            </button>
            <button
              type="button"
              className={`roles-tab-btn ${activeTab === "roles" ? "is-active" : ""}`}
              onClick={() => setActiveTab("roles")}
            >
              <FaKey /> {t("admin.roles.rolesAndPermissionsTab", { count: rolesList.length })}
            </button>
          </div>

          {/* VISTA 1: CUENTAS ADMINISTRATIVAS */}
          {activeTab === "accounts" && (
            <section className="cities-card">
              {/* Toolbar con Buscador y Filtros */}
              <div className="cities-toolbar">
                <label className="cities-search">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder={t("admin.roles.searchPlaceholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">{t("admin.roles.allRoles")}</option>
                  {rolesList.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">{t("admin.roles.allStates")}</option>
                  <option value="active">{t("admin.roles.active")}</option>
                  <option value="inactive">{t("admin.roles.inactive")}</option>
                </select>

                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                >
                  <option value="all">{t("admin.roles.allBranches")}</option>
                  {sucursales.map((s) => (
                    <option key={s.id} value={s.nombre}>
                      {s.nombre}
                    </option>
                  ))}
                </select>

                <div className="cities-export">
                  <button
                    type="button"
                    onClick={() => exportExcel(exportDataAccounts)}
                  >
                    <FaFileExcel /> {t("admin.roles.excel")}
                  </button>
                  <button
                    type="button"
                    onClick={() => exportPdf(exportDataAccounts)}
                  >
                    <FaFilePdf /> {t("admin.roles.pdf")}
                  </button>
                  <button
                    type="button"
                    onClick={() => printTable(exportDataAccounts)}
                  >
                    <FaPrint /> {t("admin.roles.print")}
                  </button>
                </div>
              </div>

              <div className="cities-summary">
                <strong>{cuentasFiltradas.length}</strong> cuentas
                administrativas encontradas
              </div>

              {cuentasFiltradas.length === 0 ? (
                <div className="cities-empty">
                  <FaUserShield />
                  <h2>{t("admin.roles.noAccountsFound")}</h2>
                  <p>
                    Ajusta el término de búsqueda o cambia los filtros
                    seleccionados.
                  </p>
                </div>
              ) : (
                <div className="cities-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>{t("admin.roles.colaborador")}</th>
                        <th>{t("admin.roles.contacto")}</th>
                        <th>{t("admin.roles.rolAsignado")}</th>
                        <th>{t("admin.roles.sucursal")}</th>
                        <th>{t("admin.roles.estadoCuenta")}</th>
                        <th>{t("admin.roles.acciones")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cuentasFiltradas.map((acc) => (
                        <tr key={acc.id}>
                          <td>
                            <div className="cities-name">
                              <span>
                                <FaUserShield />
                              </span>
                              <div>
                                <strong>{acc.nombre}</strong>
                                <small>{acc.id}</small>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div style={{ fontSize: 12 }}>
                              <div>
                                <FaEnvelope
                                  style={{ marginRight: 4, color: "#64748b" }}
                                />
                                {acc.correo}
                              </div>
                              <div style={{ color: "#64748b", fontSize: 11 }}>
                                <FaPhone style={{ marginRight: 4 }} />
                                {acc.telefono}
                              </div>
                            </div>
                          </td>

                          <td>
                            <strong style={{ fontSize: 13, color: "#2563eb" }}>
                              {acc.rolNombre}
                            </strong>
                          </td>

                          <td>
                            <span>
                              {acc.sucursal ? acc.sucursal : "Global (Todas)"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`user-account-badge ${acc.activo ? "activo" : "inactivo"}`}
                            >
                              <span className="user-account-dot" />
                              {acc.activo ? "Activa" : "Inactiva"}
                            </span>
                          </td>

                          <td>
                            <div className="cities-row-actions">
                              <button
                                type="button"
                                onClick={() => openEditarCuenta(acc)}
                                title="Editar Cuenta"
                              >
                                <FaEdit />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleActivoCuenta(acc)}
                                title={
                                  acc.activo
                                    ? "Desactivar Cuenta"
                                    : "Activar Cuenta"
                                }
                                style={{
                                  color: acc.activo ? "#16a34a" : "#94a3b8",
                                }}
                              >
                                {acc.activo ? (
                                  <FaToggleOn size={18} />
                                ) : (
                                  <FaToggleOff size={18} />
                                )}
                              </button>
                              <button
                                className="is-danger"
                                type="button"
                                onClick={() => {
                                  setErrorModal("");
                                  setModalEliminarCuenta(acc);
                                }}
                                title="Eliminar Cuenta"
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

          {/* VISTA 2: ROLES Y PERMISOS */}
          {activeTab === "roles" && (
            <section className="cities-card">
              <div className="cities-toolbar">
                <label className="cities-search">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder={t("admin.roles.searchRolePlaceholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
              </div>

              <div className="roles-grid">
                {rolesFiltrados.map((role) => (
                  <div key={role.id} className="role-card">
                    <div>
                      <div className="role-card__head">
                        <h3>{role.nombre}</h3>
                        <span>{role.cuentasAsignadas} Cuentas</span>
                      </div>
                      <p>{role.descripcion}</p>
                    </div>

                    <div className="role-card__actions">
                      <button
                        type="button"
                        className="cities-primary"
                        style={{ padding: "8px 14px", fontSize: 12 }}
                        onClick={() => openEditarRol(role)}
                      >
                        <FaEdit /> Configurar Permisos
                      </button>

                      {!role.esSistema && (
                        <button
                          type="button"
                          className="cities-danger"
                          style={{ padding: "8px 12px", fontSize: 12 }}
                          onClick={() => {
                            setErrorModal("");
                            setModalEliminarRol(role);
                          }}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* MODAL CREAR CUENTA */}
        {modalCrearCuenta && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(e) =>
              e.target === e.currentTarget && setModalCrearCuenta(false)
            }
          >
            <section className="cities-modal">
              <div className="cities-modal__head">
                <div>
                  <p className="cities-eyebrow">Alta de Colaborador</p>
                  <h2>{t("admin.roles.createAdminAccount")}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setModalCrearCuenta(false)}
                >
                  Ã—
                </button>
              </div>

                            <form onSubmit={handleCrearCuenta} className="incident-form">
                <div className="incident-grid-2">
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.fullName", "Nombre completo")}</span>
                    <input type="text" required value={formCuenta.nombre} onChange={(e) => setFormCuenta({ ...formCuenta, nombre: e.target.value })} />
                  </div>
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.email", "Correo electrónico")}</span>
                    <input type="email" required value={formCuenta.correo} onChange={(e) => setFormCuenta({ ...formCuenta, correo: e.target.value })} />
                  </div>
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.phone", "Teléfono")}</span>
                    <input type="text" required value={formCuenta.telefono} onChange={(e) => setFormCuenta({ ...formCuenta, telefono: e.target.value })} />
                  </div>
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.document", "Número de Cédula")}</span>
                    <input type="text" required value={formCuenta.cedula} onChange={(e) => setFormCuenta({ ...formCuenta, cedula: e.target.value })} />
                  </div>
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.role", "Rol de usuario")}</span>
                    <select value={formCuenta.rolId} onChange={(e) => setFormCuenta({ ...formCuenta, rolId: e.target.value })}>
                      {(rolesData || []).map((r) => (
                        <option key={r.id} value={r.id}>{r.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.assignedBranch", "Sucursal Asignada")}</span>
                    <select value={formCuenta.sucursal} onChange={(e) => setFormCuenta({ ...formCuenta, sucursal: e.target.value })}>
                      {sucursales.map((s) => (
                        <option key={s.id} value={s.nombre}>{s.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {errorModal && <p className="cities-error">{errorModal}</p>}
                <div className="cities-modal__actions" style={{ marginTop: 24 }}>
                  <button type="button" onClick={() => setModalCrearCuenta(false)}>{t("common.cancel", "Cancelar")}</button>
                  <button type="submit" className="cities-primary">{t("admin.users.saveUser", "Guardar Cuenta")}</button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* MODAL EDITAR CUENTA */}
        {modalEditarCuenta && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(e) =>
              e.target === e.currentTarget && setModalEditarCuenta(null)
            }
          >
            <section className="cities-modal">
              <div className="cities-modal__head">
                <div>
                  <p className="cities-eyebrow">Edición Administrativa</p>
                  <h2>{t("admin.roles.editAccountOf", { name: modalEditarCuenta.nombre })}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setModalEditarCuenta(null)}
                >
                  Ã—
                </button>
              </div>

                            <form onSubmit={handleEditarCuenta} className="incident-form">
                <div className="incident-grid-2">
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.fullName", "Nombre completo")}</span>
                    <input type="text" required value={formCuenta.nombre} onChange={(e) => setFormCuenta({ ...formCuenta, nombre: e.target.value })} />
                  </div>
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.email", "Correo electrónico")}</span>
                    <input type="email" required value={formCuenta.correo} onChange={(e) => setFormCuenta({ ...formCuenta, correo: e.target.value })} />
                  </div>
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.phone", "Teléfono")}</span>
                    <input type="text" required value={formCuenta.telefono} onChange={(e) => setFormCuenta({ ...formCuenta, telefono: e.target.value })} />
                  </div>
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.document", "Número de Cédula")}</span>
                    <input type="text" required value={formCuenta.cedula} onChange={(e) => setFormCuenta({ ...formCuenta, cedula: e.target.value })} />
                  </div>
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.role", "Rol de usuario")}</span>
                    <select value={formCuenta.rolId} onChange={(e) => setFormCuenta({ ...formCuenta, rolId: e.target.value })}>
                      {(rolesData || []).map((r) => (
                        <option key={r.id} value={r.id}>{r.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.assignedBranch", "Sucursal Asignada")}</span>
                    <select value={formCuenta.sucursal} onChange={(e) => setFormCuenta({ ...formCuenta, sucursal: e.target.value })}>
                      {sucursales.map((s) => (
                        <option key={s.id} value={s.nombre}>{s.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.status", "Estado")}</span>
                    <select value={formCuenta.estado} onChange={(e) => setFormCuenta({ ...formCuenta, estado: e.target.value })}>
                      <option value="activo">{t("admin.users.states.active", "Activo")}</option>
                      <option value="inactivo">{t("admin.users.states.inactive", "Inactivo")}</option>
                    </select>
                  </div>
                </div>
                {errorModal && <p className="cities-error">{errorModal}</p>}
                <div className="cities-modal__actions" style={{ marginTop: 24 }}>
                  <button type="button" onClick={() => setModalEditarCuenta(null)}>{t("common.cancel", "Cancelar")}</button>
                  <button type="submit" className="cities-primary">{t("admin.users.saveChanges", "Guardar Cambios")}</button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* MODAL CREAR / EDITAR ROL Y MATRIZ DE PERMISOS */}
        {(modalCrearRol || modalEditarRol) && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setModalCrearRol(false);
                setModalEditarRol(null);
              }
            }}
          >
            <section className="cities-modal" style={{ maxWidth: 680 }}>
              <div className="cities-modal__head">
                <div>
                  <p className="cities-eyebrow">{t("admin.roles.securityConfig")}</p>
                  <h2>
                    {modalEditarRol
                      ? `Permisos de ${modalEditarRol.nombre}`
                      : "Crear Nuevo Rol"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalCrearRol(false);
                    setModalEditarRol(null);
                  }}
                >
                  Ã—
                </button>
              </div>

              <form
                onSubmit={modalEditarRol ? handleEditarRol : handleCrearRol}
              >
                <label>
                  {t("admin.roles.roleNameLabel")}
                  <input
                    type="text"
                    required
                    value={formRol.nombre}
                    onChange={(e) =>
                      setFormRol({ ...formRol, nombre: e.target.value })
                    }
                  />
                </label>

                <label>
                  {t("admin.roles.descriptionLabel")}
                  <input
                    type="text"
                    required
                    value={formRol.descripcion}
                    onChange={(e) =>
                      setFormRol({ ...formRol, descripcion: e.target.value })
                    }
                  />
                </label>

                {/* MATRIZ DE PERMISOS POR MÓDULO */}
                <div className="permission-matrix-wrap">
                  <table className="permission-matrix-table">
                    <thead>
                      <tr>
                        <th>Módulo / Recurso</th>
                        <th>Ver</th>
                        <th>Crear</th>
                        <th>Editar</th>
                        <th>Eliminar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MODULE_KEYS.map((mod) => {
                        const mPerms = formRol.permisos[mod.key] || {
                          ver: false,
                          crear: false,
                          editar: false,
                          eliminar: false,
                        };
                        return (
                          <tr key={mod.key}>
                            <td>{t(mod.labelKey)}</td>
                            {["ver", "crear", "editar", "eliminar"].map(
                              (action) => (
                                <td key={action}>
                                  <input
                                    type="checkbox"
                                    checked={Boolean(mPerms[action])}
                                    onChange={() =>
                                      handleTogglePermiso(mod.key, action)
                                    }
                                  />
                                </td>
                              ),
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {errorModal && <p className="cities-error">{errorModal}</p>}

                <div className="cities-modal__actions">
                  <button
                    type="button"
                    onClick={() => {
                      setModalCrearRol(false);
                      setModalEditarRol(null);
                    }}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="cities-primary">
                    {modalEditarRol ? "Guardar Permisos" : "Crear Rol"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* MODAL ELIMINAR CUENTA */}
        {modalEliminarCuenta && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(e) =>
              e.target === e.currentTarget && setModalEliminarCuenta(null)
            }
          >
            <section className="cities-modal">
              <div className="cities-delete-icon">
                <FaTrash />
              </div>
              <h2>{t("admin.roles.confirmAccountDeletion")}</h2>
              <p>
                ¿Deseas eliminar la cuenta administrativa de{" "}
                <strong>{modalEliminarCuenta.nombre}</strong> (
                {modalEliminarCuenta.correo})?
              </p>

              <div className="cities-modal__actions">
                <button
                  type="button"
                  onClick={() => setModalEliminarCuenta(null)}
                >
                  Cancelar
                </button>
                <button
                  className="cities-danger"
                  type="button"
                  onClick={() => handleEliminarCuenta(modalEliminarCuenta)}
                >
                  Confirmar Eliminación
                </button>
              </div>
            </section>
          </div>
        )}

        {/* MODAL ELIMINAR ROL CON VALIDACIÓN */}
        {modalEliminarRol && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(e) =>
              e.target === e.currentTarget && setModalEliminarRol(null)
            }
          >
            <section className="cities-modal">
              <div className="cities-delete-icon">
                <FaTrash />
              </div>
              <h2>{t("admin.roles.confirmRoleDeletion")}</h2>
              <p>
                ¿Deseas eliminar el rol{" "}
                <strong>{modalEliminarRol.nombre}</strong>?
              </p>

              {modalEliminarRol.cuentasAsignadas > 0 && (
                <div
                  style={{
                    background: "#fee2e2",
                    border: "1.5px solid #fca5a5",
                    color: "#991b1b",
                    padding: "12px 14px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 16,
                  }}
                >
                  <FaExclamationTriangle style={{ marginRight: 6 }} />
                  No es posible eliminar este rol porque tiene{" "}
                  {modalEliminarRol.cuentasAsignadas} cuenta(s)
                  administrativa(s) asignada(s). Reasigna las cuentas antes de
                  eliminarlo.
                </div>
              )}

              {errorModal && <p className="cities-error">{errorModal}</p>}

              <div className="cities-modal__actions">
                <button type="button" onClick={() => setModalEliminarRol(null)}>
                  Cancelar
                </button>
                <button
                  className="cities-danger"
                  type="button"
                  disabled={modalEliminarRol.cuentasAsignadas > 0}
                  onClick={() => handleEliminarRol(modalEliminarRol)}
                >
                  Confirmar Eliminación
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

