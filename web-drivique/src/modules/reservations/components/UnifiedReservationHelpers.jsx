import { FaInfoCircle } from 'react-icons/fa'

export function getHorarioSucursal(nombreSucursal) {
  if (!nombreSucursal) return { apertura: '00:00', cierre: '23:30' }
  const nombreLower = String(nombreSucursal).toLowerCase()
  if (nombreLower.includes('aeropuerto') || nombreLower.includes('terminal') || nombreLower.includes('el dorado')) {
    return { apertura: '00:00', cierre: '23:30' }
  }
  if (nombreLower.includes('domicilio') || nombreLower.includes('hotel') || nombreLower.includes('airbnb')) {
    return { apertura: '07:00', cierre: '19:00' }
  }
  return { apertura: '00:00', cierre: '23:30' }
}

export function getFechaHoyLocal() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function generarHoras(lugar, minHora, maxHora, fecha) {
  const { apertura, cierre } = getHorarioSucursal(lugar)
  const [hInicio, mInicio] = apertura.split(':').map(Number)
  const [hFin, mFin] = cierre.split(':').map(Number)

  const ahora = new Date()
  const hoyStr = getFechaHoyLocal()
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

  if (esPasado) {
    return []
  }

  const horas = []
  for (let h = hInicio; h <= hFin; h++) {
    for (const m of [0, 30]) {
      if (h === hInicio && m < mInicio) continue
      if (h === hFin && m > mFin) continue

      const totalMins = h * 60 + m

      if (esHoy && totalMins <= ahoraMinutos) {
        continue
      }

      if (minMins >= 0 && totalMins < minMins) continue
      if (maxMins < Infinity && totalMins > maxMins) continue

      horas.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return horas
}

export function formatHoraAmPm(hora24) {
  if (!hora24) return ''
  const [h, m] = hora24.split(':').map(Number)
  const ampm = h >= 12 ? 'p. m.' : 'a. m.'
  let hour12 = h % 12
  if (hour12 === 0) hour12 = 12
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`
}

export function calcularDuracionYAnticipada(reserva, t) {
  let diasReserva = 0
  let devolucionAnticipadaText = ''

  if (reserva?.fechaInicio && reserva?.fechaFin) {
    const fInicioStr = reserva.fechaInicio.split('T')[0]
    const fFinStr = reserva.fechaFin.split('T')[0]
    const startDate = new Date(`${fInicioStr}T00:00:00`)
    const endDate = new Date(`${fFinStr}T00:00:00`)
    const diffTime = endDate - startDate
    diasReserva = Math.max(1, Math.round(diffTime / 86400000))
    if (fInicioStr === fFinStr) diasReserva = 1

    if (reserva?.horaInicio && reserva?.horaFin) {
      const [hR, mR] = reserva.horaInicio.split(':').map(Number)
      const [hD, mD] = reserva.horaFin.split(':').map(Number)
      const minutosRetiro = hR * 60 + mR
      const minutosDevolucion = hD * 60 + mD

      if (minutosDevolucion < minutosRetiro) {
        const diffEarlyMins = minutosRetiro - minutosDevolucion
        const totalContractMins = diasReserva * 24 * 60
        const totalEffectiveMins = totalContractMins - diffEarlyMins

        if (totalEffectiveMins > 0) {
          const antDias = Math.floor(totalEffectiveMins / (24 * 60))
          const remainderMins = totalEffectiveMins % (24 * 60)
          const antHoras = Math.floor(remainderMins / 60)
          const antMins = remainderMins % 60

          if (antDias > 0) {
            const dayStr = `${antDias} ${antDias === 1 ? t('vehiculo.day', 'día') : t('vehiculo.days', 'días')}`
            const timeParts = []
            if (antHoras > 0) timeParts.push(`${antHoras} h`)
            if (antMins > 0) timeParts.push(`${antMins} min`)

            if (timeParts.length > 0) {
              devolucionAnticipadaText = `${dayStr}, ${timeParts.join(' ')}`
            } else {
              devolucionAnticipadaText = dayStr
            }
          } else {
            const timeParts = []
            if (antHoras > 0) timeParts.push(`${antHoras} h`)
            if (antMins > 0) timeParts.push(`${antMins} min`)
            devolucionAnticipadaText = timeParts.join(' ')
          }
        }
      }
    }
  }

  return { diasReserva, devolucionAnticipadaText }
}

export function ComputoReservaBanner({ reserva, diasReserva, textPrimary, textSecond, t }) {
  if (!reserva?.horaInicio || diasReserva <= 0) return null

  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  let fInicioFmt = ''
  let fFinFmt = ''
  let fNextFmt = ''

  if (reserva?.fechaInicio) {
    const p = reserva.fechaInicio.split('T')[0].split('-').map(Number)
    if (p.length === 3) fInicioFmt = `${p[2]} de ${meses[p[1] - 1]}`
  }
  if (reserva?.fechaFin) {
    const p = reserva.fechaFin.split('T')[0].split('-').map(Number)
    if (p.length === 3) {
      fFinFmt = `${p[2]} de ${meses[p[1] - 1]}`
      const nextDt = new Date(p[0], p[1] - 1, p[2])
      nextDt.setDate(nextDt.getDate() + 1)
      fNextFmt = `${nextDt.getDate()} de ${meses[nextDt.getMonth()]}`
    }
  }

  const hAmPm = formatHoraAmPm(reserva.horaInicio)

  return (
    <div style={{ marginTop: 8, padding: 14, borderRadius: 12, backgroundColor: 'rgba(var(--brand-primary-rgb), 0.08)', border: '1px solid rgba(var(--brand-primary-rgb), 0.25)', display: 'flex', gap: 12 }}>
      <div style={{ color: 'var(--brand-text)', marginTop: 2, flexShrink: 0 }}>
        <FaInfoCircle size={18} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>
          {t('vehiculo.computoReservaTitle', { count: diasReserva, defaultValue_one: 'Cómputo de tu {{count}} día de alquiler', defaultValue_other: 'Cómputo de tus {{count}} días de alquiler' })}
        </span>
        <span style={{ fontSize: 12, color: textSecond, lineHeight: 1.5 }}>
          {t('vehiculo.computoReservaDesc', { inicio: fInicioFmt, hora: hAmPm, dias: diasReserva, fin: fFinFmt, siguiente: fNextFmt, defaultValue: 'Tu reserva empieza el {{inicio}} a las {{hora}}. Cada día te otorga 24 horas completas: tu {{dias}}º día inicia el {{fin}} a las {{hora}} y sus 24 horas terminan el {{siguiente}} a las {{hora}}. Entregar antes registra tiempo de devolución anticipada.' })}
        </span>
      </div>
    </div>
  )
}

export function OneDayReservationModal({ show, onClose, c, textPrimary, textSecond, t }) {
  if (!show) return null
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: c?.bgSecundario || '#ffffff', borderRadius: 20, padding: 24, maxWidth: 320, margin: '0 auto', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(var(--brand-primary-rgb), 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'transparent', border: '2px solid var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaInfoCircle size={22} color="var(--brand-primary)" />
            </div>
          </div>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: textPrimary, marginBottom: 12 }}>
          {t('vehiculo.oneDayReservationTitle', 'Reserva de 1 día (24 horas)')}
        </h3>
        <p style={{ fontSize: 14, color: textSecond, lineHeight: 1.5, marginBottom: 24 }}>
          {t('vehiculo.oneDayReservationDesc', 'Seleccionaste 1 día de reserva. Elige la hora de retiro y devolución; las 24 horas contarán a partir de la hora de retiro.')}
        </p>
        <button
          onClick={onClose}
          style={{ width: '100%', padding: '12px 16px', backgroundColor: 'var(--brand-primary)', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
        >
          Aceptar
        </button>
      </div>
    </div>
  )
}
