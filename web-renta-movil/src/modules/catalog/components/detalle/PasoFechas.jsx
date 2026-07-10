import { useTranslation } from 'react-i18next'
import { FaMapMarkerAlt, FaClock } from 'react-icons/fa'
import { SUCURSALES } from '../../constants'
import CalendarioReservas from './CalendarioReservas'

const HORAS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, '0')
  return [`${h}:00`, `${h}:30`]
}).flat()

function Campo({ icono: Icono, label, children }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-800">
        <Icono size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
        {children}
      </div>
    </div>
  )
}

const selectCls = 'w-full bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer'

export default function PasoFechas({ vehiculo, reserva, onCambio }) {
  const { t } = useTranslation()

  return (
    <div>
      <h3 className="mb-1 text-lg font-extrabold text-[var(--texto-primary)]">{t('vehiculo.stepDates')}</h3>
      <p className="mb-6 text-sm text-[var(--texto-second)]">{t('vehiculo.stepDatesSubtitle')}</p>

      <div className="mx-auto max-w-xl">
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Campo icono={FaMapMarkerAlt} label={t('vehiculo.pickupLocationLabel')}>
            <select id="campo-lugar-retiro" className={selectCls} value={reserva.sucursalRetiro} onChange={e => onCambio('sucursalRetiro', e.target.value)}>
              <option value="">{t('vehiculo.selectLocation')}</option>
              {SUCURSALES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Campo>
          <Campo icono={FaMapMarkerAlt} label={t('vehiculo.returnLocationLabel')}>
            <select id="campo-lugar-devolucion" className={selectCls} value={reserva.sucursalDevolucion} onChange={e => onCambio('sucursalDevolucion', e.target.value)}>
              <option value="">{t('vehiculo.selectLocation')}</option>
              {SUCURSALES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Campo>
          <Campo icono={FaClock} label={`${t('vehiculo.pickupDate')} — ${t('vehiculo.timeLabel')}`}>
            <select className={selectCls} value={reserva.horaInicio} onChange={e => onCambio('horaInicio', e.target.value)}>
              {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </Campo>
          <Campo icono={FaClock} label={`${t('vehiculo.returnDate')} — ${t('vehiculo.timeLabel')}`}>
            <select className={selectCls} value={reserva.horaFin} onChange={e => onCambio('horaFin', e.target.value)}>
              {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </Campo>
        </div>

        <CalendarioReservas
          vehiculoId={vehiculo.id}
          fechaInicio={reserva.fechaInicio}
          fechaFin={reserva.fechaFin}
          onCambiarFechas={({ fechaInicio, fechaFin }) => {
            onCambio('fechaInicio', fechaInicio)
            onCambio('fechaFin', fechaFin)
          }}
        />
      </div>
    </div>
  )
}
