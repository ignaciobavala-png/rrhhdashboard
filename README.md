# PetraLabs RRHH — Dashboard de Gestión de Recursos Humanos

Sistema interno de RRHH construido sobre [next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter).

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript strict |
| UI | Shadcn UI + Tailwind CSS v4 |
| Data fetching | TanStack Query v5 (React Query) |
| Forms | TanStack Form + Zod |
| URL state | nuqs |
| DB | Supabase PostgreSQL + RLS |
| Package manager | pnpm |

## Módulos

| Ruta | Módulo | Estado |
|------|--------|--------|
| `/dashboard/overview` | Dashboard RRHH | ✅ Funcional — métricas, gráficos, actividad |
| `/dashboard/legajo` | Legajos de Empleados | ✅ Funcional — tabla con filtros, búsqueda, exportación |
| `/dashboard/legajo/[id]` | Perfil de Empleado | ✅ Funcional — datos personales, sueldo, contacto emergencia |
| `/dashboard/flota` | Flota / Líneas Móviles | ✅ Funcional — líneas asignadas, estado, operador |
| `/dashboard/manuales` | Manuales de Procedimientos | ✅ Funcional — listado por área, acceso por rol |
| `/dashboard/calendario` | Calendario de Eventos | ✅ Funcional — días de estudio, ausencias, mudanza |
| `/dashboard/reuniones` | Reuniones | ✅ Funcional — agenda de reuniones |
| `/dashboard/payroll` | Salarios | ✅ Funcional — historial de sueldos por empleado |
| `/dashboard/talent` | Gestión de Talento | 🔧 Placeholder |
| `/dashboard/documents` | Expediente Digital | 🔧 Placeholder |
| `/dashboard/operations` | Control Operativo | 🔧 Placeholder |
| `/dashboard/admin` | Admin Center | 🔧 Placeholder |

## Base de datos (Supabase)

| Tabla | Descripción | Filas |
|-------|-------------|-------|
| `empresas` | Empresa(s) registradas | 1 |
| `empleados` | Datos de empleados | 22 |
| `sueldos` | Historial de salarios | 263 |
| `vacaciones` | Períodos de vacaciones | 23 |
| `vacaciones_dias` | Días puntuales de vacaciones | 36 |
| `home_office_semanal` | Agenda de modalidad semanal | 55 |
| `lineas_moviles` | Líneas móviles de la flota | 7 |
| `manuales` | Manuales por área | 50 |
| `eventos_calendario` | Eventos del calendario | 9 |
| `puestos` | Cargos/puestos disponibles | 17 |
| `reuniones` | Registro de reuniones | — |

## Desarrollo

```bash
pnpm install
pnpm dev
# Abrir http://localhost:3000
```

Requiere un archivo `.env.local` con:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Sin autenticación. Acceso directo al dashboard.

## Estructura del Proyecto

```
src/
├── app/
│   └── dashboard/           # Rutas del dashboard (App Router)
├── components/
│   ├── layout/              # Sidebar, header, providers
│   ├── themes/              # Sistema de temas (petralabs default)
│   └── ui/                  # Shadcn UI primitives + TanStack Form wrappers
├── features/
│   ├── overview/            # Dashboard principal
│   ├── legajo/              # Legajos de empleados
│   ├── flota/               # Flota / líneas móviles
│   ├── manuales/            # Manuales de procedimientos
│   ├── calendario/          # Calendario de eventos
│   ├── reuniones/           # Reuniones
│   └── payroll/             # Salarios
├── lib/
│   └── supabase.ts          # Cliente Supabase
└── scripts/
    └── audit.py             # Auditoría de datos DB vs Excel
```

## Licencia

MIT — basado en [next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter) por Kiranism.
