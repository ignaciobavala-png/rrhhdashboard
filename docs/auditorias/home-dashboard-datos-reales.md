# Auditoría: Home Dashboard — Conexión a Datos Reales

**Fecha:** 2026-06-09
**Ruta auditada:** `/dashboard/overview`
**Objetivo:** Verificar que todos los widgets del home reflejen datos reales desde Supabase y Google Sheets.

---

## 1. Widgets renderizados

| # | Widget | Slot/Posición | Fuente | Tablas consultadas | ¿Real? |
|---|--------|--------------|--------|-------------------|--------|
| 1 | KPI: Empleados Activos | `layout.tsx` (Server) | Supabase | `empleados` (count) | ✅ |
| 2 | KPI: Flota Asignada | `layout.tsx` (Server) | Supabase | `lineas_moviles` + `flota_laptops` (count) | ✅ |
| 3 | KPI: Masa Salarial ARS | `layout.tsx` (Server) | Supabase | `sueldos` (PESOS ARG, último mes + delta %) | ✅ |
| 4 | KPI: Masa Salarial USD | `layout.tsx` (Server) | Supabase | `sueldos` (USD, último mes) | ✅ |
| 5 | MasaSalarialChart | `@bar_stats` slot | Supabase | `sueldos` (PESOS ARG, últimos 6 meses) | ✅ |
| 6 | ProximosEventos | `@sales` slot | Supabase | `reuniones` + `empleados` (próximos 14 días) | ✅ |
| 7 | BarGraph | `@area_stats` slot | Supabase | `empleados` (agrupado por `equipo_ingreso`) | ✅ |
| 8 | VacacionesRanking | Inline en layout | Supabase | `empleados` + `vacaciones` (año 2025) | ✅ |

**Conclusión:** Los 8 widgets que se renderizan están correctamente conectados a Supabase con datos reales.

---

## 2. Hallazgo 1: PieGraph — Dead code

### Componente

- **Archivo:** `src/features/overview/components/pie-graph.tsx`
- **Slot:** `src/app/dashboard/overview/@pie_stats/`
- **Qué hace:** Gráfico de torta mostrando distribución de modalidad de trabajo (presencial / home office / híbrido)
- **Datos:** Consulta `empleados.modalidad` desde Supabase (activos)

### Problema

El slot `@pie_stats` existe en el filesystem con `page.tsx`, `loading.tsx`, `error.tsx` y `default.tsx`, pero **no está cableado al layout**.

En `src/app/dashboard/overview/layout.tsx:21-29`, el layout solo desestructura 3 slots:

```tsx
export default async function OverViewLayout({
  sales,
  bar_stats,
  area_stats
  // ❌ pie_stats no está declarado
}: { ... })
```

`default.tsx` devuelve `null`, por lo que no se ve nada aunque el slot esté definido. **El componente nunca se renderiza.**

### Archivos involucrados

| Archivo | Rol |
|---------|-----|
| `src/app/dashboard/overview/@pie_stats/page.tsx` | Renderiza `<PieGraph />` |
| `src/app/dashboard/overview/@pie_stats/loading.tsx` | Renderiza `<PieGraphSkeleton />` |
| `src/app/dashboard/overview/@pie_stats/error.tsx` | Muestra alerta de error |
| `src/app/dashboard/overview/@pie_stats/default.tsx` | Devuelve `null` |
| `src/features/overview/components/pie-graph.tsx` | Componente real con `useQuery` a Supabase |

### Solución propuesta

Agregar `pie_stats` a los props del layout y colocarlo en la grilla existente (por ejemplo, reemplazando uno de los slots actuales o en una nueva fila).

---

## 3. Hallazgo 2: Google Sheets — Datos sincronizados no reflejados

### Flujo actual

```
Google Sheets (XLSX público)
        ↓  POST /api/sheets/sync
        ↓  section-detector.ts (clasifica Vacaciones/Legajo/Sueldos/Flota/Asistencia/People)
Supabase: google_sheets / sheet_syncs / sheet_rows (JSONB genérico)
        ↓
        ├── ✅ UI de Google Sheets (/dashboard/google-sheets) → tabla genérica
        ├── ✅ Calendario → vacaciones desde sheets (getVacacionesDesdeSheets)
        └── ❌ Home Dashboard → NO lee ninguna tabla de sheets
```

### Tablas de Supabase involucradas

| Tabla | Contenido |
|-------|-----------|
| `google_sheets` | Una fila por planilla conectada (nombre, URL) |
| `sheet_syncs` | Una fila por pestaña por sincronización (headers, row_count, suggested_section) |
| `sheet_rows` | Datos crudos en JSONB (`{"Nombre": "María", "Días": "15"}`) |

### El problema

Los datos importados de Google Sheets se almacenan de forma **genérica en JSONB** — no hay inserción automática en las tablas de dominio (`empleados`, `sueldos`, `vacaciones`, etc.). El home dashboard solo consulta las tablas de dominio, nunca `sheet_syncs` ni `sheet_rows`.

El `section-detector.ts` ya clasifica cada pestaña, pero esa clasificación no se usa para reflejar datos en el home.

### Secciones detectadas vs widgets

| Sección detectada | Widget del home que podría alimentar | Estado |
|---|---|---|
| Sueldos | KPI Masa Salarial / MasaSalarialChart | ❌ |
| Vacaciones | VacacionesRanking | ⚠️ Parcial (solo Calendario) |
| Flota | KPI Flota Asignada | ❌ |
| Asistencia | Nuevo widget de presencia | ❌ |
| Legajo | Cross-check con empleados activos | ❌ |
| People | ProximosEventos / Calendario | ❌ |

### Solución propuesta

Crear funciones de integración por sección (similar a `getVacacionesDesdeSheets` en `src/features/calendario/api/sheet-integration.ts`) que lean `sheet_syncs.suggested_section` + `sheet_rows.data` y transformen los datos genéricos en objetos tipados para consumo de los widgets del home.

---

## 4. Resumen

| Hallazgo | Severidad | Impacto |
|----------|-----------|---------|
| PieGraph no se renderiza | Media | Falta la gráfica de Modalidad de Trabajo |
| Google Sheets no reflejado en home | Alta | Datos reales importados que no se ven en el dashboard principal |

Todos los widgets que **sí** se renderizan están correctamente conectados a Supabase. No hay mock data ni valores hardcodeados activos en el home dashboard.
