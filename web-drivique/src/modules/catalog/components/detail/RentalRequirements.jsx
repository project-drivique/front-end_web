import { useTranslation } from 'react-i18next'
import { FaIdCard, FaUserAlt, FaClipboardCheck } from 'react-icons/fa'

export default function RentalRequirements({ c }) {
  const { t } = useTranslation()

  const bg = c?.cardBg || '#fff'
  const border = c?.cardBorder || '#e2e8f0'
  const titleColor = c?.titleColor || 'var(--brand-secondary)'
  const reqTitleColor = c?.textPrimary || '#334155'
  const reqDescColor = c?.textSecondary || '#64748b'

  const requisitos = [
    { icono: FaUserAlt, titulo: t('vehiculo.minAgeTitle', 'Edad mínima'), desc: t('vehiculo.minAgeDesc', 'Debes tener al menos 21 años para rentar.') },
    { icono: FaIdCard, titulo: t('vehiculo.idTitle', 'Identificación'), desc: t('vehiculo.idDesc', 'Cédula de ciudadanía para nacionales o pasaporte vigente para extranjeros.') }
  ]

  return (
    <div style={{ background: bg, padding: 20, borderRadius: 16, border: `1px solid ${border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <FaClipboardCheck color={c?.accentText || "var(--brand-primary)"} size={14} />
        <h3 style={{ fontSize: 13, fontWeight: 700, color: titleColor, margin: 0 }}>{t('vehiculo.rentalRequirements', 'Requisitos para rentar')}</h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {requisitos.map((req, i) => (
          <div key={i} style={{ display: 'flex', gap: 12 }}>
            <div style={{ marginTop: 2 }}>
              <req.icono color="#94a3b8" size={14} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: reqTitleColor, marginBottom: 2 }}>
                {req.titulo}
              </div>
              <div style={{ fontSize: 12, color: reqDescColor, lineHeight: 1.4 }}>
                {req.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
