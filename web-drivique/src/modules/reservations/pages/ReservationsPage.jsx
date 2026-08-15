import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLanding } from '../../landing/LandingContext'
import { formatCurrency } from '@/utils/currencyUtils'
import { showAlert } from '@/utils/swalConfig'
import { useHistorialReservas } from '../hooks/useReservations'
import logo from '@/assets/logo.png'
import MenuConfiguracion from '@/components/MenuConfiguracion'

const ESTILOS_ESTADO = {
  activa: 'bg-blue-50 text-blue-700 border-blue-200',
  pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
  completada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelada: 'bg-slate-100 text-slate-500 border-slate-200',
}

const CLAVES_ESTADO = {
  activa: 'reservas.statusActive',
  pendiente: 'reservas.statusPending',
  completada: 'reservas.statusCompleted',
  cancelada: 'reservas.statusCancelled',
}

function TarjetaReserva({ reserva, onCancelar }) {
  const { t } = useTranslation()
  const { moneda } = useLanding()
  const { vehiculo, fechaInicio, fechaFin, estado, estadoRaw, fechaLimitePago } = reserva

  const dias = Math.max(1, Math.ceil((new Date(fechaFin) - new Date(fechaInicio)) / 86400000))
  const total = reserva.total ?? (vehiculo ? Math.round(vehiculo.precio * dias * 1.10) : 0)

  const pendientePagoEfectivo = estadoRaw === 'PENDIENTE_EFECTIVO' && fechaLimitePago
  const horasRestantes = pendientePagoEfectivo
    ? Math.max(0, (new Date(fechaLimitePago).getTime() - Date.now()) / 3600000)
    : null

  const textoHoras = horasRestantes !== null
    ? (horasRestantes < 1
        ? t('reservas.cashPaymentDeadlineLessThanHour')
        : t('reservas.cashPaymentDeadlineHours', { horas: Math.floor(horasRestantes) }))
    : ''

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--borde)] bg-[var(--bg-tarjeta)] p-5 shadow-sm sm:flex-row sm:items-center">
      <img
        src={vehiculo?.imagenes?.[0]}
        alt={vehiculo?.nombre || ''}
        className="h-28 w-full rounded-xl object-cover sm:w-40"
      />

      <div className="flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h3 className="text-base font-extrabold text-[var(--texto-primary)]">{vehiculo?.nombre || t('vehiculo.notFound')}</h3>
          <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${ESTILOS_ESTADO[estado]}`}>
            {t(CLAVES_ESTADO[estado])}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--texto-second)]">
          <span><span className="font-semibold text-[var(--texto-primary)]">{t('reservas.from')}:</span> {fechaInicio}</span>
          <span><span className="font-semibold text-[var(--texto-primary)]">{t('reservas.to')}:</span> {fechaFin}</span>
          <span><span className="font-semibold text-[var(--texto-primary)]">{t('reservas.total')}:</span> {formatCurrency(total, moneda)}</span>
        </div>

        {pendientePagoEfectivo && (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
            {t('reservas.cashPaymentDeadline', { horas: textoHoras })}
          </p>
        )}
        {estadoRaw === 'CANCELADA_POR_TIEMPO' && (
          <p className="mt-2 rounded-lg border border-[var(--borde)] bg-[var(--bg-item)] px-3 py-1.5 text-xs font-semibold text-[var(--texto-second)]">
            {t('reservas.autoCancelledCash')}
          </p>
        )}
      </div>

      {estado !== 'completada' && estado !== 'cancelada' && (
        <button
          onClick={() => onCancelar(reserva)}
          className="whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
        >
          {t('reservas.cancel')}
        </button>
      )}
    </div>
  )
}

export default function ReservasPage() {
  const { t } = useTranslation()
  const { reservas, cargando, error, cancelarReserva } = useHistorialReservas()

  const handleCancelar = async (reserva) => {
    const resultado = await showAlert({
      icon: 'warning',
      title: t('reservas.cancel'),
      text: t('reservas.cancelConfirm'),
      showCancelButton: true,
      confirmButtonText: t('reservas.cancel'),
      cancelButtonText: t('common.cancel'),
    })
    if (resultado.isConfirmed) await cancelarReserva(reserva.id)
  }

  return (
    <div className="catalogo-page min-h-screen bg-[var(--bg-page)]">
      <nav className="fixed inset-x-0 top-0 z-50 h-24 border-b border-[var(--borde)] bg-[var(--bg-nav)] backdrop-blur">
        <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-6">
          <Link to="/home"><img src={logo} alt="Drivique" className="h-20" /></Link>
          <MenuConfiguracion />
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 pb-16 pt-32">
        <h1 className="text-2xl font-black text-[var(--texto-primary)]">{t('reservas.title')}</h1>
        <p className="mb-8 text-sm text-[var(--texto-second)]">{t('reservas.subtitle')}</p>

        {cargando && (
          <p className="text-sm text-[var(--texto-second)]">{t('reservas.loading')}</p>
        )}

        {!cargando && error && (
          <p className="text-sm font-semibold text-red-500">{error}</p>
        )}

        {!cargando && !error && reservas.length === 0 && (
          <div className="rounded-2xl border border-[var(--borde)] bg-[var(--bg-tarjeta)] p-12 text-center">
            <p className="mb-1 text-base font-bold text-[var(--texto-primary)]">{t('reservas.noReservations')}</p>
            <p className="mb-5 text-sm text-[var(--texto-second)]">{t('reservas.noReservationsSubtitle')}</p>
            <Link to="/home" className="inline-block rounded-full bg-blue-800 px-6 py-2.5 text-sm font-bold text-white">
              {t('common.backToHome')}
            </Link>
          </div>
        )}

        {!cargando && !error && reservas.length > 0 && (
          <div className="flex flex-col gap-4">
            {reservas.map(reserva => (
              <TarjetaReserva key={reserva.id} reserva={reserva} onCancelar={handleCancelar} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
