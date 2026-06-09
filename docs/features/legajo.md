# Legajo — `/dashboard/legajo`

> **Estado:** ✅ Datos reales — Supabase conectado, edición inline
> **Archivos:** `src/features/legajo/`
> **Rutas:** `/dashboard/legajo` (listado) + `/dashboard/legajo/[id]` (detalle)

---

## Descripción

Ficha completa de empleados con tabla paginada, edición inline y vista de detalle individual.

---

## UI

### Listado (`/dashboard/legajo`)

**Componentes:**
- `legajo-listing.tsx` → Server, prefetch datos + HydrationBoundary
- `legajo-table.tsx` → Client, `useSuspenseQuery` + `useDataTable` + edición inline
- `legajo-table/columns.tsx` → ColumnDef[] con renders de edición

**Tabla DataTable con edición inline:** al cliquear "Editar", las celdas se vuelven inputs/dropdowns/date pickers. Toast de confirmación al guardar.

### Columnas

| Columna | Tipo | Editable | Con Filtro | Pin |
|---------|------|----------|------------|-----|
| Nombre | text | ✅ | ✅ | Left |
| DNI | number | ✅ | ✅ | - |
| Equipo | text | ✅ | ✅ | - |
| Fecha Ingreso | date | ✅ | ✅ | - |
| Estado | badge (activo/inactivo) | ✅ | ✅ | - |
| Modalidad | badge (HO/presencial/híbrido) | ✅ | ✅ | - |
| Nacimiento | date | ✅ | - | - |
| Celular | text | ✅ | - | - |
| Emergencia | text | ✅ | - | - |
| Dirección | text | ✅ | - | - |
| Movilidad | text | ✅ | - | - |
| Puesto | text | ✅ | - | - |
| Acciones | buttons (editar/ver/eliminar) | - | - | Right |

### Detalle (`/dashboard/legajo/[id]`)

**Componente:** `legajo-view-page.tsx`

Secciones:
- **Header:** Avatar, nombre, puesto, estado
- **Secciones editables** (cada una en `sections/section-*.tsx`):

| Sección | Archivo | Datos |
|---------|---------|-------|
| Fecha Nacimiento | `section-fecha-nacimiento.tsx` | date picker |
| Celular | `section-celular.tsx` | input text |
| Presencialidad | `section-presencialidad.tsx` | badges HO/presencial/híbrido |
| Email | `section-email.tsx` | input email |
| Dirección | `section-direccion.tsx` | input text |
| Movilidad | `section-movilidad.tsx` | input text |
| Datos Laborales | `section-datos-laborales.tsx` | DNI, Equipo, Ingreso, Puesto |
| Emergencia | `section-emergencia.tsx` | nombre + teléfono contacto |

---

## API & Datos

### Service (`api/service.ts`)

Queries a Supabase:
- `fetchEmpleados()` — Lista con joins a `puestos` y `home_office_semanal`
- `fetchEmpleado(id)` — Detalle con joins completos
- `updateEmpleado(id, data)` — Update parcial con undo toast
- `deleteEmpleado(id)` — Soft delete (cambia estado a inactivo)

### Tipos (`api/types.ts`)

```typescript
interface Empleado {
  id: number;
  nombre_apellido: string;
  dni: string;
  fecha_nacimiento: string;
  celular: string;
  email: string;
  direccion: string;
  movilidad: string;
  equipo: string;
  fecha_ingreso: string;
  estado: 'activo' | 'inactivo';
  modalidad: 'presencial' | 'home_office' | 'hibrido';
  emergencia_nombre: string;
  emergencia_telefono: string;
  puestos?: { puesto: string }[];
  home_office_semanal?: HomeOfficeSemanal[];
}
```

### Tablas Supabase

| Tabla | Uso |
|-------|-----|
| `empleados` | Datos principales (select, update) |
| `puestos` | Join para mostrar puesto |
| `home_office_semanal` | Join para modalidad semanal |

---

## Estructura de Archivos

```
src/features/legajo/
├── api/
│   ├── service.ts              # Supabase queries (fetch, update, delete)
│   └── types.ts                # Empleado, HomeOfficeSemanal
├── components/
│   ├── legajo-listing.tsx      # Server: prefetch + HydrationBoundary
│   ├── legajo-table.tsx        # Client: useSuspenseQuery + useDataTable
│   ├── legajo-table/
│   │   └── columns.tsx         # ColumnDef[] + CellAction + edición inline
│   ├── legajo-view-page.tsx    # Detalle empleado
│   └── sections/
│       ├── editable-section.tsx
│       ├── section-celular.tsx
│       ├── section-datos-laborales.tsx
│       ├── section-direccion.tsx
│       ├── section-email.tsx
│       ├── section-emergencia.tsx
│       ├── section-fecha-nacimiento.tsx
│       ├── section-movilidad.tsx
│       └── section-presencialidad.tsx
└── (schemas, constants, utils — no implementados)

src/app/dashboard/legajo/
├── page.tsx                    # Listado
└── [id]/
    └── page.tsx                # Detalle
```

---

## Estados

| Estado | UI |
|--------|-----|
| **Loading** | DataTable skeleton |
| **Empty** | "No se encontraron empleados" |
| **Error** | Toast de error + retry |
| **Editando** | Celdas se vuelven inputs, botón "Guardar" aparece |
| **Guardando** | Spinner en botón, deshabilitado mientras muta |
| **Éxito** | Toast verde "Empleado actualizado" |
| **Undo** | Toast con botón "Deshacer" durante 10s |