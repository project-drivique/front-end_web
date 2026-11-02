import { FaCheckCircle } from 'react-icons/fa'
import FirmaContrato from '../../../contracts/components/ContractSignature'

export default function ContratoModalReserva({ contratoModalReserva, setContratoModalReserva }) {
  return (
    <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: 20,
            }}
            onClick={() => setContratoModalReserva(null)}
          >
            <div
              style={{
                background: 'var(--bg-tarjeta, #ffffff)',
                borderRadius: 20,
                maxWidth: 960,
                width: '100%',
                maxHeight: '90vh',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid var(--borde, #e2e8f0)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                borderBottom: '1px solid var(--borde, #e2e8f0)',
                background: 'var(--bg-tarjeta, #ffffff)'
              }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <FaCheckCircle size={12} /> Contrato Legal Firmado Digitalmente
                  </span>
                  <h3 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 900, color: 'var(--texto-primary, #0f172a)' }}>
                    Contrato de Arrendamiento Vehicular · {contratoModalReserva.codigo || `RES-${contratoModalReserva.id}`}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setContratoModalReserva(null)}
                  style={{
                    background: 'var(--city-bg, #f1f5f9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 34,
                    height: 34,
                    fontWeight: 800,
                    color: 'var(--texto-second, #64748b)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                  }}
                >
                  ✕
                </button>
              </div>
  
              <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: 'var(--bg-seccion1, #f8fafc)' }}>
                <FirmaContrato
                  soloLectura={true}
                  vehiculo={{
                    nombre: contratoModalReserva.vehiculoNombre,
                    placa: contratoModalReserva.vehiculoPlaca,
                    sucursal: contratoModalReserva.sucursal,
                    imagen: contratoModalReserva.vehiculoImagen,
                  }}
                  reservaGuardada={{
                    id: contratoModalReserva.id,
                    clienteNombre: contratoModalReserva.clienteNombre,
                    clienteDocumento: contratoModalReserva.clienteDocumento,
                    clienteTipoDocumento: contratoModalReserva.clienteTipoDocumento || 'CC',
                    clienteCorreo: contratoModalReserva.clienteCorreo,
                    clienteTelefono: contratoModalReserva.clienteTelefono,
                    total: contratoModalReserva.totalCOP || contratoModalReserva.total,
                    referencia: contratoModalReserva.codigo || contratoModalReserva.referencia,
                    datosForm: {
                      nombre: contratoModalReserva.clienteNombre,
                      tipoDoc: contratoModalReserva.clienteTipoDocumento || 'CC',
                      numDoc: contratoModalReserva.clienteDocumento,
                    },
                    reservaDetalles: {
                      sucursalRetiro: contratoModalReserva.sucursalRetiro || contratoModalReserva.sucursal,
                      sucursalDevolucion: contratoModalReserva.sucursalDevolucion || contratoModalReserva.sucursal,
                      fechaInicio: contratoModalReserva.fechaInicio,
                      fechaFin: contratoModalReserva.fechaFin,
                      horaInicio: contratoModalReserva.horaInicio,
                      horaFin: contratoModalReserva.horaFin,
                      metodoPago: contratoModalReserva.metodoPago,
                    }
                  }}
                  contratoFirmado={{
                    id: contratoModalReserva.contratoId,
                    contractNumber: contratoModalReserva.contratoNumero || `CTR-${contratoModalReserva.codigo}`,
                    codigo: contratoModalReserva.contratoNumero || `CTR-${contratoModalReserva.codigo}`,
                    signatureUrl: contratoModalReserva.signatureUrl || contratoModalReserva.firmaUsuarioDataUrl,
                    firmaUsuarioDataUrl: contratoModalReserva.signatureUrl || contratoModalReserva.firmaUsuarioDataUrl,
                    signedAt: contratoModalReserva.fechaPagoConfirmado || contratoModalReserva.fechaCreacion,
                    clienteNombre: contratoModalReserva.clienteNombre,
                    clienteDocumento: contratoModalReserva.clienteDocumento,
                    tipoDoc: contratoModalReserva.clienteTipoDocumento || 'CC',
                  }}
                  onVolver={() => setContratoModalReserva(null)}
                />
              </div>
            </div>
          </div>
  )
}
