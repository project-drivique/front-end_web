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
export function exportExcel({ title = 'Reporte Drivique', headers = [], rows = [], filename = 'reporte' }) {
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

  const titleRow = `<Row ss:Height="30"><Cell ss:StyleID="TitleStyle"><Data ss:Type="String">${escapeXml(reportTitle)}</Data></Cell></Row><Row ss:Height="12"/>`

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
export function exportPdf({ title = 'Reporte Drivique', headers = [], rows = [], items = [] }) {
  const win = window.open('', '_blank')
  if (!win) throw new Error('popupBlocked')

  const nowStr = new Date().toLocaleString('es-CO')
  const brand = getBrandExportTheme()
  const reportTitle = withCurrentBrand(title, brand)

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
      margin-bottom: 20px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .report-header h1 { margin: 0; font-size: 20px; font-weight: 800; }
    .report-header p { margin: 4px 0 0; font-size: 11px; opacity: 0.85; }

    .report-meta {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #64748b;
      margin-bottom: 14px;
      font-weight: 600;
    }

    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
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
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
    tr:nth-child(even) td { background: #f8fafc; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 10px;
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
      <p>Sistema Operativo de Gestión e Inspección de Alquiler de Vehículos</p>
    </div>
    <div style="text-align:right;">
      <strong style="font-size:14px;">${escapeXml(brand.name).toUpperCase()}</strong>
    </div>
  </div>

  <div class="report-meta">
    <span>Fecha de Emisión: ${nowStr}</span>
    <span>Registros Totales: ${rows.length}</span>
  </div>

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
 * IMPRIMIR LISTADO CON ESTILO Y COLORES
 */
export function printTable({ title = 'Reporte Drivique', headers = [], rows = [], items = [] }) {
  exportPdf({ title, headers, rows, items, filename: 'impresion' })
}
