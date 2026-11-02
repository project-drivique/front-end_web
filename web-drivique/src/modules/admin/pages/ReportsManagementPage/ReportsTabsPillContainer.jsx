import { FaChartPie, FaFileAlt, FaHistory } from 'react-icons/fa'

export default function ReportsTabsPillContainer({ activeTab, history, setActiveTab, t }) {
  return (
    <div className="reports-tabs-pill-container">
            <button
              type="button"
              className={`reports-tab-pill-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <FaChartPie />
              <span>{t('admin.reports.tabDashboard', 'Dashboard de Inteligencia')}</span>
            </button>
  
            <button
              type="button"
              className={`reports-tab-pill-btn ${activeTab === 'builder' ? 'active' : ''}`}
              onClick={() => setActiveTab('builder')}
            >
              <FaFileAlt />
              <span>{t('admin.reports.tabBuilder', 'Generador de Reportes')}</span>
            </button>
  
            <button
              type="button"
              className={`reports-tab-pill-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <FaHistory />
              <span>{t('admin.reports.tabHistory', 'Historial de Reportes')}</span>
              <span className="reports-tab-counter-badge">{history.length}</span>
            </button>
          </div>
  )
}
