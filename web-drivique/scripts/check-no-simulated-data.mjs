// Falla si el código productivo vuelve a usar datos simulados, rutas mocks/dummy/fixtures o proveedores de prueba.
// Los fixtures siguen permitidos dentro de pruebas (carpetas __tests__, archivos *.test.* y *.spec.*) y Storybook.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = fileURLToPath(new URL('..', import.meta.url))
const carpetas = ['src']
const extensiones = /\.(js|jsx|ts|tsx|mjs)$/
const permitido = /(__tests__|__mocks__|\.test\.|\.spec\.|\.stories\.|[\\/]\.storybook[\\/])/

const reglas = [
  { nombre: 'importa rutas mocks/dummy/fixtures', patron: /(?:from\s+|import\(|require\()\s*['"][^'"]*(?:[\\/]|^)(?:mocks?|dummy|fixtures?)(?:[\\/'".])/i },
  { nombre: 'archivo de datos dummy', patron: /(?:from|import)\s+['"][^'"]*\.(?:dummy|mock)(?:\.[a-z]+)?['"]/i },
  { nombre: 'modo mock en producción (VITE_USAR_MOCK / USAR_MOCK)', patron: /USAR_MOCK|VITE_MOCK_/ },
  { nombre: 'token o proveedor simulado', patron: /sandbox_(?:google|facebook|fb)|mock_token|mock_google|mock_fb|MockEmailProvider/i },
]

function archivos(dir) {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre)
    if (nombre === 'node_modules' || nombre === 'dist') return []
    return statSync(ruta).isDirectory() ? archivos(ruta) : [ruta]
  })
}

const hallazgos = []
for (const carpeta of carpetas) {
  for (const ruta of archivos(join(raiz, carpeta))) {
    if (!extensiones.test(ruta) || permitido.test(ruta)) continue
    readFileSync(ruta, 'utf8').split('\n').forEach((linea, i) => {
      for (const regla of reglas) {
        if (regla.patron.test(linea)) hallazgos.push(`${relative(raiz, ruta).split(sep).join('/')}:${i + 1}  ${regla.nombre}\n    ${linea.trim().slice(0, 120)}`)
      }
    })
  }
}

if (hallazgos.length > 0) {
  console.error(`Se encontraron ${hallazgos.length} datos simulados en código productivo:\n`)
  console.error(hallazgos.join('\n'))
  process.exit(1)
}
console.log('Sin datos simulados en el código productivo.')
