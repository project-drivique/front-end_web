import { useTranslation } from 'react-i18next'
import { FaMapMarkerAlt, FaClock, FaCalendarAlt } from 'react-icons/fa'
import { SUCURSALES, CIUDADES } from '../../constants'
import CalendarioReservas from './CalendarioReservas'

const HORAS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, '0')
  return [`${h}:00`, `${h}:30`]
}).flat()

function Campo({ icono: Icono, label, children }) {
  return (
    <div className="flex min-h-[88px] sm:min-h-[96px] w-full items-center gap-2.5 sm:gap-4 rounded-2xl border border-[var(--borde)] bg-[var(--bg-tarjeta)] pl-4 pr-3 sm:pl-8 sm:pr-6 py-4 sm:py-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
      <span className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-800">
        <Icono size={16} className="sm:hidden" />
        <Icono size={19} className="hidden sm:block" />
      </span>
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--texto-second)] mb-1 sm:mb-1.5">{label}</span>
        {children}
      </div>
    </div>
  )
}

// Texto un poco más pequeño y truncado con "..." para que las opciones
// largas (p. ej. "Recoger en Sucursal (Alquiler Neiva - Centro)") entren
// bien sin romper el layout del select. El `title` en el <select> muestra
// el texto completo al pasar el mouse.
// Nota: el <select> usa "color-scheme" implícito del navegador para el menú
// desplegable nativo, pero el propio control (cerrado) sí respeta el tema
// gracias a var(--texto-primary).
const selectCls = 'campo-select block w-full truncate bg-transparent text-sm sm:text-[15px] font-extrabold text-[var(--texto-primary)] outline-none cursor-pointer py-1.5'

