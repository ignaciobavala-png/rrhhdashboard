# Flota Laptops — `/dashboard/flota/laptops`

> **Estado:** ✅ Datos reales — Supabase CRUD completo + undo toast
> **Archivos:** `src/features/flota-laptops/`
> **Ruta:** `/dashboard/flota/laptops`

---

## Descripción

Gestión de laptops asignadas al personal. CRUD completo: crear, editar, eliminar con undo toast y ConfirmDialog.

---

## UI

### Tabla Laptops

Client component con `useSuspenseQuery` + `useDataTable`.

**Columnas:**

| Columna | Contenido |
|---------|-----------|
| Marca | Nombre fabricante |
| Modelo | Modelo específico |
| N° Serie | Número de serie único |
| Usuario | Login/account |
| Equipo | Nombre del equipo en red |
| Ubicación | Oficina/área |
| Estado | Badge: Activo (verde), Inactivo (gris), En Reparación (amarillo) |
| Comentarios | Notas adicionales |
| Asignado a | Empleado (FK nullable) |
| Acciones | Editar, Eliminar |

### Laptop Dialog (`laptop-dialog.tsx`)

Dialog para crear/editar laptops. Campos:

| Campo | Tipo | Requerido |
|-------|------|-----------|
| Marca | Text | ✅ |
| Modelo | Text | ✅ |
| N° Serie | Text | ✅ |
| Usuario | Text | - |
| Equipo | Text | - |
| Ubicación | Text | - |
| Estado | Select (Activo/Inactivo/En Reparación) | ✅ |
| Comentarios | Textarea | - |

---

## API & Datos

### Service (`api/service.ts`)

```typescript
// Listar laptops
const { data } = await supabase
  .from('flota_laptops')
  .select('*')
  .order('marca');

// Crear laptop
const { error } = await supabase
  .from('flota_laptops')
  .insert({ marca, modelo, numero_serie, ... });

// Actualizar laptop
const { error } = await supabase
  .from('flota_laptops')
  .update(updates)
  .eq('id', id);

// Eliminar laptop
const { error } = await supabase
  .from('flota_laptops')
  .delete()
  .eq('id', id);
```

### Tipos (`api/types.ts`)

```typescript
interface Laptop {
  id: number;
  marca: string;
  modelo: string;
  numero_serie: string;
  usuario: string | null;
  equipo: string | null;
  ubicacion: string | null;
  comentarios: string | null;
  estado: 'activo' | 'inactivo' | 'en reparacion';
  empleado_id: number | null;
}
```

### Tabla Supabase

`flota_laptops` — (id, empresa_id FK, empleado_id FK nullable, marca, modelo, numero_serie, usuario, equipo, ubicacion, comentarios, estado)

**Constraints:**
- FK a `empleados(id)` para asignación
- CHECK `estado IN ('activo', 'inactivo', 'en reparacion')`
- UNIQUE o índice en `numero_serie`
- RLS `USING (true)`

---

## Flujo de Eliminación

1. Click en botón eliminar → `setOpen(true)`
2. `ConfirmDialog` muestra confirmación
3. `onConfirm`: guarda estado previo, ejecuta `deleteLaptop(id)`, invalida query, muestra undo toast
4. Si el usuario hace clic en "Deshacer": restaura con `createLaptop(saved)`

---

## Estructura de Archivos

```
src/features/flota-laptops/
├── api/
│   ├── service.ts              # CRUD Supabase (list, create, update, delete)
│   └── types.ts                # Laptop interface
└── components/
    ├── laptops-listing.tsx     # Server: prefetch + HydrationBoundary
    ├── laptops-table.tsx       # Client: useSuspenseQuery + useDataTable
    ├── laptops-table/
    │   └── columns.tsx         # ColumnDef[] + CellAction + Estado badge
    └── laptop-dialog.tsx       # Dialog crear/editar laptop

src/app/dashboard/flota/laptops/
└── page.tsx                    # Ruta laptops
```

---

## Estados

| Estado | UI |
|--------|-----|
| **Loading** | DataTable skeleton |
| **Empty** | "No hay laptops registradas" |
| **Crear** | Dialog con formulario vacío |
| **Editar** | Dialog con datos precargados |
| **Guardando** | Spinner en botón submit |
| **Éxito** | Toast verde "Laptop guardada" |
| **Eliminando** | ConfirmDialog → confirmación |
| **Eliminado** | Undo toast 10s "Laptop eliminada" |
| **Error** | Toast rojo con mensaje del error |