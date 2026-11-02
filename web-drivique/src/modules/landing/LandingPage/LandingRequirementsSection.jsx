import { Link } from 'react-router-dom'
import { FaIdCard, FaFileUpload, FaCreditCard, FaFileSignature, FaCheck, FaArrowRight } from 'react-icons/fa'

const IconoFlecha = () => <FaArrowRight size={16} aria-hidden="true" />

export default function LandingRequirementsSection({ tx }) {
  return (
    <section id="requisitos" className="landing-requirements-section landing-section">
          <div className="landing-requirements-section__inner">
            <div className="landing-requirements-copy">
              <span>{tx.requirements.label}</span>
              <h2>{tx.requirements.titulo}</h2>
              <p>{tx.requirements.sub}</p>
              <Link to="/registro" className="landing-requirements-cta">
                {tx.requirements.cta}
                <IconoFlecha />
              </Link>
            </div>
  
            <div className="landing-requirements-grid">
              {tx.requirements.items.map((item, index) => {
                const RequirementIcon = [FaIdCard, FaFileUpload, FaCreditCard, FaFileSignature][index] ?? FaCheck
                return (
                  <article key={item.titulo} className="landing-requirement-card">
                    <span className="landing-requirement-card__step">{String(index + 1).padStart(2, '0')}</span>
                    <div className="landing-requirement-card__icon">
                      <RequirementIcon aria-hidden="true" />
                    </div>
                    <h3>{item.titulo}</h3>
                    <p>{item.desc}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
  )
}
