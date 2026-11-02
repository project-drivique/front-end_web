import logocatalog from '@/assets/logocatalog.png'
import { formatCurrency } from '@/utils/currencyUtils'
import { FaCarSide, FaCreditCard, FaFileContract, FaCheck, FaMobileAlt } from 'react-icons/fa'

export default function LandingAppSection({ autoDestacado, brand, moneda, tx }) {
  return (
    <section id="app" className="landing-app-section landing-section">
          <div className="landing-app-section__inner">
            <div className="landing-phone" aria-hidden="true">
              <div className="landing-phone__screen">
                <div className="landing-phone__status">
                  <span>9:30</span>
                  <span>100%</span>
                </div>
                <div className="landing-phone__brand">
                  <img src={brand.logoDataUrl || logocatalog} alt="" />
                  <strong>{brand.name}</strong>
                </div>
                <div className="landing-phone__card">
                  <span>{tx.app.previewTitle}</span>
                  <h3>{autoDestacado?.nombre || 'Drivique'}</h3>
                  <p>{autoDestacado ? formatCurrency(autoDestacado.precio, moneda) : formatCurrency(0, moneda)}{tx.hero.perDay}</p>
                </div>
                <div className="landing-phone__list">
                  {tx.app.items.map((item, index) => {
                    const ItemIcon = [FaCarSide, FaCreditCard, FaFileContract][index] ?? FaCheck
                    return (
                      <div key={item}>
                        <ItemIcon />
                        <span>{item}</span>
                        <FaCheck />
                      </div>
                    )
                  })}
                </div>
                <div className="landing-phone__pill">{tx.app.status}</div>
              </div>
            </div>
  
            <div className="landing-app-copy">
              <span>{tx.app.label}</span>
              <h2>{tx.app.titulo}</h2>
              <p>{tx.app.sub}</p>
              <div className="landing-app-actions">
                <a href="/drivique.apk" download className="landing-app-primary">
                  <FaMobileAlt aria-hidden="true" />
                  {tx.app.cta}
                </a>
              </div>
            </div>
          </div>
        </section>
  )
}
