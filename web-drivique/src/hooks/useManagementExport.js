import { useCallback } from 'react'
import { exportExcel, exportPdf, printTable } from '../utils/listExportUtils'
import i18n from '@/i18n'

/**
 * Custom Hook: useManagementExport (Patrón Custom Hook & Facade)
 * Encapsula la lógica de exportación de datos a PDF, Excel e Impresión,
 * notificando opcionalmente el resultado al usuario.
 *
 * @param {Function} setNotice Callback para notificar mensajes en UI
 */
export function useManagementExport(setNotice) {
  const handleExportExcel = useCallback(
    (exportData) => {
      try {
        exportExcel(exportData)
        if (setNotice) setNotice('Reporte exportado exitosamente a Excel (.xlsx)')
      } catch (err) {
        console.error('Error al exportar Excel:', err)
      }
    },
    [setNotice]
  )

  const handleExportPdf = useCallback(
    (exportData) => {
      try {
        exportPdf(exportData)
        if (setNotice) setNotice(i18n.t('hc2.documento_pdf_generado_correctamente', 'Documento PDF generado correctamente'))
      } catch (err) {
        console.error('Error al exportar PDF:', err)
      }
    },
    [setNotice]
  )

  const handlePrint = useCallback(
    (exportData) => {
      try {
        printTable(exportData)
        if (setNotice) setNotice(i18n.t('hc.vista_de_impresion_desplegada', 'Vista de impresión desplegada'))
      } catch (err) {
        console.error('Error al imprimir:', err)
      }
    },
    [setNotice]
  )

  return {
    handleExportExcel,
    handleExportPdf,
    handlePrint,
  }
}
