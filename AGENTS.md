# AGENTS.md — PetraLabs RRHH

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript strict
- **UI**: Shadcn UI + Tailwind CSS v4
- **Estado**: Zustand v5 + TanStack Query v5
- **Auth**: Suprimida para desarrollo. Pendiente migrar a **Supabase Auth**.
- **DB**: Supabase PostgreSQL + RLS — **conectado y funcionando**
- **Package**: pnpm
- **Linting**: OxLint + Oxfmt

## Convenciones

- Server Components por defecto, Client Components solo cuando hay interactividad
- Cada módulo en `src/features/<modulo>/`
- API services en `src/features/<modulo>/api/service.ts`
- Tipos en `src/features/<modulo>/api/types.ts`
- Migraciones SQL en `supabase/migrations/`
- Tema por defecto: `petralabs` (Indigo `#4f46e5` primario, Esmeralda `#10b981` acento)
- Tema implementado via `src/lib/theme-context.tsx` (custom, reemplaza next-themes)
- Tipografía: Inter (sans), JetBrains Mono (mono)
- Sin testing, sin Docker

## Comandos

```bash
pnpm dev          # Desarrollo (localhost:3000, sin auth)
pnpm build        # Build producción
pnpm lint         # OxLint
```

## Estado Actual (Mayo 2026)

Fase de datos reales. Todos los módulos principales conectados a Supabase.
No requiere autenticación para desarrollo. RLS activo con `empresa_id`.

## Módulos

| Ruta | Módulo | Estado |
|------|--------|--------|
| `/dashboard/overview` | Resumen RRHH | Supabase — KPIs + 4 gráficos Recharts |
| `/dashboard/legajo` | Legajo | Supabase — tabla con edición inline, 50 empleados reales |
| `/dashboard/legajo/[id]` | Detalle Empleado | Supabase — datos personales + laborales + modalidad + puesto |
| `/dashboard/calendario` | Calendario | Supabase — RPC + eventos reales + vacaciones + cumpleaños |
| `/dashboard/talent` | Gestión de Talento | Placeholder — solo UI estática |
| `/dashboard/talent/new` | Nuevo Empleado | Placeholder |
| `/dashboard/talent/[id]` | Perfil de Empleado | Placeholder |
| `/dashboard/reuniones` | Reuniones | Supabase — tabla con minutas reales |
| `/dashboard/manuales` | Manuales | Supabase — tabla con manuales reales |
| `/dashboard/flota` | Flota Celulares | Supabase — tabla con join a empleados |
| `/dashboard/documents` | Expediente Digital | Placeholder |
| `/dashboard/operations` | Control Operativo | Placeholder |
| `/dashboard/payroll` | Sueldos | Supabase — accordion pesos/USD + bonos anuales |
| `/dashboard/admin` | Admin Center | Placeholder |
| `/dashboard/profile` | Perfil de Usuario | Placeholder |
| `/dashboard/notifications` | Notificaciones | Zustand en memoria (sin persistencia) |

## Base de Datos

### Migraciones aplicadas

| Archivo | Fecha | Contenido |
|---------|-------|-----------|
| `20260510_00001_schema_inicial.sql` | May 10 | Esquema base: empresas, empleados, HO, vacaciones, sueldos, etc. |
| `20260515_00001_eventos_calendario.sql` | May 15 | RPCs para eventos del calendario |
| `20260515_00002_actualizar_movilidad.sql` | May 15 | Ajuste columna movilidad en empleados |
| `20260515_00003_crear_tabla_puestos.sql` | May 15 | Tabla `puestos` con datos de cargo |
| `20260515_00004_cargar_bonos.sql` | May 15 | Columna `bono_anual` en sueldos |
| `20260515_00005_arreglar_rls_puestos.sql` | May 15 | RLS para tabla puestos |

### Tablas

| Tabla | Origen Excel | Propósito |
|-------|-------------|-----------|
| `empresas` | — | Tenant multi-empresa |
| `empleados` | `Legajo Colaboradores.xlsx` — Legajo | Datos personales + laborales |
| `puestos` | — | Cargo/puesto por empleado (upsert desde legajo) |
| `home_office_semanal` | `Legajo Colaboradores.xlsx` — HO | Modalidad semanal (Lu-Vi) |
| `vacaciones` | `Legajo Colaboradores.xlsx` — Vacaciones 2025 | Saldos vacacionales |
| `vacaciones_dias` | — | Detalle mensual de días usados |
| `lineas_moviles` | `Legajo Colaboradores.xlsx` — Lineas Móviles | Flota de celulares |
| `sueldos` | `💰Sueldos Contexto.xlsx` | Historial salarial mensual + bono_anual |
| `manuales` | `Listado de Manuales por Area.xlsx` | Manuales por área |
| `reuniones` | — | Minutas de reuniones |

### RLS

Todas las tablas tienen RLS habilitado con aislamiento por `empresa_id`. El tenant se define via `app.empresa_id` en la sesión.

### Datos Raw

Los archivos Excel originales están en `data-raw/`. Los archivos `src/constants/mock-api-*.ts` son legacy y no se usan (quedan como referencia histórica).

## Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `src/lib/supabase.ts` | Cliente Supabase compartido (browser) |
| `src/lib/theme-context.tsx` | Theme provider custom (reemplaza next-themes) |
| `src/lib/query-client.ts` | TanStack Query client factory |
| `src/hooks/use-data-table.ts` | Hook data-table con URL state vía nuqs |

## Cleanup Realizado

- Eliminados: Workspaces, Billing, Products, Users, Chat, Kanban, Forms, Elements, React Query demo, About, Privacy, Terms
- ClerkProvider removido del layout (ya no hay cartel de keyless mode)
- `scripts/cleanup.js` y `scripts/postinstall.js` eliminados
- `next-themes` reemplazado por `src/lib/theme-context.tsx` (custom, sin dependencia extra)
- Navegación reorganizada: Gestión de Personas + Administración + Configuración
- Dashboard con métricas en español (empleados, ausentes, vacaciones, masa salarial)
- Ícono de GitHub en navbar removido
- Tema `petralabs` como default
- Todos los módulos principales migrados de mock data a Supabase

## Issues Conocidos

- `@clerk/nextjs` y `@clerk/themes` están en `package.json` como dependencias no usadas. Se pueden eliminar con `pnpm remove @clerk/nextjs @clerk/themes`.
- API routes `/api/products` y `/api/users` son heredadas del starter y no se usan.
- `features/overview/components/overview.tsx` existe pero no es importado (código muerto del starter).
- Sin autenticación — accesible a cualquiera en desarrollo.
- Archivos `src/constants/mock-api-*.ts` son legacy muertos (6 archivos sin imports).
- Módulos Talent, Documents, Operations, Admin, Profile siguen como placeholders.

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
