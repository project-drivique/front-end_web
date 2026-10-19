import { showAlert } from './swalConfig'
import i18n from '@/i18n'

export function getHorarioInfo(nombreSucursal) {
  if (!nombreSucursal) {
    return {
      apertura: '00:00',
      cierre: '23:30',
      dias: 'lunes a domingo',
      aperturaTexto: '12:00 a.m.',
      cierreTexto: '11:30 p.m.'
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
    apertura: '00:00',
    cierre: '23:30',
    dias: 'lunes a domingo',
    aperturaTexto: '12:00 a.m.',
    cierreTexto: '11:30 p.m.'
  }
}

export function generarHorasDisponibles(lugar, minHora, maxHora, fecha) {
  const { apertura, cierre } = getHorarioInfo(lugar)
  const [hInicio, mInicio] = apertura.split(':').map(Number)
  const [hFin, mFin] = cierre.split(':').map(Number)

  const ahora = new Date()
  const year = ahora.getFullYear()
  const month = String(ahora.getMonth() + 1).padStart(2, '0')
  const day = String(ahora.getDate()).padStart(2, '0')
  const hoyStr = `${year}-${month}-${day}`

  const cleanFecha = fecha ? String(fecha).split('T')[0] : null
  const esHoy = cleanFecha === hoyStr
  const esPasado = cleanFecha ? cleanFecha < hoyStr : false
  const ahoraMinutos = ahora.getHours() * 60 + ahora.getMinutes()

  let minMins = -1
  if (minHora) {
    const [mh, mm] = String(minHora).split(':').map(Number)
    if (!isNaN(mh) && !isNaN(mm)) {
      minMins = mh * 60 + mm
    }
  }

  let maxMins = Infinity
  if (maxHora) {
    const [mh, mm] = String(maxHora).split(':').map(Number)
    if (!isNaN(mh) && !isNaN(mm)) {
      maxMins = mh * 60 + mm
    }
  }

  if (esPasado) return []

  const horas = []
  for (let h = hInicio; h <= hFin; h++) {
    for (const m of [0, 30]) {
      if (h === hInicio && m < mInicio) continue
      if (h === hFin && m > mFin) continue

      const totalMins = h * 60 + m
      if (esHoy && totalMins <= ahoraMinutos) continue
      if (minMins >= 0 && totalMins <= minMins) continue
      if (maxMins < Infinity && totalMins > maxMins) continue

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
        title: i18n.t('hc.sucursal_cerrada_por_hoy', 'Sucursal cerrada por hoy'),
        text: i18n.t('hc3.branch_closed_today', { defaultValue: 'La sucursal {{sucursal}} atiende {{dias}} · {{apertura}} – {{cierre}}. Puedes reservar a partir de mañana.', sucursal: nombreFinal, dias: info.dias, apertura: info.aperturaTexto, cierre: info.cierreTexto }),
        confirmButtonText: i18n.t('hc4.aceptar', 'Aceptar'),
      })
      return true
    }
  }
  return false
}

export const verificarYCambiarSiSucursalCerradaHoy = verificarSiSucursalCerradaHoy
