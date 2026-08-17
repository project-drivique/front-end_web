import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/currencyUtils'
import { useLanding } from '../../landing/LandingContext'

export default function TipoKilometraje({ vehiculo, tipoKm, onSeleccionar }) {
  const { t } = useTranslation()
  const { moneda } = useLanding()

  const kmLimit = vehiculo.tarifas?.kmLimitado || { precio: 0, km: 150, excedente: 550 };
  const kmIlimit = vehiculo.tarifas?.kmIlimitado || { precio: 0 };

  const opciones = [
    {
      val: 'limitado',
      titulo: t('vehiculo.kmLimitedTitle', 'Kilometraje limitado'),
      descripcion: t('vehiculo.kmLimitedDesc', 'Incluye {{km}} km por día dentro del valor de la tarifa. Si te pasas del límite, se cobra {{excedente}} por cada km adicional.', { km: kmLimit.km, excedente: formatCurrency(kmLimit.excedente, moneda) }),
      precio: kmLimit.precio,
    },
    {
      val: 'ilimitado',
      titulo: t('vehiculo.kmUnlimitedTitle', 'Kilometraje ilimitado'),
      descripcion: t('vehiculo.kmUnlimitedDesc', 'Sin restricción de distancia dentro del territorio nacional. No aplica cobro adicional por exceso de kilómetros.'),
      precio: kmIlimit.precio,
    },
  ]

  return (
    <div className="mt-12">
      <h3 className="mb-12 text-lg font-extrabold text-[var(--texto-primary)]">{t('vehiculo.kmTypeTitle')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opciones.map(op => {
          const activo = tipoKm === op.val
          return (
            <button
              key={op.val}
              type="button"
              onClick={() => onSeleccionar(op.val)}
              style={{ cursor: 'pointer' }}
              className={`group relative flex flex-col items-center text-center gap-3 rounded-2xl border-2 p-5 transition-all ${
                activo
                  ? 'border-blue-600 bg-[var(--bg-item-hover)] shadow-md'
                  : 'border-[var(--borde)] bg-[var(--bg-tarjeta)] hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              {/* Indicador de selección (círculo) */}
              <span
                className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                  activo ? 'border-blue-600 bg-blue-600' : 'border-[#cbd5e1] bg-transparent'
                }`}
              >
                {activo && (
                  <svg width="11" height="11" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </span>

              <span className={`text-base font-extrabold leading-snug break-words ${activo ? 'text-[var(--texto-acento)]' : 'text-[var(--texto-primary)]'}`}>
                {op.titulo}
              </span>
              <p className={`text-xs leading-relaxed flex-1 break-words ${activo ? 'text-[var(--texto-acento)] opacity-80' : 'text-[var(--texto-second)]'}`}>
                {op.descripcion}
              </p>
              <span className={`mt-1 inline-flex max-w-full items-baseline justify-center gap-1 font-black text-sm ${activo ? 'text-[var(--texto-acento)]' : 'text-[var(--texto-primary)]'}`}>
                {formatCurrency(op.precio, moneda)}
                <span className={`text-[11px] font-bold ${activo ? 'text-[var(--texto-acento)] opacity-80' : 'text-[var(--texto-second)]'}`}>/ {t('catalogo.day')}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
