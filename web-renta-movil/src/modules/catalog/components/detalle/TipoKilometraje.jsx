import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/utils/monedaUtils'
import { useLanding } from '../../../landing/LandingContext'

export default function TipoKilometraje({ vehiculo, tipoKm, onSeleccionar }) {
  const { t } = useTranslation()
  const { moneda } = useLanding()

  const kmLimit = vehiculo.tarifas?.kmLimitado || { precio: 0, km: 150, excedente: 550 };
  const kmIlimit = vehiculo.tarifas?.kmIlimitado || { precio: 0 };

  const opciones = [
    {
      val: 'limitado',
      titulo: 'Kilómetro limitado',
      descripcion: `Incluye ${kmLimit.km} km por día dentro del valor de la tarifa. Si te pasas del límite, se cobra ${formatCurrency(kmLimit.excedente, moneda)} por cada km adicional.`,
      precio: kmLimit.precio,
    },
    {
      val: 'ilimitado',
      titulo: 'Kilómetro ilimitado',
      descripcion: 'Sin restricción de distancia dentro del territorio nacional. No aplica cobro adicional por exceso de kilómetros.',
      precio: kmIlimit.precio,
    },
  ]

  return (
    <div className="mt-8">
      <h3 className="mb-3 text-lg font-extrabold text-[var(--texto-primary)]">{t('vehiculo.kmTypeTitle')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opciones.map(op => {
          const activo = tipoKm === op.val
          return (
            <button
              key={op.val}
              type="button"
              onClick={() => onSeleccionar(op.val)}
              style={{ cursor: 'pointer' }}
              className={`flex flex-col items-start text-left gap-2 rounded-2xl border-2 p-5 transition-all ${
                activo ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-[var(--borde)] bg-[var(--bg-tarjeta)] hover:border-blue-200'
              }`}
            >
              <span className={`text-base font-extrabold ${activo ? 'text-blue-800' : 'text-[var(--texto-primary)]'}`}>
                {op.titulo}
              </span>
              <p className="text-xs text-[var(--texto-second)] leading-relaxed flex-1">
                {op.descripcion}
              </p>
              <span className={`text-sm font-black mt-2 ${activo ? 'text-blue-800' : 'text-[var(--texto-primary)]'}`}>
                {formatCurrency(op.precio, moneda)} / {t('catalogo.day')}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
