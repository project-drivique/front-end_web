export default function IncidentForm({ categoryForm, close, saveCategory, setCategoryForm, t }) {
  return (
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
  )
}
