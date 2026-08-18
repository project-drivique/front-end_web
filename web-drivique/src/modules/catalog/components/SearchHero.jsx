import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaMapMarkerAlt, FaCalendarAlt, FaSearch, FaTimes, FaStore, FaExclamationTriangle } from 'react-icons/fa'

import { SUCURSALES, CIUDADES } from '../constants'
import IncompleteSearchModal from './IncompleteSearchModal'
import NoResultsModal from './NoResultsModal'

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
  setTextoLibre = () => {},
  mostrarBusquedaLibre = false,
  onAbrirBusquedaInvitado = () => {},
  sinCoincidenciasTexto = false,
  sinDisponibilidadFechas = false,
  onLimpiar = null,
}) {
  const { t } = useTranslation()

  const [modalTextoCerrado, setModalTextoCerrado] = useState(false)
  const [modalFechasCerrado, setModalFechasCerrado] = useState(false)
  const [modalErrorCerrado, setModalErrorCerrado] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModalTextoCerrado(false)
  }, [textoLibre])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModalFechasCerrado(false)
  }, [busquedaAplicada])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModalErrorCerrado(false)
  }, [errorBusqueda])

  const mostrarModalTexto = sinCoincidenciasTexto && !modalTextoCerrado
  const mostrarModalFechas = sinDisponibilidadFechas && !modalFechasCerrado && !mostrarModalTexto
  const mostrarModalError = !!errorBusqueda && !modalErrorCerrado

  return (
    <div style={{ width: '100%', padding: '18px 0 0' }}>
      <div style={{ width: 'min(1360px, calc(100% - 48px))', margin: '0 auto' }}>

        {invitado ? (
          /* ── MODO INVITADO: Buscador Estándar de 5 columnas (Intacto) ── */
          <div
            style={{
              background: c.heroCardBg,
              borderRadius: '16px',
              border: `1px solid ${c.heroCardBorder}`,
              boxShadow: c.heroCardShadow,
              padding: '16px 20px',
              position: 'relative',
            }}
          >
            <div
              onClick={onAbrirBusquedaInvitado}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onAbrirBusquedaInvitado() }}
              style={{ position: 'absolute', inset: 0, zIndex: 5, cursor: 'pointer', borderRadius: '16px', background: 'transparent' }}
            />

            <div
              className="hero-busqueda-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1.05fr 1.05fr 1fr 1fr 0.85fr',
                gap: '12px',
                alignItems: 'end',
                pointerEvents: 'none',
              }}
            >
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaMapMarkerAlt size={10} color={c.accentText} />
                  {t('catalogo.cityLabel')}
                </label>
                <select
                  value={busquedaForm.ciudad || ''}
                  onChange={e => { setForm('ciudad', e.target.value); setForm('sucursal', '') }}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">{t('catalogo.selectCity')}</option>
                  {CIUDADES.map(ciudad => (
                    <option key={ciudad.id} value={ciudad.nombre}>{ciudad.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaStore size={10} color={c.accentText} />
                  {t('catalogo.branchLabel')}
                </label>
                <select
                  value={busquedaForm.sucursal || ''}
                  onChange={e => setForm('sucursal', e.target.value)}
                  disabled={!busquedaForm.ciudad}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">{t('catalogo.selectBranch')}</option>
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
                  onClick={() => {
                    setModalErrorCerrado(false)
                    setModalFechasCerrado(false)
                    handleBuscar()
                  }}
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {t('catalogo.searchBtn')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── MODO REGISTRADO: Buscador de Disponibilidad (Izquierda) y Buscador Libre (Derecha) ── */
          <div
            className="hero-busqueda-registered-wrapper"
            style={{
              display: 'flex',
              alignItems: 'stretch',
              gap: '16px',
              width: '100%',
            }}
          >
            {/* Contenedor Tarjeta 1 (Izquierda): Buscador de Disponibilidad */}
            <div
              style={{
                background: c.heroCardBg,
                borderRadius: '16px',
                border: `1px solid ${c.heroCardBorder}`,
                boxShadow: c.heroCardShadow,
                padding: '16px 20px',
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                  gap: '12px',
                  alignItems: 'end',
                }}
              >
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FaMapMarkerAlt size={10} color={c.accentText} />
                    {t('catalogo.cityLabel')}
                  </label>
                  <select
                    value={busquedaForm.ciudad || ''}
                    onChange={e => { setForm('ciudad', e.target.value); setForm('sucursal', '') }}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">{t('catalogo.selectCity')}</option>
                    {CIUDADES.map(ciudad => (
                      <option key={ciudad.id} value={ciudad.nombre}>{ciudad.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FaStore size={10} color={c.accentText} />
                    {t('catalogo.branchLabel')}
                  </label>
                  <select
                    value={busquedaForm.sucursal || ''}
                    onChange={e => setForm('sucursal', e.target.value)}
                    disabled={!busquedaForm.ciudad}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">{t('catalogo.selectBranch')}</option>
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
                    onClick={() => {
                      setModalErrorCerrado(false)
                      setModalFechasCerrado(false)
                      handleBuscar()
                    }}
                    style={{
                      height: '38px',
                      padding: '0 22px',
                      borderRadius: '10px',
                      background: c.accentGradient,
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '13px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(37,99,235,0.20)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      width: '100%',
                    }}
                  >
                    {t('catalogo.searchBtn')}
                  </button>
                </div>
              </div>
            </div>

            {/* Contenedor Tarjeta 2 (Derecha): Buscador por Marca o Modelo */}
            <div
              style={{
                background: c.heroCardBg,
                borderRadius: '16px',
                border: `1px solid ${c.heroCardBorder}`,
                boxShadow: c.heroCardShadow,
                padding: '16px 20px',
                width: '380px',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
              }}
            >
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                <FaSearch size={10} color={c.accentText} />
                {t('catalogo.searchVehicleLabel', 'BUSCAR VEHÍCULO')}
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  value={textoLibre}
                  onChange={e => setTextoLibre(e.target.value)}
                  placeholder={t('catalogo.freeSearchPlaceholder', 'Buscar por marca o modelo...')}
                  className="catalogo-free-search-input"
                  style={{
                    ...inputStyle,
                    paddingLeft: '12px',
                    paddingRight: textoLibre ? '28px' : '12px',
                    '--placeholder-color': c.inputText,
                  }}
                />
                {textoLibre && (
                  <button
                    type="button"
                    onClick={() => setTextoLibre('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: c.textSecondary,
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FaTimes size={10} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {mostrarModalError && (
        <IncompleteSearchModal
          c={c}
          titulo={t('catalogo.incompleteSearchTitle', 'Seleccionar ubicación y fechas')}
          mensaje={errorBusqueda}
          textoBoton={t('common.understood', 'Entendido')}
          onCerrar={() => setModalErrorCerrado(true)}
        />
      )}

      {mostrarModalTexto && (
        <NoResultsModal
          c={c}
          titulo={t('catalogo.noMatchesFreeSearchTitle')}
          mensaje={t('catalogo.noMatchesFreeSearch', { termino: textoLibre })}
          textoBoton={t('common.close')}
          onCerrar={() => setModalTextoCerrado(true)}
        />
      )}

      {mostrarModalFechas && (
        <NoResultsModal
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