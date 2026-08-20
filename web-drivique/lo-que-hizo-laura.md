# feat/responsive-themes-i18n-redesign

> **Rama anterior:** `chore/diseno-responsive-dev`
> **Rama nueva:** `feat/responsive-themes-i18n-redesign-dev`
> **Fecha de renombre:** 2026-08-17

---

## 📌 Descripción general

Esta rama concentra un conjunto amplio de mejoras transversales aplicadas a todas las pantallas del proyecto **Drivique**, incluyendo diseño responsive, soporte multilingüe (i18n), sistema de temas claro/oscuro, estandarización de zoom y rediseño de múltiples módulos.

---

## 🌐 Internacionalización (i18n) — 5 idiomas

- Soporte completo para **Español (es)**, **Inglés (en)**, **Francés (fr)**, **Portugués europeo (pt)** y **Portugués brasileño (br)**
- Traducciones aplicadas en:
  - Pantallas de **autenticación** y **verificación 2FA/correo**
  - Flujo completo de **reservas** (todas las pantallas)
  - Módulo de **perfil de usuario**
  - **Catálogo** de vehículos
- Catálogos JSON actualizados para todos los idiomas con modismos nativos en PT/BR

---

## 🎨 Temas — Claro / Oscuro

- Integración de **tema claro/oscuro** con `MenuConfiguracion` en todas las pantallas de reserva
- Personalización de **alertas globales** (SweetAlert) adaptadas al tema activo
- Selector de tema accesible desde el menú de configuración en toda la app

---

## 🔍 Zoom — Estandarización

- Estandarización de **zoom 0.9** en todas las pantallas (equivalente al zoom de catálogo)
- Consistencia visual entre módulos: catálogo, reservas, perfil, pasarela de pago, sucursales

---

## 📱 Diseño Responsive

Aplicado de forma transversal a todos los módulos:

| Módulo | Mejoras |
|---|---|
| **Catálogo** | Diseño adaptable para móvil, tablet y escritorio |
| **Detalle de vehículo** | Responsive en todos los breakpoints |
| **Reservas** | Barra de pasos, cabecera, galería de imágenes y todas las pantallas del flujo |
| **Perfil** | Tarjetas adaptables para móvil, tablet y escritorio |
| **Pasarela de pago** | Responsive completo |
| **Sucursales** | Interfaz, mapas y tarjetas responsive |
| **Autenticación / 2FA** | Pantallas de verificación adaptadas |

---

## 👤 Módulo de Perfil — Rediseño Completo

- División de información en **3 tarjetas**: Datos Personales, Datos de Contacto, Documento de Identidad
- **Botón dinámico** "Completar perfil" / "Editar perfil" con badge de estado (Incompleto / Verificado)
- **Modal de cambio de contraseña** con validaciones estrictas y alerta SweetAlert de éxito
- **Modal de Eliminar cuenta** estilo Discord con confirmación de clave
- **Alerta de confirmación** para Cerrar sesión
- Insignias de prefijos telefónicos por nacionalidad
- Insignias de siglas de tipo de documento (CC, TI, CE, PAS)
- Inputs con placeholders "Sin registrar" en modo lectura
- Iconos de FontAwesome / react-icons en etiquetas de inputs
- **Sincronización bidireccional** de datos entre Perfil y Reserva
- Banner de perfil incompleto con validaciones de frontend
- Homogeneización de estilos entre modales
- Paleta corporativa: azul real, blanco cristalino y gris pizarra Drivique

---

## 🏢 Módulo de Sucursales — Rediseño

- Rediseño completo de la interfaz de sucursales
- Nuevas tarjetas con información de cada sucursal
- Integración y rediseño de **mapas interactivos**

---

## 🔐 Autenticación — Rediseño

- Rediseño de pantallas de **verificación 2FA** y **confirmación de correo**
- Corrección de rutas de navegación
- Actualización de datos mock de usuarios de prueba

---

## 📅 Módulo de Reservas — Mejoras de Diseño

- Rediseño de **tarjetas** dentro del flujo de reserva
- Optimización de la **galería de imágenes** (pantalla 1)
- Corrección de alineación y desbordamiento de la **barra de pasos** en móviles
- Integración de **selector de tema** y `MenuConfiguracion` en todas las pantallas
- Eliminación de bloque redundante en pantalla 1

---

## 🗂️ Otros cambios técnicos

- Consolidación de fuente de usuarios en `usersMock.json` (eliminación de `registrationMock.json`)
- Eliminación de carpeta en desuso `src/data`
- Actualización de usuarios de prueba con nombres y apellidos completos

---

## 📊 Commits totales en la rama

| # | Hash | Descripción |
|---|---|---|
| 1 | `7601c87` | feat(i18n): soporte completo para 5 idiomas en autenticación y verificación |
| 2 | `4e048b8` | feat(themes): integración de temas claro/oscuro y personalización de alertas globales |
| 3 | `9ef2101` | style(zoom): estandarización de zoom 0.9 y alineación responsive de pantallas |
| 4 | `9684a60` | feat(sucursales): rediseño de interfaz, mapas y tarjetas |
| 5 | `70a4e13` | feat(ui): mejoras responsive en catálogo, detalle de vehículo, perfil y pasarela |
| 6 | `86b1da5` | feat(auth): rediseño de pantallas de verificación 2FA/correo |
| 7 | `b014a35` | feat(i18n): traducción completa en pt y br de catálogo, alertas y ver detalles |
| 8 | `26547c0` | clean: eliminar carpeta en desuso src/data |
| 9 | `553b8db` | clean: consolidar fuente de usuarios en usersMock.json |
| 10 | `f10e004` | fix(mocks): actualizar usuarios de prueba con nombres completos |
| 11 | `fc7a2d5` | feat(perfil): banner de perfil incompleto, campos y validaciones estrictas |
| 12 | `7503dad` | feat(perfil): sincronización bidireccional entre Perfil y Reserva |
| 13–62 | `...` | Rediseño iterativo completo del módulo de Perfil y Reservas |

---

## 🔗 Referencias

- **Repositorio:** [project-drivique/front-end_web](https://github.com/project-drivique/front-end_web)
- **PR sugerido (develop ← feat):** [Crear Pull Request en GitHub](https://github.com/project-drivique/front-end_web/compare/develop...feat/responsive-themes-i18n-redesign-dev)
