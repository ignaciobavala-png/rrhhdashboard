# Stack Tecnológico — PetraLabs RRHH

> **Última actualización:** Mayo 2026

---

## Framework & Runtime

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 16.2.1 | App Router, Server Components, Streaming |
| **React** | 19.2.4 | UI Library (concurrent features) |
| **TypeScript** | 5.7.2 | Strict mode habilitado |
| **pnpm** | Latest | Package manager |

---

## UI & Styling

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Shadcn UI** | Latest | Componentes base (Radix UI primitives) |
| **Tailwind CSS** | 4.2.2 | Utility-first CSS, `@theme inline` |
| **Radix UI** | Various | Primitivas accesibles (dialog, select, table, etc.) |
| **next-themes** | 1.0.0-beta.0 | Theme switching (reemplazado por provider custom) |
| **Recharts** | 2.15.4 | Gráficos (área, barras, pie, líneas) |
| **Lucide / Tabler Icons** | 3.40.0 | Iconografía (solo vía `@/components/icons`) |

---

## Estado & Data Fetching

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **TanStack Query** | 5.95.2 | Server state, caching, mutations |
| **TanStack Form** | 1.28.5 | Formularios type-safe (ver `docs/forms.md`) |
| **Zod** | 4.3.6 | Validación de esquemas |
| **nuqs** | 2.8.9 | URL state para data tables |

> **Nota:** Zustand removido (v5.0.12 estaba en deps pero no se usa). Estado global solo via TanStack Query cache.

---

## Backend & Database

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Supabase** | 2.105.4 | PostgreSQL + Auth + Storage + Realtime |
| **PostgreSQL** | 16+ | Base de datos relacional |
| **Supabase Storage** | - | Bucket `manuales` (PDF/Word/Excel, 50MB) |

---

## Autenticación & Autorización

| Estado | Detalle |
|--------|---------|
| **Auth actual** | **Sin autenticación** — Single admin, acceso libre |
| **RLS** | `USING (true)` en todas las tablas (anon accede a todo) |
| **Futuro** | Supabase Auth (planificado, ver `docs/nav-rbac.md` legacy) |
| **Removido** | Clerk (@clerk/nextjs, @clerk/themes) — limpiado mayo 2026 |

---

## Calidad & Tooling

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| **OxLint** | 1.57.0 | Linter rápido (reemplaza ESLint) |
| **Oxfmt** | 0.42.0 | Formatter (reemplaza Prettier) |
| **Husky** | 9.1.7 | Git hooks (pre-commit: format, pre-push: build) |
| **lint-staged** | 15.5.2 | Ejecuta oxfmt en staged files |

---

## Deploy & CI/CD

| Plataforma | Configuración |
|------------|---------------|
| **Vercel** | Conectado a `github.com/ignaciobavala-png/rrhhdashboard` branch `main` |
| **Auto-deploy** | Cada push a `main` dispara build + deploy |
| **Pre-push hook** | `pnpm build` local antes de push |
| **Env vars Vercel** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

---

## Comandos Principales

```bash
pnpm dev          # Desarrollo (localhost:3000)
pnpm build        # Build producción
pnpm lint         # OxLint
pnpm format       # Oxfmt --write
git push origin main  # Deploy automático Vercel
```

---

## Convenciones de Código

| Convención | Detalle |
|------------|---------|
| **Server Components** | Por defecto en `app/` |
| **Client Components** | Solo cuando hay interactividad (`use client`) |
| **Features** | Cada módulo en `src/features/<modulo>/` |
| **API Services** | `src/features/<modulo>/api/service.ts` |
| **Tipos** | `src/features/<modulo>/api/types.ts` |
| **Migraciones SQL** | `supabase/migrations/` |
| **Tema default** | `petralabs` (Indigo `#4f46e5`, Esmeralda `#10b981`) |
| **Tipografía** | Inter (sans), JetBrains Mono (mono) |
| **Iconos** | Solo desde `@/components/icons` |
| **Undo Toast** | 10s, `showUndoToast()` de `@/lib/undo-toast.ts` |
| **ConfirmDialog** | Eliminaciones usan `@/components/ui/confirm-dialog.tsx` |

---

## Archivos de Configuración Clave

| Archivo | Propósito |
|---------|-----------|
| `next.config.ts` | Config Next.js (redirects, images, transpilePackages) |
| `src/lib/supabase.ts` | Cliente Supabase compartido (browser) |
| `src/lib/undo-toast.ts` | Helper `showUndoToast()` |
| `src/lib/theme-context.tsx` | Theme provider custom (reemplaza next-themes) |
| `src/components/ui/confirm-dialog.tsx` | Dialog confirmación eliminaciones |
| `src/config/nav-config.ts` | Navegación lateral (`navGroups`) |
| `src/hooks/use-data-table.ts` | Hook DataTable con URL state (nuqs) |
| `components.json` | Config Shadcn UI |

---

## Variables de Entorno Requeridas

```env
# .env.local (solo estas 2 son obligatorias en producción)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> Ver `env.example.txt` para lista completa (incluye vars legacy de Clerk).