import { useTranslation } from 'react-i18next'
import { FaTimes } from 'react-icons/fa'
import { SUCURSALES } from '../../catalog/constants'
import ProtectionPlans from './ProtectionPlans'
import MileageType from './MileageType'
import AdditionalServices from './AdditionalServices'
import UnifiedReservationConfigCard from './UnifiedReservationConfigCard'
import { showAlert } from '@/utils/swalConfig'
import { useIsMobile } from '../../../hooks/useIsMobile'

export default function EditReservationModal({
  modalEditarOpen, setModalEditarOpen, modalEditarSeccion,
  localReserva, setLocalReserva, localSeguroIdx, setLocalSeguroIdx,
  localServiciosSeleccionados, setLocalServiciosSeleccionados,
  modalError, setModalError,
  vehiculo,
  setReserva, setSeguroIdx, setServiciosSeleccionados, c
}) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  if (!modalEditarOpen) return null

  const cerrar = () => { setModalEditarOpen(false); setModalError('') }

  const guardar = () => {
    if (modalEditarSeccion === 'retiro' || modalEditarSeccion === 'devolucion') {
      if (!localReserva.sucursalRetiro) { setModalError(t('reservas.errorPickupLocation', 'Debes seleccionar el lugar de retiro.')); return }
      if (!localReserva.fechaInicio) { setModalError(t('reservas.errorPickupDate', 'Debes seleccionar la fecha de inicio.')); return }
      if (!localReserva.horaInicio) { setModalError(t('reservas.errorPickupTime', 'Debes seleccionar la hora de retiro.')); return }
      if (!localReserva.sucursalDevolucion) { setModalError(t('reservas.errorReturnLocation', 'Debes seleccionar el lugar de devolución.')); return }
      if (!localReserva.fechaFin) { setModalError(t('reservas.errorReturnDate', 'Debes seleccionar la fecha de devolución.')); return }
      if (!localReserva.horaFin) { setModalError(t('reservas.errorReturnTime', 'Debes seleccionar la hora de devolución.')); return }
      if (localReserva.sucursalRetiro === 'domicilio' || localReserva.sucursalDevolucion === 'domicilio') {
        if (!localReserva.domicilioBarrio?.trim() || !localReserva.domicilioDireccion?.trim()) {
          setModalError(t('reservas.errorDomicilioData', 'Debes completar los datos del domicilio.')); return
        }
      }
    }
    if (modalEditarSeccion === 'grupo') {
      if (localSeguroIdx === null) { setModalError(t('reservas.errorProtectionPlan', 'Debes seleccionar un plan de protección.')); return }
      if (!localReserva.tipoKm) { setModalError(t('reservas.errorMileageType', 'Debes seleccionar el tipo de kilometraje.')); return }
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
    retiro: t('reservas.editDatesLocations', 'Editar Fechas y Lugares'),
    devolucion: t('reservas.editDatesLocations', 'Editar Fechas y Lugares'),
    grupo: t('reservas.yourProtectionExtras', 'Tu Protección y Extras'),
    servicios: t('reservas.editAdditionalServices', 'Editar Servicios Adicionales'),
  }

  const isWide = modalEditarSeccion === 'grupo' || modalEditarSeccion === 'servicios'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center',
      background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', padding: isMobile ? 0 : 16,
    }}>
      <div style={{
        background: c?.cardBg || 'var(--bg-tarjeta)', borderRadius: isMobile ? '28px 28px 0 0' : 28, border: `1px solid ${c?.cardBorder || 'var(--borde)'}`,
        width: '100%', maxWidth: isWide ? 840 : 560,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: c?.isDark ? '0 24px 70px rgba(0,0,0,0.5)' : '0 24px 70px rgba(15,23,42,0.25)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '20px' : '24px 28px', borderBottom: `1px solid ${c?.cardBorder || 'var(--borde)'}`, background: c?.isDark ? 'rgba(255,255,255,0.02)' : 'linear-gradient(135deg,#1e3a8a,#2563eb)' }}>
          <h3 style={{ fontSize: 19, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
            {titleMap[modalEditarSeccion]}
          </h3>
          <button onClick={cerrar} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: isMobile ? '16px' : '28px', overflowY: 'auto', flex: 1, background: c?.isDark ? 'transparent' : '#f8fafc' }}>
          {modalError && (
            <div style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626', padding: '12px 16px', borderRadius: 12, marginBottom: 20, fontSize: 13, fontWeight: 700, border: '1px solid rgba(220,38,38,0.2)' }}>
              {modalError}
            </div>
          )}

          {/* Retiro / Devolución */}
          {(modalEditarSeccion === 'retiro' || modalEditarSeccion === 'devolucion') && (
            <div style={{ marginTop: -12 }}>
              <UnifiedReservationConfigCard
                vehiculo={vehiculo}
                reserva={localReserva}
                onCambio={(campo, valor) => setLocalReserva(prev => {
                  const act = { ...prev, [campo]: valor }
                  if (campo === 'metodoPago' && valor === 'efectivo') {
                    act.sucursalRetiro = vehiculo ? vehiculo.sucursal : ''
                    act.sucursalDevolucion = vehiculo ? vehiculo.sucursal : ''
                    act.domicilioBarrio = ''; act.domicilioDireccion = ''
                    act.domicilioReferencias = ''; act.domicilioCiudad = ''
                  } else if (campo === 'sucursalRetiro' && valor === 'domicilio') {
                    const b = SUCURSALES.find(s => s.nombre === vehiculo?.sucursal)
                    act.domicilioCiudad = b?.ciudad || ''
                  } else if (campo === 'sucursalDevolucion' && valor === 'domicilio') {
                    const b = SUCURSALES.find(s => s.nombre === vehiculo?.sucursal)
                    act.domicilioCiudad = b?.ciudad || ''
                  }
                  return act
                })}
                c={c}
              />
            </div>
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
        <div style={{ padding: isMobile ? '16px' : '18px 28px', borderTop: `1px solid ${c?.cardBorder || 'var(--borde)'}`, display: 'flex', justifyContent: 'flex-end', gap: 12, background: c?.isDark ? 'rgba(255,255,255,0.02)' : 'var(--bg-item)' }}>
          <button onClick={cerrar} style={{ padding: '12px 24px', borderRadius: 14, border: `1px solid ${c?.cardBorder || 'var(--borde)'}`, background: c?.cardBg || 'var(--bg-tarjeta)', color: c?.textPrimary || 'var(--texto-primary)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            {t('common.cancel', 'Cancelar')}
          </button>
          <button onClick={guardar} style={{ padding: '12px 24px', borderRadius: 14, background: 'linear-gradient(90deg,#1e3a8a,#2563eb)', color: '#fff', fontWeight: 900, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(37,99,235,0.22)' }}>
            {t('common.save', 'Guardar cambios')}
          </button>
        </div>
      </div>
    </div>
  )
}

