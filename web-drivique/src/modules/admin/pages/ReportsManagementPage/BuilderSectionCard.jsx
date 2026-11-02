import { REPORT_CATEGORIES } from '../../../../services/reportManagementService'
import { FaChartPie, FaCheck, FaMoneyBillWave, FaCarSide, FaTools, FaClipboardList, FaCar, FaFileContract, FaExclamationTriangle, FaUsers, FaTags, FaBuilding } from 'react-icons/fa'

const ICONS_MAP = {
  FaChartPie,
  FaMoneyBillWave,
  FaCarSide,
  FaTools,
  FaClipboardList,
  FaCar,
  FaFileContract,
  FaExclamationTriangle,
  FaUsers,
  FaTags,
  FaBuilding,
}

export default function BuilderSectionCard({ availableTypes, selectedCategory, selectedTypeId, setSelectedCategory, setSelectedTypeId, t }) {
  return (
    <div className="builder-section-card">
                <div className="builder-section-header">
                  <div className="builder-step-indicator">
                    <div className="step-circle-badge">1</div>
                    <div>
                      <h3 className="step-title-text">{t('admin.reports.step1Title', 'Selecciona el Tipo de Reporte')}</h3>
                      <p className="step-subtitle-text">{t('admin.reports.step1Subtitle', 'Elige la plantilla analítica o el reporte específico que deseas generar')}</p>
                    </div>
                  </div>
  
                  <div className="category-switcher-bar">
                    <button
                      type="button"
                      className={`category-switch-btn ${selectedCategory === REPORT_CATEGORIES.GENERAL ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(REPORT_CATEGORIES.GENERAL)}
                    >
                      {t('admin.reports.catGeneral', 'Reportes Generales')}
                    </button>
                    <button
                      type="button"
                      className={`category-switch-btn ${selectedCategory === REPORT_CATEGORIES.SPECIFIC ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(REPORT_CATEGORIES.SPECIFIC)}
                    >
                      {t('admin.reports.catSpecific', 'Reportes Específicos')}
                    </button>
                  </div>
                </div>
  
                <div className="reports-type-grid">
                  {availableTypes.map((type) => {
                    const IconComp = ICONS_MAP[type.icono] || FaChartPie
                    const isSelected = selectedTypeId === type.id
                    return (
                      <div
                        key={type.id}
                        className={`report-type-card-modern ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedTypeId(type.id)}
                      >
                        <div className="card-top-content">
                          <div className="card-icon-bubble">
                            <IconComp />
                          </div>
                          <div className="card-text-group">
                            <h4>{t(`admin.reports.types.${type.id}_title`, type.titulo)}</h4>
                            <p>{t(`admin.reports.types.${type.id}_desc`, type.descripcion)}</p>
                          </div>
                        </div>
  
                        {isSelected && (
                          <div className="card-selected-tag">
                            <FaCheck /> <span>{t('admin.reports.selected', 'Seleccionado')}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
  )
}
