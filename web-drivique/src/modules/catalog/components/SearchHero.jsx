import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { FaSearch, FaArrowLeft } from 'react-icons/fa'
import { SUCURSALES, CIUDADES } from '../constants'
import AlertaModal from './AlertaModal'

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
  onAbrirBusquedaInvitado = () => {},
  sinCoincidenciasTexto = false,
  sinDisponibilidadFechas = false,
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [focoTexto, setFocoTexto] = useState(false)
  const [modalTextoCerrado, setModalTextoCerrado] = useState(false)
  const [modalFechasCerrado, setModalFechasCerrado] = useState(false)

  // Si el usuario cambia el texto de búsqueda, el modal de texto vuelve a estar
  // disponible (por si vuelve a quedar sin resultados con un término distinto).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModalTextoCerrado(false)
  }, [textoLibre])

  // Cada vez que se aplica una búsqueda nueva de Ciudad/Sucursal/Fechas (clic en
  // "Buscar", lo que crea un objeto nuevo en busquedaAplicada), el modal de
  // disponibilidad vuelve a estar disponible.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModalFechasCerrado(false)
  }, [busquedaAplicada])

  const mostrarModalTexto = sinCoincidenciasTexto && !modalTextoCerrado
  // Si ya se está mostrando el de texto, no apilamos el de fechas encima.
  const mostrarModalFechas = sinDisponibilidadFechas && !modalFechasCerrado && !mostrarModalTexto

  return (
    <div className="catalogo-hero-inner" style={{ background: c.panelBg, borderBottom: '1px solid ' + c.panelBorder, padding: '20px 24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* Buscador de texto libre — funciona igual para invitado y logueado, no requiere sesión.
            En modo invitado se muestra un botón "Volver" a su derecha, con el mismo
            lenguaje visual (pastilla redondeada) que el resto de la barra. */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: c.heroCardBg,
            border: '1.5px solid ' + (sinCoincidenciasTexto ? c.dangerBorder : (focoTexto ? c.accentText : c.heroCardBorder)),
            borderRadius: '9999px',
            padding: '4px 6px 4px 20px',
            boxShadow: focoTexto ? '0 6px 20px rgba(30,58,138,0.14)' : c.heroCardShadow,
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
          }}>
            <FaSearch size={15} color={c.textSecondary} style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={textoLibre}
              onChange={(e) => setTextoLibre(e.target.value)}
              onFocus={() => setFocoTexto(true)}
              onBlur={() => setFocoTexto(false)}
              placeholder={t('catalogo.freeSearchPlaceholder')}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                padding: '13px 0',
                fontSize: '15px',
                color: c.inputText,
              }}
            />
          </div>

          {invitado ? (
            <button
              type="button"
              onClick={() => navigate('/')}
              aria-label={t('common.back', 'Volver')}
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '0 32px',
                borderRadius: '9999px',
                border: '1.5px solid ' + c.heroCardBorder,
                background: c.heroCardBg,
                color: c.textSecondary,
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: c.heroCardShadow,
                transition: 'border-color 150ms ease, color 150ms ease, transform 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = c.accentText
                e.currentTarget.style.color = c.accentText
                e.currentTarget.style.transform = 'translateX(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = c.heroCardBorder
                e.currentTarget.style.color = c.textSecondary
                e.currentTarget.style.transform = 'translateX(0)'
              }}
            >
              <FaArrowLeft size={13} />
              {t('common.back', 'Volver')}
            </button>
          ) : null}
        </div>

        {/* Tarjeta completa Ciudad/Sucursal/Fechas/Buscar — mismo diseño en ambos modos.
            En modo invitado se bloquea con UN solo overlay (no alerta por campo):
            cualquier clic en la tarjeta abre el modal de login. */}
        <div className="hero-busqueda-card" style={{ position: 'relative', background: c.heroCardBg, borderRadius: '16px', border: '1px solid ' + c.heroCardBorder, boxShadow: c.heroCardShadow, padding: '16px 16px' }}>

          {invitado ? (
            <div
              onClick={onAbrirBusquedaInvitado}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onAbrirBusquedaInvitado() }}
              aria-label={t('catalogo.loginToCheckAvailability')}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 5,
                cursor: 'pointer',
                borderRadius: '16px',
                background: 'transparent',
              }}
            />
          ) : null}

          <div
            className="hero-busqueda-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
              gap: '14px',
              alignItems: 'end',
              pointerEvents: invitado ? 'none' : 'auto',
            }}
          >

            <div>
              <label style={{ ...labelStyle, display: 'block' }}>Ciudad</label>
              <select
                value={busquedaForm.ciudad || ''}
                onChange={(e) => { setForm('ciudad', e.target.value); setForm('sucursal', '') }}
                style={inputStyle}
                tabIndex={invitado ? -1 : 0}
              >
                <option value="">Selecciona Ciudad</option>
                {CIUDADES.map((ciudad) => (
                  <option key={ciudad.id} value={ciudad.nombre}>{ciudad.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ ...labelStyle, display: 'block' }}>Sucursal</label>
              <select
                value={busquedaForm.sucursal || ''}
                onChange={(e) => setForm('sucursal', e.target.value)}
                style={inputStyle}
                disabled={!busquedaForm.ciudad}
                tabIndex={invitado ? -1 : 0}
              >
                <option value="">Selecciona Sucursal</option>
                {SUCURSALES.filter((s) => s.ciudad === busquedaForm.ciudad).map((s) => (
                  <option key={s.nombre} value={s.nombre}>{s.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ ...labelStyle, display: 'block' }}>{t('vehiculo.pickupDate')}</label>
              <input type="date" value={busquedaForm.fechaInicio || ''} onChange={(e) => setForm('fechaInicio', e.target.value)} style={inputStyle} tabIndex={invitado ? -1 : 0} />
            </div>

            <div>
              <label style={{ ...labelStyle, display: 'block' }}>{t('vehiculo.returnDate')}</label>
              <input type="date" value={busquedaForm.fechaFin || ''} onChange={(e) => setForm('fechaFin', e.target.value)} style={inputStyle} tabIndex={invitado ? -1 : 0} />
            </div>

            <div>
              <button
                type="button"
                onClick={handleBuscar}
                tabIndex={invitado ? -1 : 0}
                style={{ width: '100%', height: '48px', borderRadius: '12px', background: c.accentGradient, color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(30,58,138,0.25)' }}
              >
                {t('catalogo.searchBtn')}
              </button>
            </div>

          </div>

          {errorBusqueda ? (
            <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '10px', background: c.dangerBg, border: '1px solid ' + c.dangerBorder }}>
              <span style={{ fontSize: '13px', color: c.dangerText, fontWeight: 600 }}>{errorBusqueda}</span>
            </div>
          ) : null}
        </div>

      </div>

      {mostrarModalTexto ? (
        <AlertaModal
          c={c}
          titulo={t('catalogo.noMatchesFreeSearchTitle')}
          mensaje={t('catalogo.noMatchesFreeSearch', { termino: textoLibre })}
          textoBoton={t('common.close')}
          onCerrar={() => setModalTextoCerrado(true)}
        />
      ) : null}

      {mostrarModalFechas ? (
        <AlertaModal
          c={c}
          titulo={t('catalogo.noAvailabilityDatesTitle')}
          mensaje={t('catalogo.noAvailabilityDates', { sucursal: busquedaAplicada.sucursal })}
          textoBoton={t('common.close')}
          onCerrar={() => setModalFechasCerrado(true)}
        />
      ) : null}
    </div>
  )
}