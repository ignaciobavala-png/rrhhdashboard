# Estructura del Proyecto — PetraLabs RRHH

> **Última actualización:** Mayo 2026

---

## Árbol de Directorios (Resumen)

```
RRHH/
├── .agents/                    # Configuración de agentes (opencode)
├── .claude/                    # Configuración Claude Code
├── .github/                    # GitHub workflows
├── .husky/                     # Git hooks (pre-commit, pre-push)
├── .next/                      # Build output (gitignored)
├── docs/                       # 📁 Documentación (esta carpeta)
├── node_modules/               # Dependencias (gitignored)
├── public/                     # Assets estáticos
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Rutas protegidas /dashboard/*
│   │   │   ├── overview/       # Resumen RRHH
│   │   │   ├── legajo/         # Legajo (listado + detalle)
│   │   │   ├── people/         # People (nuevo, detalle, sub-módulos)
│   │   │   ├── calendario/     # Calendario eventos
│   │   │   ├── payroll/        # Sueldos
│   │   │   ├── flota/          # Flota (celulares + laptops)
│   │   │   ├── notifications/  # Notificaciones
│   │   │   ├── documents/      # Expedientes (placeholder)
│   │   │   ├── operations/     # Operaciones (placeholder)
│   │   │   └── layout.tsx      # Layout dashboard + sidebar
│   │   ├── globals.css         # Estilos globales + Tailwind v4
│   │   ├── layout.tsx          # Root layout + providers
│   │   └── page.tsx            # Redirect a /dashboard/overview
│   ├── components/
│   │   ├── ui/                 # Componentes base shadcn/Radix
│   │   ├── forms/              # Sistema formularios (TanStack Form)
│   │   ├── icons/              # Barrel de iconos (@tabler/icons-react)
│   │   └── themes/             # Theme selector, config
│   ├── features/               # 🎯 MÓDULOS DE NEGOCIO (feature-based)
│   │   ├── overview/           # Widgets resumen
│   │   ├── legajo/             # Legajo empleados
│   │   ├── people/             # People (nuevo, detalle)
│   │   ├── calendario/         # Calendario
│   │   ├── reuniones/          # Reuniones/minutas
│   │   ├── manuales/           # Manuales + Storage
│   │   ├── flota/              # Flota celulares
│   │   ├── flota-laptops/      # Flota laptops
│   │   ├── payroll/            # Sueldos
│   │   ├── notifications/      # Notificaciones + triggers
│   │   ├── documents/          # Expedientes (placeholder)
│   │   └── operations/         # Operaciones (placeholder)
│   ├── hooks/                  # Hooks compartidos
│   │   └── use-data-table.ts   # DataTable con URL state (nuqs)
│   ├── lib/                    # Utilidades core
│   │   ├── supabase.ts         # Cliente Supabase (browser)
│   │   ├── undo-toast.ts       # showUndoToast()
│   │   └── theme-context.tsx   # Theme provider custom
│   ├── config/
│   │   └── nav-config.ts       # Configuración navegación sidebar
│   ├── types/                  # Tipos globales compartidos
│   └── constants/              # Mock data legacy (no usado)
├── supabase/
│   └── migrations/             # Migraciones SQL aplicadas
├── data-raw/                   # Archivos Excel origen
├── package.json
├── pnpm-lock.yaml
├── next.config.ts
├── tsconfig.json
├── components.json             # Config Shadcn UI
├── .oxfmtrc.json               # Config Oxfmt
├── AGENTS.md                   # Instrucciones para agentes
├── CLAUDE.md                   # Instrucciones para Claude
└── README.md
```

---

## Convención: `src/features/<modulo>/`

Cada módulo de negocio sigue esta estructura **estándar**:

```
src/features/<modulo>/
├── api/
│   ├── service.ts              # Queries/mutations Supabase
│   └── types.ts                # Tipos TypeScript (z.infer de Zod)
├── components/
│   ├── <modulo>-listing.tsx    # Server Component (prefetch + HydrationBoundary)
│   ├── <modulo>-table.tsx      # Client Component (useSuspenseQuery + useDataTable)
│   ├── <modulo>-table/
│   │   └── columns.tsx         # ColumnDef + CellAction (edición inline, botones)
│   ├── <modulo>-view-page.tsx  # Detalle (opcional)
│   └── sections/               # Secciones del detalle (opcional)
│       ├── section-*.tsx
├── utils/                      # Utilidades específicas (opcional)
└── schemas/                    # Zod schemas (opcional, para formularios)
```

