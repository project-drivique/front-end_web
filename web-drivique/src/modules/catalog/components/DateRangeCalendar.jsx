import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  addMonths, subMonths, isSameMonth, isToday, format,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const hoyISO = format(new Date(), 'yyyy-MM-dd')
const DIAS_SEMANA = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom']

export default function CalendarioRango({ fechaInicio, fechaFin, onCambiar }) {
  const { t } = useTranslation()
  const [mesActual, setMesActual] = useState(() => (fechaInicio ? new Date(fechaInicio) : new Date()))

  const dias = useMemo(() => {
    const inicio = startOfWeek(startOfMonth(mesActual), { weekStartsOn: 1 })
    const fin = endOfWeek(endOfMonth(mesActual), { weekStartsOn: 1 })
    return eachDayOfInterval({ start: inicio, end: fin })
  }, [mesActual])

  const esPasado = useCallback((fechaISO) => fechaISO < hoyISO, [])

  const handleClickDia = useCallback((date) => {
    const fechaISO = format(date, 'yyyy-MM-dd')
    if (esPasado(fechaISO)) return

    const rangoCompleto = fechaInicio && fechaFin
    const empezandoDeNuevo = !fechaInicio || rangoCompleto || fechaISO < fechaInicio

    if (empezandoDeNuevo) {
      onCambiar('fechaInicio', fechaISO)
      onCambiar('fechaFin', '')
      return
    }

    onCambiar('fechaFin', fechaISO)
  }, [fechaInicio, fechaFin, esPasado, onCambiar])

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMesActual(m => subMonths(m, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--texto-second)] transition-colors hover:bg-[var(--bg-item-hover)] hover:text-[var(--texto-primary)]"
        >
          <FaChevronLeft size={13} />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold capitalize text-[var(--texto-primary)]">
            {format(mesActual, 'MMMM yyyy', { locale: es })}
          </span>
          <button
            type="button"
            onClick={() => setMesActual(new Date())}
            className="rounded-full bg-[var(--bg-item)] px-2.5 py-1 text-[11px] font-bold text-[var(--texto-second)] transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            {t('vehiculo.calendarToday')}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMesActual(m => addMonths(m, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--texto-second)] transition-colors hover:bg-[var(--bg-item-hover)] hover:text-[var(--texto-primary)]"
        >
          <FaChevronRight size={13} />
        </button>
      </div>

      <div className="grid w-full grid-cols-7">
        {DIAS_SEMANA.map(d => (
          <div key={d} className="pb-2 text-center text-[11px] font-bold uppercase tracking-wide text-[var(--texto-second)]">
            {d}
          </div>
        ))}
      </div>

      <div className="grid w-full grid-cols-7">
        {dias.map(dia => {
          const fechaISO = format(dia, 'yyyy-MM-dd')
          const fueraDeMes = !isSameMonth(dia, mesActual)
          const pasado = esPasado(fechaISO)
          const esInicio = fechaISO === fechaInicio
          const esFin = fechaISO === fechaFin
          const rangoActivo = Boolean(fechaInicio && fechaFin)
          const dentroDelRango = rangoActivo && fechaISO >= fechaInicio && fechaISO <= fechaFin
          const seleccionado = esInicio || esFin
          const clicable = !fueraDeMes && !pasado

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
                  'relative mx-auto flex aspect-square w-full max-w-11 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  fueraDeMes ? 'text-transparent pointer-events-none' :
                  seleccionado ? 'bg-blue-600 text-white shadow-md shadow-blue-200' :
                  pasado ? 'text-[var(--texto-second)] opacity-40 cursor-not-allowed' :
                  'text-[var(--texto-primary)] hover:bg-blue-100 hover:text-blue-900 cursor-pointer',
                  isToday(dia) && !seleccionado ? 'ring-2 ring-blue-200' : '',
                ].join(' ')}
              >
                {format(dia, 'd')}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
