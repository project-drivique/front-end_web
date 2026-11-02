import { FaExclamationTriangle, FaPlus } from 'react-icons/fa'

export default function BranchGradientHeroBanner({ dashboardData, incidentsRoute, navigate, reservationsRoute, t }) {
  return (
    <header className="branch-gradient-hero-banner">
            <div className="branch-gradient-hero-content">
              <div className="branch-gradient-hero-badge">
                <span className="branch-hero-live-dot" />
                <span>{t('dashboard.hero.realtime', 'En tiempo real')}</span>
              </div>
              <h1 className="branch-gradient-hero-title">
                {dashboardData.branchName}
              </h1>
              <p className="branch-gradient-hero-subtitle">
                {t('dashboard.hero.subtitle', 'Resumen general del rendimiento operativo de la sucursal')}
              </p>
            </div>
  
            <div className="branch-gradient-hero-actions">
              <button
                type="button"
                className="branch-hero-btn branch-hero-btn--outlined"
                onClick={() => navigate(incidentsRoute)}
              >
                <FaExclamationTriangle aria-hidden="true" />
                <span>{t('dashboard.hero.reportIncident', 'Reportar incidencia')}</span>
              </button>
  
              <button
                type="button"
                className="branch-hero-btn branch-hero-btn--white"
                onClick={() => navigate(reservationsRoute)}
              >
                <FaPlus aria-hidden="true" />
                <span>{t('dashboard.hero.createReservation', 'Crear reserva')}</span>
              </button>
            </div>
          </header>
  )
}
