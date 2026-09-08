export async function prepararVistaContrato({ elementoContrato, contrato }) {
  if (!elementoContrato) throw new Error('No fue posible preparar la visualización del contrato.')
  const canvas = elementoContrato.querySelector('canvas')
  if (!canvas || !contrato?.firmaUsuarioDataUrl) return
  const firma = new Image()
  await new Promise((resolve, reject) => { firma.onload = resolve; firma.onerror = reject; firma.src = contrato.firmaUsuarioDataUrl })
  const contexto = canvas.getContext('2d')
  contexto.clearRect(0, 0, canvas.width, canvas.height)
  contexto.drawImage(firma, 0, 0, canvas.width, canvas.height)
}

export function descargarContratoOriginal({ contrato, elementoContrato }) {
  if (!elementoContrato) throw new Error('No se encontró el contrato que estás visualizando.')
  const tituloAnterior = document.title
  const padreOriginal = elementoContrato.parentNode
  const siguienteOriginal = elementoContrato.nextSibling
  const raizImpresion = document.createElement('div')
  raizImpresion.className = 'raiz-impresion-contrato'
  document.title = `Contrato-${contrato.codigo}`
  document.body.classList.add('imprimiendo-contrato')
  elementoContrato.classList.add('contrato-a-imprimir')
  document.body.appendChild(raizImpresion)
  raizImpresion.appendChild(elementoContrato)
  return new Promise(resolve => {
    let limpio = false
    const limpiar = () => {
      if (limpio) return
      limpio = true
      if (siguienteOriginal && siguienteOriginal.parentNode === padreOriginal) padreOriginal.insertBefore(elementoContrato, siguienteOriginal)
      else padreOriginal.appendChild(elementoContrato)
      raizImpresion.remove()
      document.body.classList.remove('imprimiendo-contrato')
      elementoContrato.classList.remove('contrato-a-imprimir')
      document.title = tituloAnterior
      window.removeEventListener('afterprint', limpiar)
      resolve()
    }
    window.addEventListener('afterprint', limpiar)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.print()
      window.setTimeout(limpiar, 500)
    }))
  })
}
