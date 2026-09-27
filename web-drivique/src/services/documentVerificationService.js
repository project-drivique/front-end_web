// Servicio mock para Validación e Inspección de Documentos (Licencia de Conducir y Cédula/DNI)
const MOCK_DOCUMENT_VERIFICATIONS = [
  {
    id: 'DOC-9001',
    reservaCodigo: 'RES-8821',
    clienteNombre: 'Juan Carlos Restrepo',
    documentoIdentidad: '1020456789',
    tipoDocumento: 'Cédula de Ciudadanía',
    numeroLicencia: '1020456789-C1',
    categoriaLicencia: 'B1 / C1 (Automóviles y Camionetas)',
    fechaVencimientoLicencia: '2028-11-15',
    sucursal: 'Medellín - El Poblado',
    estado: 'aprobado', // 'pendiente' | 'aprobado' | 'rechazado'
    fechaSubida: '2026-09-21 14:30',
    fotoLicenciaFrente: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    fotoLicenciaReverso: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    fotoCedulaFrente: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    observaciones: 'Documento original verificado y legible. Licencia de conducir vigente.',
    verificadoPor: 'Encargado de Sucursal',
    fechaVerificacion: '2026-09-21 15:10'
  },
  {
    id: 'DOC-9002',
    reservaCodigo: 'RES-8824',
    clienteNombre: 'Camila Montoya López',
    documentoIdentidad: '1035987654',
    tipoDocumento: 'Cédula de Ciudadanía',
    numeroLicencia: '1035987654-B1',
    categoriaLicencia: 'B1 (Automóviles particulares)',
    fechaVencimientoLicencia: '2027-05-20',
    sucursal: 'Medellín - El Poblado',
    estado: 'pendiente',
    fechaSubida: '2026-09-23 09:15',
    fotoLicenciaFrente: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    fotoLicenciaReverso: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    fotoCedulaFrente: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    observaciones: '',
    verificadoPor: null,
    fechaVerificacion: null
  },
  {
    id: 'DOC-9003',
    reservaCodigo: 'RES-8830',
    clienteNombre: 'Alejandro Morales',
    documentoIdentidad: '71234567',
    tipoDocumento: 'Cédula de Ciudadanía',
    numeroLicencia: '71234567-C1',
    categoriaLicencia: 'C1 (Público / Particular)',
    fechaVencimientoLicencia: '2025-12-01', // Licencia proxima o por verificar
    sucursal: 'Bogotá - Calle 93',
    estado: 'rechazado',
    fechaSubida: '2026-09-22 16:45',
    fotoLicenciaFrente: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    fotoLicenciaReverso: '',
    fotoCedulaFrente: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    observaciones: 'Foto reverso de licencia borrosa. Se solicita al usuario subir foto clara nuevamente.',
    verificadoPor: 'Encargado Bogotá',
    fechaVerificacion: '2026-09-22 17:00'
  }
]

const STORAGE_KEY = 'drivique_document_verifications'

function getStoredVerifications() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DOCUMENT_VERIFICATIONS))
      return MOCK_DOCUMENT_VERIFICATIONS
    }
    return JSON.parse(data)
  } catch {
    return MOCK_DOCUMENT_VERIFICATIONS
  }
}

function saveStoredVerifications(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (err) {
    console.error('Error guardando verificaciones:', err)
  }
}

export const documentVerificationService = {
  list(user = null) {
    const all = getStoredVerifications()
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

  actualizarEstado(id, nuevoEstado, observaciones = '', verificadoPor = 'Encargado de Sucursal') {
    const list = getStoredVerifications()
    const index = list.findIndex((v) => String(v.id) === String(id))
    if (index !== -1) {
      list[index].estado = nuevoEstado
      list[index].observaciones = observaciones
      list[index].verificadoPor = verificadoPor
      list[index].fechaVerificacion = new Date().toLocaleString('es-CO')
      saveStoredVerifications(list)
      return list[index]
    }
    return null
  }
}
