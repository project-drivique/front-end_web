import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  addMonths, subMonths, isSameMonth, isToday, format,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useDisponibilidadVehiculo } from '../../hooks/useDisponibilidadVehiculo'

const hoyISO = format(new Date(), 'yyyy-MM-dd')
const DIAS_SEMANA = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom']

export default function CalendarioReservas({ vehiculoId, fechaInicio, fechaFin, onCambiarFechas }) {
  const { t } = useTranslation()
  const { estaOcupado, cargando } = useDisponibilidadVehiculo(vehiculoId)
  const [mesActual, setMesActual] = useState(new Date())
  const [aviso, setAviso] = useState('')

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
    <div className="w-full">
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMesActual(m => subMonths(m, 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--texto-second)] transition-colors hover:bg-[var(--bg-item-hover)] hover:text-[var(--texto-primary)]"
          >
            <FaChevronLeft size={14} />
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xl font-extrabold capitalize text-[var(--texto-primary)]">
              {format(mesActual, 'MMMM yyyy', { locale: es })}
            </span>
            <button
              type="button"
              onClick={() => setMesActual(new Date())}
              className="rounded-full bg-[var(--bg-item)] px-3 py-1.5 text-xs font-bold text-[var(--texto-second)] transition-colors hover:bg-blue-50 hover:text-blue-700"
            >
              {t('vehiculo.calendarToday')}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMesActual(m => addMonths(m, 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--texto-second)] transition-colors hover:bg-[var(--bg-item-hover)] hover:text-[var(--texto-primary)]"
          >
            <FaChevronRight size={14} />
          </button>
        </div>

        <div className="grid w-full grid-cols-7">
          {DIAS_SEMANA.map(d => (
            <div key={d} className="pb-3 text-center text-xs font-bold uppercase tracking-wide text-[var(--texto-second)]">
              {d}
            </div>
          ))}
        </div>

        <div className="grid w-full grid-cols-7">
          {dias.map(dia => {
            const fechaISO = format(dia, 'yyyy-MM-dd')
            const fueraDeMes = !isSameMonth(dia, mesActual)
            const pasado = esPasado(fechaISO)
            const ocupado = estaOcupado(fechaISO)
            const esInicio = fechaISO === fechaInicio
            const esFin = fechaISO === fechaFin
            const rangoActivo = Boolean(fechaInicio && fechaFin)
            const dentroDelRango = rangoActivo && fechaISO >= fechaInicio && fechaISO <= fechaFin
            const seleccionado = esInicio || esFin
            const clicable = !fueraDeMes && !pasado && !ocupado

            return (
              <div
                key={fechaISO}
                className={[
                  'w-full py-1',
                  dentroDelRango ? 'bg-blue-50' : '',
                  dentroDelRango && esInicio ? 'rounded-l-full' : '',
                  dentroDelRango && esFin ? 'rounded-r-full' : '',
                ].join(' ')}
              >
                <button
                  type="button"
                  disabled={!clicable}
                  onClick={() => handleClickDia(dia)}
                  className={[
                    'relative mx-auto flex aspect-square w-full max-w-14 items-center justify-center rounded-full text-[15px] sm:text-base font-semibold transition-colors',
                    fueraDeMes ? 'text-transparent pointer-events-none' :
                    seleccionado ? 'bg-blue-600 text-white shadow-md shadow-blue-200' :
                    pasado ? 'text-[var(--texto-second)] opacity-40 cursor-not-allowed' :
                    ocupado ? 'text-red-400 line-through cursor-not-allowed' :
                    'text-[var(--texto-primary)] hover:bg-blue-100 hover:text-blue-900 cursor-pointer',
                    isToday(dia) && !seleccionado ? 'ring-2 ring-blue-200' : '',
                  ].join(' ')}
                >
                  {format(dia, 'd')}
                  {clicable && !ocupado && (
                    <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-emerald-500" />
                  )}
                  {!fueraDeMes && !pasado && ocupado && (
                    <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-red-400" />
                  )}
                </button>
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-5 border-t border-[var(--borde)] pt-5 text-xs font-semibold text-[var(--texto-second)]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> {t('vehiculo.calendarAvailable')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" /> {t('vehiculo.calendarOccupied')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-600" /> {t('vehiculo.calendarSelected')}
          </span>
        </div>
      </div>

      {aviso && (
        <p className="mt-3 text-center text-xs font-semibold text-red-500">{aviso}</p>
      )}
      {cargando && (
        <p className="mt-3 text-center text-xs text-[var(--texto-second)]">{t('vehiculo.calendarLoading')}</p>
      )}
    </div>
  )
}
