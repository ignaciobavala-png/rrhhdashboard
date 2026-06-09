# Reuniones — `/dashboard/people/reuniones`

> **Estado:** ✅ Datos reales — Supabase conectado, undo toast
> **Archivos:** `src/features/reuniones/`
> **Ruta:** `/dashboard/people/reuniones` (redirigida desde `/dashboard/reuniones`)

---

## Descripción

Minutas y resúmenes de reuniones con tabla data-table, búsqueda y paginación.

---

## UI

### Tabla Reuniones (`reuniones-table.tsx`)

Client component con `useSuspenseQuery` + `useDataTable`.

**Columnas:**

| Columna | Contenido | Filtro |
|---------|-----------|--------|
| Título | Texto | ✅ Búsqueda global |
| Fecha | Formato día/mes/año | ✅ |
| Hora | HH:MM | - |
| Duración | Minutos | - |
| Participantes | Badges por persona | - |
| Resumen | Texto truncado | ✅ |
| Acciones | Editar, Eliminar | - |

**Funcionalidades:**
- Búsqueda global (filtra título + resumen)
- Paginación
- Ordenadas por fecha descendente
- Click en fila → expandir resumen completo
- **Eliminar:** ConfirmDialog + undo toast (10s para deshacer)

---

## API & Datos

### Service (`api/service.ts`)

```typescript
// Listar reuniones
const { data } = await supabase
  .from('reuniones')
  .select('*')
  .order('fecha', { ascending: false });

// Crear reunión
const { error } = await supabase
  .from('reuniones')
  .insert({ titulo, fecha, hora, asistentes, resumen, duracion });

// Eliminar reunión
const { error } = await supabase
  .from('reuniones')
  .delete()
  .eq('id', id);
```

### Tipos (`api/types.ts`)

```typescript
interface Reunion {
  id: number;
  titulo: string;
  fecha: string;       // ISO date
  hora: string;        // HH:MM
  asistentes: string[];
  resumen: string;
  duracion: number;    // minutos
  created_at: string;
}
```

### Tabla Supabase

`reuniones` — (id, empresa_id FK, titulo, fecha, hora, asistentes text[], resumen, duracion)

---

## Estructura de Archivos

```
src/features/reuniones/
├── api/
│   ├── service.ts              # Supabase queries (list, create, delete)
│   └── types.ts                # Reunion interface
└── components/
    ├── reuniones-listing.tsx   # Server: prefetch + HydrationBoundary
    ├── reuniones-table.tsx     # Client: useSuspenseQuery + useDataTable
    └── reuniones-table/
        └── columns.tsx         # ColumnDef[] + CellAction

src/app/dashboard/people/reuniones/
└── page.tsx                    # Ruta reuniones
```

---

## Estados

| Estado | UI |
|--------|-----|
| **Loading** | DataTable skeleton |
| **Empty** | "No hay reuniones registradas" |
| **Con datos** | Tabla paginada con reuniones |
| **Eliminando** | ConfirmDialog → "¿Eliminar reunión?" |
| **Eliminado** | Undo toast 10s "Reunión eliminada" |
| **Deshacer** | Restaura la reunión, invalida query |
| **Error** | Toast rojo "Error al eliminar reunión" |

---

## Integración Futura: Google Calendar / Gmail

Pendiente de implementar:
1. Google Cloud Console: habilitar Gmail API + Calendar API
2. OAuth 2.0 credentials + `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
3. OAuth flow en `/api/google/callback`, guardar `refresh_token` en Supabase
4. Al crear reunión: enviar email .ics + crear evento Google Calendar con asistentes