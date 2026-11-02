export default function ModalCrear({ esEncargado, formCrear, setFormCrear, setModalCrear, submitCrearManual, sucursalEncargado, sucursalesVisibles, t, vehiculosDisponibles }) {
  return (
    <div
            className="cities-modal-backdrop"
            onMouseDown={(e) => e.target === e.currentTarget && setModalCrear(false)}
          >
            <section className="cities-modal" role="dialog">
              <div className="cities-modal__head">
                <div>
                  <p className="cities-eyebrow">{t('admin.reservationsModal.directAttention')}</p>
                  <h2>{t('admin.reservationsModal.createManualResTitle')}</h2>
                </div>
                <button type="button" onClick={() => setModalCrear(false)}>
                  á—
                </button>
              </div>
  
              <form onSubmit={submitCrearManual}>
                <div className="branches-form-grid">
                  <label>
                    {t('admin.reservationsModal.clientEmail')}
                    <input
                      type="email"
                      required
                      value={formCrear.clienteCorreo}
                      onChange={(e) => setFormCrear({ ...formCrear, clienteCorreo: e.target.value })}
                      placeholder={t('admin.reservationsModal.clientEmailPlaceholder')}
                    />
                  </label>
                </div>
  
                <div className="branches-form-grid">
                  <label>
                    {t('admin.reservationsManagement.createModal.vehicle')}
                    <select
                      value={formCrear.vehiculoNombre}
                      onChange={(e) => {
                        const veh = vehiculosDisponibles.find((v) => v.nombre === e.target.value)
                        setFormCrear({
                          ...formCrear,
                          vehiculoNombre: e.target.value,
                          vehiculoPlaca: veh?.placa || '',
                        })
                      }}
                    >
                      {vehiculosDisponibles.length > 0 ? (
                        vehiculosDisponibles.map((v) => (
                          <option key={v.id} value={v.nombre}>
                            {v.nombre} ({v.placa || t('admin.reservationsModal.noLicensePlate')})
                          </option>
                        ))
                      ) : <option value="" disabled>{t('admin.reservationsManagement.createModal.noVehicles')}</option>}
                    </select>
                  </label>
  
                  <label>
                    {t('admin.reservationsModal.branch')}
                    <select
                      value={formCrear.sucursal}
                      disabled={esEncargado}
                      onChange={(e) => setFormCrear({ ...formCrear, sucursal: e.target.value })}
                    >
                      {sucursalesVisibles.map((s) => (
                        <option key={s.id} value={s.nombre}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
  
                <div className="branches-form-grid">
                  <label>
                    {t('admin.reservationsModal.pickupDate')}
                    <input
                      type="datetime-local"
                      required
                      value={formCrear.fechaInicio}
                      onChange={(e) => setFormCrear({ ...formCrear, fechaInicio: e.target.value })}
                    />
                  </label>
                  <label>
                    {t('admin.reservationsModal.returnDate')}
                    <input
                      type="datetime-local"
                      required
                      value={formCrear.fechaFin}
                      onChange={(e) => setFormCrear({ ...formCrear, fechaFin: e.target.value })}
                    />
                  </label>
                </div>
  
                <p style={{ fontSize: 13, opacity: 0.8 }}>
                  El estado inicial y el valor total los calcula el sistema según el vehículo, las fechas y la tarifa vigente.
                </p>
                <label>
                  {t('admin.reservationsModal.notes')}
                  <input
                    value={formCrear.notas}
                    onChange={(e) => setFormCrear({ ...formCrear, notas: e.target.value })}
                  />
                </label>
  
                <div className="cities-modal__actions">
                  <button type="button" onClick={() => setModalCrear(false)}>
                    {t('common.cancel')}
                  </button>
                  <button className="cities-primary" type="submit" disabled={!vehiculosDisponibles.length || (esEncargado && !sucursalEncargado)}>
                    {t('admin.reservationsManagement.createModal.create')}
                  </button>
                </div>
              </form>
            </section>
          </div>
  )
}
