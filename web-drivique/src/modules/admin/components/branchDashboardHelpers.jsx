import { FaCar, FaCheckCircle, FaCheckDouble, FaClock, FaTimesCircle } from 'react-icons/fa'

export const diaLocal = (offset) => {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + offset)
  return fecha.toLocaleDateString('en-CA')
}
export const TODAY_STR = diaLocal(0)

export const getVehicleImage = (item) => {
  const name = (item?.vehiculoNombre || item?.vehiculo || '').toLowerCase()
  if (name.includes('corolla') || name.includes('toyota')) {
    return 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=600&q=80'
  }
  if (name.includes('cx-5') || name.includes('cx5') || name.includes('mazda cx')) {
    return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80'
  }
  if (name.includes('tracker') || name.includes('chevrolet')) {
    return 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80'
  }
  if (name.includes('mazda 3') || name.includes('mazda3') || name.includes('mazda')) {
    return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80'
  }
  if (name.includes('sportage') || name.includes('kia')) {
    return 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80'
  }
  if (name.includes('jetta') || name.includes('volkswagen') || name.includes('vw')) {
    return 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80'
  }
  return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80'
}

export const getReservationStatusInfo = (rawStatus, t) => {
  const s = String(rawStatus || 'CONFIRMADA').trim().toUpperCase()

  if (['PENDIENTE', 'PENDIENTE_EFECTIVO', 'PENDIENTE_VALIDACION', 'DOCUMENTO_PENDIENTE'].includes(s) || s.includes('PENDIENTE')) {
    let sublabel = t('dashboard.status.pendingSub', 'Pendiente (Validación / Pago)')
    if (s === 'PENDIENTE_EFECTIVO') sublabel = t('dashboard.status.pendingCash', 'Pendiente (Pago en efectivo)')
    else if (s === 'PENDIENTE_VALIDACION' || s === 'DOCUMENTO_PENDIENTE') sublabel = t('dashboard.status.pendingDocs', 'Pendiente (Documentación)')
    
    return {
      visibleState: t('dashboard.status.pending', 'Pendiente'),
      internalStates: ['PENDIENTE', 'PENDIENTE_EFECTIVO', 'PENDIENTE_VALIDACION'],
      sublabel,
      badgeClass: 'branch-status-badge--amber',
      IconComp: FaClock,
    }
  }

  if (s === 'CONFIRMADA') {
    return {
      visibleState: t('dashboard.status.confirmed', 'Confirmada'),
      internalStates: ['CONFIRMADA'],
      sublabel: t('dashboard.status.confirmedSub', 'Aprobada y lista para entrega'),
      badgeClass: 'branch-status-badge--green',
      IconComp: FaCheckCircle,
    }
  }

  if (s === 'ACTIVA' || s === 'EN_CURSO' || s === 'EN CURSO') {
    return {
      visibleState: t('dashboard.status.active', 'En curso'),
      internalStates: ['ACTIVA'],
      sublabel: t('dashboard.status.activeSub', 'Vehículo entregado al cliente'),
      badgeClass: 'branch-status-badge--blue',
      IconComp: FaCar,
    }
  }

  if (s === 'COMPLETADA' || s === 'FINALIZADA' || s === 'RECIBIDA') {
    return {
      visibleState: t('dashboard.status.completed', 'Finalizada'),
      internalStates: ['COMPLETADA'],
      sublabel: t('dashboard.status.completedSub', 'Vehículo devuelto e inspeccionado'),
      badgeClass: 'branch-status-badge--teal',
      IconComp: FaCheckDouble,
    }
  }

  if (s === 'CANCELADA' || s === 'CANCELADA_POR_TIEMPO') {
    return {
      visibleState: t('dashboard.status.cancelled', 'Cancelada'),
      internalStates: ['CANCELADA', 'CANCELADA_POR_TIEMPO'],
      sublabel: s === 'CANCELADA_POR_TIEMPO' ? t('dashboard.status.cancelledTime', 'Expirada por tiempo') : t('dashboard.status.cancelledSub', 'Reserva anulada'),
      badgeClass: 'branch-status-badge--gray',
      IconComp: FaTimesCircle,
    }
  }

  return {
    visibleState: t('dashboard.status.confirmed', 'Confirmada'),
    internalStates: ['CONFIRMADA'],
    sublabel: t('dashboard.status.confirmedSub', 'Aprobada y lista para entrega'),
    badgeClass: 'branch-status-badge--green',
    IconComp: FaCheckCircle,
  }
}

export const parseISOToDate = (str) => {
  if (!str) return new Date()
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const formatDateToISO = (d) => {
  if (!d) return TODAY_STR
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const formatDateLabel = (dateStr) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-').map(Number)
  if (parts.length !== 3) return dateStr
  const [y, m, d] = parts
  const dayStr = String(d).padStart(2, '0')
  const monthStr = String(m).padStart(2, '0')
  return `${dayStr}/${monthStr}/${y}`
}
