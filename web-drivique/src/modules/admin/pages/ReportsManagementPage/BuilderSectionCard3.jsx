import { REPORT_FORMATS } from '../../../../services/reportManagementService'
import { FaFileWord, FaFilePdf, FaFileExcel, FaCheckCircle, FaEye, FaPrint, FaSyncAlt, FaDownload } from 'react-icons/fa'

export default function BuilderSectionCard3({ handleGenerateReport, handlePrintCurrentReport, isGenerating, livePreviewData, selectedFormat, setSelectedFormat, setShowPreviewModal, t }) {
  return (
    <div className="builder-section-card">
                <div className="builder-section-header">
                  <div className="builder-step-indicator">
                    <div className="step-circle-badge">3</div>
                    <div>
                      <h3 className="step-title-text">{t('admin.reports.step3Title', 'Selecciona el Formato de Salida y Genera')}</h3>
                      <p className="step-subtitle-text">{t('admin.reports.step3Subtitle', 'Elige el formato de documento deseado y descarga inmediatamente tu reporte')}</p>
                    </div>
                  </div>
                </div>
  
                <div className="format-and-actions-wrapper">
                  <div className="formats-row-selector">
                    <div
                      className={`format-selection-card word ${selectedFormat === REPORT_FORMATS.WORD ? 'active' : ''}`}
                      onClick={() => setSelectedFormat(REPORT_FORMATS.WORD)}
                    >
                      <div className="format-icon-box">
                        <FaFileWord />
                      </div>
                      <div className="format-info-group">
                        <strong>{t('admin.reports.formatWordTitle', 'Microsoft Word')}</strong>
                        <span>{t('admin.reports.formatWordDesc', 'Documento formal (.doc)')}</span>
                      </div>
                    </div>
  
                    <div
                      className={`format-selection-card pdf ${selectedFormat === REPORT_FORMATS.PDF ? 'active' : ''}`}
                      onClick={() => setSelectedFormat(REPORT_FORMATS.PDF)}
                    >
                      <div className="format-icon-box">
                        <FaFilePdf />
                      </div>
                      <div className="format-info-group">
                        <strong>{t('admin.reports.formatPdfTitle', 'Documento PDF')}</strong>
                        <span>{t('admin.reports.formatPdfDesc', 'Imprimible estilizado (.pdf)')}</span>
                      </div>
                    </div>
  
                    <div
                      className={`format-selection-card excel ${selectedFormat === REPORT_FORMATS.EXCEL ? 'active' : ''}`}
                      onClick={() => setSelectedFormat(REPORT_FORMATS.EXCEL)}
                    >
                      <div className="format-icon-box">
                        <FaFileExcel />
                      </div>
                      <div className="format-info-group">
                        <strong>{t('admin.reports.formatExcelTitle', 'Microsoft Excel')}</strong>
                        <span>{t('admin.reports.formatExcelDesc', 'Hoja de cálculo (.xls)')}</span>
                      </div>
                    </div>
                  </div>
  
                  <div className="actions-launch-bar">
                    <div className="launch-bar-info">
                      <FaCheckCircle style={{ color: '#15803d' }} />
                      <span>
                        {t('admin.reports.readyToExport', {
                          count: livePreviewData.totalRegistros,
                          format: selectedFormat,
                          defaultValue: `Listo para exportar ${livePreviewData.totalRegistros} registros en formato ${selectedFormat}`,
                        })}
                      </span>
                    </div>
  
                    <div className="launch-bar-buttons">
                      <div className="launch-bar-secondary-actions">
                        <button
                          type="button"
                          className="btn-print-hero btn-preview"
                          onClick={() => setShowPreviewModal(true)}
                        >
                          <FaEye /> {t('admin.reports.viewPreviewBtn', 'Ver Vista Previa')}
                        </button>
  
                        <button
                          type="button"
                          className="btn-print-hero btn-print"
                          onClick={handlePrintCurrentReport}
                        >
                          <FaPrint /> {t('admin.reports.printCurrentBtn', 'Imprimir')}
                        </button>
                      </div>
  
                      <button
                        type="button"
                        className="btn-generate-hero"
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <FaSyncAlt className="fa-spin" /> {t('admin.reports.generating', 'Generando Reporte...')}
                          </>
                        ) : (
                          <>
                            <FaDownload /> {t('admin.reports.generateBtn', 'Generar y Descargar Reporte')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
  )
}
