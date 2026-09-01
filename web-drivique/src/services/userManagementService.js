// src/services/userManagementService.js
import { accessAuditService } from './accessAuditService'
import { reservationManagementService } from './reservationManagementService'

const STORAGE_KEY = 'drivique_mock_users'

const INITIAL_USERS = [
  {
    id: 'usr-101',
    nombre: 'Carlos Mendoza',
    correo: 'carlos.mendoza@email.com',
    telefono: '+57 314 478 9702',
    cedula: '1075289410',
    rol: 'cliente',
    activo: true,
    documentosEstado: 'aprobado', // 'pendiente', 'aprobado', 'rechazado'
    documentoCedula: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    documentoLicencia: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80',
    observacionDocumentos: 'Documentos verificados correctamente.',
    fechaRegistro: '2026-01-15T10:30:00.000Z',
  },
  {
    id: 'usr-102',
    nombre: 'Ana María Gómez',
    correo: 'ana.gomez@email.com',
    telefono: '+57 311 589 2041',
    cedula: '1012398401',
    rol: 'cliente',
    activo: true,
    documentosEstado: 'aprobado',
    documentoCedula: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    documentoLicencia: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80',
    observacionDocumentos: 'Cédula y Licencia C1 aprobadas.',
    fechaRegistro: '2026-02-10T14:15:00.000Z',
  },
  {
    id: 'usr-103',
    nombre: 'Roberto Silva',
    correo: 'roberto.silva@email.com',
    telefono: '+57 310 892 1104',
    cedula: '1098472918',
    rol: 'cliente',
    activo: true,
    documentosEstado: 'pendiente',
    documentoCedula: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    documentoLicencia: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80',
    observacionDocumentos: 'Pendiente de revisión administrativa por foto borrosa.',
    fechaRegistro: '2026-03-01T09:20:00.000Z',
  },
  {
    id: 'usr-104',
    nombre: 'Laura Restrepo',
    correo: 'laura.restrepo@email.com',
    telefono: '+57 318 204 9912',
    cedula: '1038291048',
    rol: 'cliente',
    activo: false,
    documentosEstado: 'rechazado',
    documentoCedula: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    documentoLicencia: null,
    observacionDocumentos: 'Licencia vencida en fecha de expedición.',
    fechaRegistro: '2026-03-12T16:00:00.000Z',
  },
  {
    id: 'usr-106',
    nombre: 'Administrador Drivique',
    correo: 'admin@drivique.com',
    telefono: '+57 300 123 4567',
    cedula: '1000000001',
    rol: 'administrador',
    activo: true,
    documentosEstado: 'aprobado',
    fechaRegistro: '2026-01-01T08:00:00.000Z',
  },
]

function readUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS))
      return INITIAL_USERS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_USERS
  } catch {
    return INITIAL_USERS
  }
}

function writeUsers(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Error guardando usuarios:', err)
  }
}

export const userManagementService = {
  list() {
    const users = readUsers()
    const reservations = reservationManagementService.list()

    return users.map((u) => {
      // Calcular número de reservas activas del usuario (confirmada o en_curso)
      const userRes = reservations.filter(
        (r) =>
          (r.clienteCorreo?.toLowerCase() === u.correo?.toLowerCase() ||
            r.clienteNombre?.toLowerCase() === u.nombre?.toLowerCase()) &&
          (r.estado === 'confirmada' || r.estado === 'en_curso')
      )

      return {
        ...u,
        reservasActivas: userRes.length,
      }
    })
  },

  getById(id) {
    return this.list().find((u) => u.id === id) || null
  },

  create(userData, adminUser) {
    const cleanMail = String(userData.correo || '').trim().toLowerCase()
    if (!cleanMail) throw new Error('mailRequired')

    const users = readUsers()
    if (users.some((u) => u.correo?.toLowerCase() === cleanMail)) {
      throw new Error('mailAlreadyExists')
    }

    const newUser = {
      id: `usr-${Date.now().toString(36)}`,
      nombre: userData.nombre || 'Nuevo Usuario',
      correo: cleanMail,
      telefono: userData.telefono || '+57 300 000 0000',
      cedula: userData.cedula || 'N/A',
      rol: userData.rol || 'cliente',
      sucursal: userData.rol === 'encargado' ? userData.sucursal : undefined,
      activo: userData.activo !== false,
      documentosEstado: userData.documentosEstado || 'pendiente',
      documentoCedula: userData.documentoCedula || null,
      documentoLicencia: userData.documentoLicencia || null,
      observacionDocumentos: userData.observacionDocumentos || 'Registro administrativo nuevo.',
      fechaRegistro: new Date().toISOString(),
    }

    users.unshift(newUser)
    writeUsers(users)

    accessAuditService.record({
      correo: adminUser?.correo || 'admin@drivique.com',
      rol: adminUser?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: `Creó el usuario ${newUser.nombre} (${newUser.correo}) con rol ${newUser.rol}`,
    })

    return newUser
  },

  update(id, userData, adminUser) {
    const users = readUsers()
    const index = users.findIndex((u) => u.id === id)
    if (index < 0) throw new Error('userNotFound')

    const current = users[index]
    const updated = {
      ...current,
      ...userData,
      id: current.id, // Mantiene ID
    }

    users[index] = updated
    writeUsers(users)

    accessAuditService.record({
      correo: adminUser?.correo || 'admin@drivique.com',
      rol: adminUser?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: `Actualizó datos del usuario ${updated.nombre} (${updated.correo})`,
    })

    return updated
  },

  toggleActive(id, adminUser) {
    const users = readUsers()
    const index = users.findIndex((u) => u.id === id)
    if (index < 0) throw new Error('userNotFound')

    users[index].activo = !users[index].activo
    const newStatus = users[index].activo
    writeUsers(users)

    accessAuditService.record({
      correo: adminUser?.correo || 'admin@drivique.com',
      rol: adminUser?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: `${newStatus ? 'Activó' : 'Desactivó'} la cuenta de ${users[index].nombre} (${users[index].correo})`,
    })

    return users[index]
  },

  verifyDocuments(id, { documentosEstado, observacionDocumentos }, adminUser) {
    const users = readUsers()
    const index = users.findIndex((u) => u.id === id)
    if (index < 0) throw new Error('userNotFound')

    users[index].documentosEstado = documentosEstado
    users[index].observacionDocumentos = observacionDocumentos || ''
    writeUsers(users)

    accessAuditService.record({
      correo: adminUser?.correo || 'admin@drivique.com',
      rol: adminUser?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: `Evaluó documentos de ${users[index].nombre}: Estado ${documentosEstado.toUpperCase()}. Nota: ${observacionDocumentos || 'Sin observaciones'}`,
    })

    return users[index]
  },

  remove(id, adminUser) {
    const user = this.getById(id)
    if (!user) throw new Error('userNotFound')

    // Validar reservas activas
    if (user.reservasActivas > 0) {
      throw new Error('hasActiveReservations')
    }

    const users = readUsers().filter((u) => u.id !== id)
    writeUsers(users)

    accessAuditService.record({
      correo: adminUser?.correo || 'admin@drivique.com',
      rol: adminUser?.rol || 'administrador',
      resultado: 'EXITO',
      motivo: `Eliminó el usuario ${user.nombre} (${user.correo})`,
    })

    return true
  },
}
