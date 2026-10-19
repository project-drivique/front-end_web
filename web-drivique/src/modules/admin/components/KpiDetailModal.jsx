import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  FaTimes,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
  FaChartBar,
  FaSearch,
  FaDollarSign,
  FaCalendarCheck,
  FaUndo,
  FaCar,
} from 'react-icons/fa'
import { exportExcel, exportPdf, printTable } from '../../../utils/listExportUtils'
import './KpiDetailModal.css'
import i18n from '@/i18n'

export default function KpiDetailModal({
  metricKey,
  metricTitle,
  kpiData,
  onClose,
  onGoToReports,
}) {
  const [searchTerm, setSearchTerm] = useState('')

  const getMetricIcon = () => {
    switch (metricKey) {
      case 'ingresos':
        return <FaDollarSign style={{ color: 'var(--brand-text)' }} />
      case 'entregas':
        return <FaCalendarCheck style={{ color: '#16a34a' }} />
      case 'devoluciones':
        return <FaUndo style={{ color: '#d97706' }} />
      case 'ocupacion':
        return <FaCar style={{ color: 'var(--brand-text)' }} />
      default:
        return <FaChartBar style={{ color: 'var(--brand-text)' }} />
    }
  }

  const { title, headers, rows, kpis, filename } = kpiData || {
    title: metricTitle || i18n.t('hc2.detalle_de_metrica', 'Detalle de Métrica'),
    headers: [],
    rows: [],
    kpis: [],
    filename: 'metrica',
  }

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows
    const term = searchTerm.toLowerCase()
    return rows.filter((row) =>
      row.some((cell) => String(cell || '').toLowerCase().includes(term))
    )
  }, [rows, searchTerm])

  const handleExportExcel = () => {
    exportExcel({
      title: `Reporte — ${title}`,
      headers,
      rows,
      kpis,
      filename: `${filename}_${new Date().toISOString().slice(0, 10)}`,
    })
  }

  const handleExportPdf = () => {
    exportPdf({
      title: `Reporte Oficial — ${title}`,
      subtitle: i18n.t('hc2.sistema_de_gestion_y_control_operativo', 'Sistema de Gestión y Control Operativo Drivique'),
      headers,
      rows,
      kpis,
    })
  }

  const handlePrint = () => {
    printTable({
      title: `Reporte — ${title}`,
      headers,
      rows,
      kpis,
    })
  }

  const modalContent = (
    <div className="kpi-modal-overlay" onClick={onClose}>
      <div
        className="kpi-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Encabezado del Modal */}
        <div className="kpi-modal-header">
          <div className="kpi-modal-title-wrap">
            <span className="kpi-modal-icon">{getMetricIcon()}</span>
            <div>
              <h3 className="kpi-modal-title">{title}</h3>
              <p className="kpi-modal-subtitle">{i18n.t('hc.desglose_completo_y_metricas_de_audito', 'Desglose completo y métricas de auditoría')}</p>
            </div>
          </div>
          <button
            type="button"
            className="kpi-modal-close-btn"
            onClick={onClose}
            title={i18n.t('hc2.cerrar_modal', 'Cerrar modal')}
          >
            <FaTimes />
          </button>
        </div>

        {/* Resumen de KPIs */}
        {kpis && kpis.length > 0 && (
          <div className="kpi-modal-summary-grid">
            {kpis.map((kpi, idx) => (
              <div key={idx} className="kpi-modal-summary-card">
                <span className="kpi-modal-summary-label">{kpi.label}</span>
                <strong className="kpi-modal-summary-value">{kpi.value}</strong>
              </div>
            ))}
          </div>
        )}

        {/* Barra de Acciones y Búsqueda */}
        <div className="kpi-modal-toolbar">
          <div className="kpi-modal-search">
            <FaSearch className="kpi-search-icon" />
            <input
              type="text"
              placeholder={i18n.t('hc.buscar_en_el_detalle', 'Buscar en el detalle...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="kpi-modal-actions">
            <button
              type="button"
              className="kpi-action-btn kpi-action-btn--excel"
              onClick={handleExportExcel}
              title={i18n.t('hc4.exportar_a_excel', 'Exportar a Excel')}
            >
              <FaFileExcel /> <span>Excel</span>
            </button>

            <button
              type="button"
              className="kpi-action-btn kpi-action-btn--pdf"
              onClick={handleExportPdf}
              title={i18n.t('hc4.exportar_a_pdf', 'Exportar a PDF')}
            >
              <FaFilePdf /> <span>PDF</span>
            </button>

            <button
              type="button"
              className="kpi-action-btn kpi-action-btn--print"
              onClick={handlePrint}
              title={i18n.t('hc4.imprimir_reporte', 'Imprimir reporte')}
            >
              <FaPrint /> <span>{i18n.t('hc4.imprimir', 'Imprimir')}</span>
            </button>

            <button
              type="button"
              className="kpi-action-btn kpi-action-btn--reports"
              onClick={onGoToReports}
              title={i18n.t('hc.ir_al_modulo_completo_de_reportes', 'Ir al módulo completo de reportes')}
            >
              <FaChartBar /> <span>Ir a Reportes</span>
            </button>
          </div>
        </div>

        {/* Tabla de Datos */}
        <div className="kpi-modal-table-wrapper">
          <table className="kpi-modal-table">
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => {
                      const strCell = String(cell || '')
                      const lower = strCell.toLowerCase()
                      let badgeClass = ''
                      if (
                        lower.includes('completada') ||
                        lower.includes('recibida') ||
                        lower.includes('aprobado') ||
                        lower.includes('alquiler')
                      ) {
                        badgeClass = 'kpi-badge--success'
                      } else if (
                        lower.includes('pendiente') ||
                        lower.includes('programada') ||
                        lower.includes('disponible')
                      ) {
                        badgeClass = 'kpi-badge--warning'
                      } else if (lower.includes('taller') || lower.includes('cancelada')) {
                        badgeClass = 'kpi-badge--danger'
                      }

                      return (
                        <td key={cIdx}>
                          {badgeClass ? (
                            <span className={`kpi-cell-badge ${badgeClass}`}>{strCell}</span>
                          ) : (
                            strCell
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length || 1} className="kpi-modal-empty">
                    No se encontraron registros que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de página del Modal */}
        <div className="kpi-modal-footer">
          <span className="kpi-modal-count">
            Mostrando {filteredRows.length} de {rows.length} registros
          </span>
          <button type="button" className="kpi-modal-close-footer-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalContent, document.body)
  }

  return modalContent
}