export default function PasoFechas({ vehiculo, reserva, onCambio }) {
  const { t } = useTranslation()

  const carBranch = vehiculo.sucursal;
  const branchObj = SUCURSALES.find(s => s.nombre === carBranch);
  const cityObj = branchObj ? CIUDADES.find(c => c.nombre === branchObj.ciudad) : null;

  const opcionesEntrega = [
    { value: carBranch, label: t('vehiculo.pickupAtBranch', { sucursal: carBranch }) }
  ];

  if (reserva.metodoPago !== 'efectivo') {
    opcionesEntrega.push({ value: 'domicilio', label: t('vehiculo.deliveryHome') });
    if (cityObj?.tieneAeropuerto) {
      opcionesEntrega.push({ value: 'aeropuerto', label: t('vehiculo.deliveryAirport') });
    }
    if (cityObj?.tieneTerminal) {
      opcionesEntrega.push({ value: 'terminal', label: t('vehiculo.deliveryTerminal') });
    }
  }

  const opcionesDevolucion = [
    { value: carBranch, label: t('vehiculo.returnAtBranch', { sucursal: carBranch }) }
  ];

  if (reserva.metodoPago !== 'efectivo') {
    opcionesDevolucion.push({ value: 'domicilio', label: t('vehiculo.returnHome') });
    if (cityObj?.tieneAeropuerto) {
      opcionesDevolucion.push({ value: 'aeropuerto', label: t('vehiculo.returnAirport') });
    }
    if (cityObj?.tieneTerminal) {
      opcionesDevolucion.push({ value: 'terminal', label: t('vehiculo.returnTerminal') });
    }
  }

  return (
    <div className="w-full space-y-10">

      {/* Título y subtítulo de la sección, con más aire entre ellos y respecto al resto */}
      <div className="mb-2">
        <h3 className="mb-3 text-3xl font-black tracking-tight text-[var(--texto-primary)]">{t('vehiculo.stepDates')}</h3>
        <p className="text-base text-[var(--texto-second)]">{t('vehiculo.stepDatesSubtitle')}</p>
      </div>
      <br></br>
      <div className="w-full space-y-14">
        {/* Selector de Método de Pago */}
        <div className="w-full">
          <span className="block text-xs font-extrabold uppercase tracking-widest text-[var(--texto-second)] mb-6">
            {t('vehiculo.paymentMethodTitle')}
          </span>
          <br></br>
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            <label className={`flex min-h-[100px] sm:min-h-[112px] items-start gap-2.5 sm:gap-4 rounded-2xl border p-3.5 sm:p-6 cursor-pointer transition-all duration-200 ${reserva.metodoPago !== 'efectivo' ? 'border-blue-600 bg-blue-50/40 shadow-sm' : 'border-[var(--borde)] bg-[var(--bg-tarjeta)] hover:bg-[var(--bg-item-hover)]'}`}>
              <input
                type="radio"
                name="metodoPago"
                value="wompi"
                checked={reserva.metodoPago !== 'efectivo'}
                onChange={() => onCambio('metodoPago', 'wompi')}
                className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-blue-600 accent-blue-600 mt-1"
              />
              <div className="min-w-0 flex-1">
                <span className="block text-sm sm:text-lg font-extrabold text-[var(--texto-primary)] leading-snug">{t('vehiculo.paymentWompiTitle')}</span>
                <span className="block text-xs sm:text-sm text-[var(--texto-second)] mt-1 sm:mt-2 leading-relaxed">{t('vehiculo.paymentWompiDesc')}</span>
              </div>
            </label>

            <label className={`flex min-h-[100px] sm:min-h-[112px] items-start gap-2.5 sm:gap-4 rounded-2xl border p-3.5 sm:p-6 cursor-pointer transition-all duration-200 ${reserva.metodoPago === 'efectivo' ? 'border-blue-600 bg-blue-50/40 shadow-sm' : 'border-[var(--borde)] bg-[var(--bg-tarjeta)] hover:bg-[var(--bg-item-hover)]'}`}>
              <input
                type="radio"
                name="metodoPago"
                value="efectivo"
                checked={reserva.metodoPago === 'efectivo'}
                onChange={() => onCambio('metodoPago', 'efectivo')}
                className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-blue-600 accent-blue-600 mt-1"
              />
              <div className="min-w-0 flex-1">
                <span className="block text-sm sm:text-lg font-extrabold text-[var(--texto-primary)] leading-snug">{t('vehiculo.paymentCashTitle')}</span>
                <span className="block text-xs sm:text-sm text-[var(--texto-second)] mt-1 sm:mt-2 leading-relaxed">{t('vehiculo.paymentCashDesc')}</span>
              </div>
            </label>
          </div>
        </div>

        {/* Inputs de Ubicación y Hora */}
        <div className="w-full">
          <br></br>
          <span className="block text-xs font-extrabold uppercase tracking-widest text-[var(--texto-second)] mb-6">
            {t('vehiculo.deliveryTimeSectionTitle')}
          </span>
          {/* Dos campos por fila desde `sm` en adelante (celular incluido),
              igual que las tarjetas de método de pago. */}
          <div className="grid w-full grid-cols-2 gap-3 sm:gap-5">
            <Campo icono={FaMapMarkerAlt} label={t('vehiculo.pickupLocationLabel')}>
              <select
                id="campo-lugar-retiro"
                className={selectCls}
                title={opcionesEntrega.find(o => o.value === reserva.sucursalRetiro)?.label}
                value={reserva.sucursalRetiro}
                onChange={e => onCambio('sucursalRetiro', e.target.value)}
              >
                {opcionesEntrega.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </Campo>

            <Campo icono={FaMapMarkerAlt} label={t('vehiculo.returnLocationLabel')}>
              <select
                id="campo-lugar-devolucion"
                className={selectCls}
                title={opcionesDevolucion.find(o => o.value === reserva.sucursalDevolucion)?.label}
                value={reserva.sucursalDevolucion}
                onChange={e => onCambio('sucursalDevolucion', e.target.value)}
              >
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
        </div>
        <br></br>
        {/* Separación y Calendario */}
        <div className="w-full pt-2">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-800">
              <FaCalendarAlt size={15} />
            </span>

            <span className="block text-xs font-extrabold uppercase tracking-widest text-[var(--texto-second)]">
              {t('vehiculo.dateRangeSectionTitle')}
            </span>
          </div>
          {/* El calendario ahora ocupa el 100% del ancho de este contenedor */}
          <div className="w-full bg-[var(--bg-tarjeta)] rounded-3xl border border-[var(--borde)] p-6 sm:p-8 shadow-sm">
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