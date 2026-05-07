
# HU-00 — Estructuración del repositorio web

## ¿Qué se hizo?
Se creó la estructura base del proyecto frontend web usando React + Vite, 
siguiendo la arquitectura modular por funcionalidades definida en el documento 
de Selección de Framework del proyecto Renta Movil Location.

## Tecnología usada
- React + Vite (comando oficial: `npm create vite@latest`)
- Plantilla: `--template react`

## Estructura creada

```
web-renta-movil/
├── public/
│   └── icons/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── shared/
│   ├── modules/
│   │   ├── auth/
│   │   ├── vehicles/
│   │   ├── reservations/
│   │   ├── payments/
│   │   ├── contracts/
│   │   ├── maintenance/
│   │   ├── support/
│   │   ├── notifications/
│   │   ├── profile/
│   │   ├── admin/
│   │   └── settings/
│   ├── store/
│   ├── services/
│   ├── hooks/
│   ├── routes/
│   └── utils/
├── package.json
└── vite.config.js
```

## Dependencias instaladas

| Dependencia | Uso |
|---|---|
| `react-router-dom` | Enrutamiento entre páginas |
| `axios` | Peticiones HTTP a la API REST |
| `zustand` | Manejo de estado global |
| `tailwindcss` | Estilos |
| `@tailwindcss/vite` | Integración de Tailwind con Vite |
| `@tanstack/react-query` | Caché y sincronización de datos |
| `react-big-calendar` | Calendario de disponibilidad |

## Rama
Trabajo realizado en la rama `HU-00` desde `develop`
