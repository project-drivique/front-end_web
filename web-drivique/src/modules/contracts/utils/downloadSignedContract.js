export async function prepararVistaContrato({ elementoContrato, contrato }) {
  if (!elementoContrato) return
  const canvas = elementoContrato.querySelector('canvas')
  if (!canvas || !contrato?.firmaUsuarioDataUrl) return
  const firma = new Image()
  await new Promise((resolve, reject) => {
    firma.onload = resolve
    firma.onerror = reject
    firma.src = contrato.firmaUsuarioDataUrl
  })
  const contexto = canvas.getContext('2d')
  contexto.clearRect(0, 0, canvas.width, canvas.height)
  contexto.drawImage(firma, 0, 0, canvas.width, canvas.height)
}

export function descargarContratoOriginal({ contrato, elementoContrato }) {
  if (!elementoContrato) throw new Error('No se encontró el contrato que estás visualizando.')

  // Clonar el nodo visual del contrato para imprimir sin alterar el DOM de React
  const clon = elementoContrato.cloneNode(true)

  // Reemplazar los canvas por imágenes con su dataURL en el clon
  const canvasesOriginales = elementoContrato.querySelectorAll('canvas')
  const canvasesClon = clon.querySelectorAll('canvas')
  canvasesOriginales.forEach((origCanvas, i) => {
    try {
      const dataUrl = origCanvas.toDataURL('image/png')
      if (dataUrl && canvasesClon[i]) {
        const img = document.createElement('img')
        img.src = dataUrl
        img.style.width = '100%'
        img.style.height = '100%'
        img.style.objectFit = 'contain'
        canvasesClon[i].parentNode.replaceChild(img, canvasesClon[i])
      }
    } catch (e) {
      console.warn('Error convirtiendo canvas para impresión', e)
    }
  })

  // Remover botones de acción en la copia a imprimir
  clon.querySelectorAll('button').forEach(b => b.remove())

  // Recoger estilos actuales
  const estilos = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(el => el.outerHTML)
    .join('\n')

  const docTitle = `Contrato-${contrato?.codigo || 'Drivique'}`

  return new Promise((resolve) => {
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    iframe.setAttribute('aria-hidden', 'true')
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow.document
    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${docTitle}</title>
          ${estilos}
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              background: #ffffff !important;
              color: #0f172a !important;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .contrato-contenedor-externo {
              max-width: 100% !important;
              margin: 0 !important;
              background: transparent !important;
            }
            * {
              --bg-tarjeta: #ffffff !important;
              --bg-item: #f8fafc !important;
              --borde: #dbe3ef !important;
              --texto-primary: #0f172a !important;
              --texto-second: #64748b !important;
              --sombra-tarjeta: none !important;
            }
            button {
              display: none !important;
            }
            .contrato-campo, section, footer {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
          </style>
        </head>
        <body>
          <div class="raiz-impresion-contrato">
            ${clon.outerHTML}
          </div>
        </body>
      </html>
    `)
    doc.close()

    iframe.contentWindow.focus()
    setTimeout(() => {
      try {
        iframe.contentWindow.print()
      } catch (err) {
        console.error('Error al imprimir contrato', err)
      }
      setTimeout(() => {
        iframe.remove()
        resolve()
      }, 1000)
    }, 400)
  })
}
