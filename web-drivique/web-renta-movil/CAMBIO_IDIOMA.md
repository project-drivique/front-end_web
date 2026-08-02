# HU-12 — Cambio de Idioma (i18n)

Guía para el equipo sobre cómo funciona el sistema de traducción y qué deben tener en cuenta al agregar nuevas funcionalidades.

---

## Idiomas disponibles

| Código | Idioma |
|--------|--------|
| `es` | Español (por defecto) |
| `en` | English |
| `fr` | Français |
| `pt` | Português (Portugal) |
| `br` | Português Brasileiro |

---

## Cómo funciona — arquitectura

El proyecto tiene **dos sistemas de traducción** que conviven:

### Sistema A — Landing page (`traducciones.js`)

Solo aplica a `LandingPage.jsx`. Las traducciones están en un objeto JS en:

```
src/modules/landing/traducciones.js
```

Se usa así dentro de `LandingPage.jsx`:
```jsx
const tx = traducciones[idioma]   // idioma viene de LandingContext
<h1>{tx.hero.h1a}</h1>
```

Si tu nueva funcionalidad es parte de la landing page, agrega las traducciones en ese archivo en los 5 idiomas.

---

### Sistema B — Resto de la app (`react-i18next`)

Todo lo que NO es la landing usa `react-i18next`. Los archivos de traducción están en:

```
src/i18n/locales/
  ├── es.json   ← español (fuente principal)
  ├── en.json
  ├── fr.json
  ├── pt.json
  └── br.json
```

Se usa así en cualquier componente o página:
```jsx
import { useTranslation } from 'react-i18next'

export default function MiComponente() {
  const { t } = useTranslation()

  return <p>{t('catalogo.details')}</p>
}
```

Y en hooks personalizados también funciona:
```js
import { useTranslation } from 'react-i18next'

export function useMiHook() {
  const { t } = useTranslation()
  // ...
  setError(t('perfil.errors.nameRequired'))
}
```

---

## Estructura de los archivos JSON

Los archivos están organizados por sección/módulo:

```json
{
  "common":          { ... },   // palabras comunes reutilizables
  "login":           { ... },
  "registro":        { ... },
  "recuperar":       { ... },
  "nuevaContrasena": { ... },
  "verificar2fa":    { ... },
  "catalogo":        { ... },
  "vehiculo":        { ... },   // página de detalle y reserva
  "reservas":        { ... },
  "perfil":          { ... },
  "pagos":           { ... },
  "contratos":       { ... },
  "sucursales":      { ... },
  "admin":           { ... },
  "panel":           { ... }    // panel izquierdo del login
}
```

---

## Reglas que DEBEN seguir al agregar funcionalidades

### ✅ Lo que SÍ hay que hacer

**1. Nunca escribir texto visible en español directamente en JSX:**
```jsx
// ❌ MAL — hardcodeado, no cambia de idioma
<button>Guardar cambios</button>

// ✅ BIEN — usa la clave de traducción
<button>{t('common.save')}</button>
```

**2. Nunca hardcodear mensajes de error en hooks:**
```js
// ❌ MAL
setError('El nombre es obligatorio')

// ✅ BIEN
setError(t('perfil.errors.nameRequired'))
```

**3. Agregar la clave en los 5 archivos JSON siempre:**

Cuando agregues una clave nueva en `es.json`, agrégala también en `en.json`, `fr.json`, `pt.json` y `br.json`. Si no la traduces, `react-i18next` usará el español como fallback, pero es mejor tenerla.

**4. Para valores que vienen de la API o del mock con nombre en español, usar un mapa de traducción:**
```jsx
// Ejemplo: vehiculo.transmision viene como "Automática" desde la API
const TRANS_KEYS = {
  'Automática': 'catalogo.transAuto',
  'Manual':     'catalogo.transManual',
}

// En el componente:
const label = TRANS_KEYS[vehiculo.transmision]
  ? t(TRANS_KEYS[vehiculo.transmision])
  : vehiculo.transmision
```

**5. Para fechas, usar `Intl.DateTimeFormat` con el idioma activo:**
```jsx
const { i18n } = useTranslation()

const formatearFecha = (d) => {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  const fecha = new Date(parseInt(y), parseInt(m) - 1, parseInt(day))
  return fecha.toLocaleDateString(i18n.language, {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}
```

---

### ❌ Lo que NO hay que hacer

