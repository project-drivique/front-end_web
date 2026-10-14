import { api } from './httpClient'
import { reservationService } from './reservationService'
import { hasMatchingBranch } from './accessAuditService'
const MOCK_DOCUMENT_VERIFICATIONS = [
  {
    id: 1,
    reservaId: 'RES-8790',
    reservaCodigo: 'RES-8790',
    vehiculoNombre: 'Mazda CX-30 Grand Touring',
    clienteNombre: 'Carlos Andrés Rodríguez',
    conductorNombre: 'Carlos Andrés Rodríguez',
    documentoIdentidad: '1018475892',
    tipoDocumento: 'Cédula de Ciudadanía',
    pdfCedulaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fotoCedulaFrente: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    numeroLicencia: '1018475892-B1',
    pdfLicenciaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fotoLicenciaFrente: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    fotoLicenciaReverso: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    categoriaLicencia: 'B1',
    fechaVencimientoLicencia: '2028-08-20',
    sucursal: 'Alamo Bogotá - Aeropuerto',
    estado: 'pendiente', // 'pendiente' | 'aprobado' | 'rechazado'
    fechaSubida: '2026-09-22 10:15',
    checklist: {
      cedulaLegible: false,
      identidadCoincide: false,
      licenciaVigente: false,
      categoriaApta: false,
      datosCompletos: false,
    },
    observaciones: '',
    verificadoPor: null,
    fechaVerificacion: null
  },
  {
    id: 2,
    reservaId: 'RES-8802',
    reservaCodigo: 'RES-8802',
    vehiculoNombre: 'Toyota RAV4 Hybrid',
    clienteNombre: 'María Fernanda Gómez',
    conductorNombre: 'María Fernanda Gómez',
    documentoIdentidad: '1020304050',
    tipoDocumento: 'Cédula de Ciudadanía',
    pdfCedulaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fotoCedulaFrente: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    numeroLicencia: '1020304050-C1',
    pdfLicenciaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fotoLicenciaFrente: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    fotoLicenciaReverso: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    categoriaLicencia: 'C1',
    fechaVencimientoLicencia: '2029-03-14',
    sucursal: 'Alamo Bogotá - Aeropuerto',
    estado: 'aprobado',
    fechaSubida: '2026-09-21 16:20',
    checklist: {
      cedulaLegible: true,
      identidadCoincide: true,
      licenciaVigente: true,
      categoriaApta: true,
      datosCompletos: true,
    },
    observaciones: 'Documento original verificado y legible. Licencia vigente.',
    verificadoPor: 'Encargado de Sucursal',
    fechaVerificacion: '2026-09-21 16:45'
  },
  {
    id: 3,
    reservaId: 'RES-8821',
    reservaCodigo: 'RES-8821',
    vehiculoNombre: 'Renault Duster 4x4',
    clienteNombre: 'Andrés Felipe Castro',
    conductorNombre: 'Andrés Felipe Castro',
    documentoIdentidad: '80123456',
    tipoDocumento: 'Cédula de Ciudadanía',
    pdfCedulaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fotoCedulaFrente: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    numeroLicencia: '80123456-B1',
    pdfLicenciaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fotoLicenciaFrente: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    fotoLicenciaReverso: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    categoriaLicencia: 'B1',
    fechaVencimientoLicencia: '2027-11-30',
    sucursal: 'Alamo Bogotá - Aeropuerto',
    estado: 'pendiente',
    fechaSubida: '2026-09-25 08:30',
    checklist: {
      cedulaLegible: false,
      identidadCoincide: false,
      licenciaVigente: false,
      categoriaApta: false,
      datosCompletos: false,
    },
    observaciones: '',
    verificadoPor: null,
    fechaVerificacion: null
  },
  {
    id: 4,
    reservaId: 'RES-8824',
    reservaCodigo: 'RES-8824',
    vehiculoNombre: 'Chevrolet Tracker Turbo',
    clienteNombre: 'Laura Marcela Moreno',
    conductorNombre: 'Laura Marcela Moreno',
    documentoIdentidad: '52987654',
    tipoDocumento: 'Cédula de Ciudadanía',
    pdfCedulaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fotoCedulaFrente: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    numeroLicencia: '52987654-B1',
    pdfLicenciaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fotoLicenciaFrente: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    fotoLicenciaReverso: '',
    categoriaLicencia: 'B1',
    fechaVencimientoLicencia: '2025-05-10',
    sucursal: 'Alamo Bogotá - Aeropuerto',
    estado: 'rechazado',
    fechaSubida: '2026-09-25 11:10',
    checklist: {
      cedulaLegible: true,
      identidadCoincide: true,
      licenciaVigente: false,
      categoriaApta: true,
      datosCompletos: false,
    },
    observaciones: 'Licencia de conducir vencida antes de la fecha de alquiler. Se solicita cargar archivo PDF con licencia vigente.',
    verificadoPor: 'Encargado de Sucursal',
    fechaVerificacion: '2026-09-25 11:30'
  },
  {
    id: 5,
    reservaId: 'RES-8830',
    reservaCodigo: 'RES-8830',
    vehiculoNombre: 'Toyota Corolla Cross',
    clienteNombre: 'Juan Carlos Restrepo',
    conductorNombre: 'Juan Carlos Restrepo',
    documentoIdentidad: '1020456789',
    tipoDocumento: 'Cédula de Ciudadanía',
    pdfCedulaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fotoCedulaFrente: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    numeroLicencia: '1020456789-C1',
    pdfLicenciaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fotoLicenciaFrente: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    fotoLicenciaReverso: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    categoriaLicencia: 'C1',
    fechaVencimientoLicencia: '2028-11-15',
    sucursal: 'Medellín - El Poblado',
    estado: 'aprobado',
    fechaSubida: '2026-09-21 14:30',
    checklist: {
      cedulaLegible: true,
      identidadCoincide: true,
      licenciaVigente: true,
      categoriaApta: true,
      datosCompletos: true,
    },
    observaciones: 'Documento original verificado y legible. Licencia de conducir vigente.',
    verificadoPor: 'Encargado de Sucursal',
    fechaVerificacion: '2026-09-21 15:10'
  }
]

