# Documentación PetraLabs RRHH Dashboard

> **Versión:** Mayo 2026 — Next.js 16 + Supabase + Shadcn UI + TanStack Query v5

---

## Índice General

### 🏗️ Arquitectura
| Documento | Descripción |
|-----------|-------------|
| [Stack Tecnológico](./arquitectura/stack-tecnologico.md) | Framework, librerías, convenciones, comandos |
| [Estructura del Proyecto](./arquitectura/estructura-proyecto.md) | Organización de carpetas, convención `features/`, `app/dashboard/` |
| [Base de Datos](./arquitectura/base-de-datos.md) | Esquema Supabase, migraciones, RLS, Storage, triggers |
| [Patrones Clave](./arquitectura/patrones-clave.md) | Undo Toast, ConfirmDialog, flujo estándar de mutaciones |

### 📦 Features (Módulos Implementados)
| Módulo | Ruta | Documentación | Estado |
|--------|------|---------------|--------|
| **Resumen / Overview** | `/dashboard/overview` | [overview-resumen.md](./features/overview-resumen.md) | ✅ Datos reales |
| **Legajo** | `/dashboard/legajo` | [legajo.md](./features/legajo.md) | ✅ Datos reales + inline edit |
| **People** | `/dashboard/people` | [people.md](./features/people.md) | ✅ Datos reales + sub-módulos |
| **Calendario** | `/dashboard/calendario` | [calendario.md](./features/calendario.md) | ✅ Datos reales + RPCs |
| **Reuniones** | `/dashboard/people/reuniones` | [reuniones.md](./features/reuniones.md) | ✅ Datos reales |
| **Manuales** | `/dashboard/people/manuales` | [manuales.md](./features/manuales.md) | ✅ Storage + uploader |
| **Flota Celulares** | `/dashboard/flota/celulares` | [flota-celulares.md](./features/flota-celulares.md) | ✅ Join empleados |
| **Flota Laptops** | `/dashboard/flota/laptops` | [flota-laptops.md](./features/flota-laptops.md) | ✅ CRUD completo |
| **Sueldos / Payroll** | `/dashboard/payroll` | [payroll-sueldos.md](./features/payroll-sueldos.md) | ✅ ARS/USD + bonos |
| **Notificaciones** | `/dashboard/notifications` | [notificaciones.md](./features/notificaciones.md) | ✅ Triggers DB |

### 📦 Features (Placeholders)
| Módulo | Ruta | Documentación | Estado |
|--------|------|---------------|--------|
| **Expedientes** | `/dashboard/documents` | [expedientes.md](./features/expedientes.md) | 🔲 Placeholder |
| **Operaciones** | `/dashboard/operations` | [operaciones.md](./features/operaciones.md) | 🔲 Placeholder |

### 🧭 Navegación
| Documento | Descripción |
|-----------|-------------|
| [Configuración de Navegación](./navegacion/nav-config.md) | Estructura `navGroups` del sidebar |

### 📝 Formularios
| Documento | Descripción |
|-----------|-------------|
| [Sistema de Formularios](./formularios/sistema-formularios.md) | TanStack Form + shadcn/ui (ver `docs/forms.md`) |

### 🎨 Temas
| Documento | Descripción |
|-----------|-------------|
| [Sistema de Temas](./temas/sistema-temas.md) | CSS custom properties, Tailwind v4 (ver `docs/themes.md`) |

### 🔧 Mantenimiento
| Carpeta | Propósito |
|---------|-----------|
| [fixes/](./fixes/) | Registro de bugs silenciosos, workarounds, soluciones |
| [auditorias/](./auditorias/) | Reportes de auditoría de código, performance, seguridad |

---

## Documentación Legado (Mantenida como Referencia)

| Archivo | Descripción |
|---------|-------------|
| [modules.md](../modules.md) | Documentación previa de módulos (puede tener rutas desactualizadas) |
| [forms.md](../forms.md) | Sistema de formularios completo (TanStack Form) |
| [themes.md](../themes.md) | Guía completa para agregar temas |
| [nav-rbac.md](../nav-rbac.md) | Sistema RBAC deprecado (Clerk removido) |

---

## Estado del Proyecto (Mayo 2026)

- **Producción:** Vercel (deploy automático en push a `main`)
- **Base de datos:** Supabase PostgreSQL conectada, 10 tablas, RLS `USING (true)`
- **Autenticación:** Sin auth — acceso libre admin (single-tenant)
- **Testing:** Sin testing configurado
- **Linting:** OxLint + Oxfmt (0 errores, 0 warnings)

---

## Convenciones de Documentación

1. **Un archivo por feature** en `docs/features/`
2. **Estructura estándar** por feature: Datos → UI → API → Archivos → DB
3. **Carpetas `fixes/` y `auditorias/`** vacías, listas para usar
4. **Mantener archivos legacy** en raíz de `docs/` por compatibilidad