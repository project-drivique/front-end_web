import { useTranslation } from 'react-i18next';
import { FaCar, FaGasPump, FaUserFriends, FaDoorOpen, FaSuitcase, FaBolt, FaTag, FaInfoCircle, FaIdCard } from 'react-icons/fa';

const CAT_KEYS   = { 'Económico': 'catalogo.catEco', 'Deportivo': 'catalogo.catSport', 'Sedan': 'catalogo.catSedan', 'SUV': 'catalogo.catSuv' };
const TRANS_KEYS = { 'Automática': 'catalogo.transAuto', 'Manual': 'catalogo.transManual' };
const FUEL_KEYS  = { 'Gasolina': 'catalogo.fuelGas', 'Diesel': 'catalogo.fuelDiesel', 'Híbrido': 'catalogo.fuelHybrid', 'Eléctrico': 'catalogo.fuelElec' };

export default function VehicleQuickSpecsCard({ vehiculo, c }) {
  const { t } = useTranslation();

  if (!vehiculo) return null;

  const esModoOscuro = c?.isDark ?? false;

  const categoria   = CAT_KEYS[vehiculo.categoria]     ? t(CAT_KEYS[vehiculo.categoria])   : vehiculo.categoria;
  const transmision = TRANS_KEYS[vehiculo.transmision] ? t(TRANS_KEYS[vehiculo.transmision]) : vehiculo.transmision;
  const combustible = FUEL_KEYS[vehiculo.combustible]  ? t(FUEL_KEYS[vehiculo.combustible])  : vehiculo.combustible;

  const items = [
    { 
      Icon: FaCar, 
      label: t('vehiculo.transmission', 'Transmisión'), 
      value: transmision 
    },
    { 
      Icon: FaGasPump, 
      label: t('vehiculo.fuel', 'Combustible'), 
      value: combustible 
    },
    { 
      Icon: FaUserFriends, 
      label: t('vehiculo.capacity', 'Capacidad'), 
      value: `${vehiculo.pasajeros} ${t('vehiculo.passengers', 'pasajeros')}` 
    },
    { 
      Icon: FaSuitcase, 
      label: t('vehiculo.trunk', 'Maletero'), 
      value: vehiculo.maletero ? `${vehiculo.maletero} L` : 'Amplio' 
    },
    { 
      Icon: FaDoorOpen, 
      label: t('vehiculo.doorsLabel', 'Puertas'), 
      value: `${vehiculo.puertas || 4}` 
    },
    { 
      Icon: FaBolt, 
      label: t('vehiculo.engine', 'Motor'), 
      value: vehiculo.cilindraje || 'Estándar' 
    },
    { 
      Icon: FaTag, 
      label: t('vehiculo.colorLabel', 'Color'), 
      value: vehiculo.color || '—' 
    },
    { 
      Icon: FaIdCard, 
      label: t('vehiculo.plateLabel', 'Placa'), 
      value: vehiculo.placa || '—' 
    },
  ];

  return (
    <div 
      style={{
        background: esModoOscuro ? '#1e293b' : '#ffffff',
        border: `1px solid ${esModoOscuro ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
        borderRadius: 20,
        padding: '22px 24px',
        boxShadow: esModoOscuro ? '0 12px 32px rgba(0,0,0,0.35)' : '0 10px 30px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        height: '100%',
        boxSizing: 'border-box',
        justifyContent: 'space-between'
      }}
    >
      {/* Encabezado de la tarjeta con badge de categoría y título */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: esModoOscuro ? 'rgba(59,130,246,0.2)' : '#eff6ff',
            color: esModoOscuro ? '#60a5fa' : '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 15
          }}>
            <FaInfoCircle />
          </div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: esModoOscuro ? '#f8fafc' : '#0f172a', letterSpacing: '-0.01em' }}>
            {t('vehiculo.carData', 'Datos del carro')}
          </h3>
        </div>

        <span style={{
          background: esModoOscuro ? 'rgba(59,130,246,0.15)' : '#f0f9ff',
          color: esModoOscuro ? '#93c5fd' : '#0284c7',
          border: `1px solid ${esModoOscuro ? 'rgba(59,130,246,0.3)' : '#bae6fd'}`,
          padding: '4px 12px',
          borderRadius: 9999,
          fontSize: 12,
          fontWeight: 700
        }}>
          {categoria} · {vehiculo.año}
        </span>
      </div>

      {/* Grid 2x3 de micro-tarjetas iconográficas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
        flex: 1
      }}>
        {items.map((item, index) => {
          const ItemIcon = item.Icon;
          return (
            <div
              key={index}
              style={{
                background: esModoOscuro ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                border: `1px solid ${esModoOscuro ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}`,
                borderRadius: 14,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all 200ms ease'
              }}
            >
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: esModoOscuro ? 'rgba(59,130,246,0.15)' : '#ffffff',
                border: `1px solid ${esModoOscuro ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                color: esModoOscuro ? '#60a5fa' : '#1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
                flexShrink: 0,
                boxShadow: esModoOscuro ? 'none' : '0 2px 6px rgba(0,0,0,0.02)'
              }}>
                <ItemIcon />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: esModoOscuro ? '#94a3b8' : '#64748b',
                  lineHeight: 1.2,
                  marginBottom: 2
                }}>
                  {item.label}
                </span>
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: esModoOscuro ? '#f1f5f9' : '#0f172a',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
