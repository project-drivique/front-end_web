import { FaTrash } from 'react-icons/fa'

export default function BranchFormDeleteModal({
  modal,
  close,
  save,
  remove,
  form,
  setForm,
  cities,
  managers,
  error,
  t,
}) {
  if (!modal) return null

  return (
    <div
      className="cities-modal-backdrop"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <section className="cities-modal branches-modal" role="dialog" aria-modal="true">
        {modal.type === 'form' ? (
          <>
            <div className="cities-modal__head">
              <div>
                <p className="cities-eyebrow">{t('hc.formulario_de_sede', 'Formulario de Sede')}</p>
                <h2>
                  {modal.branch
                    ? t('hc2.editar_sucursal', 'Editar Sucursal')
                    : t('hc2.registrar_nueva_sucursal', 'Registrar Nueva Sucursal')}
                </h2>
              </div>
              <button type="button" onClick={close}>
                á—
              </button>
            </div>

            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label>
                Nombre de la Sucursal
                <input
                  autoFocus
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder={t('hc.ej_drivique_bogota_norte', 'Ej: Drivique Bogotá Norte')}
                />
              </label>

              <div className="branches-form-grid">
                <label>
                  Ciudad
                  <select value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })}>
                    {cities.map((city) => (
                      <option key={city.id} value={city.nombre}>
                        {city.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Encargado Asignado
                  <select value={form.encargadoId} onChange={(e) => setForm({ ...form, encargadoId: e.target.value })}>
                    <option value="">
                      {t('hc.sin_encargado_asignado_asignar_luego', 'Sin encargado asignado (asignar luego)')}
                    </option>
                    {managers.map((manager) => (
                      <option key={manager.correo} value={manager.correo}>
                        {`${manager.nombre || ''} ${manager.apellido || ''}`.trim() || manager.correo}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Dirección Completa
                <input
                  required
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  placeholder={t('hc.ej_av_calle_100_15_20_chico', 'Ej: Av. Calle 100 # 15-20, Chicó')}
                />
              </label>

              <div className="branches-form-grid">
                <label>
                  Teléfono de Contacto
                  <input
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    placeholder="Ej: +57 601 555 1234"
                  />
                </label>

                <label>
                  Capacidad Máxima de Autos
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={form.capacidadVehiculos}
                    onChange={(e) => setForm({ ...form, capacidadVehiculos: e.target.value })}
                  />
                </label>
              </div>

              <div className="branches-form-grid">
                <label>
                  Horario de Atención
                  <span style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="time"
                      required
                      value={form.apertura}
                      onChange={(e) => setForm({ ...form, apertura: e.target.value })}
                    />
                    <input
                      type="time"
                      required
                      value={form.cierre}
                      onChange={(e) => setForm({ ...form, cierre: e.target.value })}
                    />
                  </span>
                </label>

                <label>
                  Estado de la Sede
                  <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                    <option value="activa">{t('hc4.activa_operativa', 'Activa / Operativa')}</option>
                    <option value="inactiva">{t('hc4.inactiva_cerrada', 'Inactiva / Cerrada')}</option>
                  </select>
                </label>
              </div>

              <label className="branches-cash-check">
                <input
                  type="checkbox"
                  checked={form.autorizadoPagoEfectivo}
                  onChange={(e) => setForm({ ...form, autorizadoPagoEfectivo: e.target.checked })}
                />
                <span>
                  <strong>
                    {t('hc.autorizar_cobro_en_efectivo_en_sucursa', 'Autorizar Cobro en Efectivo en Sucursal')}
                  </strong>
                  <small>
                    {t(
                      'hc.permite_que_esta_sede_reciba_dinero_en',
                      'Permite que esta sede reciba dinero en caja para reservaciones en mostrador.'
                    )}
                  </small>
                </span>
              </label>

              {error && <p className="cities-error">{error}</p>}

              <div className="cities-modal__actions">
                <button type="button" onClick={close}>
                  Cancelar
                </button>
                <button className="cities-primary" type="submit">
                  Guardar Sucursal
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="cities-delete-icon">
              <FaTrash />
            </div>
            <h2>{t('hc.eliminar_sucursal_59', '¿Eliminar Sucursal?')}</h2>
            <p>
              {t('hc.estas_seguro_de_eliminar_la_sucursal', '¿Estás seguro de eliminar la sucursal')}{' '}
              <strong>{modal.branch.nombre}</strong>?
            </p>
            <div className="cities-modal__actions">
              <button type="button" onClick={close}>
                Cancelar
              </button>
              <button className="cities-danger" type="button" onClick={remove}>
                Eliminar
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
