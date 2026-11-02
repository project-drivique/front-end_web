import ReservationStep1 from '../../components/ReservationStep1'
import ReservationStep2 from '../../components/ReservationStep2'
import PersonalData from '../../components/PersonalData'
import SideSummary from '../../components/SideSummary'

export default function ReservationFlowPart({ abrirModalEditar, aplicarPromocion, appliedPromotion, c, cambiarReserva, cotizacion, datosForm, docsVerificados, errorPaso1, errores, esModoOscuro, handleReservar, irSiguiente, pantalla, procesandoReserva, quitarPromocion, reserva, resumenMovilAbierto, resumenMovilRef, seguroIdx, serviciosSeleccionados, setDatosForm, setSeguroIdx, t, toggleServicio, vehiculo }) {
  return (
    <div className={`detalle-layout ${pantalla === 1 ? 'w-full' : 'grid grid-cols-1 lg:grid-cols-3 gap-6 items-start'}`}>
              <div className={`detalle-columna-principal ${pantalla === 1 ? 'w-full' : 'lg:col-span-2 min-w-0 flex flex-col gap-6'}`}>
  
                {/* ── Paso 1 ── */}
                {pantalla === 1 && (
                  <ReservationStep1
                    vehiculo={vehiculo}
                    c={c}
                    esModoOscuro={esModoOscuro}
                    reserva={reserva}
                    cambiarReserva={cambiarReserva}
                    seguroIdx={seguroIdx}
                    serviciosSeleccionados={serviciosSeleccionados}
                    abrirModalEditar={abrirModalEditar}
                    pantalla={pantalla}
                    onContinuar={irSiguiente}
                    appliedPromotion={appliedPromotion}
                    cotizacion={cotizacion}
                    onApplyPromotion={aplicarPromocion}
                    onRemovePromotion={quitarPromocion}
                  />
                )}
  
                {/* ── Paso 2 ── */}
                {pantalla === 2 && (
                  <ReservationStep2
                    vehiculo={vehiculo}
                    c={c}
                    seguroIdx={seguroIdx}
                    setSeguroIdx={setSeguroIdx}
                    reserva={reserva}
                    cambiarReserva={cambiarReserva}
                    serviciosSeleccionados={serviciosSeleccionados}
                    toggleServicio={toggleServicio}
                  />
                )}
  
                {/* ── Paso 3 ── */}
                {pantalla === 3 && (
                  <PersonalData
                    vehiculo={vehiculo}
                    reserva={reserva}
                    seguroIdx={seguroIdx}
                    serviciosSeleccionados={serviciosSeleccionados}
                    datosForm={datosForm}
                    onCambio={(k, v) => setDatosForm(p => ({ ...p, [k]: v }))}
                    onReservar={handleReservar}
                    errores={errores}
                    docsVerificados={docsVerificados}
                    appliedPromotion={appliedPromotion}
                    cotizacion={cotizacion}
                    onApplyPromotion={aplicarPromocion}
                    onRemovePromotion={quitarPromocion}
                    procesando={procesandoReserva}
                    c={c}
                  />
                )}
  
                {/* ── Botón continuar (pasos 1 y 2) ── */}
                {pantalla < 3 && errorPaso1 && (
                  <div className="detalle-continuar-desktop" style={{ marginTop: 16 }}>
                    <p style={{ color: '#dc2626', fontSize: 13, fontWeight: 700, marginBottom: 12, textAlign: 'right' }}>{errorPaso1}</p>
                  </div>
                )}
              </div>
  
              {/* ── SideSummary (pasos 2 y 3, en columna lateral desktop) ── */}
              {pantalla > 1 && (
                <div
                  ref={resumenMovilRef}
                  className={`detalle-resumen-wrapper lg:col-span-1 min-w-0${resumenMovilAbierto ? ' abierto' : ''}`}
                >
                  <SideSummary
                    vehiculo={vehiculo}
                    reserva={reserva}
                    seguroIdx={seguroIdx}
                    serviciosSeleccionados={serviciosSeleccionados}
                    onEditar={abrirModalEditar}
                    pantalla={pantalla}
                    onContinuar={pantalla < 3 ? irSiguiente : null}
                    appliedPromotion={appliedPromotion}
                    cotizacion={cotizacion}
                    onApplyPromotion={aplicarPromocion}
                    onRemovePromotion={quitarPromocion}
                    c={c}
                  />
                </div>
              )}
  
              {/* Botón continuar móvil */}
              {pantalla < 3 && (
                <div className="detalle-continuar-movil" style={{ display: 'none', width: '100%', marginTop: 24 }}>
                  {errorPaso1 && <p style={{ color: '#dc2626', fontSize: 13, fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>{errorPaso1}</p>}
                  <button onClick={irSiguiente} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px 40px', borderRadius: 16, background: 'var(--brand-gradient)', color: 'var(--brand-on-primary)', fontWeight: 900, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: 'var(--brand-shadow)' }}>
                    {t('common.continue', 'Continuar')}
                  </button>
                </div>
              )}
            </div>
  )
}
