import defaultLogo from '../assets/logocatalog.png'
import { useBrand } from '../contexts/BrandContext'

export default function BrandLogo({ className = '', style, showName = false }) {
  const { brand } = useBrand()
  return (
    <span className={`brand-logo ${className}`.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, ...style }}>
      <img src={brand.logoDataUrl || defaultLogo} alt={brand.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      {showName && <strong>{brand.name}</strong>}
    </span>
  )
}
