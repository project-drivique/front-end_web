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

const escapeXml = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const escapePdf = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, '').replace(/([\\()])/g, '\\$1')

export function exportExcel({ headers, rows, filename }) {
  const tableRows = [headers, ...rows].map((row) => `<Row>${row.map((cell) => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join('')}</Row>`).join('')
  const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Ciudades"><Table>${tableRows}</Table></Worksheet></Workbook>`
  downloadBlob(`\ufeff${workbook}`, 'application/vnd.ms-excel;charset=utf-8', `${filename}.xls`)
}

export function exportPdf({ title, headers, rows, filename }) {
  const lines = [title, '', headers.join(' | '), '-'.repeat(92), ...rows.map((row) => row.join(' | '))]
  const pages = []
  for (let index = 0; index < lines.length; index += 42) pages.push(lines.slice(index, index + 42))
  const objects = []
  const add = (value) => { objects.push(value); return objects.length }
  const fontId = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  const pageIds = []
  const contentIds = []
  pages.forEach((pageLines) => {
    const commands = pageLines.map((line, index) => `BT /F1 ${index === 0 ? 16 : 9} Tf 40 ${800 - index * 18} Td (${escapePdf(line)}) Tj ET`).join('\n')
    contentIds.push(add(`<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`))
    pageIds.push(add(''))
  })
  const pagesId = add('')
  pageIds.forEach((pageId, index) => { objects[pageId - 1] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentIds[index]} 0 R >>` })
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`
  const catalogId = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`)
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n` })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\ntrailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`
  downloadBlob(pdf, 'application/pdf', `${filename}.pdf`)
}

export function printTable({ title, headers, rows }) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) throw new Error('popupBlocked')
  const body = rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeXml(cell)}</td>`).join('')}</tr>`).join('')
  printWindow.document.write(`<!doctype html><html><head><title>${escapeXml(title)}</title><style>body{font-family:Arial,sans-serif;padding:28px;color:#111827}h1{font-size:22px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #d1d5db;padding:8px;text-align:left;font-size:11px}th{background:#eff6ff}@page{margin:14mm}</style></head><body><h1>${escapeXml(title)}</h1><table><thead><tr>${headers.map((header) => `<th>${escapeXml(header)}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></body></html>`)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}