```jsx
// ❌ Texto en español hardcodeado en JSX
<label>Correo electrónico</label>
<p>No se encontraron resultados</p>
<span>Cerrar sesión</span>

// ❌ Arrays de meses hardcodeados
const meses = ['ene','feb','mar','abr','may','jun'...]

// ❌ textTransform: 'uppercase' en labels de formularios
// (hace que parezca que se está "gritando")
const lbl = { textTransform: 'uppercase' }   // ← quitar esto

// ❌ Mensajes de error hardcodeados en hooks
if (!form.nombre) setError('El nombre es obligatorio')
```

---

## Cómo agregar traducciones para una nueva pantalla

### Paso 1 — Agregar las claves en `es.json`

Abre `src/i18n/locales/es.json` y agrega una nueva sección:

```json
"miNuevaPantalla": {
  "titulo": "Mi nueva pantalla",
  "subtitulo": "Descripción de la pantalla",
  "boton": "Aceptar",
  "errors": {
    "campoRequerido": "Este campo es obligatorio"
  }
}
```

### Paso 2 — Traducir en los otros 4 archivos

Agrega la misma estructura en `en.json`, `fr.json`, `pt.json`, `br.json` con la traducción correspondiente.

### Paso 3 — Usar en el componente

```jsx
import { useTranslation } from 'react-i18next'

export default function MiNuevaPantalla() {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('miNuevaPantalla.titulo')}</h1>
      <p>{t('miNuevaPantalla.subtitulo')}</p>
      <button>{t('miNuevaPantalla.boton')}</button>
    </div>
  )
}
```

---

## Claves reutilizables ya existentes en `common`

Antes de crear una clave nueva, revisa si ya existe en la sección `common`:

| Clave | Español |
|-------|---------|
| `common.save` | Guardar cambios |
| `common.cancel` | Cancelar |
| `common.edit` | Editar |
| `common.close` | Cerrar |
| `common.accept` | Aceptar |
| `common.loading` | Cargando... |
| `common.error` | Error |
| `common.success` | Éxito |
| `common.day` | día |
| `common.days` | días |

---

## Archivos modificados en esta HU

### Nuevos archivos
- `src/i18n/index.js` — configuración de i18n
- `src/i18n/locales/es.json` — traducciones español
- `src/i18n/locales/en.json` — traducciones inglés
- `src/i18n/locales/fr.json` — traducciones francés
- `src/i18n/locales/pt.json` — traducciones portugués (Portugal)
- `src/i18n/locales/br.json` — traducciones portugués (Brasil)

### Archivos modificados
| Archivo | Qué se hizo |
|---------|-------------|
| `src/main.jsx` | Importar i18n al inicio de la app |
| `src/modules/landing/LandingContext.jsx` | Llamar `i18n.changeLanguage()` al cambiar idioma |
| `src/modules/auth/components/PanelIzquierdo.jsx` | Reemplazar texto hardcodeado por `t()` |
| `src/modules/auth/hooks/useLogin.js` | Errores de validación con `t()` |
| `src/modules/auth/hooks/useRecuperar.js` | Errores de validación con `t()` |
| `src/modules/auth/hooks/useNuevaContrasena.js` | REGLAS y errores con `t()` |
| `src/modules/auth/hooks/useRegistroSocial.js` | Errores de Google/Facebook con `t()` |
| `src/modules/auth/pages/LoginPage.jsx` | Textos con `t()` |
| `src/modules/auth/pages/RegistroPage.jsx` | Textos con `t()` |
| `src/modules/auth/pages/RecuperarContrasenaPage.jsx` | Panel izquierdo y textos de éxito con `t()` |
| `src/modules/auth/pages/NuevaContrasenaPage.jsx` | Textos con `t()` |
| `src/modules/auth/pages/Verificar2FAPage.jsx` | Panel izquierdo y countdown con `t()` |
| `src/modules/catalog/hooks/useCatalogo.js` | Errores de búsqueda con `t()` |
| `src/modules/catalog/hooks/useFavoritos.js` | Mensajes con `t()` |
| `src/modules/catalog/components/TarjetaVehiculo.jsx` | Características, seguros, transmisión y combustible con mapeo de traducción |
| `src/modules/catalog/components/FiltrosCatalogo.jsx` | Filtros con `t()` |
| `src/modules/catalog/components/detalle/InfoVehiculo.jsx` | Transmisión y combustible con mapeo |
| `src/modules/catalog/components/detalle/DatosPersonales.jsx` | Labels sin uppercase, textos con `t()` |
| `src/modules/catalog/components/detalle/ResumenLateral.jsx` | Fechas con `Intl.DateTimeFormat` |
| `src/modules/catalog/components/detalle/PlanesProteccion.jsx` | Textos con `t()` |
| `src/modules/catalog/components/detalle/GaleriaImagenes.jsx` | Textos con `t()` |
| `src/modules/catalog/pages/CatalogoPage.jsx` | Textos con `t()` |
| `src/modules/catalog/pages/VehiculoDetallePage.jsx` | Textos y errores con `t()` |
| `src/modules/catalog/pages/SucursalesPage.jsx` | Textos con `t()` |
| `src/modules/reservations/pages/ReservasPage.jsx` | Textos con `t()` |
| `src/modules/payments/pages/PagosPage.jsx` | Textos con `t()` |
| `src/modules/contracts/pages/ContratosPage.jsx` | Textos con `t()` |
| `src/modules/profile/hooks/usePerfil.js` | Errores de validación con `t()` |
| `src/modules/profile/hooks/useCambiarContrasena.js` | REGLAS y errores con `t()` |
| `src/modules/profile/pages/PerfilPage.jsx` | Labels sin uppercase, textos con `t()` |
| `src/modules/admin/pages/AdminPage.jsx` | Textos con `t()` |

