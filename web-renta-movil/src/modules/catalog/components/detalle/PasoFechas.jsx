import { useTranslation } from 'react-i18next'
import { FaMapMarkerAlt, FaClock } from 'react-icons/fa'
import { SUCURSALES, CIUDADES } from '../../constants'
import CalendarioReservas from './CalendarioReservas'

const HORAS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, '0')
  return [`${h}:00`, `${h}:30`]
}).flat()

function Campo({ icono: Icono, label, children }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm hover:border-slate-300 transition-colors">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-800">
        <Icono size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</span>
        {children}
      </div>
    </div>
  )
}

const selectCls = 'w-full bg-transparent text-base font-extrabold text-slate-800 outline-none cursor-pointer'

export default function PasoFechas({ vehiculo, reserva, onCambio }) {
  const { t } = useTranslation()

  const carBranch = vehiculo.sucursal;
  const branchObj = SUCURSALES.find(s => s.nombre === carBranch);
  const cityObj = branchObj ? CIUDADES.find(c => c.nombre === branchObj.ciudad) : null;

  const opcionesEntrega = [
    { value: carBranch, label: `Recoger en Sucursal (${carBranch})` }
  ];

  if (reserva.metodoPago !== 'efectivo') {
    opcionesEntrega.push({ value: 'domicilio', label: 'Entrega a domicilio' });
    if (cityObj?.tieneAeropuerto) {
      opcionesEntrega.push({ value: 'aeropuerto', label: 'Entrega en Aeropuerto' });
    }
    if (cityObj?.tieneTerminal) {
      opcionesEntrega.push({ value: 'terminal', label: 'Entrega en Terminal' });
    }
  }

  const opcionesDevolucion = [
    { value: carBranch, label: `Devolver en Sucursal (${carBranch})` }
  ];

  if (reserva.metodoPago !== 'efectivo') {
    opcionesDevolucion.push({ value: 'domicilio', label: 'Devolución a domicilio' });
    if (cityObj?.tieneAeropuerto) {
      opcionesDevolucion.push({ value: 'aeropuerto', label: 'Devolución en Aeropuerto' });
    }
    if (cityObj?.tieneTerminal) {
      opcionesDevolucion.push({ value: 'terminal', label: 'Devolución en Terminal' });
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-2 text-3xl font-black tracking-tight text-[var(--texto-primary)]">{t('vehiculo.stepDates')}</h3>
        <p className="text-base text-[var(--texto-second)]">{t('vehiculo.stepDatesSubtitle')}</p>
      </div>

      <div className="mx-auto max-w-3xl space-y-10">
        {/* Selector de Método de Pago */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
          <span className="block text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-5">
            Método de Pago Preferido
          </span>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className={`flex items-start gap-4 rounded-2xl border p-5 cursor-pointer transition-all duration-200 ${reserva.metodoPago !== 'efectivo' ? 'border-blue-600 bg-blue-50/40 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}>
              <input
                type="radio"
                name="metodoPago"
                value="wompi"
                checked={reserva.metodoPago !== 'efectivo'}
                onChange={() => onCambio('metodoPago', 'wompi')}
                className="h-5 w-5 text-blue-600 accent-blue-600 mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <span className="block text-base font-extrabold text-slate-800">Pago Virtual con Wompi</span>
                <span className="block text-xs text-slate-500 mt-1.5 leading-relaxed">Habilita entregas a domicilio, aeropuerto o terminal.</span>
              </div>
            </label>

            <label className={`flex items-start gap-4 rounded-2xl border p-5 cursor-pointer transition-all duration-200 ${reserva.metodoPago === 'efectivo' ? 'border-blue-600 bg-blue-50/40 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}>
              <input
                type="radio"
                name="metodoPago"
                value="efectivo"
                checked={reserva.metodoPago === 'efectivo'}
                onChange={() => onCambio('metodoPago', 'efectivo')}
                className="h-5 w-5 text-blue-600 accent-blue-600 mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <span className="block text-base font-extrabold text-slate-800">Pago en Efectivo</span>
                <span className="block text-xs text-slate-500 mt-1.5 leading-relaxed">Obligatorio retirar y pagar directamente en sucursal.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Inputs de Ubicación y Hora */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Campo icono={FaMapMarkerAlt} label={t('vehiculo.pickupLocationLabel')}>
            <select id="campo-lugar-retiro" className={selectCls} value={reserva.sucursalRetiro} onChange={e => onCambio('sucursalRetiro', e.target.value)}>
              {opcionesEntrega.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </Campo>

          <Campo icono={FaMapMarkerAlt} label={t('vehiculo.returnLocationLabel')}>
            <select id="campo-lugar-devolucion" className={selectCls} value={reserva.sucursalDevolucion} onChange={e => onCambio('sucursalDevolucion', e.target.value)}>
              {opcionesDevolucion.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
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

        {/* Separación y Calendario */}
        <div className="pt-10 border-t border-slate-200 mt-12">
          <span className="block text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-6">
            Selecciona el Rango de Fechas
          </span>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
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
      </div>
    </div>
  )
}
