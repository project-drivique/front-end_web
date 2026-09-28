# Drivique — Plataforma Web de Alquiler de Vehículos

Proyecto formativo SENA | Ficha 3145555  
Tecnólogo en Análisis y Desarrollo de Software

---

## 🚗 Descripción del Proyecto
**Drivique** es una plataforma web moderna, segura y de alto rendimiento diseñada para la gestión integral del alquiler de vehículos. Ofrece experiencias optimizadas tanto para clientes (catálogo interactivo, cotizaciones en tiempo real, reserva paso a paso, firma digital de contratos y pasarela de pago) como para administradores y encargados de sucursal (panel operativo en tiempo real, control de entregas/devoluciones, gestión de flota, reportes financieros y auditoría).

---

## 🛠️ Stack Tecnológico
* **Core:** [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
* **Enrutamiento y Rendimiento:** [React Router 7](https://reactrouter.com/) con *Code Splitting* y *Lazy Loading* (`React.lazy` + `Suspense`)
* **Gestión de Estado Global:** [Zustand 5](https://zustand-demo.pmnd.rs/)
* **Peticiones HTTP & Asincronía:** Axios + `@tanstack/react-query`
* **Estilizado & Diseño:** CSS3 Modular con variables/tokens, Tailwind CSS y diseño adaptable (*Responsive & Dark Mode*)
* **Internacionalización (i18n):** `react-i18next` + `i18next` (Español / Inglés)
* **Visualización de Datos:** Recharts + Gráficos SVG nativos
* **Alertas & Feedback:** SweetAlert2
* **Iconografía:** `react-icons/fa` (FontAwesome Icons)

---

## 🏛️ Arquitectura y Patrones de Diseño

El código sigue estrictos estándares de ingeniería de software y separación de responsabilidades (*Separation of Concerns*):

1. **Patrón Strategy (Estrategia):**
   * Implementado en [`src/modules/payments/strategies/`](file:///web-drivique/src/modules/payments/strategies/) para el procesamiento desacoplado de métodos de pago (`WompiPaymentStrategy`, `CashPaymentStrategy`), permitiendo añadir nuevas pasarelas sin alterar el flujo de checkout.
2. **Patrón Factory (Fábrica):**
   * Centraliza la instanciación de procesadores de pago (`PaymentProcessorFactory`) y la generación/normalización de alertas operacionales en tiempo real (`useBranchNotifications`).
3. **Patrón Container / Presentational:**
   * Desacoplamiento total entre componentes inteligentes encargados del estado/servicios (ej. `BranchDashboard`) y componentes presentacionales puros (ej. `BranchNotificationDrawer`).
4. **Patrón Facade (Fachada):**
   * Interfaces unificadas y limpias que ocultan la complejidad de APIs y transformaciones de datos en la capa de servicios.
5. **Patrón Error Boundary:**
   * Capturador global de excepciones en runtime (`ErrorBoundary`) para garantizar resiliencia y evitar pantallas blancas ante errores no controlados.

---

## 📁 Estructura Modular del Proyecto

```text
front-end_web/
└── web-drivique/
    ├── src/
    │   ├── components/       # Componentes transversales (ErrorBoundary, LoadingFallback, ChatBot, Modales)
    │   ├── contexts/         # Contextos globales de UI y temas
    │   ├── hooks/            # Custom Hooks de negocio y control
    │   ├── i18n/             # Configuración y diccionarios de traducción
    │   ├── mocks/            # Datos locales de prueba y configuración Sandbox
    │   ├── modules/          # Arquitectura por Dominios / Features:
    │   │   ├── admin/        # Dashboard operativo, reportes, auditoría y sucursales
    │   │   ├── auth/         # Login, registro, recuperación y 2FA
    │   │   ├── catalog/      # Catálogo de vehículos, filtros y sedes
    │   │   ├── contracts/    # Firma electrónica y previsualización de contratos
    │   │   ├── landing/      # Página principal y secciones informativas
    │   │   ├── notifications/# Centro de notificaciones de usuario y cupones
    │   │   ├── payments/     # Pasarelas de pago, estrategias y respuestas
    │   │   ├── profile/      # Perfil de usuario y edición de datos
    │   │   ├── reservations/ # Flujo de reserva (3 pasos) y gestión de alquileres
    │   │   └── support/      # Módulo de PQRS y soporte al cliente
    │   ├── routes/           # Enrutamiento con Code Splitting (AppRouter)
    │   ├── services/         # Servicios de integración con backend / API
    │   ├── store/            # Almacenamiento de estado global con Zustand
    │   ├── styles/           # Variables, temas y diseño base
    │   └── utils/            # Utilidades puras (formatos, exportación Excel/PDF, alertas)
    └── package.json
```

---

## 🌿 Gobernanza de Ramas Git

El repositorio se rige bajo el modelo de ramas controladas:
* `main` → Código de producción estable, verificado y aprobado.
* `qa` → Ambiente de pruebas, certificación y control de calidad.
* `develop` → Rama central de integración para desarrollo activo.
* `feature/*` → Ramas de características específicas desprendidas de su respectivo entorno (ej. `feature/administrador-surcursal-dev`).

---

## ⚙️ Instalación y Ejecución Local

### 1. Clonar el repositorio:
```bash
git clone https://github.com/project-drivique/front-end_web.git
cd front-end_web/web-drivique
```

### 2. Instalar dependencias:
```bash
npm install
```

### 3. Iniciar servidor de desarrollo:
```bash
npm run dev
```

### 4. Compilar para producción:
```bash
npm run build
```

---

## 👥 Equipo de Desarrollo
* **Laura Vanessa Perez Perdomo**
* **Danna Valentina Barrios Penagos**