---

## Correcciones de estilo visual aplicadas en esta HU

### Labels en MAYÚSCULAS → solo primera letra en mayúscula

Se detectó que varios formularios tenían los labels escritos en MAYÚSCULAS sostenidas usando `textTransform: 'uppercase'` en el CSS. Esto da la sensación visual de que se está "gritando" y no es buena práctica de UX.

**Archivos corregidos:**

| Archivo | Qué se cambió |
|---------|---------------|
| `src/modules/profile/pages/PerfilPage.jsx` | Quitado `textTransform: 'uppercase'` del estilo `lbl` (línea ~135) |
| `src/modules/catalog/components/detalle/DatosPersonales.jsx` | Quitado `textTransform: 'uppercase'` del estilo `lbl` (línea ~90) |

**Cómo quedó:**

```js
// ❌ ANTES — labels en mayúscula sostenida
const lbl = {
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',   // ← esto hacía que dijera "NOMBRE", "APELLIDO"
  letterSpacing: '0.06em',
}

// ✅ DESPUÉS — primera letra mayúscula, el resto normal
const lbl = {
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.04em',      // ← sin uppercase, se ve "Nombre", "Apellido"
}
```

**Regla para las compañeras:** Si van a crear un formulario nuevo, **NO usar `textTransform: 'uppercase'`** en los labels. Los títulos de sección o badges sí pueden tenerlo, pero los labels de campos (nombre, correo, teléfono, etc.) deben ir en capitalización normal.

---

## Problema frecuente: datos de la API en español

Varios campos del vehículo como `transmision` y `combustible` vienen del backend en español (`"Automática"`, `"Gasolina"`, etc.). Para traducirlos se creó un patrón de mapeo en `TarjetaVehiculo.jsx` e `InfoVehiculo.jsx`:

```js
// Mapas de traducción para valores de la API
const TRANS_KEYS = {
  'Automática': 'catalogo.transAuto',
  'Manual':     'catalogo.transManual',
}
const FUEL_KEYS = {
  'Gasolina':  'catalogo.fuelGas',
  'Diesel':    'catalogo.fuelDiesel',
  'Híbrido':   'catalogo.fuelHybrid',
  'Eléctrico': 'catalogo.fuelElec',
}
const SEGURO_KEYS = {
  'Protección Obligatoria': 'catalogo.basicProtection',
  'Protección Total':       'catalogo.fullProtection',
}

// Uso en el componente
const label = TRANS_KEYS[vehiculo.transmision]
  ? t(TRANS_KEYS[vehiculo.transmision])
  : vehiculo.transmision   // fallback: mostrar el valor original
```

Si el backend devuelve nuevos valores en español que se muestran al usuario, hay que agregarlos al mapa correspondiente y crear la clave en los 5 archivos JSON.

---

## Cómo probar el cambio de idioma localmente

1. Correr el proyecto: `npm run dev`
2. En la landing page, abrir el menú de configuración (ícono de configuración en la navbar)
3. Seleccionar el idioma
4. Verificar que todos los textos visibles cambien
5. Navegar por todas las pantallas para confirmar que no quede ningún texto en español

---

## Contacto

Cualquier duda sobre esta implementación, revisar este documento o preguntar a **Danna Barrios** (responsable de la HU-12).
