import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/monedaUtils'
import { useLanding } from '../../../landing/LandingContext'

export default function TipoKilometraje({ vehiculo, tipoKm, onSeleccionar }) {
  const { t } = useTranslation()
  const { moneda } = useLanding()

  const opciones = [
    { val: 'limitado', label: `${t('catalogo.limitedKm')} (${vehiculo.tarifas.kmLimitado.km} km/${t('catalogo.day')})`, precio: vehiculo.tarifas.kmLimitado.precio },
    { val: 'ilimitado', label: t('catalogo.unlimitedKm'), precio: vehiculo.tarifas.kmIlimitado.precio },
  ]

  return (
    <div className="mt-8">
      <h3 className="mb-3 text-lg font-extrabold text-[var(--texto-primary)]">{t('vehiculo.kmTypeTitle')}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {opciones.map(op => {
          const activo = tipoKm === op.val
          return (
            <button
              key={op.val}
              type="button"
              onClick={() => onSeleccionar(op.val)}
              className={`flex min-h-[92px] items-center justify-between gap-4 rounded-2xl border-2 px-6 py-6 text-left transition-colors ${
                activo ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-[var(--borde)] bg-[var(--bg-tarjeta)] hover:border-blue-200'
              }`}
            >
              <span className={`text-base font-bold leading-snug sm:text-lg ${activo ? 'text-blue-800' : 'text-[var(--texto-primary)]'}`}>{op.label}</span>
              <span className="whitespace-nowrap text-base font-black text-blue-800 sm:text-lg">{formatCurrency(op.precio, moneda)}/{t('catalogo.day')}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
