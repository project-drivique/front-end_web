import { reservationManagementService } from './reservationManagementService'
import { accessAuditService } from './accessAuditService'

const STORAGE_KEY_CONTRATOS = 'drivique_contratos'

function readContratos() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CONTRATOS)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export const contractManagementService = {
  list: (user) => {
    // 1. Obtener todas las reservas base
    const reservations = reservationManagementService.list(user)
    // 2. Obtener contratos reales firmados/generados por los clientes
    const contratosAlmacenados = readContratos()

    // 3. Cruzar reservas con contratos reales, ignorando pendientes o canceladas
    let contracts = reservations
      .filter((r) => r.estado !== 'cancelada' && r.estado !== 'pendiente')
      .map((r) => {
        const contratoReal = contratosAlmacenados[r.id]
        
        // Si existe un contrato real firmado en BD
        if (contratoReal) {
          return {
            id: contratoReal.codigo || `CTR-${r.codigo || r.id}`,
            contratoNumero: contratoReal.codigo || `CTR-${r.codigo || r.id}`,
            reservaCodigo: r.codigo || r.id,
            clienteNombre: r.clienteNombre || 'Cliente Drivique',
            clienteCorreo: r.clienteCorreo || 'cliente@drivique.com',
            clienteTelefono: r.clienteTelefono || '+57 300 000 0000',
            clienteDocumento: r.clienteDocumento || '1030507090',
            vehiculoId: r.vehiculoId || '',
            vehiculoPlaca: r.vehiculoPlaca || 'KLS-849',
            vehiculoNombre: r.vehiculoNombre || 'Vehículo Drivique',
            vehiculoImagen: r.vehiculoImagen || '',
            sucursal: r.sucursal || 'Bogotá - Calle 100',
            fechaInicio: r.fechaInicio || new Date().toISOString().slice(0, 16),
            fechaFin: r.fechaFin || new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
            totalCOP: r.totalCOP || 0,
            // Estado del contrato en base a la firma y la reserva
            estado: r.estado === 'en_curso' ? 'vigente' : r.estado === 'finalizada' ? 'cerrado' : 'firmado',
            fechaFirma: contratoReal.firmadoEn || contratoReal.fecha || r.fechaCreacion,
            firmaUsuarioDataUrl: contratoReal.firmaUsuarioDataUrl || null
          }
        }

        // Si NO existe contrato real (aún no lo firma el usuario, pero la reserva está confirmada)
        return {
          id: `CTR-${r.codigo || r.id}`,
          contratoNumero: `CTR-${r.codigo || r.id}`,
          reservaCodigo: r.codigo || r.id,
          clienteNombre: r.clienteNombre || 'Cliente Drivique',
          clienteCorreo: r.clienteCorreo || 'cliente@drivique.com',
          clienteTelefono: r.clienteTelefono || '+57 300 000 0000',
          clienteDocumento: r.clienteDocumento || '1030507090',
          vehiculoId: r.vehiculoId || '',
          vehiculoPlaca: r.vehiculoPlaca || 'KLS-849',
          vehiculoNombre: r.vehiculoNombre || 'Vehículo Drivique',
          vehiculoImagen: r.vehiculoImagen || '',
          sucursal: r.sucursal || 'Bogotá - Calle 100',
          fechaInicio: r.fechaInicio || new Date().toISOString().slice(0, 16),
          fechaFin: r.fechaFin || new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
          totalCOP: r.totalCOP || 0,
          estado: r.estado === 'en_curso' ? 'vigente' : 'firmado',
          fechaFirma: r.fechaCreacion || new Date().toISOString(),
          firmaUsuarioDataUrl: null
        }
      })

    // 4. El encargado solo ve los contratos de su sucursal
    if (user?.rol === 'encargado' || user?.rol === 'encargado_sucursal' || user?.rol === 'branch_manager') {
      const sucursalAsignada = user?.sucursal || user?.sucursalId || user?.sucursalAsignada
      if (!sucursalAsignada) return []
      const assignedKey = String(sucursalAsignada).trim().toLocaleLowerCase()
      contracts = contracts.filter((c) => String(c.sucursal || '').trim().toLocaleLowerCase() === assignedKey)
    }

    return contracts
  },

  logAudit: (action, contract, user) => {
    accessAuditService.logAccess(
      user?.id || 'UNK',
      user?.nombre || 'Unknown',
      action,
      'Éxito',
      contract?.contratoNumero || 'ALL'
    );
  }
}
