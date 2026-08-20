import { useTranslation } from 'react-i18next'
import { FaClipboardList } from 'react-icons/fa'
import { formatCurrency } from '@/utils/currencyUtils'
import { useLanding } from '../../landing/LandingContext'

export default function PlansSummaryCard({ vehiculo, reserva, seguroIdx, serviciosSeleccionados = [], c }) {
  const { t } = useTranslation()
  const { moneda } = useLanding()

  if (!vehiculo) return null;

  const dias = reserva.fechaInicio && reserva.fechaFin
    ? Math.max(1, Math.ceil((new Date(reserva.fechaFin) - new Date(reserva.fechaInicio)) / 86400000))
    : 1;

  // Proteccion
  const seguro = seguroIdx !== null ? vehiculo.seguros[seguroIdx] : null;
  const precioSeguro = seguro ? seguro.precio : 0;
  const seguroNombre = seguro ? seguro.nombre : 'Sin protección';

  // Kilometraje
  const kmLimit = vehiculo.tarifas?.kmLimitado || { precio: 0 };
  const kmIlimit = vehiculo.tarifas?.kmIlimitado || { precio: 0 };
  const precioKm = reserva.tipoKm === 'ilimitado' ? kmIlimit.precio : kmLimit.precio;
  const kmNombre = reserva.tipoKm === 'ilimitado' ? 'Ilimitado' : 'Limitado';

  // Servicios
  const serviciosElegidos = (vehiculo.servicios || []).filter(s => serviciosSeleccionados.includes(s.nombre));
  const precioServicios = serviciosElegidos.reduce((suma, s) => suma + s.precio, 0);

  // Totales
  const totalDiario = precioSeguro + precioKm + precioServicios;
  const totalMultiplicado = totalDiario * dias;

  return (
    <div className="mt-8">
      <div style={{
        background: c?.cardBg || '#ffffff',
        borderRadius: 16,
        padding: '16px',
        border: `1px solid ${c?.cardBorder || '#e2e8f0'}`,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 20px' }}>
          <FaClipboardList color={c?.accentText || '#1e3a8a'} size={14} />
          <h3 style={{ fontSize: 13, fontWeight: 700, color: c?.accentText || '#1e3a8a', margin: 0, textTransform: 'none' }}>
            {t('vehiculo.plansSummary', 'Resumen de planes')}
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Protección */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: c?.textSecondary || '#64748b' }}>
              Protección — <span style={{ color: c?.textPrimary || '#0f172a', fontWeight: 500 }}>{seguroNombre}</span>
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: c?.textPrimary || '#0f172a' }}>
              {formatCurrency(precioSeguro, moneda)}
            </span>
          </div>

          {/* Kilometraje */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: c?.textSecondary || '#64748b' }}>
              Kilometraje — <span style={{ color: c?.textPrimary || '#0f172a', fontWeight: 500 }}>{kmNombre}</span>
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: c?.textPrimary || '#0f172a' }}>
              {formatCurrency(precioKm, moneda)}
            </span>
          </div>

          {/* Servicios */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: c?.textSecondary || '#64748b' }}>
              Servicios adicionales
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: c?.textPrimary || '#0f172a' }}>
              {formatCurrency(precioServicios, moneda)}
            </span>
          </div>
        </div>

        {/* Total Highlighted Box */}
        <div style={{
          marginTop: 20,
          background: c?.isDark ? 'rgba(37,99,235,0.1)' : '#f8fafc',
          borderRadius: 8,
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: c?.textPrimary || '#0f172a' }}>
            Total de planes y extras ({dias} día{dias !== 1 ? 's' : ''})
          </span>
          <span style={{ fontSize: 16, fontWeight: 800, color: c?.accentText || '#1e3a8a' }}>
            {formatCurrency(totalMultiplicado, moneda)}
          </span>
        </div>
      </div>
    </div>
  )
}
