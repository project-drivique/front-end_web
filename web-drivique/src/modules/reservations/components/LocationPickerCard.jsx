import { useTranslation } from 'react-i18next'
import { FaMapMarkerAlt } from 'react-icons/fa'
import { SUCURSALES, CIUDADES } from '../../catalog/constants'

export default function LocationPickerCard({ vehiculo, reserva, onCambio, c }) {
  const { t } = useTranslation()

  const bg          = c?.cardBg      || '#fff'
  const border      = c?.cardBorder  || '#e2e8f0'
  const titleColor  = c?.titleColor  || 'var(--brand-secondary)'
  const textPrimary = c?.textPrimary || 'var(--texto-primary)'
  const textSecond  = c?.textSecondary || 'var(--texto-second)'
  const accent      = c?.accentText  || 'var(--brand-primary)'

  const carBranch = vehiculo?.sucursal
  const branchObj = SUCURSALES.find(s => s.nombre === carBranch)
  const cityObj   = branchObj ? CIUDADES.find(c => c.nombre === branchObj.ciudad) : null

  const opcionesEntrega = carBranch
    ? [{ value: carBranch, label: t('vehiculo.pickupAtBranch', { sucursal: carBranch }) }]
    : []

  if (reserva?.metodoPago !== 'efectivo') {
    opcionesEntrega.push({ value: 'domicilio', label: t('vehiculo.deliveryHome') })
    if (cityObj?.tieneAeropuerto) opcionesEntrega.push({ value: 'aeropuerto', label: t('vehiculo.deliveryAirport') })
    if (cityObj?.tieneTerminal)   opcionesEntrega.push({ value: 'terminal',   label: t('vehiculo.deliveryTerminal') })
  }

  const opcionesDevolucion = carBranch
    ? [{ value: carBranch, label: t('vehiculo.returnAtBranch', { sucursal: carBranch }) }]
    : []

  if (reserva?.metodoPago !== 'efectivo') {
    opcionesDevolucion.push({ value: 'domicilio', label: t('vehiculo.returnHome') })
    if (cityObj?.tieneAeropuerto) opcionesDevolucion.push({ value: 'aeropuerto', label: t('vehiculo.returnAirport') })
    if (cityObj?.tieneTerminal)   opcionesDevolucion.push({ value: 'terminal',   label: t('vehiculo.returnTerminal') })
  }

  const selectStyle = {
    width: '100%',
    border: `1px solid ${border}`,
    borderRadius: 10,
    padding: '9px 12px',
    fontSize: 13,
    fontWeight: 700,
    color: textPrimary,
    background: bg,
    outline: 'none',
    cursor: 'pointer',
    appearance: 'auto',
  }

  return (
    <div style={{ background: bg, padding: 20, borderRadius: 16, border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <FaMapMarkerAlt color={accent} size={14} />
        <h3 style={{ fontSize: 13, fontWeight: 700, color: titleColor, margin: 0 }}>
          {t('vehiculo.locationPickerTitle', 'Selecciona lugar de entrega y devolución')}
        </h3>
      </div>

      {/* Campo de Recogida */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ fontSize: 12, color: textSecond, margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FaMapMarkerAlt size={11} color="#94a3b8" />
          {t('vehiculo.pickupLocationLabel', 'Lugar de recogida')}
        </p>
        <select
          id="campo-lugar-retiro"
          value={reserva?.sucursalRetiro || ''}
          onChange={e => onCambio('sucursalRetiro', e.target.value)}
          title={opcionesEntrega.find(o => o.value === reserva?.sucursalRetiro)?.label}
          style={selectStyle}
        >
          <option value="">{t('vehiculo.selectLocation', 'Selecciona Lugar')}</option>
          {opcionesEntrega.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      {/* Campo de Devolución */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ fontSize: 12, color: textSecond, margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FaMapMarkerAlt size={11} color="#94a3b8" />
          {t('vehiculo.returnLocationLabel', 'Lugar de devolución')}
        </p>
        <select
          id="campo-lugar-devolucion"
          value={reserva?.sucursalDevolucion || ''}
          onChange={e => onCambio('sucursalDevolucion', e.target.value)}
          title={opcionesDevolucion.find(o => o.value === reserva?.sucursalDevolucion)?.label}
          style={selectStyle}
        >
          <option value="">{t('vehiculo.selectLocation', 'Selecciona Lugar')}</option>
          {opcionesDevolucion.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      {/* Campos de domicilio cuando aplica */}
      {reserva?.sucursalRetiro === 'domicilio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px', borderRadius: 12, background: '#f8fafc', border: `1px solid var(--brand-soft-strong-light)` }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: accent, margin: 0 }}>
            {t('vehiculo.domicilioSectionTitle', 'Datos de domicilio')}
          </p>
          <input
            type="text"
            placeholder={t('vehiculo.domicilioNeighborhoodPlaceholder', 'Barrio')}
            value={reserva?.domicilioBarrio || ''}
            onChange={e => onCambio('domicilioBarrio', e.target.value)}
            style={{ ...selectStyle, fontWeight: 500 }}
          />
          <input
            type="text"
            placeholder={t('vehiculo.domicilioAddressPlaceholder', 'Dirección exacta')}
            value={reserva?.domicilioDireccion || ''}
            onChange={e => onCambio('domicilioDireccion', e.target.value)}
            style={{ ...selectStyle, fontWeight: 500 }}
          />
          <textarea
            rows={2}
            placeholder={t('vehiculo.domicilioReferencesPlaceholder', 'Referencias')}
            value={reserva?.domicilioReferencias || ''}
            onChange={e => onCambio('domicilioReferencias', e.target.value)}
            style={{ ...selectStyle, fontWeight: 500, resize: 'none' }}
          />
        </div>
      )}
    </div>
  )
}
