import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FaCheckCircle,
  FaEdit,
  FaExclamationTriangle,
  FaFileAlt,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
  FaSearch,
  FaTimesCircle,
  FaToggleOff,
  FaToggleOn,
  FaTrash,
  FaUserCheck,
  FaUserCog,
  FaUserPlus,
  FaUsers,
  FaBuilding,
  FaIdCard,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { useLanding } from "../../landing/LandingContext";
import { useAuthStore } from "../../../store/authStore";
import { userManagementService } from "../../../services/userManagementService";
import { branchManagementService } from "../../../services/branchManagementService";
import {
  exportExcel,
  exportPdf,
  printTable,
} from "../../../utils/listExportUtils";
import MenuConfiguracion from "../../../components/MenuConfiguracion";
import ManagementSidebar from "../components/ManagementSidebar";
import "./CityManagementPage.css";
import "./UserManagementPage.css";

export default function UserManagementPage() {
  const { t } = useTranslation();
  const { tema, divisa, tasaUSD } = useLanding();
  const user = useAuthStore((state) => state.usuario);
  const esModoOscuro = tema === "oscuro";

  const [usersList, setUsersList] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [docFilter, setDocFilter] = useState("all");
  const [notice, setNotice] = useState("");

  // Modales
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalDocumentos, setModalDocumentos] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);

  // Formularios
  const [formCrear, setFormCrear] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    cedula: "",
    rol: "cliente",
    sucursal: "Neiva",
  });

  const [formEditar, setFormEditar] = useState({});
  const [observacionDoc, setObservacionDoc] = useState("");
  const [errorModal, setErrorModal] = useState("");

  const sucursales = useMemo(
    () =>
      branchManagementService
        .list()
        .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [],
  );

  const cargarUsuarios = () => {
    setUsersList(userManagementService.list());
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Filtrado dinámico
  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    return usersList.filter((u) => {
      const matchRole = roleFilter === "all" || u.rol === roleFilter;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? u.activo : !u.activo);
      const matchDoc = docFilter === "all" || u.documentosEstado === docFilter;

      const matchSearch =
        !term ||
        u.nombre?.toLowerCase().includes(term) ||
        u.correo?.toLowerCase().includes(term) ||
        u.telefono?.toLowerCase().includes(term) ||
        u.cedula?.toLowerCase().includes(term);

      return matchRole && matchStatus && matchDoc && matchSearch;
    });
  }, [usersList, search, roleFilter, statusFilter, docFilter]);

  // --- Handlers CRUD ---
  const handleCrearUsuario = (e) => {
    e.preventDefault();
    try {
      setErrorModal("");
      userManagementService.create(formCrear, user);
      setNotice(
        t(
          "admin.users.createdSuccess",
          `Usuario ${formCrear.nombre} creado con éxito.`,
        ),
      );
      setModalCrear(false);
      setFormCrear({
        nombre: "",
        correo: "",
        telefono: "",
        cedula: "",
        rol: "cliente",
        sucursal: "Neiva",
      });
      cargarUsuarios();
    } catch (err) {
      if (err.message === "mailAlreadyExists") {
        setErrorModal(
          t(
            "admin.users.mailExists",
            "El correo electrónico ya está registrado.",
          ),
        );
      } else {
        setErrorModal(
          t("admin.users.createError", "Error al crear el usuario."),
        );
      }
    }
  };

  const openEditarModal = (u) => {
    setErrorModal("");
    setFormEditar({
      id: u.id,
      nombre: u.nombre,
      correo: u.correo,
      telefono: u.telefono,
      cedula: u.cedula,
      rol: u.rol,
      sucursal: u.sucursal || "Neiva",
    });
    setModalEditar(u);
  };

  const handleEditarUsuario = (e) => {
    e.preventDefault();
    try {
      setErrorModal("");
      userManagementService.update(formEditar.id, formEditar, user);
      setNotice(
        t(
          "admin.users.updatedSuccess",
          `Datos de ${formEditar.nombre} actualizados.`,
        ),
      );
      setModalEditar(null);
      cargarUsuarios();
    } catch (err) {
      setErrorModal(
        t("admin.users.updateError", "Error al actualizar usuario."),
      );
    }
  };

  const handleToggleActivo = (u) => {
    userManagementService.toggleActive(u.id, user);
    setNotice(
      t(
        u.activo
          ? "admin.users.deactivatedSuccess"
          : "admin.users.activatedSuccess",
        `Cuenta de ${u.nombre} ${u.activo ? "desactivada" : "activada"}.`,
      ),
    );
    cargarUsuarios();
  };

  const openDocumentosModal = (u) => {
    setObservacionDoc(u.observacionDocumentos || "");
    setModalDocumentos(u);
  };

  const handleVerificarDocumentos = (nuevoEstado) => {
    if (!modalDocumentos) return;
    userManagementService.verifyDocuments(
      modalDocumentos.id,
      { documentosEstado: nuevoEstado, observacionDocumentos: observacionDoc },
      user,
    );
    setNotice(
      t(
        "admin.users.docVerifiedSuccess",
        `Documentos de ${modalDocumentos.nombre} marcados como ${nuevoEstado.toUpperCase()}.`,
      ),
    );
    setModalDocumentos(null);
    cargarUsuarios();
  };

  const handleEliminarUsuario = (u) => {
    try {
      userManagementService.remove(u.id, user);
      setNotice(
        t("admin.users.deletedSuccess", `Usuario ${u.nombre} eliminado.`),
      );
      setModalEliminar(null);
      cargarUsuarios();
    } catch (err) {
      if (err.message === "hasActiveReservations") {
        setErrorModal(
          t(
            "admin.users.hasReservationsError",
            "No se puede eliminar el usuario porque tiene reservas activas (en curso o confirmadas).",
          ),
        );
      } else {
        setErrorModal(
          t("admin.users.deleteError", "Error al eliminar usuario."),
        );
      }
    }
  };

  // --- Exportaciones ---
  const headersExport = [
    "Nombre",
    "Correo",
    "Teléfono",
    "Cédula",
    "Rol",
    "Sucursal",
    "Estado Cuenta",
    "Verificación Documentos",
    "Reservas Activas",
  ];
  const rowsExport = filtrados.map((u) => [
    u.nombre,
    u.correo,
    u.telefono,
    u.cedula,
    u.rol,
    u.sucursal || "N/A",
    u.activo ? "Activo" : "Inactivo",
    u.documentosEstado,
    u.reservasActivas,
  ]);

  const exportData = {
    title: "Gestión de Usuarios — Plataforma Drivique",
    headers: headersExport,
    rows: rowsExport,
    items: filtrados,
    filename: `usuarios-drivique-${new Date().toISOString().slice(0, 10)}`,
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
                {t("admin.management", "Gestión de Usuarios")}
              </p>
              <h1>
                {t("admin.usersTitle", "Control de Cuentas y Verificación")}
              </h1>
              <p className="cities-subtitle">
                {t(
                  "admin.usersSubtitle",
                  "Gestión completa de clientes, administradores, roles, estados de cuenta y revisión de documentos.",
                )}
              </p>
            </div>

            <div className="cities-topbar__actions">
              <MenuConfiguracion />
              <button
                className="cities-primary"
                type="button"
                onClick={() => {
                  setErrorModal("");
                  setModalCrear(true);
                }}
              >
                <FaUserPlus /> {t("admin.newUser", "Nuevo Usuario")}
              </button>
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

          {/* Tarjeta Principal */}
          <section className="cities-card">
            {/* Toolbar con Buscador y Filtros */}
            <div className="cities-toolbar">
              <label className="cities-search">
                <FaSearch />
                <input
                  type="text"
                  placeholder={t(
                    "admin.searchUsers",
                    "Buscar por nombre, correo, teléfono o cédula...",
                  )}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>

              {/* Filtro por Rol */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Todos los roles</option>
                <option value="cliente">Clientes</option>
                <option value="encargado">Encargados de Sucursal</option>
                <option value="administrador">Administradores</option>
              </select>

              {/* Filtro por Estado de Cuenta */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="active">Cuentas Activas</option>
                <option value="inactive">Cuentas Inactivas</option>
              </select>

              {/* Filtro por Documentos */}
              <select
                value={docFilter}
                onChange={(e) => setDocFilter(e.target.value)}
              >
                <option value="all">Todos los documentos</option>
                <option value="aprobado">Documentos Aprobados</option>
                <option value="pendiente">Documentos Pendientes</option>
                <option value="rechazado">Documentos Rechazados</option>
              </select>

              {/* Botones de Exportación */}
              <div className="cities-export">
                <button type="button" onClick={() => exportExcel(exportData)}>
                  <FaFileExcel /> Excel
                </button>
                <button type="button" onClick={() => exportPdf(exportData)}>
                  <FaFilePdf /> PDF
                </button>
                <button type="button" onClick={() => printTable(exportData)}>
                  <FaPrint /> Imprimir
                </button>
              </div>
            </div>

            {/* Contador de Resultados */}
            <div className="cities-summary">
              <strong>{filtrados.length}</strong>{" "}
              {t("admin.usersFound", "usuarios registrados")}
            </div>

            {/* Tabla Estilizada de Usuarios */}
            {filtrados.length === 0 ? (
              <div className="cities-empty">
                <FaUsers />
                <h2>No se encontraron usuarios</h2>
                <p>
                  Intenta ajustar el término de búsqueda o los filtros
                  seleccionados.
                </p>
              </div>
            ) : (
              <div className="cities-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Cédula</th>
                      <th>Contacto</th>
                      <th>Rol / Sucursal</th>
                      <th>Estado Cuenta</th>
                      <th>Verificación Documentos</th>
                      <th>Reservas Activas</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="cities-name">
                            <span>
                              <FaUsers />
                            </span>
                            <div>
                              <strong>{u.nombre}</strong>
                              <small>{u.id}</small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <strong
                            style={{ fontSize: 13, color: "var(--city-text)" }}
                          >
                            {u.cedula || "N/A"}
                          </strong>
                        </td>

                        <td>
                          <div style={{ fontSize: 12 }}>
                            <div>
                              <FaEnvelope
                                style={{ marginRight: 4, color: "#64748b" }}
                              />
                              {u.correo}
                            </div>
                            <div style={{ color: "#64748b", fontSize: 11 }}>
                              <FaPhone style={{ marginRight: 4 }} />
                              {u.telefono}
                            </div>
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: 12 }}>
                            <strong style={{ textTransform: "capitalize" }}>
                              {u.rol}
                            </strong>
                            {u.sucursal && (
                              <small
                                style={{
                                  display: "block",
                                  color: "#2563eb",
                                  fontWeight: 800,
                                }}
                              >
                                <FaBuilding style={{ marginRight: 3 }} />{" "}
                                {u.sucursal}
                              </small>
                            )}
                          </div>
                        </td>

                        <td>
                          <span
                            className={`user-account-badge ${u.activo ? "activo" : "inactivo"}`}
                          >
                            <span className="user-account-dot" />
                            {u.activo ? "Activa" : "Inactiva"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`doc-status-badge ${u.documentosEstado}`}
                          >
                            {u.documentosEstado === "aprobado" && (
                              <FaCheckCircle />
                            )}
                            {u.documentosEstado === "pendiente" && (
                              <FaExclamationTriangle />
                            )}
                            {u.documentosEstado === "rechazado" && (
                              <FaTimesCircle />
                            )}
                            {u.documentosEstado}
                          </span>
                        </td>

                        <td>
                          <strong
                            style={{
                              fontSize: 13,
                              color:
                                u.reservasActivas > 0 ? "#9333ea" : "#64748b",
                            }}
                          >
                            {u.reservasActivas} activas
                          </strong>
                        </td>

                        <td>
                          <div className="cities-row-actions">
                            {/* Revisión de Documentos */}
                            <button
                              type="button"
                              onClick={() => openDocumentosModal(u)}
                              title="Revisar Cédula y Licencia"
                              style={{ color: "#2563eb" }}
                            >
                              <FaIdCard />
                            </button>

                            {/* Editar Usuario */}
                            <button
                              type="button"
                              onClick={() => openEditarModal(u)}
                              title="Editar Usuario"
                            >
                              <FaEdit />
                            </button>

                            {/* Activar / Desactivar Toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleActivo(u)}
                              title={
                                u.activo
                                  ? "Desactivar Cuenta"
                                  : "Activar Cuenta"
                              }
                              style={{
                                color: u.activo ? "#16a34a" : "#94a3b8",
                              }}
                            >
                              {u.activo ? (
                                <FaToggleOn size={18} />
                              ) : (
                                <FaToggleOff size={18} />
                              )}
                            </button>

                            {/* Eliminar Usuario */}
                            <button
                              className="is-danger"
                              type="button"
                              onClick={() => {
                                setErrorModal("");
                                setModalEliminar(u);
                              }}
                              title="Eliminar Usuario"
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

        {/* MODAL REVISIÓN DE DOCUMENTOS */}
        {modalDocumentos && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(e) =>
              e.target === e.currentTarget && setModalDocumentos(null)
            }
          >
            <section className="cities-modal user-doc-modal">
              <div className="cities-modal__head">
                <div>
                  <p className="cities-eyebrow">Verificación de Identidad</p>
                  <h2>Documentos de {modalDocumentos.nombre}</h2>
                </div>
                <button type="button" onClick={() => setModalDocumentos(null)}>
                  Ã—
                </button>
              </div>

              <div className="user-doc-grid">
                <div className="user-doc-card">
                  <strong>Cédula de Ciudadanía / Pasaporte</strong>
                  {modalDocumentos.documentoCedula ? (
                    <img
                      src={modalDocumentos.documentoCedula}
                      alt="Cédula"
                      className="user-doc-preview"
                    />
                  ) : (
                    <div className="user-doc-placeholder">
                      No se ha adjuntado Cédula
                    </div>
                  )}
                </div>

                <div className="user-doc-card">
                  <strong>Licencia de Conducción</strong>
                  {modalDocumentos.documentoLicencia ? (
                    <img
                      src={modalDocumentos.documentoLicencia}
                      alt="Licencia"
                      className="user-doc-preview"
                    />
                  ) : (
                    <div className="user-doc-placeholder">
                      No se ha adjuntado Licencia
                    </div>
                  )}
                </div>
              </div>

              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "var(--city-muted)",
                }}
              >
                Observaciones o motivo de rechazo:
                <input
                  type="text"
                  placeholder="Ej: Licencia vigente aprobada / Foto borrosa..."
                  value={observacionDoc}
                  onChange={(e) => setObservacionDoc(e.target.value)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--city-border)",
                    marginTop: 6,
                  }}
                />
              </label>

              <div className="cities-modal__actions" style={{ marginTop: 24 }}>
                <button
                  type="button"
                  className="cities-danger"
                  onClick={() => handleVerificarDocumentos("rechazado")}
                >
                  <FaTimesCircle /> Rechazar Documentos
                </button>
                <button
                  type="button"
                  className="cities-primary"
                  onClick={() => handleVerificarDocumentos("aprobado")}
                >
                  <FaCheckCircle /> Aprobar Documentos
                </button>
              </div>
            </section>
          </div>
        )}

        {/* MODAL CREAR USUARIO */}
        {modalCrear && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(e) =>
              e.target === e.currentTarget && setModalCrear(false)
            }
          >
            <section className="cities-modal">
              <div className="cities-modal__head">
                <div>
                  <p className="cities-eyebrow">Formulario de Registro</p>
                  <h2>Crear Nuevo Usuario</h2>
                </div>
                <button type="button" onClick={() => setModalCrear(false)}>
                  Ã—
                </button>
              </div>

                            <form onSubmit={handleCrearUsuario} className="incident-form">
                <div className="incident-grid-2">
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.fullName", "Nombre completo")}</span>
                    <input type="text" required value={formCrear.nombre} onChange={(e) => setFormCrear({ ...formCrear, nombre: e.target.value })} />
                  </div>
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.email", "Correo electrónico")}</span>
                    <input type="email" required value={formCrear.correo} onChange={(e) => setFormCrear({ ...formCrear, correo: e.target.value })} />
                  </div>
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.phone", "Teléfono")}</span>
                    <input type="text" required value={formCrear.telefono} onChange={(e) => setFormCrear({ ...formCrear, telefono: e.target.value })} />
                  </div>
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.document", "Número de Cédula / Documento")}</span>
                    <input type="text" required value={formCrear.cedula} onChange={(e) => setFormCrear({ ...formCrear, cedula: e.target.value })} />
                  </div>
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.role", "Rol de usuario")}</span>
                    <select value={formCrear.rol} onChange={(e) => setFormCrear({ ...formCrear, rol: e.target.value })}>
                      <option value="cliente">{t("admin.users.roles.client", "Cliente")}</option>
                      <option value="encargado">{t("admin.users.roles.manager", "Encargado de Sucursal")}</option>
                      <option value="administrador">{t("admin.users.roles.admin", "Administrador")}</option>
                    </select>
                  </div>
                  {formCrear.rol === "encargado" && (
                    <div className="incident-field">
                      <span className="incident-field-label">{t("admin.users.assignedBranch", "Sucursal Asignada")}</span>
                      <select value={formCrear.sucursal} onChange={(e) => setFormCrear({ ...formCrear, sucursal: e.target.value })}>
                        {sucursales.map((s) => (
                          <option key={s.id} value={s.nombre}>{s.nombre}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                {errorModal && <p className="cities-error">{errorModal}</p>}
                <div className="cities-modal__actions" style={{ marginTop: 24 }}>
                  <button type="button" onClick={() => setModalCrear(false)}>{t("common.cancel", "Cancelar")}</button>
                  <button type="submit" className="cities-primary">{t("admin.users.saveUser", "Guardar Usuario")}</button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* MODAL EDITAR USUARIO */}
        {modalEditar && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(e) =>
              e.target === e.currentTarget && setModalEditar(null)
            }
          >
            <section className="cities-modal">
              <div className="cities-modal__head">
                <div>
                  <p className="cities-eyebrow">Edición de Perfil</p>
                  <h2>Editar Datos de {modalEditar.nombre}</h2>
                </div>
                <button type="button" onClick={() => setModalEditar(null)}>
                  Ã—
                </button>
              </div>

                            <form onSubmit={handleEditarUsuario} className="incident-form">
                <div className="incident-grid-2">
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.fullName", "Nombre completo")}</span>
                    <input type="text" required value={formEditar.nombre} onChange={(e) => setFormEditar({ ...formEditar, nombre: e.target.value })} />
                  </div>
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.email", "Correo electrónico")}</span>
                    <input type="email" required value={formEditar.correo} onChange={(e) => setFormEditar({ ...formEditar, correo: e.target.value })} />
                  </div>
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.phone", "Teléfono")}</span>
                    <input type="text" required value={formEditar.telefono} onChange={(e) => setFormEditar({ ...formEditar, telefono: e.target.value })} />
                  </div>
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.document", "Número de Cédula / Documento")}</span>
                    <input type="text" required value={formEditar.cedula} onChange={(e) => setFormEditar({ ...formEditar, cedula: e.target.value })} />
                  </div>
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.role", "Rol de usuario")}</span>
                    <select value={formEditar.rol} onChange={(e) => setFormEditar({ ...formEditar, rol: e.target.value })}>
                      <option value="cliente">{t("admin.users.roles.client", "Cliente")}</option>
                      <option value="encargado">{t("admin.users.roles.manager", "Encargado de Sucursal")}</option>
                      <option value="administrador">{t("admin.users.roles.admin", "Administrador")}</option>
                    </select>
                  </div>
                  {formEditar.rol === "encargado" && (
                    <div className="incident-field">
                      <span className="incident-field-label">{t("admin.users.assignedBranch", "Sucursal Asignada")}</span>
                      <select value={formEditar.sucursal} onChange={(e) => setFormEditar({ ...formEditar, sucursal: e.target.value })}>
                        {sucursales.map((s) => (
                          <option key={s.id} value={s.nombre}>{s.nombre}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="incident-field">
                    <span className="incident-field-label">{t("admin.users.status", "Estado de la cuenta")}</span>
                    <select value={formEditar.estado} onChange={(e) => setFormEditar({ ...formEditar, estado: e.target.value })}>
                      <option value="activo">{t("admin.users.states.active", "Activo")}</option>
                      <option value="inactivo">{t("admin.users.states.inactive", "Inactivo")}</option>
                      <option value="suspendido">{t("admin.users.states.suspended", "Suspendido")}</option>
                    </select>
                  </div>
                </div>
                {errorModal && <p className="cities-error">{errorModal}</p>}
                <div className="cities-modal__actions" style={{ marginTop: 24 }}>
                  <button type="button" onClick={() => setModalEditar(null)}>{t("common.cancel", "Cancelar")}</button>
                  <button type="submit" className="cities-primary">{t("admin.users.saveChanges", "Guardar Cambios")}</button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* MODAL ELIMINAR USUARIO */}
        {modalEliminar && (
          <div
            className="cities-modal-backdrop"
            onMouseDown={(e) =>
              e.target === e.currentTarget && setModalEliminar(null)
            }
          >
            <section className="cities-modal">
              <div className="cities-delete-icon">
                <FaTrash />
              </div>
              <h2>Confirmar Eliminación de Usuario</h2>
              <p>
                ¿Estás seguro de que deseas eliminar a{" "}
                <strong>{modalEliminar.nombre}</strong> ({modalEliminar.correo}
                )?
              </p>

              {modalEliminar.reservasActivas > 0 && (
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
                  No es posible eliminar este usuario porque tiene{" "}
                  {modalEliminar.reservasActivas} reserva(s) activa(s).
                </div>
              )}

              {errorModal && <p className="cities-error">{errorModal}</p>}

              <div className="cities-modal__actions">
                <button type="button" onClick={() => setModalEliminar(null)}>
                  Cancelar
                </button>
                <button
                  className="cities-danger"
                  type="button"
                  disabled={modalEliminar.reservasActivas > 0}
                  onClick={() => handleEliminarUsuario(modalEliminar)}
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