const STORAGE_KEY = 'drivique_document_verifications'
const USER_NOTIFS_KEY = 'drivique_user_notifications'

function getStoredVerifications() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DOCUMENT_VERIFICATIONS))
      return MOCK_DOCUMENT_VERIFICATIONS
    }
    const parsed = JSON.parse(data)
    // Merge new mock items if they are not in local storage yet
    const existingIds = new Set(parsed.map((item) => String(item.id)))
    let updated = false
    MOCK_DOCUMENT_VERIFICATIONS.forEach((mock) => {
      if (!existingIds.has(String(mock.id))) {
        parsed.unshift(mock)
        updated = true
      }
    })
    if (updated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
    }
    return parsed
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

function notificarCliente(item, nuevoEstado, observaciones) {
  try {
    const raw = localStorage.getItem(USER_NOTIFS_KEY)
    const list = raw ? JSON.parse(raw) : []
    const isAprobado = nuevoEstado === 'aprobado'
    
    const notif = {
      id: `doc-notif-${Date.now()}`,
      tipo: isAprobado ? 'exito' : 'alerta',
      titulo: isAprobado
        ? `Documentos Aprobados - Reserva ${item.reservaCodigo}`
        : `Novedad en Documentos - Reserva ${item.reservaCodigo}`,
      mensaje: isAprobado
        ? `Tus documentos de identidad y licencia para la reserva ${item.reservaCodigo} han sido validados y aprobados por la sucursal ${item.sucursal}. Tu vehículo estará listo para entrega.`
        : `Tus documentos para la reserva ${item.reservaCodigo} requieren corrección. Motivo: ${observaciones || 'Documento no legible o vencido'}. Por favor sube nuevamente los archivos PDF corregidos.`,
      fecha: new Date().toISOString(),
      leida: false,
      reservaCodigo: item.reservaCodigo,
      icono: isAprobado ? 'check' : 'warning',
    }

    list.unshift(notif)
    localStorage.setItem(USER_NOTIFS_KEY, JSON.stringify(list))
  } catch (err) {
    console.warn('Error enviando notificación al cliente:', err)
  }
}

