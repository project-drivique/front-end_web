import { FaHeadphones, FaWrench, FaFolderOpen } from 'react-icons/fa'

export default function SoporteTabsContainer({ conteoReportesActivos, pestanaActiva, setPestanaActiva, t }) {
  return (
    <div className="soporte-tabs-container">
            <button
              className={`soporte-tab-btn ${pestanaActiva === 'canales' ? 'activa' : ''}`}
              onClick={() => setPestanaActiva('canales')}
            >
              <FaHeadphones /> {t('soporte.tabCanales', 'Canales de atención')}
            </button>
  
            <button
              className={`soporte-tab-btn ${pestanaActiva === 'reportar' ? 'activa' : ''}`}
              onClick={() => setPestanaActiva('reportar')}
            >
              <FaWrench /> {t('soporte.tabReportar', 'Reportar incidencia')}
            </button>
  
            <button
              className={`soporte-tab-btn ${pestanaActiva === 'informes' ? 'activa' : ''}`}
              onClick={() => setPestanaActiva('informes')}
            >
              <FaFolderOpen /> {t('soporte.tabInformes', 'Mis reportes')}
              {conteoReportesActivos > 0 && (
                <span className="soporte-tab-badge">{conteoReportesActivos}</span>
              )}
            </button>
          </div>
  )
}
