# Notificaciones — `/dashboard/notifications`

> **Estado:** ✅ Datos reales — Supabase triggers + tabla
> **Archivos:** `src/features/notifications/`
> **Ruta:** `/dashboard/notifications`

---

## Descripción

Sistema de notificaciones con dos fuentes:
1. **Historial de actividad** — generado automáticamente por triggers DB (`log_change()`)
2. **Próximos eventos** — eventos en los próximos 5 días (reuniones, cumpleaños, vencimientos)

---

## UI

### Notifications Page (`notifications-page.tsx`)

Dividida en dos secciones:

#### Próximos Eventos (5 días)
Lista de eventos próximos desde Supabase. Incluye:
- Reuniones programadas (tabla `reuniones`)
- Cumpleaños de empleados (tabla `empleados`)
- Vencimientos/próximos (si aplica)

#### Historial de Actividad
Tabla con log de todas las acciones registradas por triggers:

| Columna | Contenido |
|---------|-----------|
| Entidad | Tipo de registro afectado (empleados, reuniones, manuales, etc.) |
| Acción | INSERT, UPDATE, DELETE (badge de color) |
| Descripción | Texto descriptivo del cambio |
| Fecha | Timestamp del evento |
| Leída | Indicador leído/no leído |

### Notification Center (`notification-center.tsx`)

Badge en la barra superior con contador de no leídas. Dropdown con últimas notificaciones.

---

## API & Datos

### Service (`api/service.ts`)

```typescript
// Historial de notificaciones
const { data } = await supabase
  .from('notificaciones')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(50);

// Marcar como leída
const { error } = await supabase
  .from('notificaciones')
  .update({ leida: true })
  .eq('id', id);

// Marcar todas como leídas
const { error } = await supabase
  .from('notificaciones')
  .update({ leida: true })
  .eq('leida', false);

// Próximos eventos (5 días)
const { data: reuniones } = await supabase
  .from('reuniones')
  .select('*')
  .gte('fecha', today)
  .lte('fecha', fiveDaysFromNow);

const { data: cumpleaños } = await supabase
  .from('empleados')
  .select('id, nombre_apellido, fecha_nacimiento')
  .eq('estado', 'activo');
// Filtrar client-side por mes/día en los próximos 5 días
```

### Tipos (`api/types.ts`)

```typescript
interface Notificacion {
  id: number;
  entidad: string;
  accion: 'INSERT' | 'UPDATE' | 'DELETE';
  descripcion: string;
  leida: boolean;
  created_at: string;
}
```

### Tabla Supabase + Triggers

`notificaciones` — (id, entidad, accion, descripcion, leida, created_at)

La función `log_change()` registra automáticamente cambios en:
- `empleados`, `puestos`, `reuniones`, `manuales`, `flota_laptops`, `lineas_moviles`

Ver `docs/arquitectura/base-de-datos.md` para detalles de los triggers.

---

## Estructura de Archivos

```
src/features/notifications/
├── api/
│   ├── service.ts              # Supabase queries notificaciones + próximos eventos
│   └── types.ts                # Notificacion interface
├── components/
│   ├── notifications-page.tsx  # Lista completa: próximos eventos + historial
│   └── notification-center.tsx # Badge + dropdown en header
└── utils/
    └── store.ts                # Estado local notificaciones (legacy Zustand?)

src/app/dashboard/notifications/
└── page.tsx                    # Ruta notificaciones
```

---

## Estados

| Estado | UI |
|--------|-----|
| **Loading** | Skeleton lista notificaciones |
| **Sin notificaciones** | "No hay actividad reciente" |
| **Sin eventos próximos** | "No hay eventos en los próximos 5 días" |
| **No leídas** | Badge con contador en notification center |
| **Marcando leída** | Animación fade out |
| **Error** | Toast rojo "Error al cargar notificaciones" |