export const documentVerificationService = {
  async listarPendientesBackend() {
    const { data } = await api.get('/kyc/documents', { params: { status: 'PENDING' } })
    const docs = Array.isArray(data) ? data : (data?.documents || [])
    const todasReservas = reservationService.getReservas() || []

    const expedientesByUser = new Map()
    for (const doc of docs) {
      const uKey = String(doc.userId || doc.userName || doc.documentNumber || doc.id)
      if (!expedientesByUser.has(uKey)) {
        expedientesByUser.set(uKey, [])
      }
      expedientesByUser.get(uKey).push(doc)
    }

    const result = []
    for (const [, userDocs] of expedientesByUser.entries()) {
      const idDoc = userDocs.find((d) =>
        /cedula|identidad|dni|cc|ce|passport/i.test(`${d.documentType?.code || ''} ${d.documentType?.name || ''}`)
      ) || userDocs[0]

      const licDoc = userDocs.find((d) =>
        /licencia|driver/i.test(`${d.documentType?.code || ''} ${d.documentType?.name || ''}`)
      ) || (userDocs.length > 1 ? userDocs[1] : null)

      const docPrincipal = idDoc || userDocs[0]

      // Buscar reserva asociada local o backend
      const matchedRes = todasReservas.find((r) => {
        const docNum = String(docPrincipal.documentNumber || '').trim()
        const rDocNum = String(r.datosForm?.numDoc || r.datosForm?.documento || r.clienteDocumento || '').trim()
        if (docNum && rDocNum && docNum === rDocNum) return true

        const cName = String(docPrincipal.userName || '').toLowerCase().trim()
        const rName = String(r.datosForm?.nombre || r.clienteNombre || '').toLowerCase().trim()
        if (cName && rName && (cName.includes(rName) || rName.includes(cName))) return true

        return false
      }) || todasReservas.find((r) => {
        const st = String(r.estado || r.status || '').toUpperCase()
        return st.includes('DOCUMENT') || st.includes('SCHEDULE')
      })

      const reservaCodigo = docPrincipal.reservationCode || matchedRes?.codigo || matchedRes?.referencia || matchedRes?.id || ''
      const vehiculoNombre = docPrincipal.vehicleName || matchedRes?.vehiculoNombre || matchedRes?.vehiculo?.nombre || 'Chevrolet Onix RS'
      const reservaEstado = matchedRes?.estado || matchedRes?.status || 'PENDING_DOCUMENT_REVIEW'

      result.push({
        id: docPrincipal.id,
        allDocIds: userDocs.map((d) => d.id),
        identityDocId: idDoc?.id,
        licenseDocId: licDoc?.id,
        reservaCodigo,
        reservaId: docPrincipal.reservationId || matchedRes?.id,
        vehiculoNombre,
        reservaEstado,
        clienteNombre: docPrincipal.userName || matchedRes?.clienteNombre || 'Cliente',
        conductorNombre: docPrincipal.userName || matchedRes?.clienteNombre || 'Cliente',
        documentoIdentidad: docPrincipal.documentNumber || matchedRes?.clienteDocumento || '—',
        tipoDocumento: idDoc?.documentType?.name || 'Cédula de Ciudadanía',
        numeroLicencia: licDoc?.documentNumber || docPrincipal.documentNumber || '—',
        pdfCedulaUrl: idDoc?.frontUrl || '',
        fotoCedulaFrente: idDoc?.frontUrl || '',
        pdfLicenciaUrl: licDoc?.frontUrl || '',
        fotoLicenciaFrente: licDoc?.frontUrl || '',
        frontUrl: docPrincipal.frontUrl,
        sucursal: docPrincipal.branchName || matchedRes?.sucursal || 'Sucursal sin asignar',
        branchId: docPrincipal.branchId,
        estado: 'pendiente',
        observaciones: docPrincipal.reviewNotes || '',
        fechaSubida: docPrincipal.createdAt ? new Date(docPrincipal.createdAt).toLocaleString('es-CO') : '',
        backend: true,
      })
    }

    return result
  },

  async revisarDocumentoBackend(id, nuevoEstado, observaciones = '') {
    const { data } = await api.patch(`/kyc/documents/${id}/review`, {
      status: nuevoEstado === 'aprobado' ? 'APPROVED' : 'REJECTED',
      reviewNotes: observaciones || null,
    })
    return data
  },

  list(user = null) {
    const all = getStoredVerifications()
    if (!user) return all

    const isBranchManager = user.rol === 'encargado' || user.rol === 'branch_manager' || user.rol === 'encargado_sucursal'
    const sucursalAsignada = user.sucursalAsignada || user.sucursalId || user.sucursal || ''

    if (isBranchManager && sucursalAsignada) {
      return all.filter((item) => hasMatchingBranch(item.sucursal, sucursalAsignada))
    }

    return all
  },

  actualizarReservaAsociada(item, nuevoEstado, observaciones = '', verificadoPor = 'Encargado de Sucursal') {
    if (!item || !item.reservaCodigo) return
    try {
      const todasReservas = reservationService.getReservas()
      const targetCode = String(item.reservaCodigo).trim().toLowerCase()
      const resIdx = todasReservas.findIndex(
        (r) =>
          String(r.id || '').trim().toLowerCase() === targetCode ||
          String(r.codigo || '').trim().toLowerCase() === targetCode ||
          String(r.referencia || '').trim().toLowerCase() === targetCode
      )
      if (resIdx !== -1) {
        const res = { ...todasReservas[resIdx] }
        const esAprobado = nuevoEstado === 'aprobado'
        res.estadoDocumentos = esAprobado ? 'APROBADO' : 'RECHAZADO'
        res.motivoRechazoDocumentos = esAprobado ? null : observaciones

        if (esAprobado) {
          if (
            res.estado === 'PENDIENTE_VALIDACION' ||
            res.estado === 'pendiente' ||
            res.estado === 'PENDING_DOCUMENT_REVIEW' ||
            res.estado === 'PENDING_SCHEDULE' ||
            !res.estado
          ) {
            if (res.pagoEstado === 'aprobado' || (res.metodoPago !== 'efectivo' && res.metodoPagoConfirmado)) {
              res.estado = 'confirmada'
            } else if (res.metodoPago === 'efectivo' || res.pasarela === 'efectivo') {
              res.estado = 'PENDIENTE_EFECTIVO'
            } else {
              res.estado = 'PENDING_PAYMENT'
            }
          }
        } else {
          res.estado = 'DOCUMENTOS_RECHAZADOS'
        }

        res.historialAcciones = [
          ...(res.historialAcciones || []),
          {
            fecha: new Date().toISOString(),
            accion: esAprobado
              ? `Aprobación de documentos por ${verificadoPor || 'Encargado de Sucursal'}`
              : `Rechazo de documentos: ${observaciones || 'Requiere corrección'}`,
            usuario: verificadoPor || 'Encargado de Sucursal',
          },
        ]
        reservationService.guardarReserva(res)
      }
    } catch (err) {
      console.warn('Error actualizando reserva asociada a verificación documental:', err)
    }
  },

  actualizarEstado(id, nuevoEstado, observaciones = '', verificadoPor = 'Encargado de Sucursal', checklist = null) {
    const list = getStoredVerifications()
    const index = list.findIndex((v) => String(v.id) === String(id))
    if (index !== -1) {
      list[index].estado = nuevoEstado
      list[index].observaciones = observaciones
      list[index].verificadoPor = verificadoPor
      list[index].fechaVerificacion = new Date().toLocaleString('es-CO')
      if (checklist) {
        list[index].checklist = checklist
      }
      saveStoredVerifications(list)
      notificarCliente(list[index], nuevoEstado, observaciones)
      this.actualizarReservaAsociada(list[index], nuevoEstado, observaciones, verificadoPor)
      return list[index]
    }
    return null
  }
}
