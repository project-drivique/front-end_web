import './setupTestEnv.js'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const aquí = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(aquí, '..')
const localesDir = path.join(srcDir, 'i18n', 'locales')
const IDIOMAS = ['es', 'en', 'fr', 'pt', 'br']

const aplanar = (objeto, prefijo = '', salida = {}) => {
  for (const [clave, valor] of Object.entries(objeto)) {
    const ruta = prefijo ? `${prefijo}.${clave}` : clave
    if (valor && typeof valor === 'object' && !Array.isArray(valor)) aplanar(valor, ruta, salida)
    else salida[ruta] = valor
  }
  return salida
}

const traducciones = Object.fromEntries(
  IDIOMAS.map((idioma) => [idioma, aplanar(JSON.parse(fs.readFileSync(path.join(localesDir, `${idioma}.json`), 'utf8')))])
)

const archivosDeCodigo = () => {
  const archivos = []
  const recorrer = (dir) => {
    for (const nombre of fs.readdirSync(dir)) {
      const ruta = path.join(dir, nombre)
      if (fs.statSync(ruta).isDirectory()) {
        if (!['i18n', '__tests__', 'node_modules'].includes(nombre)) recorrer(ruta)
      } else if (/\.(jsx?|tsx?)$/.test(nombre)) archivos.push(ruta)
    }
  }
  recorrer(srcDir)
  return archivos
}

describe('Traducciones de la web', () => {
  it('los cinco idiomas tienen exactamente las mismas claves', () => {
    const todas = new Set(IDIOMAS.flatMap((idioma) => Object.keys(traducciones[idioma])))
    for (const idioma of IDIOMAS) {
      const faltan = [...todas].filter((clave) => !(clave in traducciones[idioma]))
      assert.deepEqual(faltan, [], `A ${idioma} le faltan ${faltan.length} claves: ${faltan.slice(0, 5).join(', ')}`)
    }
  })

  it('ninguna traducción está vacía', () => {
    for (const idioma of IDIOMAS) {
      const vacias = Object.entries(traducciones[idioma]).filter(([, valor]) => typeof valor === 'string' && valor.trim() === '')
      assert.deepEqual(vacias.map(([clave]) => clave), [], `Hay textos vacíos en ${idioma}`)
    }
  })

  it('toda clave escrita en el código existe en el idioma base', () => {
    const es = traducciones.es
    const existe = (clave) => clave in es || `${clave}_one` in es || `${clave}_other` in es
    const faltan = new Set()
    for (const archivo of archivosDeCodigo()) {
      const texto = fs.readFileSync(archivo, 'utf8')
      for (const coincidencia of texto.matchAll(/\bt\(\s*(['"`])([A-Za-z0-9_.-]+\.[A-Za-z0-9_.-]*)\1/g)) {
        const clave = coincidencia[2]
        // las claves que terminan en punto se completan con un dato del servidor (rol, país, servicio…)
        if (!clave.endsWith('.') && !existe(clave)) faltan.add(clave)
      }
    }
    assert.deepEqual([...faltan], [], `Claves usadas sin traducción: ${[...faltan].slice(0, 8).join(', ')}`)
  })
})
