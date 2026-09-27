import { showAlert } from './swalConfig'

export function getHorarioInfo(nombreSucursal) {
  if (!nombreSucursal) {
    return {
      apertura: '08:00',
      cierre: '18:00',
      dias: 'lunes a sábado',
      aperturaTexto: '8:00 a.m.',
      cierreTexto: '6:00 p.m.'
    }
  }

  const nombreLower = nombreSucursal.toLowerCase()
  if (nombreLower.includes('aeropuerto') || nombreLower.includes('terminal') || nombreLower.includes('el dorado')) {
    return {
      apertura: '00:00',
      cierre: '23:30',
      dias: 'lunes a domingo',
      aperturaTexto: '6:00 a.m.',
      cierreTexto: '11:00 p.m.'
    }
  }
  if (nombreLower.includes('domicilio') || nombreLower.includes('hotel') || nombreLower.includes('airbnb')) {
    return {
      apertura: '07:00',
      cierre: '19:00',
      dias: 'lunes a domingo',
      aperturaTexto: '7:00 a.m.',
      cierreTexto: '7:00 p.m.'
    }
  }

  return {
    apertura: '08:00',
    cierre: '18:00',
    dias: 'lunes a sábado',
    aperturaTexto: '8:00 a.m.',
    cierreTexto: '6:00 p.m.'
  }
}

export function generarHorasDisponibles(lugar, minHora, maxHora) {
  const { apertura, cierre } = getHorarioInfo(lugar)
  const [hInicio, mInicio] = apertura.split(':').map(Number)
  const [hFin, mFin] = cierre.split(':').map(Number)

  let minMins = -1
  if (minHora) {
    const [mh, mm] = minHora.split(':').map(Number)
    minMins = mh * 60 + mm
  }

  let maxMins = Infinity
  if (maxHora) {
    const [mh, mm] = maxHora.split(':').map(Number)
    maxMins = mh * 60 + mm
  }

  const horas = []
  for (let h = hInicio; h <= hFin; h++) {
    for (const m of [0, 30]) {
      if (h === hInicio && m < mInicio) continue
      if (h === hFin && m > mFin) continue

      const totalMins = h * 60 + m
      if (totalMins <= minMins) continue
      if (totalMins > maxMins) continue

      horas.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return horas
}

export function verificarSiSucursalCerradaHoy(fechaISO, nombreSucursal) {
  if (!fechaISO) return false

  const [y, m, d] = fechaISO.split('-').map(Number)
  const selectedDate = new Date(y, m - 1, d)
  const today = new Date()

  if (selectedDate.toDateString() === today.toDateString()) {
    const minHoraActual = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`
    const horasDisponibles = generarHorasDisponibles(nombreSucursal, minHoraActual)

    if (horasDisponibles.length === 0) {
      const info = getHorarioInfo(nombreSucursal)
      const nombreFinal = nombreSucursal || 'Alquiler Drivique'

      showAlert({
        icon: 'warning',
        title: 'Sucursal cerrada por hoy',
        text: `La sucursal ${nombreFinal} atiende ${info.dias} · ${info.aperturaTexto} – ${info.cierreTexto}. Puedes reservar a partir de mañana.`,
        confirmButtonText: 'Aceptar',
      })
      return true
    }
  }
  return false
}

export const verificarYCambiarSiSucursalCerradaHoy = verificarSiSucursalCerradaHoy
