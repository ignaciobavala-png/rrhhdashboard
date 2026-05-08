# PetraLabs RRHH

Sistema de Gestión de Recursos Humanos multi-empresa.

Construido sobre [next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter).

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript strict |
| UI | Shadcn UI + Tailwind CSS v4 |
| Estado | Zustand v5 |
| Auth | Clerk (por ahora) → **Supabase Auth** (pendiente) |
| DB | Supabase PostgreSQL + RLS + Storage |
| Deploy | Vercel |
| Package | pnpm |
| Linting | OxLint + Oxfmt |

## Módulos

| Ruta | Módulo | Estado |
|------|--------|--------|
| `/dashboard/talent` | Gestión de Talento | Placeholder |
| `/dashboard/documents` | Expediente Digital | Placeholder |
| `/dashboard/operations` | Control Operativo | Placeholder |
| `/dashboard/payroll` | Salarios | Placeholder |
| `/dashboard/admin` | Admin Center | Placeholder |

## Desarrollo

```bash
pnpm install
pnpm dev
# Abrir http://localhost:3000
```

Sin autenticación requerida en desarrollo.

## Migración Pendiente: Clerk → Supabase Auth

El proyecto arrancó con Clerk (heredado del starter). Para producción se migrará a Supabase Auth con login clásico de usuario y contraseña.

### Por qué

- Clerk es un SaaS de auth genérico con login social (Google, GitHub, etc.)
- Para RRHH interno de empresas, la experiencia debe ser tipo intranet: usuario + contraseña, sin branding de terceros
- Supabase Auth provee email/contraseña, sesiones, y se integra naturalmente con el RLS

### Plan de migración

1. Eliminar dependencias de Clerk (`@clerk/nextjs`, `@clerk/themes`)
2. Instalar `@supabase/ssr` + `@supabase/supabase-js`
3. Crear helpers de Supabase (`client.ts`, `server.ts`, `middleware.ts`)
4. Migrar `proxy.ts` de `clerkMiddleware` a Supabase middleware
5. Crear login page custom — email + contraseña, UI con Shadcn, sin logos externos
6. Migraciones SQL: `empresas`, `miembros`, `perfiles`, RLS policies
7. Reemplazar hooks: `useUser()` → hook propio, `useOrganization()` → `useEmpresa()`
8. OrgSwitcher → selector de empresas desde tabla `miembros`
9. Actualizar sidebar, user-nav y todos los componentes que usan Clerk

### Diseño del login

```
┌─────────────────────┐
│  PetraLabs RRHH     │
│                     │
│  Usuario            │
│  [                ] │
│  Contraseña         │
│  [                ] │
│                     │
│  [ Iniciar Sesión ] │
│                     │
│  ¿Olvidaste tu      │
│  contraseña?        │
└─────────────────────┘
```

Sin Google, GitHub, Clerk ni ningún branding externo.
