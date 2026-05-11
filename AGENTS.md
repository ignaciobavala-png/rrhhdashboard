# AGENTS.md — PetraLabs RRHH

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript strict
- **UI**: Shadcn UI + Tailwind CSS v4
- **Estado**: Zustand v5
- **Auth**: Suprimida para desarrollo. Pendiente migrar a **Supabase Auth**.
- **DB**: Supabase PostgreSQL + RLS + Storage (pendiente backend)
- **Package**: pnpm
- **Linting**: OxLint + Oxfmt

## Convenciones

- Server Components por defecto, Client Components solo cuando hay interactividad
- Cada módulo en `src/features/<modulo>/`
- Migraciones SQL en `supabase/migrations/` (pendiente)
- Tema por defecto: `petralabs` (Indigo `#4f46e5` primario, Esmeralda `#10b981` acento)
- Tipografía: Inter (sans), JetBrains Mono (mono)
- Sin testing, sin Docker

## Comandos

```bash
pnpm dev          # Desarrollo (localhost:3000, sin auth)
pnpm build        # Build producción
pnpm lint         # OxLint
```

## Estado Actual (Mayo 2026)

El frontend está en fase de maqueta. No requiere autenticación para desarrollo.
Todos los módulos son placeholders con diseño listo.

## Módulos

| Ruta | Módulo | Estado |
|------|--------|--------|
| `/dashboard/overview` | Resumen RRHH | Cards + gráficos Recharts |
| `/dashboard/legajo` | Legajo | Tabla + detalle empleado (50 mock) |
| `/dashboard/legajo/[id]` | Detalle Empleado | Datos personales + laborales + modalidad |
| `/dashboard/calendario` | Calendario | Calendario editable (licencias/sueldos/estudio/ausencias) |
| `/dashboard/talent` | Gestión de Talento | Evaluaciones + objetivos + KPIs |
| `/dashboard/talent/new` | Nuevo Empleado | Placeholder |
| `/dashboard/talent/[id]` | Perfil de Empleado | Placeholder |
| `/dashboard/reuniones` | Reuniones | Tabla con minutas (15 mock) |
| `/dashboard/manuales` | Manuales | Tabla con manuales (12 mock) |
| `/dashboard/flota` | Flota Celulares | Tabla con equipos (20 mock) |
| `/dashboard/documents` | Expediente Digital | Placeholder |
| `/dashboard/operations` | Control Operativo | Placeholder |
| `/dashboard/payroll` | Sueldos | Placeholder |
| `/dashboard/admin` | Admin Center | Placeholder |
| `/dashboard/profile` | Perfil de Usuario | Placeholder |
| `/dashboard/notifications` | Notificaciones | Funcional con mock data |

## Base de Datos

Migración inicial: `supabase/migrations/20260510_00001_schema_inicial.sql`

### Tablas

| Tabla | Origen Excel | Propósito |
|-------|-------------|-----------|
| `empresas` | — | Tenant multi-empresa |
| `empleados` | `Legajo Colaboradores.xlsx` — Legajo | Datos personales + laborales |
| `home_office_semanal` | `Legajo Colaboradores.xlsx` — HO | Modalidad semanal (Lu-Vi) |
| `vacaciones` | `Legajo Colaboradores.xlsx` — Vacaciones 2025 | Saldos vacacionales |
| `vacaciones_dias` | — | Detalle mensual de días usados |
| `lineas_moviles` | `Legajo Colaboradores.xlsx` — Lineas Móviles | Flota de celulares |
| `sueldos` | `💰Sueldos Contexto.xlsx` | Historial salarial mensual |
| `manuales` | `Listado de Manuales por Area.xlsx` | Manuales por área |

### RLS

Todas las tablas tienen RLS habilitado con aislamiento por `empresa_id`. El tenant se define via `app.empresa_id` en la sesión.

### Datos Raw

Los archivos Excel originales están en `data-raw/` para referencia y migración futura.

## Cleanup Realizado

- Eliminados: Workspaces, Billing, Products, Users, Chat, Kanban, Forms, Elements, React Query demo, About, Privacy, Terms
- ClerkProvider removido del layout (ya no hay cartel de keyless mode)
- Navegación reorganizada: Gestión de Personas + Administración + Configuración
- Dashboard con métricas en español (empleados, ausentes, vacaciones, masa salarial)
- Ícono de GitHub en navbar removido
- Tema `petralabs` como default

## Issues Conocidos

- `@clerk/nextjs` y `@clerk/themes` están en `package.json` como dependencias no usadas desde que se removió ClerkProvider. Se pueden eliminar con `pnpm remove @clerk/nextjs @clerk/themes`.
- API routes `/api/products` y `/api/users` son heredadas del starter y no se usan.
- `features/overview/components/overview.tsx` existe pero no es importado (es código muerto del starter).
- Sin autenticación — accesible a cualquiera en desarrollo.

## Plan de Migración Clerk → Supabase Auth

1. Eliminar `@clerk/nextjs` y `@clerk/themes` de dependencies
2. `pnpm add @supabase/ssr @supabase/supabase-js`
3. Crear `src/lib/supabase/client.ts` (browser), `server.ts` (server), `middleware.ts`
4. Migrar `proxy.ts` de `clerkMiddleware` a Supabase middleware
5. Crear login page custom en `/auth/sign-in` con Shadcn
6. Migraciones SQL: `empresas`, `miembros`, `perfiles`, RLS
7. hooks: `useUser()` → hook propio de Supabase, `useEmpresa()` para orgs
8. Auth en pages protegidas con `supabase.auth.getUser()`

## Contexto Adicional

Proyecto creado el 2026-05-08. Basado en next-shadcn-dashboard-starter.
Desarrollador: Ignacio Bavala. Stack preferido en perfil-desarrollador del vault Obsidian.
