
import html2canvas from 'html2canvas'

import { formatCurrency } from '../../../utils/currencyUtils'

import ManagementSidebar from '../components/ManagementSidebar'

import './CityManagementPage.css'
import './CashCollectionPage.css'
import ComprobanteDigital from './CashCollectionPage/ComprobanteDigital'
import ModalReserva from './CashCollectionPage/ModalReserva'
import CitiesCard from './CashCollectionPage/CitiesCard'
import CashKpiBar from './CashCollectionPage/CashKpiBar'
import CitiesTopbar from './CashCollectionPage/CitiesTopbar'
import useCashCollectionLogic1 from './CashCollectionPage/useCashCollectionLogic1'

// â”€â”€ COMPONENTE DE UN SOLO CALENDARIO REUTILIZABLE PARA SELECCIÓN DE RANGO DE FECHAS â”€â”€

export default function CashCollectionPage({ branchOnly = false }) {
  const { t, tema, moneda, tasaUSD, user, isBranchManager, setSearch, filterTab, setFilterTab, comprobanteDigital, setComprobanteDigital, dateFrom, setDateFrom, dateTo, setDateTo, selectedBranch, setSelectedBranch, listaSucursales, modalReserva, setModalReserva, observacionesCaja, setObservacionesCaja, procesandoPago, searchRefValue, setSearchRefValue, esCobradoEnSucursal, pendientesEfectivo, cobradasHoy, totalRecaudadoHoy, listFiltrada, exportData, openModalCobro, handleConfirmarCobro, handleSearchRef, formatFecha } = useCashCollectionLogic1({ branchOnly })

  const generarHtmlComprobante = (r) => {
    if (!r) return ''
    const rawMetodo = String(r.metodoPagoConfirmado || r.metodoPago || '').toLowerCase()
    const esEfectivo = rawMetodo.includes('efectivo') || rawMetodo.includes('sucursal') || String(r.estado).toLowerCase().includes('efectivo') || esCobradoEnSucursal(r)
    const cod = r.codigo || r.referencia || r.id || 'RECIBO'
    const total = Number(r.totalCOP || r.total || 0)
    const totalFormateado = formatCurrency(total, moneda, tasaUSD)
    const fecha = formatFecha(r.fechaPagoConfirmado || r.fechaCreacion)
    const clienteNombre = r.clienteNombre || t('hc2.cliente_registrado', 'Cliente Registrado')
    const clienteTelefono = r.clienteTelefono || '—'
    const clienteCorreo = r.clienteCorreo || r.clienteEmail || '—'
    const vehiculoNombre = r.vehiculoNombre || t('hc2.vehiculo_reservado', 'Vehículo Reservado')
    const sucursal = r.sucursalRetiro || r.sucursalNombre || r.sucursal || 'Principal'
    const cajero = r.cajeroConfirmacion || t('hc5.counter_manager', 'Encargado Mostrador')
    const observaciones = r.observacionesCaja || ''

    if (esEfectivo) {
      return `
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px 28px;width:420px;margin:0 auto;box-shadow:0 10px 25px rgba(0,0,0,0.08);position:relative;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;box-sizing:border-box;">
          <div style="height:6px;background:linear-gradient(90deg, #10b981 0%, #059669 100%);border-radius:4px 4px 0 0;margin:-32px -28px 24px -28px;"></div>
          
          <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:#ecfdf5;color:#10b981;margin-bottom:12px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2"></rect>
              <circle cx="12" cy="12" r="2"></circle>
              <path d="M6 12h.01M18 12h.01"></path>
            </svg>
          </div>
          
          <h2 style="margin:0 0 4px;font-size:20px;font-weight:800;letter-spacing:0.5px;color:#111827;">${t('hc.recibo_de_caja', 'RECIBO DE CAJA')}</h2>
          <p style="margin:0 0 20px;font-size:13px;color:#64748b;font-weight:500;">${t('admin.cash.modal.branchPrefix', 'Sucursal')} ${sucursal}</p>
          
          <div style="border-top:1px dashed #cbd5e1;border-bottom:1px dashed #cbd5e1;padding:16px 0;margin:0 0 20px 0;text-align:left;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;">
              <span style="color:#64748b;">${t('admin.cash.modal.reference', 'Referencia')}:</span>
              <span style="font-weight:700;color:#0f172a;">${cod}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;">
              <span style="color:#64748b;">${t('admin.cash.modal.date', 'Fecha')}:</span>
              <span style="font-weight:600;color:#0f172a;">${fecha}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;">
              <span style="color:#64748b;">${t('admin.cash.modal.customer', 'Cliente')}:</span>
              <span style="font-weight:600;color:#0f172a;">${clienteNombre}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;">
              <span style="color:#64748b;">${t('hc.vehiculo', 'Vehículo')}:</span>
              <span style="font-weight:600;color:#0f172a;">${vehiculoNombre}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;">
              <span style="color:#64748b;">${t('admin.cash.modal.cashier', 'Cajero')}:</span>
              <span style="font-weight:600;color:#0f172a;">${cajero}</span>
            </div>
          </div>
          
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:15px;font-weight:700;color:#111827;">${t('admin.cash.modal.totalPaid', 'TOTAL PAGADO')}</span>
            <span style="font-size:24px;font-weight:800;color:#10b981;">${totalFormateado}</span>
          </div>
          <div style="font-size:11px;color:#64748b;margin-top:4px;text-align:right;font-weight:600;">${t('admin.cash.modal.cashPayment', 'Pago en Efectivo')}</div>
          
          ${observaciones ? `
          <div style="margin-top:20px;padding:12px;border-radius:6px;background:#f8fafc;border:1px solid #e2e8f0;font-size:12px;text-align:left;color:#475569;">
            <strong style="color:#1e293b;">Nota:</strong> ${observaciones}
          </div>` : ''}

          <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8;display:flex;align-items:center;justify-content:space-between;">
            <span style="font-weight:800;color:#0f172a;letter-spacing:1px;">DRIVIQUE</span>
            <span>Documento de Recibo Oficial</span>
          </div>
        </div>
      `
    }

    let medioPago = t('admin.cash.modal.onlinePayment', 'Pago en línea (Wompi)')
    if (rawMetodo.includes('nequi')) medioPago = 'Wompi (Nequi)'
    else if (rawMetodo.includes('pse')) medioPago = 'Wompi (PSE)'
    else if (rawMetodo.includes('daviplata')) medioPago = 'Wompi (DaviPlata)'
    else if (rawMetodo.includes('bancolombia')) medioPago = 'Wompi (Bancolombia)'

    return `
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:6px solid #00a650;border-radius:12px;padding:36px 30px;width:420px;margin:0 auto;box-shadow:0 10px 25px rgba(0,0,0,0.08);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;box-sizing:border-box;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:#00a650;color:#ffffff;margin-bottom:14px;box-shadow:0 4px 12px rgba(0,166,80,0.25);">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2 style="font-size:22px;color:#111827;font-weight:700;margin:0 0 6px 0;">${t('admin.cash.modal.paymentApprovedTitle', '¡Pago aprobado!')}</h2>
          <div style="font-size:30px;color:#00a650;font-weight:800;margin:0 0 6px 0;">
            ${totalFormateado}
          </div>
          <div style="font-size:13px;color:#6b7280;">
            ${fecha}
          </div>
        </div>
        
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;text-align:center;margin-bottom:24px;font-size:12.5px;color:#15803d;line-height:1.5;">
          Hemos registrado tu pago con éxito.<br>
          Comprobante digital enviado a <strong>${clienteCorreo}</strong>
        </div>
        
        <div style="margin-bottom:20px;">
          <h4 style="font-size:14px;color:#111827;font-weight:700;margin:0 0 12px 0;border-bottom:1px solid #f3f4f6;padding-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
            ${t('admin.cash.modal.transactionInfo', 'Información de la transacción')}
          </h4>
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:10px;">
            <span style="color:#6b7280;">${t('hc4.referencia', 'Referencia')}:</span>
            <span style="font-weight:600;color:#111827;text-align:right;word-break:break-all;">${cod}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:10px;">
            <span style="color:#6b7280;">${t('hc.metodo_de_pago', 'Método de pago')}:</span>
            <span style="font-weight:600;color:#111827;">${medioPago}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:13px;">
            <span style="color:#6b7280;">${t('hc.vehiculo', 'Vehículo')}:</span>
            <span style="font-weight:600;color:#111827;">${vehiculoNombre}</span>
          </div>
        </div>
        
        <div style="margin-bottom:24px;">
          <h4 style="font-size:14px;color:#111827;font-weight:700;margin:0 0 12px 0;border-bottom:1px solid #f3f4f6;padding-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
            ${t('admin.cash.modal.payerInfo', 'Información del pagador')}
          </h4>
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:10px;">
            <span style="color:#6b7280;">${t('hc4.nombre', 'Nombre')}:</span>
            <span style="font-weight:500;color:#111827;">${clienteNombre}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:10px;">
            <span style="color:#6b7280;">${t('hc.telefono', 'Teléfono')}:</span>
            <span style="font-weight:500;color:#111827;">${clienteTelefono}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:13px;">
            <span style="color:#6b7280;">Email:</span>
            <span style="font-weight:500;color:#111827;">${clienteCorreo}</span>
          </div>
        </div>

        <div style="padding-top:16px;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8;display:flex;align-items:center;justify-content:space-between;">
          <span style="font-weight:800;color:#0f172a;letter-spacing:1px;">DRIVIQUE</span>
          <span>Transacción Segura Wompi</span>
        </div>
      </div>
    `
  }

  const handleDescargarComprobante = async (r) => {
    if (!r) return
    const cod = r.codigo || r.referencia || r.id || 'RECIBO'
    const htmlTicket = generarHtmlComprobante(r)

    const wrapper = document.createElement('div')
    wrapper.style.cssText = 'position:fixed;top:0;left:0;width:460px;z-index:-9999;pointer-events:none;opacity:1;background:#ffffff;padding:20px;box-sizing:border-box;'
    wrapper.innerHTML = htmlTicket
    document.body.appendChild(wrapper)

    try {
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `Comprobante-${cod}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Error al generar imagen de comprobante:', err)
      handleImprimirComprobante(r)
    } finally {
      if (wrapper.parentNode) {
        document.body.removeChild(wrapper)
      }
    }
  }

  const handleImprimirComprobante = (r) => {
    if (!r) return
    const cod = r.codigo || r.referencia || r.id || 'RECIBO'
    const htmlTicket = generarHtmlComprobante(r)

    const win = window.open('', '_blank', 'width=560,height=750')
    if (!win) return
    win.document.open()
    win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Comprobante-${cod}</title>
  <style>
    body {
      margin: 0;
      padding: 30px 15px;
      background: #f8fafc;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    @media print {
      body { background: transparent; padding: 0; }
    }
  </style>
</head>
<body>
  ${htmlTicket}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 250);
    };
  </script>
</body>
</html>`)
    win.document.close()
  }

  return (
    <div className={`management-shell ${tema === 'oscuro' ? 'management-shell--dark' : ''}`}>
      <ManagementSidebar branchOnly={branchOnly} />

      <main className="management-main" style={{ padding: '24px 32px' }}>
        <div className="cities-container" style={{ maxWidth: '100%' }}>
          {/* Header Superior */}
          <CitiesTopbar t={t} user={user} />

          {/* Tarjetas de Resumen KPI */}
          <CashKpiBar cobradasHoy={cobradasHoy} moneda={moneda} pendientesEfectivo={pendientesEfectivo} t={t} tasaUSD={tasaUSD} totalRecaudadoHoy={totalRecaudadoHoy} />

          {/* Tarjeta Principal con Buscador, Filtros y Tabla (Estilo exacto según captura) */}
          <CitiesCard cobradasHoy={cobradasHoy} dateFrom={dateFrom} dateTo={dateTo} esCobradoEnSucursal={esCobradoEnSucursal} exportData={exportData} filterTab={filterTab} handleDescargarComprobante={handleDescargarComprobante} handleImprimirComprobante={handleImprimirComprobante} handleSearchRef={handleSearchRef} isBranchManager={isBranchManager} listFiltrada={listFiltrada} listaSucursales={listaSucursales} moneda={moneda} openModalCobro={openModalCobro} pendientesEfectivo={pendientesEfectivo} searchRefValue={searchRefValue} selectedBranch={selectedBranch} setComprobanteDigital={setComprobanteDigital} setDateFrom={setDateFrom} setDateTo={setDateTo} setFilterTab={setFilterTab} setSearch={setSearch} setSearchRefValue={setSearchRefValue} setSelectedBranch={setSelectedBranch} t={t} tasaUSD={tasaUSD} />
        </div>
      </main>

      {/* â”€â”€ MODAL ORGANIZADO DE CONFIRMACIÓN DE PAGO EN SUCURSAL â”€â”€ */}
      {modalReserva && (
        <ModalReserva esCobradoEnSucursal={esCobradoEnSucursal} handleConfirmarCobro={handleConfirmarCobro} handleDescargarComprobante={handleDescargarComprobante} handleImprimirComprobante={handleImprimirComprobante} isBranchManager={isBranchManager} modalReserva={modalReserva} moneda={moneda} observacionesCaja={observacionesCaja} procesandoPago={procesandoPago} setModalReserva={setModalReserva} setObservacionesCaja={setObservacionesCaja} t={t} tasaUSD={tasaUSD} />
      )}

      {/* â”€â”€ MODAL COMPROBANTE DIGITAL (RÉPLICA WOMPI) â”€â”€ */}
      {comprobanteDigital && (
        <ComprobanteDigital comprobanteDigital={comprobanteDigital} handleDescargarComprobante={handleDescargarComprobante} handleImprimirComprobante={handleImprimirComprobante} moneda={moneda} setComprobanteDigital={setComprobanteDigital} t={t} tasaUSD={tasaUSD} />
      )}
    </div>
  )
}
