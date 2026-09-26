/**
 * src/utils/branchSchedules.js
 * Módulo reutilizable de Reglas de Negocio para Horarios de Sucursales y Entregas.
 */

export const SCHEDULE_RULES = Object.freeze({
  AIRPORT_TERMINAL: {
    is24Hours: true,
    open: '00:00',
    close: '23:59',
  },
  STANDARD: {
    is24Hours: false,
    open: '08:00',
    close: '18:00',
  },
  HOME_DELIVERY: {
    is24Hours: false,
    open: '07:00',
    close: '19:00',
  },
})

/**
 * Obtiene la configuración de horario para un lugar.
 * @param {Object} place - Objeto { kind: 'branch'|'home_delivery', branchType: 'AIRPORT_TERMINAL'|'STANDARD' }
 * @returns {Object} { is24Hours, open, close }
 */
export function getPlaceSchedule(place) {
  if (!place) return SCHEDULE_RULES.STANDARD

  if (place.kind === 'home_delivery' || place.tipo === 'home_delivery' || place.isHomeDelivery) {
    return SCHEDULE_RULES.HOME_DELIVERY
  }

  const type = String(
    place.branchType || place.tipo || place.tipoSucursal || 'STANDARD'
  ).toUpperCase()

  if (type.includes('AIRPORT') || type.includes('TERMINAL') || type.includes('AEROPUERTO')) {
    return SCHEDULE_RULES.AIRPORT_TERMINAL
  }

  return SCHEDULE_RULES.STANDARD
}

/**
 * Evalúa si una hora "HH:mm" cae dentro del horario establecido.
 * @param {string} time - Hora en formato "HH:mm"
 * @param {Object} schedule - Objeto devuelto por getPlaceSchedule
 * @returns {boolean}
 */
export function isTimeWithinSchedule(time, schedule) {
  if (!schedule) return true
  if (schedule.is24Hours) return true
  if (!time) return false

  const cleanTime = String(time).trim().slice(0, 5)
  return cleanTime >= schedule.open && cleanTime <= schedule.close
}

/**
 * Valida los horarios de retiro y devolución independientemente.
 * @param {Object} param0 - { pickup: { place, time }, return: { place, time } }
 * @returns {Object} { pickup: null | 'outsideSchedule', return: null | 'outsideSchedule' }
 */
export function validateReservationTimes({ pickup, return: returnOption }) {
  const result = { pickup: null, return: null }

  if (pickup && pickup.place && pickup.time) {
    const pSchedule = getPlaceSchedule(pickup.place)
    if (!isTimeWithinSchedule(pickup.time, pSchedule)) {
      result.pickup = 'outsideSchedule'
    }
  }

  if (returnOption && returnOption.place && returnOption.time) {
    const rSchedule = getPlaceSchedule(returnOption.place)
    if (!isTimeWithinSchedule(returnOption.time, rSchedule)) {
      result.return = 'outsideSchedule'
    }
  }

  return result
}

/**
 * Formatea un horario en un texto legible para el cliente.
 * @param {Object} schedule - Objeto { is24Hours, open, close }
 * @param {string} locale - Código de idioma i18n
 * @returns {string} Texto formateado (ej. "24 horas" o "8:00 a. m. – 6:00 p. m.")
 */
export function formatSchedule(schedule, locale = 'es-CO') {
  if (!schedule) return ''
  if (schedule.is24Hours) {
    return locale.startsWith('en')
      ? '24 hours'
      : locale.startsWith('fr')
      ? '24 heures'
      : locale.startsWith('pt') || locale.startsWith('br')
      ? '24 horas'
      : '24 horas'
  }

  const parseHour = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number)
    const d = new Date()
    d.setHours(h, m, 0, 0)
    return d
  }

  try {
    const openDate = parseHour(schedule.open)
    const closeDate = parseHour(schedule.close)

    const formatter = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

    return `${formatter.format(openDate)} – ${formatter.format(closeDate)}`
  } catch {
    return `${schedule.open} – ${schedule.close}`
  }
}
