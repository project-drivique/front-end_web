import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa'

import { SUCURSALES, CIUDADES } from '../constants'
import AlertaModal from './AlertModal'

export default function HeroBusqueda({
  c,
  inputStyle,
  labelStyle,
  busquedaForm = {},
  setForm = () => {},
  busquedaAplicada = {},
  errorBusqueda = '',
  handleBuscar = () => {},
  invitado = false,
  textoLibre = '',
  onAbrirBusquedaInvitado = () => {},
  sinCoincidenciasTexto = false,
  sinDisponibilidadFechas = false,
}) {
  const { t } = useTranslation()

  const [modalTextoCerrado, setModalTextoCerrado] = useState(false)
  const [modalFechasCerrado, setModalFechasCerrado] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModalTextoCerrado(false)
  }, [textoLibre])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModalFechasCerrado(false)
  }, [busquedaAplicada])

  const mostrarModalTexto = sinCoincidenciasTexto && !modalTextoCerrado
  const mostrarModalFechas = sinDisponibilidadFechas && !modalFechasCerrado && !mostrarModalTexto

  return (
    <div style={{ width: '100%', padding: '8px 0 0' }}>
      <div style={{ width: 'min(1360px, calc(100% - 48px))', margin: '0 auto' }}>

        {/* CIUDAD / SUCURSAL / FECHAS / BUSCAR */}
        <div
          style={{
            background: c.heroCardBg,
            borderRadius: '14px',
            border: `1px solid ${c.heroCardBorder}`,
            boxShadow: c.heroCardShadow,
            padding: '14px 16px',
            position: 'relative',
          }}
        >

          {invitado && (
            <div
              onClick={onAbrirBusquedaInvitado}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onAbrirBusquedaInvitado() }}
              style={{ position: 'absolute', inset: 0, zIndex: 5, cursor: 'pointer', borderRadius: '14px', background: 'transparent' }}
            />
          )}

          <div
            className="hero-busqueda-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.05fr 1.05fr 1fr 1fr 0.85fr',
              gap: '12px',
              alignItems: 'end',
              pointerEvents: invitado ? 'none' : 'auto',
            }}
          >

            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaMapMarkerAlt size={10} color={c.accentText} />
                Ciudad
              </label>
              <select
                value={busquedaForm.ciudad || ''}
                onChange={e => { setForm('ciudad', e.target.value); setForm('sucursal', '') }}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">Selecciona ciudad</option>
                {CIUDADES.map(ciudad => (
                  <option key={ciudad.id} value={ciudad.nombre}>{ciudad.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaMapMarkerAlt size={10} color={c.accentText} />
                Sucursal
              </label>
              <select
                value={busquedaForm.sucursal || ''}
                onChange={e => setForm('sucursal', e.target.value)}
                disabled={!busquedaForm.ciudad}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">Selecciona sucursal</option>
                {SUCURSALES.filter(s => s.ciudad === busquedaForm.ciudad).map(s => (
                  <option key={s.nombre} value={s.nombre}>{s.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaCalendarAlt size={10} color={c.accentText} />
                {t('vehiculo.pickupDate')}
              </label>
              <input
                type="date"
                value={busquedaForm.fechaInicio || ''}
                onChange={e => setForm('fechaInicio', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaCalendarAlt size={10} color={c.accentText} />
                {t('vehiculo.returnDate')}
              </label>
              <input
                type="date"
                value={busquedaForm.fechaFin || ''}
                onChange={e => setForm('fechaFin', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <button
                type="button"
                onClick={handleBuscar}
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '10px',
                  background: c.accentGradient,
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.20)',
                }}
              >
                {t('catalogo.searchBtn')}
              </button>
            </div>
          </div>

          {errorBusqueda && (
            <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '10px', background: c.dangerBg, border: `1px solid ${c.dangerBorder}` }}>
              <span style={{ fontSize: '12px', color: c.dangerText, fontWeight: 600 }}>{errorBusqueda}</span>
            </div>
          )}
        </div>
      </div>

      {mostrarModalTexto && (
        <AlertaModal
          c={c}
          titulo={t('catalogo.noMatchesFreeSearchTitle')}
          mensaje={t('catalogo.noMatchesFreeSearch', { termino: textoLibre })}
          textoBoton={t('common.close')}
          onCerrar={() => setModalTextoCerrado(true)}
        />
      )}

      {mostrarModalFechas && (
        <AlertaModal
          c={c}
          titulo={t('catalogo.noAvailabilityDatesTitle')}
          mensaje={t('catalogo.noAvailabilityDates', { sucursal: busquedaAplicada.sucursal })}
          textoBoton={t('common.close')}
          onCerrar={() => setModalFechasCerrado(true)}
        />
      )}
    </div>
  )
}