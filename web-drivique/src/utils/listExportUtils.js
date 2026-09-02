// src/utils/listExportUtils.js

function downloadBlob(content, type, filename) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

const escapeXml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

function getBrandExportTheme() {
  const root = getComputedStyle(document.documentElement)
  const read = (name, fallback) => root.getPropertyValue(name).trim() || fallback
  return {
    name: document.documentElement.dataset.brand || 'Drivique',
    primary: read('--brand-primary', '#2563EB'),
    secondary: read('--brand-secondary', '#1E3A8A'),
    hover: read('--brand-primary-hover', '#1D4ED8'),
    soft: read('--brand-soft-strong-light', '#DBEAFE'),
    text: read('--brand-text-light', '#1E40AF'),
  }
}

function withCurrentBrand(value, brand) {
  return String(value || '')
    .replace(/Drivique/gi, (match) => match === match.toUpperCase() ? brand.name.toUpperCase() : brand.name)
}

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
  const metaRow = `<Row ss:Height="18"><Cell ss:StyleID="MetaStyle"><Data ss:Type="String">Fecha de emisión: ${nowStr} | Total registros: ${rows.length}</Data></Cell></Row><Row ss:Height="8"/>`

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
  subtitle = 'Sistema Operativo de Gestión e Inspección de Alquiler de Vehículos',
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
        <strong>Filtros aplicados:</strong>
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
          // Si la columna es Vehículo y tenemos imagen, renderizar la miniatura
          if (headers[cIdx] === 'Vehículo' && vehicleImg) {
            return `
              <td>
                <div style="display:flex; align-items:center; gap:8px;">
                  <img src="${vehicleImg}" alt="" style="width:36px; height:26px; border-radius:6px; object-fit:cover; border:1px solid #cbd5e1;" />
                  <span>${escapeXml(val)}</span>
                </div>
              </td>
            `
          }

          // Si la columna es Estado, darle color badge
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
    .badge-en_curso { background: #f3e8ff; color: #7e22ce; }
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
    Documento generado automáticamente por ${escapeXml(brand.name)}. Todos los derechos reservados.
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
 * EXPORTAR A WORD (.doc / WordprocessingML HTML) CON FORMATO INSTITUCIONAL
 */
export function exportWord({
  title = 'Reporte Drivique',
  subtitle = 'Sistema Operativo de Gestión e Inspección de Alquiler de Vehículos',
  headers = [],
  rows = [],
  kpis = [],
  filtersSummary = [],
  filename = 'reporte-drivique',
  user = null,
}) {
  const brand = getBrandExportTheme()
  const reportTitle = withCurrentBrand(title, brand)
  const nowStr = new Date().toLocaleString('es-CO')
  const author = user?.nombre || user?.name || user?.correo || user?.email || 'Administrador'

  const kpisHtml = Array.isArray(kpis) && kpis.length > 0
    ? `
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-family:Calibri,sans-serif;">
        <tr>
          ${kpis
            .map(
              (k) => `
            <td style="background-color:#F1F5F9; border:1px solid #CBD5E1; padding:10px 14px; text-align:center;">
              <div style="font-size:10pt; color:#64748B; text-transform:uppercase; font-weight:bold;">${escapeXml(k.label)}</div>
              <div style="font-size:16pt; color:${brand.hover}; font-weight:bold; margin-top:4px;">${escapeXml(k.value)}</div>
            </td>
          `,
            )
            .join('')}
        </tr>
      </table>
    `
    : ''

  const filtersHtml = Array.isArray(filtersSummary) && filtersSummary.length > 0
    ? `
      <table style="width:100%; border-collapse:collapse; margin-bottom:16px; font-family:Calibri,sans-serif; font-size:9.5pt;">
        <tr style="background-color:#E2E8F0;">
          <th colspan="2" style="padding:6px 10px; text-align:left; border:1px solid #CBD5E1; color:#1E293B;">Parámetros y Filtros del Reporte</th>
        </tr>
        ${filtersSummary
          .map(
            (f) => `
          <tr>
            <td style="padding:5px 10px; width:30%; font-weight:bold; color:#475569; border:1px solid #E2E8F0; background-color:#F8FAFC;">${escapeXml(f.label)}</td>
            <td style="padding:5px 10px; color:#0F172A; border:1px solid #E2E8F0;">${escapeXml(f.value)}</td>
          </tr>
        `,
          )
          .join('')}
      </table>
    `
    : ''

  const tableHeaderHtml = headers
    .map(
      (h) => `
      <th style="background-color:${brand.hover}; color:#FFFFFF; padding:8px 10px; border:1px solid #CBD5E1; font-size:10pt; text-align:left;">
        ${escapeXml(h)}
      </th>
    `,
    )
    .join('')

  const tableRowsHtml = rows
    .map((row, idx) => {
      const bg = idx % 2 === 1 ? '#F8FAFC' : '#FFFFFF'
      const cells = row
        .map(
          (c) => `
        <td style="padding:7px 10px; border:1px solid #E2E8F0; font-size:9.5pt; color:#0F172A; background-color:${bg}; vertical-align:middle;">
          ${escapeXml(c)}
        </td>
      `,
        )
        .join('')
      return `<tr>${cells}</tr>`
    })
    .join('')

  const wordHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8"/>
      <title>${escapeXml(reportTitle)}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: 21cm 29.7cm;
          margin: 2cm 1.8cm 2cm 1.8cm;
          mso-page-orientation: portrait;
        }
        body {
          font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
          font-size: 10pt;
          color: #0F172A;
          line-height: 1.4;
        }
        h1 {
          font-size: 18pt;
          color: ${brand.secondary};
          margin: 0 0 4px 0;
          font-weight: bold;
        }
        h2 {
          font-size: 12pt;
          color: #334155;
          margin: 16px 0 8px 0;
          border-bottom: 2px solid ${brand.hover};
          padding-bottom: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div style="border-bottom:3px solid ${brand.hover}; padding-bottom:12px; margin-bottom:16px;">
        <table style="width:100%; border:none; margin:0;">
          <tr>
            <td style="border:none; text-align:left; vertical-align:middle;">
              <h1>${escapeXml(brand.name)} — ${escapeXml(reportTitle)}</h1>
              <div style="color:#64748B; font-size:10pt;">${escapeXml(subtitle)}</div>
            </td>
            <td style="border:none; text-align:right; vertical-align:middle; width:160px;">
              <div style="font-size:14pt; font-weight:bold; color:${brand.hover};">${escapeXml(brand.name).toUpperCase()}</div>
              <div style="font-size:8.5pt; color:#94A3B8;">REPORTE OFICIAL</div>
            </td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom:14px; font-size:9pt; color:#475569; display:flex; justify-content:space-between;">
        <strong>Fecha de Emisión:</strong> ${nowStr} &nbsp;|&nbsp; 
        <strong>Generado por:</strong> ${escapeXml(author)} &nbsp;|&nbsp; 
        <strong>Total de Registros:</strong> ${rows.length}
      </div>

      ${kpisHtml}
      ${filtersHtml}

      <h2>Detalle del Reporte</h2>
      <table>
        <thead>
          <tr>${tableHeaderHtml}</tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>

      <div style="margin-top:40px; padding-top:14px; border-top:1px solid #CBD5E1; font-size:8.5pt; color:#64748B;">
        <table style="width:100%; border:none;">
          <tr>
            <td style="border:none; width:50%; text-align:left;">
              <strong>Control de Auditoría:</strong> Generado por plataforma administrativa ${escapeXml(brand.name)}.<br/>
              <em>Válido para supervisión interna, gestión financiera y contabilidad.</em>
            </td>
            <td style="border:none; width:50%; text-align:right; vertical-align:bottom;">
              _____________________________________<br/>
              Firma Responsable / Auditoría
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `

  downloadBlob(`\ufeff${wordHtml}`, 'application/msword;charset=utf-8', `${filename}.doc`)
}

/**
 * IMPRIMIR LISTADO CON ESTILO Y COLORES
 */
export function printTable({ title = 'Reporte Drivique', headers = [], rows = [], items = [], kpis = [] }) {
  exportPdf({ title, headers, rows, items, filename: 'impresion' })
}

