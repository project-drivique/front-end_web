

const obtenerTituloSeccionFecha = (fechaIsoStr, locale = 'es-CO') => {
  if (!fechaIsoStr || fechaIsoStr === 'desconocida') return 'Otras reservas'
  const clean = String(fechaIsoStr).split('T')[0]
  const [y, m, d] = clean.split('-').map(Number)
  if (!y || !m || !d) return 'Otras reservas'

  const ahora = new Date()
  const yearHoy = ahora.getFullYear()
  const mesHoy = String(ahora.getMonth() + 1).padStart(2, '0')
  const diaHoy = String(ahora.getDate()).padStart(2, '0')
  const hoyStr = `${yearHoy}-${mesHoy}-${diaHoy}`

  const ayerDate = new Date(ahora)
  ayerDate.setDate(ayerDate.getDate() - 1)
  const ayerStr = `${ayerDate.getFullYear()}-${String(ayerDate.getMonth() + 1).padStart(2, '0')}-${String(ayerDate.getDate()).padStart(2, '0')}`

  if (clean === hoyStr) {
    return 'Reservas de hoy'
  }
  if (clean === ayerStr) {
    return 'Ayer'
  }

  const fechaItem = new Date(y, m - 1, d)
  const hoyMid = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
  const diffDias = Math.round((hoyMid.getTime() - fechaItem.getTime()) / (1000 * 60 * 60 * 24))

  const fechaFormateada = fechaItem.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: ahora.getFullYear() === y ? undefined : 'numeric',
  })

  if (diffDias > 1 && diffDias <= 7) {
    return `Hace ${diffDias} días · ${fechaFormateada}`
  }

  return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)
}

export default obtenerTituloSeccionFecha
