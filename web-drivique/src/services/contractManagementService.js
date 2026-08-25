import { reservationManagementService } from './reservationManagementService'

const AUDIT_KEY = 'drivique_management_audit'

function readJson(key, fallback) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

export const contractManagementService = {
  list: (user) => {
    // Generar contratos a partir de las reservas
    const reservations = reservationManagementService.list()
    // Filtramos reservas que ya tengan contrato firmado o estén confirmadas/en curso/finalizadas
    let contracts = reservations
      .filter((r) => r.estado !== 'cancelada' && r.estado !== 'pendiente')
      .map((r, index) => ({
        id: `CON-${r.id.split('-')[1] || Date.now() + index}`,
        contratoNumero: `CON-${r.codigo.split('-')[1] || Date.now() + index}`,
        reservaCodigo: r.codigo,
        clienteNombre: r.clienteNombre,
        clienteCorreo: r.clienteCorreo,
        clienteTelefono: r.clienteTelefono,
        clienteDocumento: r.clienteDocumento || `10${Math.floor(Math.random() * 90000000) + 10000000}`, // Generar documento aleatorio si no existe
        vehiculoPlaca: r.vehiculoPlaca,
        vehiculoNombre: r.vehiculoNombre,
        sucursal: r.sucursal,
        fechaInicio: r.fechaInicio,
        fechaFin: r.fechaFin,
        totalCOP: r.totalCOP,
        estado: r.estado === 'en_curso' ? 'vigente' : r.estado === 'finalizada' ? 'cerrado' : 'firmado',
        fechaFirma: r.fechaCreacion
      }))

    // El encargado solo ve los contratos de su sucursal
    if (user?.rol === 'encargado' || user?.rol === 'encargado_sucursal' || user?.rol === 'branch_manager') {
      const sucursalAsignada = user?.sucursal || user?.sucursalId || user?.sucursalAsignada
      if (sucursalAsignada) {
        contracts = contracts.filter((c) => c.sucursal.toLowerCase().includes(sucursalAsignada.toLowerCase()))
      }
    }

    return contracts
  },

  logAudit: (action, contract, user) => {
    const records = readJson(AUDIT_KEY, [])
    const entry = {
      id: `AUDIT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      fecha: new Date().toISOString(),
      modulo: 'contratos',
      accion: action,
      entidadId: contract.id,
      entidadNombre: `Contrato ${contract.contratoNumero}`,
      usuario: user?.correo || user?.nombre || 'administrador'
    }
    localStorage.setItem(AUDIT_KEY, JSON.stringify([entry, ...records].slice(0, 200)))
  }
}
