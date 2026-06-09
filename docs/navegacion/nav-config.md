# Configuración de Navegación — Sidebar

> **Última actualización:** Mayo 2026
> **Archivo:** `src/config/nav-config.ts`

---

## Estructura

La navegación se define en el array `navGroups: NavGroup[]` exportado por `src/config/nav-config.ts`.

Cada grupo tiene un `label` y un array de `items`:

```typescript
interface NavItem {
  title: string;
  url: string;
  icon: string;           // Nombre del icono en @/components/icons
  isActive: boolean;
  shortcut: [string, string];  // Atajo de teclado (kbar)
  items: NavItem[];       // Sub-items (opcional)
}

interface NavGroup {
  label: string;
  items: NavItem[];
}
```

---

## Grupos y Rutas

### Panel Principal

| Item | Ruta | Icono |
|------|------|-------|
| Resumen | `/dashboard/overview` | `dashboard` |

### Gestión de Personas

| Item | Ruta | Icono | Sub-items |
|------|------|-------|-----------|
| Legajo | `/dashboard/legajo` | `legajo` | - |
| Calendario | `/dashboard/calendario` | `calendar` | - |
| People | `/dashboard/people` | `talent` | Reuniones, Manuales |
| Sueldos | `/dashboard/payroll` | `payroll` | - |

### Administración

| Item | Ruta | Icono | Sub-items |
|------|------|-------|-----------|
| Flota | `/dashboard/flota/celulares` | `mobile` | Celulares, Laptops |
| Expedientes | `/dashboard/documents` | `documents` | - |

### Configuración

| Item | Ruta | Icono | Sub-items |
|------|------|-------|-----------|
| Notificaciones | `/dashboard/notifications` | `notification` | - |

---

## Cómo Agregar un Nuevo Item

1. Editar `src/config/nav-config.ts`
2. Agregar objeto en el grupo correspondiente:

```typescript
{
  title: 'Nuevo Módulo',
  url: '/dashboard/nuevo',
  icon: 'nuevo',
  isActive: false,
  shortcut: ['n', 'm'],
  items: []
}
```

3. Asegurar que el icono (`'nuevo'`) exista en `src/components/icons/`
4. Los shortcuts se usan en la búsqueda kbar (`Cmd+K`)

---

## Redirecciones Configuradas

En `next.config.ts`:

```typescript
{ source: '/dashboard/talent', destination: '/dashboard/people', permanent: true },
{ source: '/dashboard/talent/:path*', destination: '/dashboard/people/:path*', permanent: true },
{ source: '/dashboard/reuniones', destination: '/dashboard/people/reuniones', permanent: true },
{ source: '/dashboard/manuales', destination: '/dashboard/people/manuales', permanent: true },
{ source: '/dashboard/flota', destination: '/dashboard/flota/celulares', permanent: true }
```

---

## Nota Histórica

El sistema anterior incluía RBAC con Clerk (ver `docs/nav-rbac.md`). Clerk fue removido en mayo 2026. Actualmente **todos los items son visibles** para cualquier usuario (sin auth).