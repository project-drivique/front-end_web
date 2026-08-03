import { useTranslation } from 'react-i18next'
import { FaWifi } from 'react-icons/fa'
import { formatCurrency } from '@/utils/currencyUtils'
import { useLanding } from '../../landing/LandingContext'

export default function ServiciosAdicionales({ servicios = [], seleccionados = [], onToggle }) {
  const { t } = useTranslation()
  const { moneda } = useLanding()

  if (servicios.length === 0) return null

  return (
    <div>
      <h3 className="mb-1 text-lg font-extrabold text-[var(--texto-primary)]">{t('vehiculo.extraServices')}</h3>
      <p className="mb-4 text-sm text-[var(--texto-second)]">{t('vehiculo.extraServicesSubtitle')}</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {servicios.map((servicio) => {
          const activo = seleccionados.includes(servicio.nombre)
          return (
            <button
              key={servicio.nombre}
              type="button"
              onClick={() => onToggle(servicio.nombre)}
              className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors ${
                activo
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-[var(--borde)] bg-[var(--bg-tarjeta)] hover:border-blue-200'
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-xs font-black text-white ${
                  activo ? 'border-blue-600 bg-blue-600' : 'border-[var(--borde)] bg-transparent'
                }`}
              >
                {activo && '✓'}
              </span>

              <FaWifi className={activo ? 'text-blue-600' : 'text-[var(--texto-second)]'} />

              <span className="flex-1">
                <span className="block text-sm font-bold text-[var(--texto-primary)]">{servicio.nombre}</span>
                <span className="block text-xs font-semibold text-emerald-600">
                  +{formatCurrency(servicio.precio, moneda)} / {t('catalogo.day')}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
