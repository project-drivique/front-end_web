import { FaTimes } from 'react-icons/fa'
import FirmaContrato from '@/modules/contracts/components/ContractSignature'

export default function ContractDetailModal({ modalDetalle, setModalDetalle, handleDownloadSinglePdf, t }) {
  if (!modalDetalle) return null

  return (
    <div
      className="cities-modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && setModalDetalle(null)}
    >
      <section className="cities-modal contracts-detail-modal">
        <div className="cities-modal__head">
          <div>
            <p className="cities-eyebrow">{modalDetalle.contratoNumero}</p>
            <h2>{t('admin.contractsPage.detailsTitle', 'Detalle de Contrato')}</h2>
          </div>
          <button type="button" onClick={() => setModalDetalle(null)}>
            <FaTimes />
          </button>
        </div>

        <div
          className="contracts-detail-body"
          style={{
            background: 'var(--city-bg, #f8fafc)',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            maxHeight: '75vh',
            overflowY: 'auto',
          }}
        >
          <FirmaContrato
            soloLectura={true}
            vehiculo={{
              nombre: modalDetalle.vehiculoNombre,
              placa: modalDetalle.vehiculoPlaca,
              sucursal: modalDetalle.sucursal,
            }}
            reservaGuardada={{
              id: modalDetalle.reservaId,
              clienteNombre: modalDetalle.clienteNombre,
              clienteDocumento: modalDetalle.clienteDocumento,
              clienteTipoDocumento: modalDetalle.clienteTipoDocumento || 'CC',
              clienteCorreo: modalDetalle.clienteCorreo,
              clienteTelefono: modalDetalle.clienteTelefono,
              total: modalDetalle.totalCOP,
              referencia: modalDetalle.reservaCodigo,
              datosForm: {
                nombre: modalDetalle.clienteNombre,
                tipoDoc: modalDetalle.clienteTipoDocumento || 'CC',
                numDoc: modalDetalle.clienteDocumento,
              },
              reservaDetalles: {
                sucursalRetiro: modalDetalle.sucursal,
                fechaInicio: modalDetalle.fechaInicio,
                fechaFin: modalDetalle.fechaFin,
              },
            }}
            contratoFirmado={{
              id: modalDetalle.id,
              contractNumber: modalDetalle.contratoNumero || `CTR-${modalDetalle.reservaCodigo}`,
              codigo: modalDetalle.contratoNumero || `CTR-${modalDetalle.reservaCodigo}`,
              signatureUrl: modalDetalle.signatureUrl || modalDetalle.firmaUsuarioDataUrl || '',
              firmaUsuarioDataUrl: modalDetalle.signatureUrl || modalDetalle.firmaUsuarioDataUrl || '',
              signedAt: modalDetalle.fechaFirma,
              clienteNombre: modalDetalle.clienteNombre,
              clienteDocumento: modalDetalle.clienteDocumento,
              tipoDoc: modalDetalle.clienteTipoDocumento || 'CC',
            }}
          />
        </div>

        <div className="cities-modal__actions" style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <button type="button" onClick={() => setModalDetalle(null)} style={{ flex: 1 }}>
            {t('admin.contractsPage.close')}
          </button>
          <button
            type="button"
            className="cities-primary"
            onClick={() => handleDownloadSinglePdf(modalDetalle)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {t('admin.contractsPage.downloadPdf', 'Descargar Contrato')}
          </button>
        </div>
      </section>
    </div>
  )
}