### Patrones de Componentes

| Componente | Tipo | Propósito |
|------------|------|-----------|
| `<modulo>-listing.tsx` | **Server Component** | Prefetch data, `HydrationBoundary`, pasa `initialData` a tabla |
| `<modulo>-table.tsx` | **Client Component** | `useSuspenseQuery`, `useDataTable`, renderiza `DataTable` |
| `<modulo>-table/columns.tsx` | **Client/Shared** | `ColumnDef[]` con `CellAction` para edición inline |
| `<modulo>-view-page.tsx` | **Server/Client** | Vista detalle empleado/entidad |

---

## Convención: `src/app/dashboard/<modulo>/`

```
src/app/dashboard/<modulo>/
├── page.tsx                    # Página principal (Server Component)
├── [id]/
│   └── page.tsx                # Detalle por ID (Server Component)
├── new/
│   └── page.tsx                # Crear nuevo (Client Component + form)
└── <sub-modulo>/
    └── page.tsx                # Sub-rutas (ej: people/reuniones, people/manuales)
```

---

## Rutas Principales (Mayo 2026)

| Ruta | Feature | Descripción |
|------|---------|-------------|
| `/dashboard/overview` | `overview` | Resumen RRHH (KPIs + 4 widgets) |
| `/dashboard/legajo` | `legajo` | Listado empleados + edición inline |
| `/dashboard/legajo/[id]` | `legajo` | Detalle empleado (datos pers/laborales) |
| `/dashboard/people` | `people` | Listado + nuevo empleado |
| `/dashboard/people/[id]` | `people` | Detalle empleado (vista alternativa) |
| `/dashboard/people/new` | `people` | Formulario nuevo empleado |
| `/dashboard/people/reuniones` | `reuniones` | Minutas reuniones |
| `/dashboard/people/manuales` | `manuales` | Manuales + Storage uploader |
| `/dashboard/calendario` | `calendario` | Calendario mensual eventos |
| `/dashboard/payroll` | `payroll` | Sueldos ARS/USD + bonos |
| `/dashboard/flota/celulares` | `flota` | Líneas móviles + join empleados |
| `/dashboard/flota/laptops` | `flota-laptops` | Laptops CRUD completo |
| `/dashboard/notifications` | `notifications` | Historial triggers + próximos 5 días |
| `/dashboard/documents` | `documents` | 🔲 Placeholder |
| `/dashboard/operations` | `operations` | 🔲 Placeholder |

---

## Archivos Compartidos Clave

### `src/lib/supabase.ts`
```typescript
// Cliente Supabase singleton para browser
import { createBrowserClient } from '@supabase/ssr'
export const supabase = createBrowserClient(url, key)
```

### `src/hooks/use-data-table.ts`
```typescript
// Hook DataTable con URL state (nuqs)
// Retorna: table, setPagination, setSorting, setFilters, etc.
```

### `src/lib/undo-toast.ts`
```typescript
// showUndoToast(description, undoFn, options?)
// 10 segundos, botón "↩ Deshacer"
```

### `src/components/ui/confirm-dialog.tsx`
```typescript
// ConfirmDialog para eliminaciones (nunca confirm() nativo)
// Props: open, onOpenChange, title, description, confirmLabel, destructive, onConfirm, loading
```

### `src/config/nav-config.ts`
```typescript
// navGroups: NavGroup[] — estructura sidebar
// label, items[{ title, url, icon, shortcut, items[] }]
```

---

## Archivos Legacy (No Usados)

```
src/constants/mock-api-*.ts       # Mock data heredado (muerto)
src/features/auth/                # Eliminado (Clerk removido)
src/app/auth/                     # Eliminado (Clerk removido)
src/proxy.ts                      # Eliminado (clerkMiddleware)
src/instrumentation*.ts           # Eliminado (Sentry removido)
```

---

## Imports Recomendados

```typescript
// Supabase client
import { supabase } from '@/lib/supabase'

// Undo toast
import { showUndoToast } from '@/lib/undo-toast'

// Confirm dialog
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

// Iconos (SIEMPRE desde barrel)
import { Icons } from '@/components/icons'
// Uso: <Icons.user className="h-4 w-4" />

// Theme
import { useTheme } from '@/lib/theme-context'

// DataTable hook
import { useDataTable } from '@/hooks/use-data-table'
```