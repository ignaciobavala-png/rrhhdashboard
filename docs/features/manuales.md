# Manuales — `/dashboard/people/manuales`

> **Estado:** ✅ Datos reales — Supabase Storage + tabla
> **Archivos:** `src/features/manuales/`
> **Ruta:** `/dashboard/people/manuales` (redirigida desde `/dashboard/manuales`)

---

## Descripción

Repositorio de manuales y documentación interna. Drag & drop uploader, descarga y eliminación con undo toast. Archivos almacenados en Supabase Storage bucket `manuales`.

---

## UI

### Tabla Manuales (`manuales-table.tsx`)

Client component con `useSuspenseQuery` + `useDataTable`.

**Columnas:**

| Columna | Contenido |
|---------|-----------|
| Título | Icono PDF + nombre archivo (click para descargar) |
| Descripción | Texto del manual |
| Categoría | Badge de color (8 categorías) |
| Versión | Número versión |
| Autor | Nombre |
| Fecha Actualización | Día/mes/año |
| Acciones | Descargar, Eliminar |

### Uploader

Componente drag & drop para subir archivos:
- Formatos: PDF, Word (.doc/.docx), Excel (.xls/.xlsx)
- Límite: 50 MB por archivo
- Preview del archivo antes de subir
- Barra de progreso durante upload
- Al completar: inserta registro en tabla `manuales` + archivo en Storage

### Categorías

| Categoría | Color Badge |
|-----------|-------------|
| RRHH | Azul |
| Seguridad | Rojo |
| Calidad | Verde |
| Procesos | Ámbar |
| TI | Púrpura |
| Marketing | Rosa |
| Ventas | Cian |
| Finanzas | Índigo |

---

## API & Datos

### Service (`api/service.ts`)

```typescript
// Listar manuales
const { data } = await supabase
  .from('manuales')
  .select('*')
  .order('fecha_actualizacion', { ascending: false });

// Subir archivo
const { data: upload } = await supabase.storage
  .from('manuales')
  .upload(`${categoria}/${nombre_archivo}`, file);

// Insertar registro
const { error } = await supabase
  .from('manuales')
  .insert({
    titulo, descripcion, categoria, version, autor,
    storage_path: upload.path,
    nombre_archivo, tamanio, tipo_archivo
  });

// Descargar
const { data } = supabase.storage
  .from('manuales')
  .getPublicUrl(storage_path);

// Eliminar
await supabase.storage.from('manuales').remove([storage_path]);
await supabase.from('manuales').delete().eq('id', id);
```

### Tipos (`api/types.ts`)

```typescript
interface Manual {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: 'RRHH' | 'Seguridad' | 'Calidad' | 'Procesos' | 'TI' | 'Marketing' | 'Ventas' | 'Finanzas';
  version: string;
  autor: string;
  fecha_actualizacion: string;
  storage_path: string;
  nombre_archivo: string;
  tamanio: number;
  tipo_archivo: string;
}
```

### Tablas + Storage

| Recurso | Uso |
|---------|-----|
| `manuales` | Tabla con metadata + storage_path |
| `manuales` (bucket) | Archivos físicos en Supabase Storage |

---

## Estructura de Archivos

```
src/features/manuales/
├── api/
│   ├── service.ts              # Supabase queries + storage operations
│   └── types.ts                # Manual interface
└── components/
    ├── manuales-listing.tsx    # Server: prefetch + HydrationBoundary
    ├── manuales-table.tsx      # Client: useSuspenseQuery + useDataTable
    └── manuales-table/
        └── columns.tsx         # ColumnDef[] + CellAction

src/app/dashboard/people/manuales/
└── page.tsx                    # Ruta manuales
```

---

## Estados

| Estado | UI |
|--------|-----|
| **Loading** | DataTable skeleton |
| **Empty** | "No hay manuales cargados" + uploader zone destacada |
| **Con datos** | Tabla paginada con manuales |
| **Subiendo** | Barra progreso + "Subiendo archivo..." |
| **Éxito upload** | Toast verde "Manual subido" |
| **Descargando** | Loading en botón descargar |
| **Eliminando** | ConfirmDialog → "¿Eliminar manual?" |
| **Eliminado** | Undo toast 10s "Manual eliminado" |
| **Error upload** | Toast rojo "Error al subir archivo" + reintentar |