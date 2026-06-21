import { useTranslation } from 'react-i18next';
import { FaShieldAlt, FaRegHeart } from "react-icons/fa";
import { formatCurrency } from '@/utils/monedaUtils';
import { useLanding } from '../../../landing/LandingContext';

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
const IcoX = ({ sz = 15, color = '#dc2626' }) => (
  <svg width={sz} height={sz} fill="none" stroke={color} strokeWidth="2.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
  </svg>
)

export default function PlanesProteccion({ seguroIdx, onSeleccionar }) {
  const { t } = useTranslation()
  const { moneda } = useLanding();

  const planes = [
    {
      nombre: t('catalogo.basicProtection'),
      precio: 29000,
      icono: [FaShieldAlt, FaRegHeart, FaRegHeart],
      items: [
        { tipo: 'check', texto: t('vehiculo.plan1Item1') },
        { tipo: 'check', texto: t('vehiculo.plan1Item2') },
        { tipo: 'check', texto: t('vehiculo.plan1Item3') },
        { tipo: 'warn',  texto: t('vehiculo.plan1Item4') },
        { tipo: 'x',     texto: t('vehiculo.plan1Item5') },
      ],
    },
    {
      nombre: t('catalogo.fullProtection'),
      precio: 67000,
      icono: [FaShieldAlt, FaShieldAlt, FaShieldAlt],
      items: [
        { tipo: 'check', texto: t('vehiculo.plan2Item1') },
        { tipo: 'check', texto: t('vehiculo.plan2Item2') },
        { tipo: 'check', texto: t('vehiculo.plan2Item3') },
        { tipo: 'check', texto: t('vehiculo.plan2Item4') },
        { tipo: 'x',     texto: t('vehiculo.plan2Item5') },
      ],
    },
  ];

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--texto-primary)', margin: '0 0 16px' }}>{t('vehiculo.chooseProtection')}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 18, marginBottom: 32 }}>
        {planes.map((plan, idx) => {
          const sel = seguroIdx === idx;
          return (
            <div key={idx} style={{
              borderRadius: 20,
              border: `2px solid ${sel ? '#2563eb' : 'var(--borde)'}`,
              background: sel ? '#f8fafc' : 'var(--bg-tarjeta)',
              boxShadow: sel ? '0 6px 24px rgba(37,99,235,0.15)' : 'var(--sombra-tarjeta)',
              overflow: 'hidden',
              transition: 'all 250ms ease'
            }}>
              <div style={{ padding: '20px 24px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 10 }}>
                  {plan.icono.map((Icono, i) => (
                    <span key={i} style={{ fontSize: 18, color: sel ? '#2563eb' : 'var(--texto-second)' }}>
                      <Icono />
                    </span>
                  ))}
                </div>
                <h4 style={{ fontSize: 18, fontWeight: 800, color: 'var(--texto-primary)', textAlign: 'center', margin: '0 0 4px' }}>{plan.nombre}</h4>
                <p style={{ fontSize: 18, fontWeight: 800, color: '#059669', textAlign: 'center', margin: '0 0 16px' }}>
                  {formatCurrency(plan.precio, moneda)} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--texto-second)' }}>/ {t('catalogo.day')}</span>
                </p>
                <hr style={{ border: 'none', borderTop: '1px solid var(--borde)', margin: '0 0 16px' }} />
              </div>
              <div style={{ padding: '0 24px' }}>
                {plan.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flexShrink: 0, marginTop: 2 }}>
                      {item.tipo === 'check' && <IcoCheck />}
                      {item.tipo === 'warn'  && <IcoWarn />}
                      {item.tipo === 'x'     && <IcoX sz={14} color="#dc2626" />}
                    </div>
                    <span style={{
                      fontSize: 13,
                      color: sel ? '#1e3a8a' : (item.tipo === 'x' ? 'var(--texto-second)' : 'var(--texto-primary)'),
                      lineHeight: 1.5,
                      textDecoration: item.tipo === 'x' ? 'line-through' : 'none'
                    }}>
                      {item.texto}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '20px 24px' }}>
                <button onClick={() => onSeleccionar(idx)} style={{
                  width: '100%', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', transition: 'all 200ms ease',
                  background: sel ? 'linear-gradient(90deg,#1e3a8a,#2563eb)' : (idx === 1 ? '#fff' : 'var(--bg-item)'),
                  color: sel ? '#fff' : (idx === 1 ? '#1e3a8a' : 'var(--texto-second)'),
                  border: idx === 1 && !sel ? '2px solid #1e3a8a' : 'none',
                  boxShadow: sel ? '0 4px 14px rgba(30,58,138,0.25)' : 'none',
                }}>
                  {sel ? t('vehiculo.planSelected') : t('vehiculo.choosePlan')}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
