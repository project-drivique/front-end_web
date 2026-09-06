import { useTranslation } from 'react-i18next';
import { FaShieldAlt, FaRegHeart, FaCheckCircle } from "react-icons/fa";
import { formatCurrency } from '@/utils/currencyUtils';
import { useLanding } from '../../landing/LandingContext';
import { useState } from 'react';

const IcoCheck = ({ color = '#16a34a', sz = 15 }) => (
  <svg width={sz} height={sz} fill="none" stroke={color} strokeWidth="2.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
  </svg>
)
const IcoWarn = () => (
  <svg width="15" height="15" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
  </svg>
)
const IcoX = ({ sz = 15, color = '#94a3b8' }) => (
  <svg width={sz} height={sz} fill="none" stroke={color} strokeWidth="2.4" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
  </svg>
)

const ShieldIcon = ({ filled = true }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

export default function PlanesProteccion({ seguroIdx, onSeleccionar, c, dias = 1 }) {
  const { t } = useTranslation()
  const { moneda } = useLanding();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const planes = [
    {
      nombre: t('catalogo.basicProtection', 'Protección Obligatoria'),
      precio: 29000,
      shields: [true, false, false],
      items: [
        { tipo: 'check', texto: t('vehiculo.plan1Item1', 'Responsabilidad civil extracontractual (hasta $840 millones)') },
        { tipo: 'check', texto: t('vehiculo.plan1Item2', 'Cobertura básica por colisión y daños') },
        { tipo: 'check', texto: t('vehiculo.plan1Item3', 'Asistencia en carretera 24/7') },
        { tipo: 'warn',  texto: t('vehiculo.plan1Item4', 'Deducible obligatorio de hasta $4.760.000 por siniestro') },
        { tipo: 'x',     texto: t('vehiculo.plan1Item5', 'Sin cobertura de cristales, llantas ni hurto total') },
      ],
    },
    {
      nombre: t('catalogo.fullProtection', 'Protección Total'),
      precio: 67000,
      shields: [true, true, true],
      items: [
        { tipo: 'check', texto: t('vehiculo.plan2Item1', 'Cobertura total contra todo riesgo (Colisión y Hurto)') },
        { tipo: 'check', texto: t('vehiculo.plan2Item2', '$0 Deducible (Cero deducible por daños o choque)') },
        { tipo: 'check', texto: t('vehiculo.plan2Item3', 'Protección total de cristales, espejos y llantas') },
        { tipo: 'check', texto: t('vehiculo.plan2Item4', 'Responsabilidad civil extracontractual ampliada') },
        { tipo: 'check', texto: t('vehiculo.plan2Item5', 'Asistencia VIP prioritaria 24/7 con grúa ilimitada') },
        { tipo: 'x',     texto: t('vehiculo.plan2Item6', 'No cubre uso indebido ni conducción no autorizada') },
      ],
    },
  ];

  const precioDiario = seguroIdx !== null ? planes[seguroIdx].precio : 0;
  const total = precioDiario * dias;

  return (
    <div>
      <div style={{
        background: c?.cardBg || '#ffffff',
        borderRadius: 16,
        padding: '16px',
        border: `1px solid ${c?.cardBorder || '#e2e8f0'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 16px' }}>
          <FaShieldAlt color={c?.accentText || 'var(--brand-secondary)'} size={14} />
          <h3 style={{ fontSize: 13, fontWeight: 700, color: c?.accentText || 'var(--brand-secondary)', margin: 0, textTransform: 'none' }}>
            {t('vehiculo.chooseProtection', 'Elige tu Nivel de Protección')}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {planes.map((plan, idx) => {
            const sel = seguroIdx === idx;
            const isHovered = hoveredIdx === idx;
            const isActive = sel || isHovered;
            
            return (
              <div 
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  background: 'transparent',
                  borderRadius: 16,
                  border: `1px solid ${isActive ? (c?.accentText || 'var(--brand-primary)') : (c?.cardBorder || '#e2e8f0')}`,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'border-color 200ms ease',
                }}
              >
              <div style={{ padding: '20px 20px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 10 }}>
                  {plan.shields.map((isFilled, i) => (
                    <span key={i} style={{ fontSize: 16, color: sel ? 'var(--brand-text)' : (isFilled ? (c?.textSecondary || '#64748b') : (c?.cardBorder || '#94a3b8')) }}>
                      <ShieldIcon filled={isFilled} />
                    </span>
                  ))}
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: c?.textPrimary || 'var(--texto-primary)', textAlign: 'center', margin: '0 0 4px' }}>{plan.nombre}</h4>
                <p style={{ fontSize: '18px', fontWeight: 900, color: 'var(--brand-text)', textAlign: 'center', margin: '0 0 16px', letterSpacing: '-0.03em' }}>
                  {formatCurrency(plan.precio, moneda)} <span style={{ fontSize: '10px', fontWeight: 600, color: c?.textSecondary || 'var(--texto-second)' }}>/ {t('catalogo.day', 'día')}</span>
                </p>
                <hr style={{ border: 'none', borderTop: `1px solid ${c?.cardBorder || 'var(--borde)'}`, margin: '0 0 16px' }} />
              </div>
              <div style={{ padding: '0 20px', flex: 1 }}>
                {plan.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ flexShrink: 0, marginTop: 2 }}>
                      {item.tipo === 'check' && <IcoCheck />}
                      {item.tipo === 'warn'  && <IcoWarn />}
                      {item.tipo === 'x'     && <IcoX sz={14} color="#dc2626" />}
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: sel ? 600 : 500,
                      color: sel ? 'var(--brand-text)' : (item.tipo === 'x' ? (c?.textSecondary || 'var(--texto-second)') : (c?.textPrimary || 'var(--texto-primary)')),
                      lineHeight: 1.4,
                      textDecoration: item.tipo === 'x' ? 'line-through' : 'none'
                    }}>
                      {item.texto}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '16px 20px 20px', marginTop: 'auto' }}>
                <button onClick={() => onSeleccionar(idx)} style={{
                  width: '100%',
                  height: '36px',
                  borderRadius: '9px',
                  fontSize: '11px',
                  fontWeight: 800,
                  border: 'none',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  background: sel ? 'var(--brand-gradient)' : (c?.isDark ? '#1e293b' : '#f1f5f9'),
                  color: sel ? '#ffffff' : (c?.textSecondary || '#64748b'),
                  boxShadow: sel ? '0 5px 14px rgba(var(--brand-primary-rgb),0.22)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}>
                  {sel && <FaCheckCircle size={12} />}
                  {sel ? t('vehiculo.planSelected', 'Plan Seleccionado') : t('vehiculo.choosePlan', 'Elegir Plan')}
                </button>
              </div>
            </div>
          )
        })}
        </div>

        <div style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: `1px solid ${c?.cardBorder || '#e2e8f0'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: c?.textPrimary || '#0f172a' }}>
            {seguroIdx !== null 
              ? t('vehiculo.totalDynamic', `Total ${planes[seguroIdx].nombre} ({{diasText}})`, { name: planes[seguroIdx].nombre, diasText: `${dias} ${dias === 1 ? t('vehiculo.dayStr', 'día') : t('vehiculo.daysStr', 'días')}` })
              : t('vehiculo.totalProtectionPlan', `Total plan de protección ({{diasText}})`, { diasText: `${dias} ${dias === 1 ? t('vehiculo.dayStr', 'día') : t('vehiculo.daysStr', 'días')}` })
            }
          </span>
          <span style={{ fontSize: 15, fontWeight: 800, color: c?.accentText || 'var(--brand-secondary)' }}>
            {formatCurrency(total, moneda)}
          </span>
        </div>
      </div>
    </div>
  );
}
