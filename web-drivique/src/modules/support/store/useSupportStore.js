import { useState, useEffect, useMemo, useCallback } from 'react'
import { INITIAL_REPORTS, TIPOS_INCIDENCIA } from '../data/support.dummy'

const STORAGE_KEY_REPORTS = 'drivique_user_reports'

function leerStorageReports() {
  if (typeof window === 'undefined') return INITIAL_REPORTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTS)
    if (!raw) return INITIAL_REPORTS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_REPORTS
  } catch {
    return INITIAL_REPORTS
  }
}

function guardarStorageReports(data) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(data))
  } catch { /* El almacenamiento puede no estar disponible en modo privado. */ }
}

export function useSupportStore() {
  const [reportes, setReportes] = useState(leerStorageReports)

  useEffect(() => {
    guardarStorageReports(reportes)
  }, [reportes])

  // Conteo de informes erróneos / reportes activos (no resueltos)
  const conteoReportesActivos = useMemo(() => {
    return reportes.filter((r) => r.estado !== 'resuelto').length
  }, [reportes])

  const crearReporte = useCallback((formData) => {
    const numRandom = Math.floor(1000 + Math.random() * 9000)
    const nuevoCodigo = `REP-${numRandom}`

    const tipoObj = TIPOS_INCIDENCIA.find((t) => t.id === formData.tipoIncidenciaId)
    const tiempoEst = tipoObj ? tipoObj.tiempoEstimado : '2 a 4 horas'

    const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const nuevoReporte = {
      id: nuevoCodigo,
      codigo: nuevoCodigo,
      tipoIncidenciaId: formData.tipoIncidenciaId || 'averia_mecanica',
      tipoIncidenciaNombre: tipoObj ? tipoObj.nombre : 'Incidencia reportada',
      vehiculo: formData.vehiculo || 'Vehículo reservado',
      placa: formData.placa || 'N/A',
      descripcion: formData.descripcion,
      contactoNombre: formData.contactoNombre,
      contactoTelefono: formData.contactoTelefono,
      contactoEmail: formData.contactoEmail,
      tiempoEstimado: tiempoEst,
      estado: 'recibido',
      fechaIso: new Date().toISOString(),
      evidenciasCount: formData.evidenciasCount || 0,
      historial: [
        {
          estadoKey: 'recibido',
          titulo: 'Recibido',
          descripcion: 'Reporte registrado en el sistema.',
          hora: horaActual,
          color: 'var(--brand-primary)',
        },
      ],
    }

    setReportes((prev) => [nuevoReporte, ...prev])

    // Agrega notificación automática al almacén de notificaciones si existe
    try {
      const notifsRaw = localStorage.getItem('drivique_user_notifications')
      const notifs = notifsRaw ? JSON.parse(notifsRaw) : []
      if (Array.isArray(notifs)) {
        notifs.unshift({
          id: `notif-rep-${Date.now()}`,
          tipo: 'soporte_respuesta',
          tituloKey: 'notificaciones.items.soporteRespuestaTitle',
          tituloFallback: `Soporte registró tu reporte ${nuevoCodigo}`,
          mensajeKey: 'notificaciones.items.soporteRespuestaMsg',
          mensajeFallback: `Tu reporte ${nuevoCodigo} por ${tipoObj?.nombre || 'incidencia'} fue recibido. Tiempo estimado de atención: ${tiempoEst}.`,
          fechaIso: new Date().toISOString(),
          leida: false,
        })
        localStorage.setItem('drivique_user_notifications', JSON.stringify(notifs))
      }
    } catch { /* El reporte permanece creado aunque no se pueda notificar. */ }

    return nuevoReporte
  }, [])

  return {
    reportes,
    conteoReportesActivos,
    crearReporte,
  }
}
