import { FaCheck, FaCarSide, FaCreditCard, FaFileContract, FaMapMarkerAlt, FaMobileAlt, FaStar } from 'react-icons/fa'

const ICONOS_FEATURES = [
  FaCarSide,
  FaCreditCard,
  FaFileContract,
  FaMapMarkerAlt,
  FaMobileAlt,
  FaStar,
]

export default function LandingFeaturesSection({ tx }) {
  return (
    <section id="servicios" className="landing-features-section landing-section">
          <div className="landing-features-section__inner">
            <div className="landing-features-heading">
              <span>{tx.features.label}</span>
              <h2>{tx.features.titulo}</h2>
              <p>{tx.features.sub}</p>
            </div>
  
            <div className="landing-features-grid">
              {tx.features.items.map((item, i) => {
                const FeatureIcon = ICONOS_FEATURES[i] ?? FaCheck
                return (
                <div
                  key={i}
                  className={i === 2 ? 'landing-feature-card landing-feature-card--highlight' : 'landing-feature-card'}
                >
                  <div className="landing-feature-card__icon">
                    <FeatureIcon size={24} aria-hidden="true" />
                  </div>
                  <h3>{item.titulo}</h3>
                  <p>{item.desc}</p>
                </div>
                )
              })}
            </div>
          </div>
        </section>
  )
}
