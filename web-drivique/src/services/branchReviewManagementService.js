// Servicio mock para gestión de reseñas y calificaciones aisladas por sucursal
const MOCK_BRANCH_REVIEWS = [
  {
    id: 'REV-101',
    reservaCodigo: 'RES-48201',
    sucursal: 'Alamo Bogotá - Aeropuerto',
    clienteNombre: 'Carlos Andrés Mendoza',
    clienteEmail: 'carlos.mendoza@gmail.com',
    vehiculo: 'Chevrolet Onix Turbo 2024',
    placa: 'KHW-892',
    calificacion: 5,
    fecha: '2026-09-20',
    comentario: 'Excelente servicio en la entrega del vehículo. El vehículo estaba impecable, limpio y me lo entregaron a tiempo. Proceso muy ágil.',
    evidenciaFoto1: 'Resena-Foto1-RES-48201.jpg',
    evidenciaFoto1Url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80',
    evidenciaFoto2: 'Resena-Foto2-RES-48201.jpg',
    evidenciaFoto2Url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    evidenciaFoto3: 'Resena-Foto3-RES-48201.jpg',
    evidenciaFoto3Url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
    respuestaEncargado: '¡Muchas gracias Carlos! Nos alegra mucho saber que disfrutaste tu viaje. Te esperamos de nuevo.',
    fechaRespuesta: '2026-09-21',
    estado: 'publicada',
  },
  {
    id: 'REV-102',
    reservaCodigo: 'RES-59102',
    sucursal: 'Alamo Bogotá - Aeropuerto',
    clienteNombre: 'Mariana Restrepo',
    clienteEmail: 'mariana.restrepo@outlook.com',
    vehiculo: 'Toyota Hilux 4x4 Diesel 2023',
    placa: 'LMN-456',
    calificacion: 4,
    fecha: '2026-09-22',
    comentario: 'La camioneta estaba en perfecto estado mecánico. La entrega en mostrador fue rápida pero el tanque no estaba 100% lleno, marcaron 7/8.',
    evidenciaFoto1: 'Resena-Foto1-RES-59102.jpg',
    evidenciaFoto1Url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
    evidenciaFoto2: 'Resena-Foto2-RES-59102.jpg',
    evidenciaFoto2Url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&q=80',
    evidenciaFoto3: null,
    evidenciaFoto3Url: null,
    respuestaEncargado: null,
    fechaRespuesta: null,
    estado: 'pendiente_respuesta',
  },
  {
    id: 'REV-103',
    reservaCodigo: 'RES-38491',
    sucursal: 'Alamo Bogotá - Aeropuerto',
    clienteNombre: 'Felipe Jaramillo',
    clienteEmail: 'felipe.jara@yahoo.es',
    vehiculo: 'Mazda CX-30 Touring 2024',
    placa: 'FGH-123',
    calificacion: 5,
    fecha: '2026-09-25',
    comentario: 'Excelente atención en la sede del aeropuerto. El carro impecable y la devolución tomó menos de 5 minutos.',
    evidenciaFoto1: 'Resena-Foto1-RES-38491.jpg',
    evidenciaFoto1Url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80',
    evidenciaFoto2: 'Resena-Foto2-RES-38491.jpg',
    evidenciaFoto2Url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80',
    evidenciaFoto3: 'Resena-Foto3-RES-38491.jpg',
    evidenciaFoto3Url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
    respuestaEncargado: 'Gracias Felipe por confiar en Drivique Bogotá Aeropuerto.',
    fechaRespuesta: '2026-09-26',
    estado: 'publicada',
  },
  {
    id: 'REV-104',
    reservaCodigo: 'RES-71029',
    sucursal: 'Alamo Bogotá - Aeropuerto',
    clienteNombre: 'Claudia Elena Gómez',
    clienteEmail: 'claudia.gomez@gmail.com',
    vehiculo: 'Renault Duster 4WD 2024',
    placa: 'DRV-204',
    calificacion: 5,
    fecha: '2026-09-28',
    comentario: 'Atención personalizada de 10 estrellas. Nos explicaron el funcionamiento del vehículo y la tarifa fue muy transparente.',
    evidenciaFoto1: 'Resena-Foto1-RES-71029.jpg',
    evidenciaFoto1Url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&q=80',
    evidenciaFoto2: null,
    evidenciaFoto2Url: null,
    evidenciaFoto3: null,
    evidenciaFoto3Url: null,
    respuestaEncargado: null,
    fechaRespuesta: null,
    estado: 'pendiente_respuesta',
  },
  {
    id: 'REV-105',
    reservaCodigo: 'RES-94821',
    sucursal: 'Alamo Bogotá - Aeropuerto',
    clienteNombre: 'Juan Diego Valencia',
    clienteEmail: 'juandiego@empresa.com',
    vehiculo: 'Kia Picanto Zenith 2024',
    placa: 'JKL-789',
    calificacion: 3,
    fecha: '2026-09-30',
    comentario: 'El auto muy económico de gasolina, pero me tocó esperar unos 15 minutos mientras terminaban el alistamiento.',
    evidenciaFoto1: 'Resena-Foto1-RES-94821.jpg',
    evidenciaFoto1Url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
    evidenciaFoto2: 'Resena-Foto2-RES-94821.jpg',
    evidenciaFoto2Url: 'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=800&q=80',
    evidenciaFoto3: null,
    evidenciaFoto3Url: null,
    respuestaEncargado: 'Hola Juan Diego, lamentamos la pequeña demora. Tomamos nota para mejorar nuestros tiempos de alistamiento.',
    fechaRespuesta: '2026-10-01',
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
    const parsed = JSON.parse(data)
    if (Array.isArray(parsed) && parsed.length >= 5) return parsed
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_BRANCH_REVIEWS))
    return MOCK_BRANCH_REVIEWS
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
      const filtered = all.filter((item) => {
        const itemSuc = String(item.sucursal || '').toLowerCase().trim()
        return itemSuc.includes(nomNorm) || nomNorm.includes(itemSuc) || itemSuc.includes('bogotá') || nomNorm.includes('bogotá')
      })
      return filtered.length > 0 ? filtered : all
    }

    return all
  },

  responderResena(id, textoRespuesta) {
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

  eliminarResena(id) {
    const list = getStoredReviews().filter((r) => String(r.id) !== String(id))
    saveStoredReviews(list)
    return list
  }
}
