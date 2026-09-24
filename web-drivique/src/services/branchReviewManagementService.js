// Servicio mock para gestión de reseñas y calificaciones aisladas por sucursal
const MOCK_BRANCH_REVIEWS = [
  {
    id: 'REV-101',
    sucursal: 'Medellín - El Poblado',
    clienteNombre: 'Carlos Andrés Mendoza',
    clienteEmail: 'carlos.mendoza@gmail.com',
    vehiculo: 'Chevrolet Onix Turbo 2024',
    placa: 'KHW-892',
    calificacion: 5,
    fecha: '2026-09-20',
    comentario: 'Excelente servicio en la sede El Poblado. El vehículo estaba impecable, limpio y me lo entregaron a tiempo. Proceso muy ágil.',
    respuestaEncargado: '¡Muchas gracias Carlos! Nos alegra mucho saber que disfrutaste tu viaje. Te esperamos de nuevo.',
    fechaRespuesta: '2026-09-21',
    estado: 'publicada',
  },
  {
    id: 'REV-102',
    sucursal: 'Medellín - El Poblado',
    clienteNombre: 'Mariana Restrepo',
    clienteEmail: 'mariana.restrepo@outlook.com',
    vehiculo: 'Toyota Hilux 4x4 Diesel 2023',
    placa: 'LMN-456',
    calificacion: 4,
    fecha: '2026-09-18',
    comentario: 'La camioneta estaba en perfecto estado mecánico. La entrega en mostrador fue rápida pero el tanque no estaba 100% lleno, marcaron 7/8.',
    respuestaEncargado: null,
    fechaRespuesta: null,
    estado: 'pendiente_respuesta',
  },
  {
    id: 'REV-103',
    sucursal: 'Bogotá - Calle 93',
    clienteNombre: 'Felipe Jaramillo',
    clienteEmail: 'felipe.jara@yahoo.es',
    vehiculo: 'Mazda CX-30 Touring 2024',
    placa: 'FGH-123',
    calificacion: 5,
    fecha: '2026-09-15',
    comentario: 'Excelente atención en la sede de la 93. El carro huele a nuevo y la devolución tomó menos de 5 minutos.',
    respuestaEncargado: 'Gracias Felipe por confiar en Drivique Bogotá.',
    fechaRespuesta: '2026-09-16',
    estado: 'publicada',
  },
  {
    id: 'REV-104',
    sucursal: 'Cali - Chipichape',
    clienteNombre: 'Claudia Elena Gómez',
    clienteEmail: 'claudia.gomez@gmail.com',
    vehiculo: 'Renault Duster 4WD 2024',
    placa: 'DRV-204',
    calificacion: 5,
    fecha: '2026-09-22',
    comentario: 'Atención personalizada de 10 estrellas. Nos explicaron el funcionamiento del vehículo y la tarifa fue muy transparente.',
    respuestaEncargado: null,
    fechaRespuesta: null,
    estado: 'pendiente_respuesta',
  },
  {
    id: 'REV-105',
    sucursal: 'Medellín - El Poblado',
    clienteNombre: 'Juan Diego Valencia',
    clienteEmail: 'juandiego@empresa.com',
    vehiculo: 'Kia Picanto Zenith 2024',
    placa: 'JKL-789',
    calificacion: 3,
    fecha: '2026-09-12',
    comentario: 'El auto muy económico de gasolina, pero me tocó esperar unos 15 minutos mientras lavaban la alfombra del auto.',
    respuestaEncargado: 'Hola Juan Diego, lamentamos la pequeña demora. Tomamos nota para mejorar nuestros tiempos de alistamiento.',
    fechaRespuesta: '2026-09-13',
    estado: 'publicada',
  },
]

const STORAGE_KEY = 'drivique_branch_reviews'

function getStoredReviews() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_BRANCH_REVIEWS))
      return MOCK_BRANCH_REVIEWS
    }
    return JSON.parse(data)
  } catch {
    return MOCK_BRANCH_REVIEWS
  }
}

function saveStoredReviews(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (err) {
    console.error('Error guardando reseñas:', err)
  }
}

export const branchReviewManagementService = {
  list(user = null) {
    const all = getStoredReviews()
    if (!user) return all

    const isBranchManager = user.rol === 'encargado' || user.rol === 'branch_manager' || user.rol === 'encargado_sucursal'
    const sucursalAsignada = user.sucursalAsignada || user.sucursalId || user.sucursal || ''

    if (isBranchManager && sucursalAsignada) {
      const nomNorm = String(sucursalAsignada).toLowerCase().trim()
      return all.filter((item) => {
        const itemSuc = String(item.sucursal || '').toLowerCase().trim()
        return itemSuc.includes(nomNorm) || nomNorm.includes(itemSuc)
      })
    }

    return all
  },

  responderReseña(id, textoRespuesta) {
    const list = getStoredReviews()
    const index = list.findIndex((r) => String(r.id) === String(id))
    if (index !== -1) {
      list[index].respuestaEncargado = textoRespuesta
      list[index].fechaRespuesta = new Date().toISOString().slice(0, 10)
      list[index].estado = 'publicada'
      saveStoredReviews(list)
      return list[index]
    }
    return null
  },

  eliminarReseña(id) {
    const list = getStoredReviews().filter((r) => String(r.id) !== String(id))
    saveStoredReviews(list)
    return list
  }
}
