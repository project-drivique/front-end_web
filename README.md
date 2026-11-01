# Drivique — Plataforma Web de Alquiler de Vehículos

Proyecto formativo SENA | Ficha 3145555  
Tecnólogo en Análisis y Desarrollo de Software

---

## Descripción del Proyecto
**Drivique** es una plataforma web moderna, segura y de alto rendimiento diseñada para la gestión integral del alquiler de vehículos. Ofrece experiencias optimizadas tanto para clientes (catálogo interactivo, cotizaciones en tiempo real, reserva paso a paso, firma digital de contratos y pasarela de pago Wompi firmada en el servidor) como para administradores y encargados de sucursal (panel operativo en tiempo real, control de entregas/devoluciones, gestión de flota, reportes financieros y auditoría).

* **Despliegue Web en Producción (Hostinger):** `https://drivique.tech`
* **API Backend en Producción:** `https://drivique.tech/api/v1` (Healthcheck: `https://drivique.tech/api/actuator/health`)

---

## Stack Tecnológico
* **Core:** [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
* **Enrutamiento y Rendimiento:** [React Router 7](https://reactrouter.com/) con *Code Splitting* y *Lazy Loading* (`React.lazy` + `Suspense`)
* **Gestión de Estado Global:** [Zustand 5](https://zustand-demo.pmnd.rs/)
* **Peticiones HTTP & Asincronía:** Axios + `@tanstack/react-query`
* **Pruebas Automatizadas:** Vitest (flujos de autenticación, reservas e iniciación de pago con Wompi)
* **Estilizado & Diseño:** CSS3 Modular con variables/tokens, Tailwind CSS y diseño adaptable (*Responsive & Dark Mode*)
* **Internacionalización (i18n):** `react-i18next` + `i18next` en 5 idiomas soportados (`es` Español, `en` Inglés, `fr` Francés, `pt` Portugués, `br` Portugués Brasileño)
* **Visualización de Datos:** Recharts + Gráficos SVG nativos
* **Alertas & Feedback:** SweetAlert2 & Feedback toast accesible
* **Iconografía:** `react-icons/fa` (FontAwesome Icons)

---

## Variables de Entorno Obligatorias

La aplicación exige la configuración explícita de la URL base del API mediante variables de entorno (validada en [`src/config/apiConfig.js`](file:///web-drivique/src/config/apiConfig.js)):

| Variable | Obligatoria | Descripción | Ejemplo |
| --- | :---: | --- | --- |
| `VITE_API_URL` | **Sí** | URL base del API REST de Drivique (`/api/v1`). Si no se define, la aplicación detiene el arranque con error descriptivo. | `https://drivique.tech/api/v1` (producción) o `http://localhost:8080/api/v1` (local) |
| `VITE_GOOGLE_CLIENT_ID` | No | Client ID público de Google OAuth 2.0. | `18960724578-...apps.googleusercontent.com` |
| `VITE_FACEBOOK_APP_ID` | No | App ID público de Facebook Login. | `1072551762252390` |

> **Seguridad de Pagos (Wompi):** El frontend **nunca** almacena ni utiliza `integrityKey`. Para iniciar un pago, el cliente invoca `POST /v1/payments/wompi/initiate` en el backend, el cual registra el pago `PENDING` en `billing.payments` y retorna la firma `integritySignature` generada en el servidor.

---

## Arquitectura y Patrones de Diseño

El código sigue estrictos estándares de ingeniería de software y separación de responsabilidades (*Separation of Concerns*):

1. **Patrón Strategy (Estrategia):**
   * Implementado en [`src/modules/payments/strategies/`](file:///web-drivique/src/modules/payments/strategies/) para el procesamiento desacoplado de métodos de pago (`WompiPaymentStrategy`, `CashPaymentStrategy`), delegando la firma e iniciación del checkout al backend (`POST /v1/payments/wompi/initiate`).
2. **Patrón Factory (Fábrica):**
   * Centraliza la instanciación de procesadores de pago (`PaymentProcessorFactory`) y la generación/normalización de alertas operacionales en tiempo real (`useBranchNotifications`).
3. **Patrón Container / Presentational:**
   * Desacoplamiento entre componentes contenedores y subcomponentes modulares de menos de 500 líneas.
4. **Patrón Facade (Fachada):**
   * Interfaces unificadas en la capa de servicios (`wompiService`, `reservationsService`, `authService`, `branchCategoryService`, `vehicleManagementService`, `branchManagementService`).
5. **Seguridad en el Cliente:**
   * Sesión gestionada en `sessionStorage` (fuera de `localStorage` persistente) y renderizado libre de inyección HTML (`dangerouslySetInnerHTML`).

---

## Instalación, Configuración y Ejecución Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/project-drivique/front-end_web.git
cd front-end_web/web-drivique
```

### 2. Configurar variables de entorno (`.env`)
Copie el archivo de ejemplo y defina `VITE_API_URL` (obligatoria):
```bash
cp .env.example .env
```
Contenido mínimo de `.env`:
```env
VITE_API_URL=http://localhost:8080/api/v1
```
*(Para conectar contra el backend productivo en Hostinger use `VITE_API_URL=https://drivique.tech/api/v1`).*

### 3. Instalar dependencias
```bash
npm install
```

### 4. Ejecutar servidor de desarrollo
```bash
npm run dev
```

### 5. Ejecutar pruebas automatizadas
```bash
npm test
```

### 6. Compilar para producción
```bash
npm run build
```

---

## Gobernanza de Ramas Git

El repositorio se rige bajo el modelo de ramas controladas:
* `main` → Código de producción estable, verificado y aprobado.
* `qa` → Ambiente de pruebas, certificación y control de calidad.
* `develop` → Rama central de integración para desarrollo activo.
* `HU-*` / `feature/*` → Ramas de características o historias de usuario integradas mediante Pull Request con revisión obligatoria y CI en verde.

---

## Equipo de Desarrollo
* **Laura Vanessa Perez Perdomo**
* **Danna Valentina Barrios Penagos**
* **Emily Sharith Amezquita Saavedra**
