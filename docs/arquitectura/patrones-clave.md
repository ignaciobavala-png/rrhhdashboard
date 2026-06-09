# Patrones Clave — PetraLabs RRHH

> **Última actualización:** Mayo 2026

---

## Undo Toast (`showUndoToast`)

Toda acción **destructiva o creativa** (eliminar, crear, editar) debe usar `showUndoToast()` para permitir al usuario deshacer.

**Archivo:** `src/lib/undo-toast.ts`
**Duración:** 10 segundos
**Botón:** "↩ Deshacer"

### Uso

```typescript
import { showUndoToast } from '@/lib/undo-toast';

// Ejemplo: eliminar empleado
const saved = empleado;
await supabase.from('empleados').update({ estado: 'inactivo' }).eq('id', id);

showUndoToast(`Empleado ${empleado.nombre} archivado`, async () => {
  await supabase.from('empleados').update({ estado: 'activo' }).eq('id', id);
  queryClient.invalidateQueries({ queryKey: ['empleados'] });
});

queryClient.invalidateQueries({ queryKey: ['empleados'] });
```

### Flujo Estándar

1. Guardar estado previo: `const saved = { ...row.original };`
2. Ejecutar acción: `await deleteX(id);`
3. Invalidar query: `queryClient.invalidateQueries({ queryKey: ['modulo'] });`
4. Undo toast con restauración del estado original.

---

## Confirm Dialog (`ConfirmDialog`)

Toda **eliminación** debe usar `ConfirmDialog` — **nunca** `window.confirm()` nativo.

**Archivo:** `src/components/ui/confirm-dialog.tsx`

### Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `open` | `boolean` | Controla visibilidad |
| `onOpenChange` | `(open: boolean) => void` | Callback cambio estado |
| `title` | `string` | Título del diálogo |
| `description` | `string` | Texto descriptivo |
| `confirmLabel` | `string` | Texto botón confirmar |
| `destructive` | `boolean` | Estilo rojo/variante danger |
| `onConfirm` | `() => Promise<void>` | Acción a ejecutar |
| `loading` | `boolean` | Estado de carga (deshabilita botón) |

### Uso

```tsx
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const [open, setOpen] = useState(false);
const [loading, setLoading] = useState(false);

const handleDelete = async () => {
  setLoading(true);
  const saved = { ...row.original };
  await deleteX(id);
  queryClient.invalidateQueries({ queryKey: ['modulo'] });
  showUndoToast('X eliminado', async () => {
    await createX(saved);
    queryClient.invalidateQueries({ queryKey: ['modulo'] });
  });
  setLoading(false);
  setOpen(false);
};

<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="¿Eliminar registro?"
  description="Esta acción no se puede deshacer."
  confirmLabel="Eliminar"
  destructive
  onConfirm={handleDelete}
  loading={loading}
/>
```

---

## Flujo Mutación con Undo + Confirm

```tsx
// 1. Selector de estado
const [open, setOpen] = useState(false);

// 2. Handler envolviendo ambas acciones
const handleDelete = async () => {
  setLoading(true);
  const saved = { ...row.original };
  await deleteX(id);
  queryClient.invalidateQueries({ queryKey: ['modulo'] });
  showUndoToast('X eliminado', async () => {
    await createX(saved);
    queryClient.invalidateQueries({ queryKey: ['modulo'] });
  });
  setLoading(false);
  setOpen(false);
};

// 3. UI: botón dispara setOpen(true), ConfirmDialog ejecuta handleDelete
<Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
  <Icons.trash className="h-4 w-4" />
</Button>
<ConfirmDialog open={open} onOpenChange={setOpen} ... onConfirm={handleDelete} />
```

---

## Patrón de Módulo (Feature-Based)

Cada módulo sigue esta arquitectura Server/Client:

```
src/features/<modulo>/
├── api/
│   ├── service.ts              # Queries/mutations Supabase
│   └── types.ts                # Tipos TS con Row de Supabase + z.infer
├── components/
│   ├── <modulo>-listing.tsx    # Server Component: prefetch + HydrationBoundary
│   ├── <modulo>-table.tsx      # Client Component: useSuspenseQuery + useDataTable
│   └── <modulo>-table/
│       └── columns.tsx         # ColumnDef[] con CellAction
```

### Server Component Listing

```tsx
// <modulo>-listing.tsx
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { fetchX } from '../api/service';

export default async function Listado() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({ queryKey: ['modulo'], queryFn: fetchX });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Tabla />
    </HydrationBoundary>
  );
}
```

### Client Component Table

```tsx
// <modulo>-table.tsx
'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './<modulo>-table/columns';
import { fetchX } from '../api/service';

export default function Tabla() {
  const { data } = useSuspenseQuery({ queryKey: ['modulo'], queryFn: fetchX });
  const { table } = useDataTable({ data: data ?? [], columns, ... });
  return <DataTable table={table} ... />;
}
```

### Service (Queries Supabase)

```typescript
// api/service.ts
import { supabase } from '@/lib/supabase';
import type { Entity } from './types';

export const fetchEntities = async (): Promise<Entity[]> => {
  const { data, error } = await supabase
    .from('table')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const deleteEntity = async (id: number) => {
  const { error } = await supabase.from('table').delete().eq('id', id);
  if (error) throw error;
};

export const updateEntity = async (id: number, updates: Partial<Entity>) => {
  const { error } = await supabase.from('table').update(updates).eq('id', id);
  if (error) throw error;
};
```

---

## Edición Inline

La tabla de **Legajo** implementa edición inline:

```tsx
// En columns.tsx, cell render:
cell: ({ row }) => {
  const isEditing = editingId === row.original.id;
  const value = row.getValue(columnId) as string;

  if (isEditing) {
    // Input/dropdown/date picker editable
    return <Input value={value} onChange={(e) => updateValue(row, columnId, e.target.value)} />;
  }
  // Valor display
  return <span>{value}</span>;
}
```

Las columnas con filtro usan los componentes de filtro de `useDataTable`.

---

## Iconos — Regla Obligatoria

```tsx
// ✅ CORRECTO: desde barrel @/components/icons
import { Icons } from '@/components/icons';
<Icons.user className="h-4 w-4" />

// ❌ INCORRECTO: directo desde @tabler
import { IconUser } from '@tabler/icons-react';
```

---

## Server Components vs Client Components

| Componente | Tipo | Cuándo usarlo |
|------------|------|---------------|
| `<modulo>-listing.tsx` | **Server** | Prefetch de datos, envoltura HydrationBoundary |
| `page.tsx` rutas | **Server** | Metadata, layout, SEO |
| Layout | **Server** | Proveedores globales, estructura |
| `<modulo>-table.tsx` | **Client** | Tablas interactivas, filtros, edición inline |
| Modal/Dialog | **Client** | Interactividad de apertura/cierre |
| Formularios | **Client** | TanStack Form requiere estado local |

---

## Query Keys Convención

```typescript
['empleados']                  // Lista empleados
['empleados', id]              // Empleado individual
['empleados', id, 'puesto']    // Puesto de un empleado
['sueldos', anio]              // Sueldos por año
['calendario', mes, anio]      // Eventos del mes
['notificaciones']             // Historial notificaciones
```