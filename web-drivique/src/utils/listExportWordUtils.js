import i18n from '@/i18n'

export function downloadBlob(content, type, filename) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export const escapeXml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export function getBrandExportTheme() {
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

export function withCurrentBrand(value, brand) {
  return String(value || '')
    .replace(/Drivique/gi, (match) => match === match.toUpperCase() ? brand.name.toUpperCase() : brand.name)
}

/**
 * EXPORTAR A WORD (.doc / WordprocessingML HTML) CON FORMATO INSTITUCIONAL
 */
export function exportWord({
  title = 'Reporte Drivique',
  subtitle = i18n.t('hc2.sistema_operativo_de_gestion_e_inspecc', 'Sistema Operativo de Gestión e Inspección de Alquiler de Vehículos'),
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
          <th colspan="2" style="padding:6px 10px; text-align:left; border:1px solid #CBD5E1; color:#1E293B;">${i18n.t('hc.parametros_y_filtros_del_reporte', 'Parámetros y Filtros del Reporte')}</th>
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
              <div style="font-size:8.5pt; color:#94A3B8;">${i18n.t('hc4.reporte_oficial', 'REPORTE OFICIAL')}</div>
            </td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom:14px; font-size:9pt; color:#475569; display:flex; justify-content:space-between;">
        <strong>${i18n.t('hc.fecha_de_emision', 'Fecha de Emisión:')}</strong> ${nowStr} &nbsp;|&nbsp; 
        <strong>${i18n.t('hc.generado_por', 'Generado por:')}</strong> ${escapeXml(author)} &nbsp;|&nbsp; 
        <strong>${i18n.t('hc.total_de_registros', 'Total de Registros:')}</strong> ${rows.length}
      </div>

      ${kpisHtml}
      ${filtersHtml}

      <h2>${i18n.t('hc.detalle_del_reporte', 'Detalle del Reporte')}</h2>
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
              <strong>${i18n.t('hc.control_de_auditoria', 'Control de Auditoría:')}</strong> ${i18n.t('hc5.export_audit_platform', { defaultValue: 'Generado por plataforma administrativa {{marca}}.', marca: escapeXml(brand.name) })}<br/>
              <em>${i18n.t('hc.valido_para_supervision_interna_gestio', 'Válido para supervisión interna, gestión financiera y contabilidad.')}</em>
            </td>
            <td style="border:none; width:50%; text-align:right; vertical-align:bottom;">
              _____________________________________<br/>
              ${i18n.t('hc5.export_signature_line', 'Firma Responsable / Auditoría')}
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `

  downloadBlob(`\ufeff${wordHtml}`, 'application/msword;charset=utf-8', `${filename}.doc`)
}
