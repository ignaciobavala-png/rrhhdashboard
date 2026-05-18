# AGENTS.md — PetraLabs RRHH

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript strict
- **UI**: Shadcn UI + Tailwind CSS v4
- **Estado**: TanStack Query v5 (sin Zustand — removido)
- **Auth**: Sin autenticación. Un solo admin. RLS con `USING (true)` en todas las tablas.
- **DB**: Supabase PostgreSQL + Storage — **conectado y funcionando**
- **Package**: pnpm
- **Linting**: OxLint + Oxfmt (0 errores, 0 warnings en producción)
- **Deploy**: Vercel (conectado a `main` en GitHub)

## Convenciones

- Server Components por defecto, Client Components solo cuando hay interactividad
- Cada módulo en `src/features/<modulo>/`
- API services en `src/features/<modulo>/api/service.ts`
- Tipos en `src/features/<modulo>/api/types.ts`
- Migraciones SQL en `supabase/migrations/`
- Tema por defecto: `petralabs` (Indigo `#4f46e5` primario, Esmeralda `#10b981` acento)
- Tipografía: Inter (sans), JetBrains Mono (mono)
- Sin testing, sin Docker
- **Undo toast**: toda acción destructiva/creativa usa `showUndoToast()` de `src/lib/undo-toast.ts` (10 segundos)
- **ConfirmDialog**: toda eliminación usa `src/components/ui/confirm-dialog.tsx` (nunca `confirm()` nativo)
- Iconos: solo desde `@/components/icons`, nunca directo de `@tabler/icons-react`

## Comandos

```bash
pnpm dev          # Desarrollo (localhost:3000)
pnpm build        # Build producción
pnpm lint         # OxLint
git push origin main  # Dispara deploy automático en Vercel
```

## Estado Actual (Mayo 2026)

Proyecto en producción en Vercel. Todos los módulos principales conectados a Supabase con datos reales.
Sin autenticación — acceso libre al admin (single-tenant, un solo usuario admin).

## Módulos

| Ruta | Módulo | Estado |
|------|--------|--------|
| `/dashboard/overview` | Resumen RRHH | ✅ Datos reales — KPIs + evolución masa salarial + próximos eventos + empleados por equipo + saldo vacaciones |
| `/dashboard/people` | Legajo | ✅ Supabase — tabla con edición inline, empleados reales |
| `/dashboard/people/[id]` | Detalle Empleado | ✅ Supabase — datos personales + laborales + modalidad + puesto |
| `/dashboard/people/new` | Nuevo Empleado | ✅ Form completo |
| `/dashboard/people/reuniones` | Reuniones | ✅ Supabase — tabla + minutas + notas con undo toast |
| `/dashboard/people/manuales` | Manuales | ✅ Supabase Storage — uploader drag & drop + descarga + eliminar |
| `/dashboard/calendario` | Calendario | ✅ Supabase — RPC + eventos + vacaciones + cumpleaños |
| `/dashboard/flota/celulares` | Flota Celulares | ✅ Supabase — join a empleados |
| `/dashboard/flota/laptops` | Flota Laptops | ✅ Supabase — CRUD completo con undo toast |
| `/dashboard/payroll` | Sueldos | ✅ Supabase — accordion pesos/USD + bonos anuales |
| `/dashboard/notifications` | Notificaciones | ✅ Supabase — historial por triggers DB + próximos eventos (5 días) |
| `/dashboard/documents` | Expediente Digital | 🔲 Placeholder |
| `/dashboard/operations` | Control Operativo | 🔲 Placeholder |

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
| `20260518_00001_fix_reuniones_rls.sql` | May 18 | Fix RLS reuniones para writes del cliente anon |
| `20260518_00002_manuales_storage.sql` | May 18 | Bucket `manuales` en Storage + RLS + columnas storage_path/nombre_archivo/tamanio/tipo_archivo |
| `flota_laptops_table` | May 18 | Tabla `flota_laptops` con FK, check constraint, RLS, indexes |
| `flota_laptops_add_detail_columns` | May 18 | Columnas: usuario, equipo, ubicacion, comentarios |
| `notificaciones_tabla_y_triggers` | May 18 | Tabla `notificaciones` + función `log_change()` + 6 AFTER triggers (empleados, puestos, reuniones, manuales, flota_laptops, lineas_moviles) |

### Tablas

| Tabla | Propósito |
|-------|-----------|
| `empresas` | Tenant multi-empresa |
| `empleados` | Datos personales + laborales |
| `puestos` | Cargo/puesto por empleado (upsert desde legajo) |
| `home_office_semanal` | Modalidad semanal (Lu-Vi) |
| `vacaciones` | Saldos vacacionales por año |
| `vacaciones_dias` | Detalle mensual de días usados |
| `lineas_moviles` | Flota de celulares |
| `flota_laptops` | Flota de laptops (marca, modelo, serie, usuario, equipo, ubicación, estado) |
| `sueldos` | Historial salarial mensual + bono_anual (PESOS ARG y USD) |
| `manuales` | Manuales por área (con storage_path a bucket Supabase) |
| `reuniones` | Minutas de reuniones (título, fecha, hora, asistentes, resumen) |
| `notificaciones` | Log de actividad generado por triggers DB (leida, entidad, accion, descripcion) |

