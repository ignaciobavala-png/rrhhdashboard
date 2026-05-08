# AGENTS.md — PetraLabs RRHH

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript strict
- **UI**: Shadcn UI + Tailwind CSS v4
- **Estado**: Zustand v5
- **Auth**: Clerk (orgs multi-tenant)
- **DB**: Supabase PostgreSQL + RLS + Storage
- **Package**: pnpm
- **Linting**: OxLint + Oxfmt

## Convenciones

- Server Components por defecto, Client Components solo cuando hay interactividad
- Cada módulo en `src/features/<modulo>/`
- Migraciones SQL en `supabase/migrations/`
- Tema por defecto: `petralabs` (Indigo primario, Esmeralda acento)
- Tipografía: Inter (sans), JetBrains Mono (mono)
- Sin testing, sin Docker

## Comandos

```bash
pnpm dev          # Desarrollo
pnpm build        # Build producción
pnpm lint         # OxLint
```

## Módulos

| Ruta | Módulo | Estado |
|------|--------|--------|
| `/dashboard/talent` | Gestión de Talento | Placeholder |
| `/dashboard/documents` | Expediente Digital | Placeholder |
| `/dashboard/operations` | Control Operativo | Placeholder |
| `/dashboard/payroll` | Nómina | Placeholder |
| `/dashboard/admin` | Admin Center | Placeholder |

## Arquitectura Multi-tenant

Clerk Organization → `organization_id` → RLS en todas las tablas de Supabase.
Cada tenant ve solo sus datos.
