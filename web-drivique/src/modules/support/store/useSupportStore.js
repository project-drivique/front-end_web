import { useState, useEffect, useMemo, useCallback } from 'react'
import { incidentManagementService } from '../../../services/incidentManagementService'

// Reportes del cliente: se leen del servidor y se crean con sus archivos de evidencia
export function useSupportStore() {
  const [reportes, setReportes] = useState(() => incidentManagementService.list())

  useEffect(() => {
    let activo = true
    const actualizar = () => { if (activo) setReportes(incidentManagementService.list()) }
    window.addEventListener(incidentManagementService.eventName, actualizar)
    incidentManagementService.refreshMine().then(actualizar).catch(() => {})
    return () => {
      activo = false
      window.removeEventListener(incidentManagementService.eventName, actualizar)
    }
  }, [])

  // Reportes activos: los que todavía no se resuelven ni se cierran
  const conteoReportesActivos = useMemo(
    () => reportes.filter((r) => ['recibido', 'atendiendo'].includes(r.estado)).length,
    [reportes]
  )

  const crearReporte = useCallback(async (formData, archivos = []) => {
    const creado = await incidentManagementService.createIncident(formData, null, archivos)
    setReportes(incidentManagementService.list())
    return creado
  }, [])

  const abrirDetalle = useCallback((id) => incidentManagementService.loadDetail(id), [])

  return { reportes, conteoReportesActivos, crearReporte, abrirDetalle }
}
