import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  addMonths, subMonths, isSameMonth, isToday, format,
} from 'date-fns'
import { es, enUS, fr, ptBR } from 'date-fns/locale'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useDisponibilidadVehiculo } from '../hooks/useVehicleAvailability'

const hoyISO = format(new Date(), 'yyyy-MM-dd')

export default function CalendarioReservas({ vehiculoId, fechaInicio, fechaFin, onCambiarFechas }) {
  const { t, i18n } = useTranslation()
  const { estaOcupado, cargando } = useDisponibilidadVehiculo(vehiculoId)
  const [mesActual, setMesActual] = useState(new Date())
  const [aviso, setAviso] = useState('')

  const getLocale = () => {
    switch (i18n.language) {
      case 'en': return enUS
      case 'fr': return fr
      case 'pt': return ptBR
      case 'br': return ptBR
      default: return es
    }
  }
  const currentLocale = getLocale()
  const DIAS_SEMANA = t('vehiculo.calendarDays', 'Lun,Mar,Mié,Jue,Vie,Sáb,Dom').split(',')

  const dias = useMemo(() => {
    const inicio = startOfWeek(startOfMonth(mesActual), { weekStartsOn: 1 })
    const fin = endOfWeek(endOfMonth(mesActual), { weekStartsOn: 1 })
    return eachDayOfInterval({ start: inicio, end: fin })
  }, [mesActual])

  const esPasado = useCallback((fechaISO) => fechaISO < hoyISO, [])

  const hayConflictoEnRango = useCallback((desde, hasta) => {
    return eachDayOfInterval({ start: new Date(desde), end: new Date(hasta) })
      .some(d => estaOcupado(format(d, 'yyyy-MM-dd')))
  }, [estaOcupado])

  const handleClickDia = useCallback((date) => {
    const fechaISO = format(date, 'yyyy-MM-dd')
    setAviso('')

    if (esPasado(fechaISO) || estaOcupado(fechaISO)) return

    const rangoCompleto = fechaInicio && fechaFin
    const empezandoDeNuevo = !fechaInicio || rangoCompleto || fechaISO < fechaInicio

    if (empezandoDeNuevo) {
      onCambiarFechas({ fechaInicio: fechaISO, fechaFin: '' })
      return
    }

    if (hayConflictoEnRango(fechaInicio, fechaISO)) {
      setAviso(t('vehiculo.rangeHasOccupiedDays'))
      return
    }

    onCambiarFechas({ fechaInicio, fechaFin: fechaISO })
  }, [fechaInicio, fechaFin, esPasado, estaOcupado, hayConflictoEnRango, onCambiarFechas, t])

  return (
    <div style={{ width: '100%', fontFamily: 'inherit' }}>

      {/* Navegación del mes */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => setMesActual(m => subMonths(m, 1))}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#f1f5f9', border: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#475569', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#1e293b' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569' }}
        >
          <FaChevronLeft size={12} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', textTransform: 'capitalize', letterSpacing: '-0.01em' }}>
            {format(mesActual, 'MMMM yyyy', { locale: currentLocale })}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMesActual(m => addMonths(m, 1))}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#f1f5f9', border: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#475569', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#1e293b' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569' }}
        >
          <FaChevronRight size={12} />
        </button>
      </div>

      {/* Encabezado de días */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
        {DIAS_SEMANA.map(d => (
          <div key={d} style={{
            textAlign: 'center', paddingBottom: 10,
            fontSize: 11, fontWeight: 700,
            color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em'
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grilla de días */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px 0' }}>
        {dias.map(dia => {
          const fechaISO = format(dia, 'yyyy-MM-dd')
          const fueraDeMes = !isSameMonth(dia, mesActual)
          const pasado = esPasado(fechaISO)
          const ocupado = estaOcupado(fechaISO)
          const esInicio = fechaISO === fechaInicio
          const esFin = fechaISO === fechaFin
          const rangoActivo = Boolean(fechaInicio && fechaFin)
          const dentroDelRango = rangoActivo && fechaISO > fechaInicio && fechaISO < fechaFin
          const seleccionado = esInicio || esFin
          const clicable = !fueraDeMes && !pasado && !ocupado

          // Colores dinámicos
          let btnBg = 'transparent'
          let btnColor = '#334155'
          let btnBorder = 'none'
          let btnCursor = 'pointer'
          let btnOpacity = 1
          let rowBg = 'transparent'
          let roundedLeft = false
          let roundedRight = false

          if (fueraDeMes) {
            btnColor = 'transparent'
            btnCursor = 'default'
          } else if (seleccionado) {
            btnBg = '#2563eb'
            btnColor = '#fff'
          } else if (pasado) {
            btnColor = '#94a3b8'
            btnOpacity = 0.5
            btnCursor = 'not-allowed'
          } else if (ocupado) {
            btnColor = '#f87171'
            btnCursor = 'not-allowed'
          }

          if (dentroDelRango) {
            rowBg = 'rgba(37, 99, 235, 0.08)'
          }
          if (esInicio && fechaFin) roundedLeft = true
          if (esFin) roundedRight = true

          return (
            <div
              key={fechaISO}
              style={{
                background: rowBg,
                borderRadius: roundedLeft ? '50% 0 0 50%' : roundedRight ? '0 50% 50% 0' : 0,
                padding: '2px 0',
              }}
            >
              <button
                type="button"
                disabled={!clicable}
                onClick={() => handleClickDia(dia)}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  width: 38, height: 38,
                  margin: '0 auto',
                  borderRadius: '50%',
                  background: btnBg,
                  color: btnColor,
                  border: isToday(dia) && !seleccionado ? '2px solid #bfdbfe' : btnBorder,
                  cursor: btnCursor,
                  opacity: btnOpacity,
                  fontSize: 13,
                  fontWeight: seleccionado ? 800 : 500,
                  transition: 'all 0.15s',
                  position: 'relative',
                  outline: 'none',
                  gap: 2,
                }}
                onMouseEnter={e => {
                  if (clicable && !seleccionado) {
                    e.currentTarget.style.background = '#eff6ff'
                    e.currentTarget.style.color = '#1e40af'
                  }
                }}
                onMouseLeave={e => {
                  if (clicable && !seleccionado) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#334155'
                  }
                }}
              >
                {format(dia, 'd')}
                {/* Punto indicador */}
                {!fueraDeMes && !pasado && (
                  <span style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: ocupado ? '#f87171' : seleccionado ? 'rgba(255,255,255,0.7)' : '#34d399',
                    display: 'block',
                    marginTop: -1,
                  }} />
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Leyenda */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center',
        justifyContent: 'center', gap: 16,
        marginTop: 20, paddingTop: 16,
        borderTop: '1px solid #f1f5f9',
        fontSize: 12, fontWeight: 500, color: '#64748b'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', display: 'block' }} />
          {t('vehiculo.calendarAvailable', 'Disponible')}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#dc2626', display: 'block' }} />
          {t('vehiculo.calendarOccupied', 'Reservado')}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#64748b', display: 'block' }} />
          {t('vehiculo.calendarMaintenance', 'Mantenimiento')}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563eb', display: 'block' }} />
          {t('vehiculo.calendarSelected', 'Seleccionado')}
        </span>
      </div>

      {/* Mensajes */}
      {aviso && (
        <p style={{ marginTop: 12, textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#ef4444' }}>
          {aviso}
        </p>
      )}
      {cargando && (
        <p style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
          {t('vehiculo.calendarLoading', 'Cargando disponibilidad...')}
        </p>
      )}
    </div>
  )
}
