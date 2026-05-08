# PetraLabs RRHH — SaaS de Gestión de Recursos Humanos

Sistema multi-empresa de RRHH construido sobre [next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter).

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript strict |
| UI | Shadcn UI + Tailwind CSS v4 |
| Estado | Zustand v5 |
| Auth | Suprimida para desarrollo. Pendiente migrar a **Supabase Auth**. |
| DB | Supabase PostgreSQL + RLS + Storage (pendiente backend) |
| Package | pnpm |
| Linting | OxLint + Oxfmt |

## Sistema de Diseño

- **Paleta**: Primario Indigo `#4f46e5` / Acento Esmeralda `#10b981`
- **Tipografía**: Inter (sans), JetBrains Mono (mono)
- **Modo oscuro**: Soportado nativamente con fondos grises azulados
- **White Label**: Logo y color primario configurables por tenant (pendiente)

## Módulos

| Ruta | Módulo | Estado |
|------|--------|--------|
| `/dashboard/overview` | Dashboard RRHH | Cards + gráficos funcionales |
| `/dashboard/talent` | Gestión de Talento | Placeholder |
| `/dashboard/talent/new` | Nuevo Empleado | Placeholder |
| `/dashboard/talent/[id]` | Perfil de Empleado | Placeholder |
| `/dashboard/documents` | Expediente Digital | Placeholder |
| `/dashboard/operations` | Control Operativo | Placeholder |
| `/dashboard/payroll` | Salarios | Placeholder |
| `/dashboard/admin` | Admin Center | Placeholder |
| `/dashboard/profile` | Perfil de Usuario | Placeholder |
| `/dashboard/notifications` | Notificaciones | Placeholder |

## Desarrollo

```bash
pnpm install
pnpm dev
# Abrir http://localhost:3000
```

Sin autenticación. Desarrollo directo sin login.

## Estructura del Proyecto

```
src/
├── app/
│   ├── dashboard/
│   │   ├── admin/           # Admin Center
│   │   ├── documents/       # Expediente Digital
│   │   ├── notifications/   # Notificaciones
│   │   ├── operations/      # Control Operativo
│   │   ├── overview/        # Dashboard principal (parallel routes)
│   │   ├── payroll/         # Salarios
│   │   ├── profile/         # Perfil de usuario
│   │   └── talent/          # Gestión de Talento + [id] + new
│   └── auth/                # Login/registro (placeholder)
├── components/
│   ├── layout/              # Sidebar, header, providers
│   ├── themes/              # Sistema de temas (petralabs default)
│   └── ui/                  # Shadcn UI primitives
├── features/
│   ├── admin/               # Admin Center
│   ├── auth/                # Auth pages
│   ├── documents/           # Expediente Digital
│   ├── notifications/       # Centro de notificaciones
│   ├── operations/          # Control Operativo
│   ├── overview/            # Dashboard (gráficos, actividad)
│   ├── payroll/             # Salarios
│   ├── profile/             # Perfil
│   └── talent/              # Gestión de Talento
├── config/
│   ├── nav-config.ts        # Navegación (sidebar)
│   └── infoconfig.ts        # Info sidebar
├── hooks/                   # Custom hooks
├── lib/                     # Utilidades
├── styles/
│   ├── themes/
│   │   └── petralabs.css    # Tema corporativo
│   └── globals.css
└── types/                   # TypeScript types
```

## Cleanup Realizado (vs starter original)

- [x] Eliminados módulos demo: Workspaces, Billing, Products, Users, Chat, Kanban, Forms, Elements, React Query demo
- [x] ClerkProvider removido del layout (sin cartel de keyless mode)
- [x] Sin autenticación forzada en desarrollo
- [x] Navegación en español solo con módulos RRHH
- [x] Dashboard con métricas de RRHH (empleados, ausentes, vacaciones, masa salarial)
- [x] Tema petralabs como default (Indigo/Esmeralda)
- [x] Git iniciado con 2 commits

## Pendiente para Próximo Agente

### Fase 1 — Multi-tenencia y Core DB
- [ ] Eliminar `@clerk/nextjs` y `@clerk/themes` de package.json
- [ ] Instalar `@supabase/ssr` + `@supabase/supabase-js`
- [ ] Crear `supabase/migrations/` con tablas: `empresas`, `miembros`, `perfiles`
- [ ] Configurar RLS policies en todas las tablas
- [ ] Login page custom con email + contraseña (Shadcn UI, sin branding externo)
- [ ] Hook `useEmpresa()` y selector de empresa activa

### Fase 2 — Módulos funcionales
- [ ] CRUD de empleados conectado a Supabase
- [ ] Subida de documentos a Supabase Storage
- [ ] Calendario de vacaciones y marcaje de asistencia
- [ ] Recibos de salario con PDF en Storage
- [ ] Admin Center con toggle de módulos y white label

## Licencia

MIT — basado en [next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter) por Kiranism.
