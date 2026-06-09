# Flota Celulares — `/dashboard/flota/celulares`

> **Estado:** ✅ Datos reales — Supabase + join empleados
> **Archivos:** `src/features/flota/`
> **Ruta:** `/dashboard/flota/celulares`

---

## Descripción

Gestión de equipos móviles asignados al personal. Tabla con join a empleados para mostrar a quién está asignada cada línea.

---

## UI

### Tabla Flota (`flota-table/columns.tsx`)

Client component con `useSuspenseQuery` + `useDataTable`.

**Columnas:**

| Columna | Contenido | Detalle |
|---------|-----------|---------|
| Número | Teléfono | ID de la línea |
| Rol | Descripción | Uso del equipo |
| Empleado | Avatar + nombre | Join `empleados(nombre_apellido)`. "Sin asignar" si null |
| Usuario | Texto | Usuario del dispositivo |
| Contraseña | Texto oculto | Mostrar/ocultar toggle |
| Código | Texto | Código de acceso/IMEI |
| Acciones | Editar, Asignar, Liberar | - |

---

## API & Datos

### Service (`api/service.ts`)

```typescript
// Listar líneas con join a empleados
const { data } = await supabase
  .from('lineas_moviles')
  .select('*, empleados(nombre_apellido)')
  .order('numero');

// Asignar línea
const { error } = await supabase
  .from('lineas_moviles')
  .update({ empleado_id: id })
  .eq('id', lineaId);

// Liberar línea
const { error } = await supabase
  .from('lineas_moviles')
  .update({ empleado_id: null })
  .eq('id', lineaId);
```

### Tipos (`api/types.ts`)

```typescript
interface LineaMovil {
  id: number;
  numero: string;
  rol: string;
  usuario: string;
  contrasena: string;
  codigo: string;
  empleado_id: number | null;
  empleados?: { nombre_apellido: string } | null;
}
```

### Tabla Supabase

`lineas_moviles` — (id, empresa_id FK, empleado_id FK nullable, numero, rol, usuario, contrasena, codigo)

---

## Estructura de Archivos

```
src/features/flota/
├── api/
│   ├── service.ts              # Supabase queries con join empleados
│   └── types.ts                # LineaMovil con empleado_nombre
└── components/
    ├── flota-listing.tsx       # Server: prefetch + HydrationBoundary
    └── flota-table/
        └── columns.tsx         # ColumnDef[] + acciones (asignar/liberar)

src/app/dashboard/flota/
├── page.tsx                    # Redirect a celulares
├── celulares/
│   └── page.tsx                # Listado líneas móviles
└── laptops/
    └── page.tsx                # → ver docs/features/flota-laptops.md
```

---

## Estados

| Estado | UI |
|--------|-----|
| **Loading** | DataTable skeleton |
| **Empty** | "No hay líneas registradas" |
| **Sin asignar** | Badge "Sin asignar" en columna Empleado |
| **Asignado** | Avatar + nombre del empleado |
| **Asignando** | Dialog selector de empleado |
| **Éxito** | Toast verde "Línea asignada a {nombre}" |
| **Error** | Toast rojo "Error al asignar línea" |