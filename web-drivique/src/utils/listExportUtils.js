import i18n from '@/i18n'
import {
  downloadBlob,
  escapeXml,
  getBrandExportTheme,
  withCurrentBrand,
  exportWord,
} from './listExportWordUtils'

export { exportWord }

/**
 * EXPORTAR A EXCEL (.xls SpreadsheetML) CON ESTILOS, COLORES Y FORMATO ORDENADO
 */
export function exportExcel({
  title = 'Reporte Drivique',
  headers = [],
  rows = [],
  kpis = [],
  filtersSummary = [],
  filename = 'reporte',
}) {
  const brand = getBrandExportTheme()
  const reportTitle = withCurrentBrand(title, brand)
  const styles = `
    <Styles>
      <Style ss:ID="Default" ss:Name="Normal">
        <Alignment ss:Vertical="Center"/>
        <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0F172A"/>
        <Interior/>
        <Borders>
          <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        </Borders>
      </Style>
      <Style ss:ID="TitleStyle">
        <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
        <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="${brand.hover}"/>
      </Style>
      <Style ss:ID="MetaStyle">
        <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
        <Font ss:FontName="Calibri" ss:Size="9.5" ss:Color="#64748B" ss:Italic="1"/>
      </Style>
      <Style ss:ID="KpiLabelStyle">
        <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
        <Font ss:FontName="Calibri" ss:Size="9" ss:Bold="1" ss:Color="#475569"/>
        <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
        <Borders>
          <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
          <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
          <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
        </Borders>
      </Style>
      <Style ss:ID="KpiValStyle">
        <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
        <Font ss:FontName="Calibri" ss:Size="12" ss:Bold="1" ss:Color="${brand.hover}"/>
        <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
        <Borders>
          <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
          <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
          <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
        </Borders>
      </Style>
      <Style ss:ID="HeaderStyle">
        <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
        <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
        <Interior ss:Color="${brand.hover}" ss:Pattern="Solid"/>
        <Borders>
          <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="${brand.secondary}"/>
        </Borders>
      </Style>
      <Style ss:ID="ZebraStyle">
        <Alignment ss:Vertical="Center"/>
        <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0F172A"/>
        <Interior ss:Color="#F4F7FB" ss:Pattern="Solid"/>
        <Borders>
          <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        </Borders>
      </Style>
    </Styles>
  `

  const nowStr = new Date().toLocaleString('es-CO')
  const titleRow = `<Row ss:Height="30"><Cell ss:StyleID="TitleStyle"><Data ss:Type="String">${escapeXml(reportTitle)}</Data></Cell></Row>`
  const metaRow = `<Row ss:Height="18"><Cell ss:StyleID="MetaStyle"><Data ss:Type="String">${i18n.t('hc3.export_meta_row', { defaultValue: 'Fecha de emisión: {{fecha}} | Total registros: {{total}}', fecha: nowStr, total: rows.length })}</Data></Cell></Row><Row ss:Height="8"/>`

  let kpiRows = ''
  if (Array.isArray(kpis) && kpis.length > 0) {
    const kpiLabelCells = kpis.map((k) => `<Cell ss:StyleID="KpiLabelStyle"><Data ss:Type="String">${escapeXml(k.label)}</Data></Cell>`).join('')
    const kpiValCells = kpis.map((k) => `<Cell ss:StyleID="KpiValStyle"><Data ss:Type="String">${escapeXml(k.value)}</Data></Cell>`).join('')
    kpiRows = `<Row ss:Height="18">${kpiLabelCells}</Row><Row ss:Height="24">${kpiValCells}</Row><Row ss:Height="12"/>`
  }

  let filterRows = ''
  if (Array.isArray(filtersSummary) && filtersSummary.length > 0) {
    const filterText = filtersSummary.map((f) => `${f.label}: ${f.value}`).join(' | ')
    filterRows = `<Row ss:Height="18"><Cell ss:StyleID="MetaStyle"><Data ss:Type="String">Filtros aplicados: ${escapeXml(filterText)}</Data></Cell></Row><Row ss:Height="8"/>`
  }

  const headerCells = headers
    .map((h) => `<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`)
    .join('')
  const headerRow = `<Row ss:Height="24">${headerCells}</Row>`

  const dataRows = rows
    .map((row, rIdx) => {
      const styleId = rIdx % 2 === 1 ? 'ZebraStyle' : 'Default'
      const cells = row
        .map((cell) => {
          const isNum = typeof cell === 'number'
          return `<Cell ss:StyleID="${styleId}"><Data ss:Type="${isNum ? 'Number' : 'String'}">${escapeXml(cell)}</Data></Cell>`
        })
        .join('')
      return `<Row ss:Height="20">${cells}</Row>`
    })
    .join('')

  const colWidths = headers.map(() => `<Column ss:AutoFitWidth="1" ss:Width="130"/>`).join('')

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  ${styles}
  <Worksheet ss:Name="Reporte ${escapeXml(brand.name).slice(0, 23)}">
    <Table>
      ${colWidths}
      ${titleRow}
      ${metaRow}
      ${kpiRows}
      ${filterRows}
      ${headerRow}
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`

  downloadBlob(`\ufeff${xml}`, 'application/vnd.ms-excel;charset=utf-8', `${filename}.xls`)
}

/**
 * EXPORTAR A PDF CON DISEÑO ELEGANTE, COLORES DE LA MARCA E IMÁGENES
 */
export function exportPdf({
  title = 'Reporte Drivique',
  subtitle = i18n.t('hc2.sistema_operativo_de_gestion_e_inspecc', 'Sistema Operativo de Gestión e Inspección de Alquiler de Vehículos'),
  headers = [],
  rows = [],
  items = [],
  kpis = [],
  filtersSummary = [],
}) {
  const win = window.open('', '_blank')
  if (!win) throw new Error('popupBlocked')

  const nowStr = new Date().toLocaleString('es-CO')
  const brand = getBrandExportTheme()
  const reportTitle = withCurrentBrand(title, brand)

  const kpisHtml = Array.isArray(kpis) && kpis.length > 0
    ? `
      <div class="kpis-grid">
        ${kpis
          .map(
            (k) => `
          <div class="kpi-card">
            <span class="kpi-label">${escapeXml(k.label)}</span>
            <span class="kpi-value">${escapeXml(k.value)}</span>
          </div>
        `,
          )
          .join('')}
      </div>
    `
    : ''

  const filtersHtml = Array.isArray(filtersSummary) && filtersSummary.length > 0
    ? `
      <div class="filters-summary">
        <strong>${i18n.t('hc4.filtros_aplicados', 'Filtros aplicados:')}</strong>
        ${filtersSummary.map((f) => `<span class="filter-chip"><em>${escapeXml(f.label)}:</em> ${escapeXml(f.value)}</span>`).join('')}
      </div>
    `
    : ''

  const tableHeaderHtml = headers.map((h) => `<th>${escapeXml(h)}</th>`).join('')

  const tableRowsHtml = rows
    .map((row, idx) => {
      const rawItem = items[idx] || {}
      const vehicleImg = rawItem.vehiculoImagen || rawItem.imagenes?.[0]
      const cellsHtml = row
        .map((cell, cIdx) => {
          const val = String(cell ?? '')
          if ((headers[cIdx] === 'Vehículo' || headers[cIdx] === 'Nombre Vehículo' || headers[cIdx] === 'NOMBRE VEHÍCULO' || String(headers[cIdx] || '').toLowerCase().includes('vehículo') || String(headers[cIdx] || '').toLowerCase().includes('vehiculo')) && vehicleImg) {
            return `
              <td>
                <div style="display:flex; align-items:center; gap:8px;">
                  <img src="${vehicleImg}" alt="" style="width:36px; height:26px; border-radius:6px; object-fit:cover; border:1px solid #cbd5e1;" />
                  <span>${escapeXml(val)}</span>
                </div>
              </td>
            `
          }

          if (headers[cIdx] === 'Estado') {
            const st = val.toLowerCase().replace(' ', '_')
            return `<td><span class="badge badge-${st}">${escapeXml(val)}</span></td>`
          }

          return `<td>${escapeXml(val)}</td>`
        })
        .join('')

      return `<tr>${cellsHtml}</tr>`
    })
    .join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>${escapeXml(reportTitle)}</title>
  <style>
    :root { --brand-primary:${brand.primary}; --brand-secondary:${brand.secondary}; --brand-primary-hover:${brand.hover}; --brand-soft-strong-light:${brand.soft}; --brand-text-light:${brand.text}; }
    @page { size: A4 landscape; margin: 12mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; background: #fff; }
    
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, var(--brand-secondary) 0%, var(--brand-primary) 100%);
      color: #ffffff;
      padding: 16px 24px;
      border-radius: 12px;
      margin-bottom: 16px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .report-header h1 { margin: 0; font-size: 20px; font-weight: 800; }
    .report-header p { margin: 4px 0 0; font-size: 11px; opacity: 0.85; }

    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }
    .kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      text-align: center;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .kpi-label { display: block; font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; }
    .kpi-value { display: block; font-size: 16px; font-weight: 800; color: var(--brand-primary); margin-top: 4px; }

    .filters-summary {
      background: #f1f5f9;
      border-left: 4px solid var(--brand-primary);
      padding: 8px 12px;
      font-size: 11px;
      color: #334155;
      margin-bottom: 14px;
      border-radius: 4px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .filter-chip {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
    }

    .report-meta {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #64748b;
      margin-bottom: 12px;
      font-weight: 600;
    }

    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 6px; }
    th {
      background: var(--brand-secondary) !important;
      color: #ffffff !important;
      padding: 10px 12px;
      text-align: left;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
    tr:nth-child(even) td { background: #f8fafc; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 9.5px;
      font-weight: 800;
      text-transform: capitalize;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .badge-confirmada { background: var(--brand-soft-strong-light); color: var(--brand-text-light); }
    .badge-en_curso { background: #e0f2fe; color: #0369a1; }
    .badge-finalizada { background: #dcfce7; color: #15803d; }
    .badge-pendiente { background: #fef3c7; color: #b45309; }
    .badge-cancelada { background: #fee2e2; color: #991b1b; }

    .report-footer {
      margin-top: 24px;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
    }
  </style>
</head>
<body>
  <div class="report-header">
    <div>
      <h1>${escapeXml(brand.name)} — ${escapeXml(reportTitle)}</h1>
      <p>${escapeXml(subtitle)}</p>
    </div>
    <div style="text-align:right;">
      <strong style="font-size:14px;">${escapeXml(brand.name).toUpperCase()}</strong>
    </div>
  </div>

  <div class="report-meta">
    <span>Fecha de Emisión: ${nowStr}</span>
    <span>Registros Totales: ${rows.length}</span>
  </div>

  ${kpisHtml}
  ${filtersHtml}

  <table>
    <thead>
      <tr>${tableHeaderHtml}</tr>
    </thead>
    <tbody>
      ${tableRowsHtml}
    </tbody>
  </table>

  <div class="report-footer">
    ${i18n.t('hc5.export_auto_footer', { defaultValue: 'Documento generado automáticamente por {{marca}}. Todos los derechos reservados.', marca: escapeXml(brand.name) })}
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`

  win.document.write(html)
  win.document.close()
}

/**
 * IMPRIMIR LISTADO CON ESTILO Y COLORES
 */
export function printTable({ title = 'Reporte Drivique', headers = [], rows = [], items = [] }) {
  exportPdf({ title, headers, rows, items, filename: 'impresion' })
}