### RLS

Todas las tablas tienen RLS con `USING (true)` — sin auth, acceso libre desde el cliente anon.

### Storage

- Bucket `manuales` — archivos PDF/Word/Excel, límite 50 MB, público via signed URL
- Descargar: `getDownloadUrl(storage_path)` en `src/features/manuales/api/service.ts`

### Triggers de Actividad

La función `log_change()` (SECURITY DEFINER) registra automáticamente en `notificaciones` cualquier INSERT/UPDATE/DELETE en: `empleados`, `puestos`, `reuniones`, `manuales`, `flota_laptops`, `lineas_moviles`.

## Patrones Clave

### Undo Toast
```ts
import { showUndoToast } from '@/lib/undo-toast';

showUndoToast('Descripción acción', async () => {
  await revertirCambio();
  queryClient.invalidateQueries({ queryKey: ['...'] });
});
```

### Confirm Dialog (eliminaciones)
```tsx
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

<ConfirmDialog
  open={open} onOpenChange={setOpen}
  title='¿Eliminar X?' description='...'
  confirmLabel='Eliminar' destructive
  onConfirm={handleDelete} loading={loading}
/>
```

### Flujo estándar mutación
```ts
// 1. Guardar estado previo
const saved = { ...row.original };
// 2. Ejecutar acción
await deleteX(id);
// 3. Invalidar query
queryClient.invalidateQueries({ queryKey: ['modulo'] });
// 4. Undo toast con restauración
showUndoToast('X eliminado', async () => {
  await createX(saved);
  queryClient.invalidateQueries({ queryKey: ['modulo'] });
});
```

## Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `src/lib/supabase.ts` | Cliente Supabase compartido (browser) |
| `src/lib/undo-toast.ts` | Helper showUndoToast (10s, botón ↩ Deshacer) |
| `src/lib/theme-context.tsx` | Theme provider custom |
| `src/components/ui/confirm-dialog.tsx` | Dialog de confirmación para eliminaciones |
| `src/config/nav-config.ts` | Configuración de navegación lateral |
| `src/hooks/use-data-table.ts` | Hook data-table con URL state vía nuqs |

## Resumen / Overview — Widgets Implementados

| Slot | Componente | Datos |
|------|-----------|-------|
| KPI x4 | `layout.tsx` (server) | Empleados activos, Flota asignada (líneas+laptops), Masa ARS (último mes + delta %), Masa USD |
| `@bar_stats` | `masa-salarial-chart.tsx` | Evolución masa salarial ARS — área chart, últimos 6 meses |
| `@sales` | `proximos-eventos.tsx` | Reuniones + cumpleaños próximos 14 días, badge urgente si ≤1 día |
| `@area_stats` | `bar-graph.tsx` | Empleados por equipo — barras activos/inactivos |
| Inline | `vacaciones-ranking.tsx` | Lista todos activos con barra progreso y días, colores por criticidad |

## Cleanup Realizado en Esta Sesión

- **Removidos**: `@clerk/nextjs`, `@clerk/themes`, `@sentry/nextjs` de package.json y pnpm-lock.yaml
- **Eliminados**: `src/proxy.ts` (clerkMiddleware), `src/app/auth/`, `src/features/auth/`
- **Limpiados**: `src/instrumentation.ts`, `src/instrumentation-client.ts` (eliminado), `src/app/global-error.tsx`
- **next.config.ts**: eliminado `withSentryConfig` y hostnames de Clerk
- **Variables de entorno**: solo `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` necesarias

## Deploy Vercel

- Repo: `github.com/ignaciobavala-png/rrhhdashboard` (branch `main`)
- Variables de entorno en Vercel: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Cada push a `main` dispara deploy automático
- Pre-push hook local corre `pnpm build` antes de pushear

## Issues Conocidos / Pendientes

- Sin autenticación — accesible a cualquiera con la URL (pendiente Supabase Auth)
- Módulos `documents` y `operations` son placeholders sin funcionalidad
- API routes `/api/products` y `/api/users` son legacy del starter (no se usan)
- Archivos `src/constants/mock-api-*.ts` son legacy muertos

## Integración Google Calendar / Gmail (pendiente, no implementada)

Para enviar invitaciones automáticas al crear reuniones:
1. Google Cloud Console: habilitar Gmail API + Calendar API, crear OAuth 2.0 credentials
2. El cliente (PetraLabs) crea el proyecto y provee `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
3. Implementar OAuth flow en `/api/google/callback`, guardar `refresh_token` en Supabase
4. Al crear reunión: llamar Gmail API (envía email .ics) + Calendar API (crea evento con asistentes)

## Contexto Adicional

Proyecto iniciado: 2026-05-08. Basado en next-shadcn-dashboard-starter.
Desarrollador: Ignacio Bavala (ignaciobavala@gmail.com).
Primer deploy a Vercel: 2026-05-18.
