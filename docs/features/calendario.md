# Calendario — `/dashboard/calendario`

> **Estado:** ✅ Datos reales — Supabase RPCs + empleados
> **Archivos:** `src/features/calendario/`
> **Ruta:** `/dashboard/calendario`

---

## Descripción

Calendario mensual con eventos agrupados por tipo. Navegación entre meses, filtro por tipo, y registro de vacaciones via dialog.

---

## UI

### Calendario Grid (`calendario-page.tsx`)

Layout responsive con grid dinámico de semanas. Cada celda-día muestra hasta 2 eventos como chips de color + indicador "+N más" si hay más.

**Funcionalidades:**
- Navegación entre meses (← mes anterior | mes actual | mes siguiente →)
- Filtro por tipo de evento (badges clickeables)
- Clic en un día → abre `evento-dialog.tsx` para registrar vacaciones
- Layout responsive con `flex flex-col flex-1 min-h-0`

### Tipos de Eventos

| Tipo | Color | Origen |
|------|-------|--------|
| Vacaciones | 🟢 Verde esmeralda | RPC `get_vacaciones_calendario` |
| Cumpleaños | 🩷 Rosa | Tabla `empleados.fecha_nacimiento` |
| Feriado | 🔵 Azul | RPC `get_eventos_calendario` |
| Estudio/Mudanza | 🟡 Ámbar | RPC `get_eventos_calendario` |

### Evento Dialog (`evento-dialog.tsx`)

Dialog para registrar vacaciones con:
- Selector de período (desde / hasta)
- Empleado asignado
- Validación de fechas

---

## API & Datos

### Service (`api/service.ts`)

```typescript
// Eventos desde RPCs
const { data } = await supabase.rpc('get_vacaciones_calendario', { mes, anio });
const { data } = await supabase.rpc('get_eventos_calendario', { mes, anio });

// Cumpleaños desde empleados
const { data } = await supabase
  .from('empleados')
  .select('id, nombre_apellido, fecha_nacimiento')
  .eq('estado', 'activo');

// Registrar vacaciones
const { error } = await supabase
  .from('vacaciones_dias')
  .insert({ vacacion_id, mes, dias_usados });
```

### RPCs Supabase

| RPC | Params | Retorna |
|-----|--------|---------|
| `get_vacaciones_calendario` | `mes, anio` | Array de eventos vacaciones: `{ fecha, empleado, dias }` |
| `get_eventos_calendario` | `mes, anio` | Array de eventos generales: `{ fecha, tipo, descripcion }` |

### Tablas Involucradas

| Tabla | Uso |
|-------|-----|
| `empleados` | Cumpleaños (fecha_nacimiento) |
| `vacaciones` | Saldos vacacionales por empleado/año |
| `vacaciones_dias` | Registro diario de días usados |

---

## Estructura de Archivos

```
src/features/calendario/
├── api/
│   └── service.ts              # RPCs + queries empleados
└── components/
    ├── calendario-page.tsx     # Grid calendario + estado local (mes actual, filtros)
    └── evento-dialog.tsx       # Dialog crear vacaciones (período + empleado)

src/app/dashboard/calendario/
└── page.tsx                    # Ruta calendario
```

---

## Estados

| Estado | UI |
|--------|-----|
| **Loading** | Skeleton grid del calendario |
| **Sin eventos** | Días vacíos sin chips |
| **Con eventos** | Chips de color dentro de celdas |
| **+N más** | Badge indicando eventos ocultos en el día |
| **Registrando vacación** | Dialog abierto + loading en submit |
| **Éxito registro** | Toast verde + refresh del mes actual |
| **Error** | Toast rojo "Error al registrar vacaciones" |