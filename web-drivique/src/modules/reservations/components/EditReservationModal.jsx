import { useTranslation } from 'react-i18next'
import { FaTimes } from 'react-icons/fa'
import { SUCURSALES } from '../../catalog/constants'
import { HORAS } from '../hooks/useReservationFlow'
import ReservationCalendar from './ReservationCalendar'
import ProtectionPlans from './ProtectionPlans'
import MileageType from './MileageType'
import AdditionalServices from './AdditionalServices'
import { showAlert } from '@/utils/swalConfig'

export default function EditReservationModal({
  modalEditarOpen, setModalEditarOpen, modalEditarSeccion,
  localReserva, setLocalReserva, localSeguroIdx, setLocalSeguroIdx,
  localServiciosSeleccionados, setLocalServiciosSeleccionados,
  modalError, setModalError,
  vehiculo,
  setReserva, setSeguroIdx, setServiciosSeleccionados, c
}) {
  const { t } = useTranslation()

  if (!modalEditarOpen) return null

  const opcionesEntregaModal = vehiculo ? [
    { value: vehiculo.sucursal, label: t('vehiculo.pickupAtBranch', { sucursal: vehiculo.sucursal }) }
  ] : []
  if (vehiculo && localReserva.metodoPago !== 'efectivo') {
    const cityBranch = SUCURSALES.find(s => s.nombre === vehiculo.sucursal)
    opcionesEntregaModal.push({ value: 'domicilio', label: t('vehiculo.deliveryHome') })
    if (cityBranch?.tieneAeropuerto) opcionesEntregaModal.push({ value: 'aeropuerto', label: t('vehiculo.deliveryAirport') })
    if (cityBranch?.tieneTerminal) opcionesEntregaModal.push({ value: 'terminal', label: t('vehiculo.deliveryTerminal') })
  }

  const opcionesDevolucionModal = vehiculo ? [
    { value: vehiculo.sucursal, label: t('vehiculo.returnAtBranch', { sucursal: vehiculo.sucursal }) }
  ] : []
  if (vehiculo && localReserva.metodoPago !== 'efectivo') {
    const cityBranch = SUCURSALES.find(s => s.nombre === vehiculo.sucursal)
    opcionesDevolucionModal.push({ value: 'domicilio', label: t('vehiculo.returnHome') })
    if (cityBranch?.tieneAeropuerto) opcionesDevolucionModal.push({ value: 'aeropuerto', label: t('vehiculo.returnAirport') })
    if (cityBranch?.tieneTerminal) opcionesDevolucionModal.push({ value: 'terminal', label: t('vehiculo.returnTerminal') })
  }

  const cerrar = () => { setModalEditarOpen(false); setModalError('') }

  const guardar = () => {
    if (modalEditarSeccion === 'retiro') {
      if (!localReserva.sucursalRetiro) { setModalError('Debes seleccionar el lugar de retiro.'); return }
      if (!localReserva.fechaInicio) { setModalError('Debes seleccionar la fecha de inicio.'); return }
      if (!localReserva.horaInicio) { setModalError('Debes seleccionar la hora de retiro.'); return }
      if (localReserva.sucursalRetiro === 'domicilio') {
        if (!localReserva.domicilioBarrio?.trim() || !localReserva.domicilioDireccion?.trim() || !localReserva.domicilioReferencias?.trim()) {
          setModalError('Debes completar todos los datos del domicilio.'); return
        }
      }
    }
    if (modalEditarSeccion === 'devolucion') {
      if (!localReserva.sucursalDevolucion) { setModalError('Debes seleccionar el lugar de devolución.'); return }
      if (!localReserva.fechaFin) { setModalError('Debes seleccionar la fecha de devolución.'); return }
      if (!localReserva.horaFin) { setModalError('Debes seleccionar la hora de devolución.'); return }
      if (localReserva.sucursalDevolucion === 'domicilio') {
        if (!localReserva.domicilioBarrio?.trim() || !localReserva.domicilioDireccion?.trim() || !localReserva.domicilioReferencias?.trim()) {
          setModalError('Debes completar todos los datos del domicilio.'); return
        }
      }
    }
    if (modalEditarSeccion === 'grupo') {
      if (localSeguroIdx === null) { setModalError('Debes seleccionar un plan de protección.'); return }
      if (!localReserva.tipoKm) { setModalError('Debes seleccionar el tipo de kilometraje.'); return }
    }

    setReserva({ ...localReserva })
    setSeguroIdx(localSeguroIdx)
    setServiciosSeleccionados([...localServiciosSeleccionados])
    setModalError('')
    setModalEditarOpen(false)

    if (localReserva.metodoPago === 'efectivo' && vehiculo) {
      const sucursal = SUCURSALES.find(s => s.nombre === vehiculo.sucursal)
      if (sucursal) {
        showAlert({
          icon: 'info',
          title: t('vehiculo.cashBranchTitle'),
          background: 'var(--bg-tarjeta)',
          color: 'var(--texto-primary)',
          html: `<div style="text-align:left;font-size:14px;line-height:1.6;color:var(--texto-primary);">
            <p style="margin:0 0 10px;">${t('vehiculo.cashBranchIntro')}</p>
            <div style="background:var(--bg-item);border:1px solid var(--borde);border-radius:12px;padding:14px 16px;">
              <p style="margin:0 0 4px;font-weight:800;color:var(--texto-acento);">${sucursal.nombre}</p>
              <p style="margin:0 0 4px;color:var(--texto-second);"><strong>${t('vehiculo.cashBranchCity')}:</strong> ${sucursal.ciudad}</p>
              <p style="margin:0;color:var(--texto-second);"><strong>${t('vehiculo.cashBranchAddress')}:</strong> ${sucursal.direccion || t('vehiculo.cashBranchNoAddress')}</p>
            </div>
          </div>`,
          confirmButtonText: t('common.close'),
          width: 480,
        })
      }
    }
  }

  const titleMap = {
    retiro: 'Editar Retiro',
    devolucion: 'Editar Devolución',
    grupo: 'Tu Protección y Extras',
    servicios: 'Editar Servicios Adicionales',
  }

  const isWide = modalEditarSeccion === 'grupo' || modalEditarSeccion === 'servicios'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', padding: 16,
    }}>
      <div style={{
        background: c?.cardBg || 'var(--bg-tarjeta)', borderRadius: 28, border: `1px solid ${c?.cardBorder || 'var(--borde)'}`,
        width: '100%', maxWidth: isWide ? 840 : 560,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: c?.isDark ? '0 24px 70px rgba(0,0,0,0.5)' : '0 24px 70px rgba(15,23,42,0.25)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '24px 28px', borderBottom: '1px solid var(--borde)',
          background: 'linear-gradient(135deg,#1e3a8a,#2563eb)',
        }}>
          <h3 style={{ fontSize: 19, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
            {titleMap[modalEditarSeccion]}
          </h3>
          <button onClick={cerrar} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 28, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {modalError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 16, padding: '14px 18px', color: '#b91c1c', fontSize: 13, fontWeight: 800 }}>
              {modalError}
            </div>
          )}

          {/* Retiro / Devolución */}
          {(modalEditarSeccion === 'retiro' || modalEditarSeccion === 'devolucion') && (
            <>
              {/* Método de pago */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: c?.textSecondary || 'var(--texto-second)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Método de Pago</label>
                <div style={{ border: `1px solid ${c?.cardBorder || 'var(--borde)'}`, borderRadius: 16, padding: '12px 16px', background: c?.isDark ? 'rgba(255,255,255,0.05)' : 'var(--bg-item)' }}>
                  <select
                    className="w-full bg-transparent text-sm font-extrabold text-[var(--texto-primary)] outline-none cursor-pointer"
                    value={localReserva.metodoPago}
                    onChange={e => {
                      const val = e.target.value
                      setLocalReserva(prev => {
                        const act = { ...prev, metodoPago: val }
                        if (val === 'efectivo') {
                          act.sucursalRetiro = vehiculo ? vehiculo.sucursal : ''
                          act.sucursalDevolucion = vehiculo ? vehiculo.sucursal : ''
                          act.domicilioBarrio = ''; act.domicilioDireccion = ''
                          act.domicilioReferencias = ''; act.domicilioCiudad = ''
                        }
                        return act
                      })
                    }}
                  >
                    <option value="wompi">Pago digital (Wompi)</option>
                    <option value="efectivo">Pago en efectivo en sucursal</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {modalEditarSeccion === 'retiro' ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 800, color: c?.textSecondary || 'var(--texto-second)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('vehiculo.pickupLocationLabel')}</label>
                      <div style={{ border: `1px solid ${c?.cardBorder || 'var(--borde)'}`, borderRadius: 16, padding: '12px 16px', background: c?.isDark ? 'rgba(255,255,255,0.05)' : 'var(--bg-item)' }}>
                        <select
                          className="w-full bg-transparent text-sm font-extrabold text-[var(--texto-primary)] outline-none cursor-pointer"
                          value={localReserva.sucursalRetiro}
                          onChange={e => {
                            const val = e.target.value
                            setLocalReserva(prev => {
                              const act = { ...prev, sucursalRetiro: val }
                              if (val === 'domicilio') {
                                const b = SUCURSALES.find(s => s.nombre === vehiculo?.sucursal)
                                act.domicilioCiudad = b?.ciudad || ''
                              }
                              return act
                            })
                          }}
                        >
                          <option value="">Selecciona sucursal</option>
                          {opcionesEntregaModal.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 800, color: c?.textSecondary || 'var(--texto-second)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hora</label>
                      <div style={{ border: `1px solid ${c?.cardBorder || 'var(--borde)'}`, borderRadius: 16, padding: '12px 16px', background: c?.isDark ? 'rgba(255,255,255,0.05)' : 'var(--bg-item)' }}>
                        <select
                          className="w-full bg-transparent text-sm font-extrabold text-[var(--texto-primary)] outline-none cursor-pointer"
                          value={localReserva.horaInicio}
                          onChange={e => setLocalReserva(prev => ({ ...prev, horaInicio: e.target.value }))}
                        >
                          <option value="">Selecciona hora</option>
                          {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 800, color: c?.textSecondary || 'var(--texto-second)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('vehiculo.returnLocationLabel')}</label>
                      <div style={{ border: `1px solid ${c?.cardBorder || 'var(--borde)'}`, borderRadius: 16, padding: '12px 16px', background: c?.isDark ? 'rgba(255,255,255,0.05)' : 'var(--bg-item)' }}>
                        <select
                          className="w-full bg-transparent text-sm font-extrabold text-[var(--texto-primary)] outline-none cursor-pointer"
                          value={localReserva.sucursalDevolucion}
                          onChange={e => {
                            const val = e.target.value
                            setLocalReserva(prev => {
                              const act = { ...prev, sucursalDevolucion: val }
                              if (val === 'domicilio') {
                                const b = SUCURSALES.find(s => s.nombre === vehiculo?.sucursal)
                                act.domicilioCiudad = b?.ciudad || ''
                              }
                              return act
                            })
                          }}
                        >
                          <option value="">Selecciona sucursal</option>
                          {opcionesDevolucionModal.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 800, color: c?.textSecondary || 'var(--texto-second)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hora</label>
                      <div style={{ border: `1px solid ${c?.cardBorder || 'var(--borde)'}`, borderRadius: 16, padding: '12px 16px', background: c?.isDark ? 'rgba(255,255,255,0.05)' : 'var(--bg-item)' }}>
                        <select
                          className="w-full bg-transparent text-sm font-extrabold text-[var(--texto-primary)] outline-none cursor-pointer"
                          value={localReserva.horaFin}
                          onChange={e => setLocalReserva(prev => ({ ...prev, horaFin: e.target.value }))}
                        >
                          <option value="">Selecciona hora</option>
                          {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Domicilio */}
              {((modalEditarSeccion === 'retiro' && localReserva.sucursalRetiro === 'domicilio') ||
                (modalEditarSeccion === 'devolucion' && localReserva.sucursalDevolucion === 'domicilio')) && (
                <div style={{ background: 'var(--bg-item)', border: '1px solid var(--borde)', borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Dirección de Domicilio</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--texto-second)' }}>Ciudad</label>
                      <input type="text" disabled value={localReserva.domicilioCiudad || ''} style={{ border: '1px solid var(--borde)', borderRadius: 12, padding: '10px 14px', background: '#e2e8f0', fontSize: 13, color: 'var(--texto-second)', fontWeight: 600 }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--texto-second)' }}>Barrio *</label>
                      <input type="text" value={localReserva.domicilioBarrio || ''} onChange={e => setLocalReserva(prev => ({ ...prev, domicilioBarrio: e.target.value }))} style={{ border: '1px solid var(--borde)', borderRadius: 12, padding: '10px 14px', background: 'var(--bg-item)', fontSize: 13, color: 'var(--texto-primary)', fontWeight: 600 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--texto-second)' }}>Dirección *</label>
                    <input type="text" value={localReserva.domicilioDireccion || ''} onChange={e => setLocalReserva(prev => ({ ...prev, domicilioDireccion: e.target.value }))} style={{ border: '1px solid var(--borde)', borderRadius: 12, padding: '10px 14px', background: 'var(--bg-item)', fontSize: 13, color: 'var(--texto-primary)', fontWeight: 600 }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 10, fontWeight: 800, color: 'var(--texto-second)' }}>Referencias *</label>
                    <textarea rows="2" value={localReserva.domicilioReferencias || ''} onChange={e => setLocalReserva(prev => ({ ...prev, domicilioReferencias: e.target.value }))} style={{ border: '1px solid var(--borde)', borderRadius: 12, padding: '10px 14px', background: 'var(--bg-item)', fontSize: 13, color: 'var(--texto-primary)', resize: 'none', fontWeight: 600 }} />
                  </div>
                </div>
              )}

              {/* Calendario */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--texto-second)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fechas de Reserva</label>
                <div style={{ border: '1px solid var(--borde)', borderRadius: 20, padding: 16 }}>
                  <ReservationCalendar
                    vehiculoId={vehiculo.id}
                    fechaInicio={localReserva.fechaInicio}
                    fechaFin={localReserva.fechaFin}
                    onCambiarFechas={({ fechaInicio, fechaFin }) => setLocalReserva(prev => ({ ...prev, fechaInicio, fechaFin }))}
                    c={c}
                  />
                </div>
              </div>
            </>
          )}

          {/* Grupo (protección + km) */}
          {modalEditarSeccion === 'grupo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <ProtectionPlans seguroIdx={localSeguroIdx} onSeleccionar={setLocalSeguroIdx} c={c} />
              <div style={{ borderTop: `1px solid ${c?.cardBorder || 'var(--borde)'}`, paddingTop: 20 }}>
                <MileageType vehiculo={vehiculo} tipoKm={localReserva.tipoKm} onSeleccionar={val => setLocalReserva(prev => ({ ...prev, tipoKm: val }))} c={c} />
              </div>
            </div>
          )}

          {/* Servicios */}
          {modalEditarSeccion === 'servicios' && (
            <AdditionalServices
              servicios={vehiculo.servicios}
              seleccionados={localServiciosSeleccionados}
              onToggle={nombre => setLocalServiciosSeleccionados(prev =>
                prev.includes(nombre) ? prev.filter(n => n !== nombre) : [...prev, nombre]
              )}
              c={c}
            />
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '18px 28px', borderTop: `1px solid ${c?.cardBorder || 'var(--borde)'}`, display: 'flex', justifyContent: 'flex-end', gap: 12, background: c?.isDark ? 'rgba(255,255,255,0.02)' : 'var(--bg-item)' }}>
          <button onClick={cerrar} style={{ padding: '12px 24px', borderRadius: 14, border: `1px solid ${c?.cardBorder || 'var(--borde)'}`, background: c?.cardBg || 'var(--bg-tarjeta)', color: c?.textPrimary || 'var(--texto-primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={guardar} style={{ padding: '12px 24px', borderRadius: 14, background: 'linear-gradient(90deg,#1e3a8a,#2563eb)', color: '#fff', fontWeight: 900, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(37,99,235,0.22)' }}>
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  )
}

