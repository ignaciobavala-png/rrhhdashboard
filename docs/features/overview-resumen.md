# Resumen / Overview — `/dashboard/overview`

> **Estado:** ✅ Datos reales — Supabase conectado
> **Archivos:** `src/features/overview/components/`
> **Layout:** `src/app/dashboard/overview/layout.tsx` (server, KPI cards) + `page.tsx` (widgets paralelos)

---

## Descripción

Dashboard principal con KPIs y 4 widgets que muestran un resumen RRHH en tiempo real.

---

## Componentes

### KPI Cards (Server — en `layout.tsx`)

4 tarjetas con datos agregados desde Supabase:

| KPI | Datos | Query |
|-----|-------|-------|
| **Empleados Activos** | Count empleados con `estado: 'activo'` | `count(*)` en `empleados` |
| **Flota Asignada** | Líneas móviles + laptops asignadas | `count(*)` en `lineas_moviles` + `flota_laptops` |
| **Masa Salarial ARS** | Último mes + delta % vs mes anterior | `sum(sueldo_pesos)` en `sueldos` (último mes) |
| **Masa Salarial USD** | Total USD último mes | `sum(sueldo_usd)` en `sueldos` (último mes) |

### Widgets (Client Components — en `page.tsx`)

Widgets montados en slots paralelos del layout:

| Slot | Componente | Descripción | Archivo |
|------|------------|-------------|---------|
| `@bar_stats` | `MasaSalarialChart` | Evolución masa salarial ARS (últimos 6 meses) — gráfico de área | `masa-salarial-chart.tsx` |
| `@sales` | `ProximosEventos` | Reuniones + cumpleaños próximos 14 días. Badge "urgente" si ≤1 día | `proximos-eventos.tsx` |
| `@area_stats` | `BarGraph` | Empleados por equipo — barras activos/inactivos | `bar-graph.tsx` |
| Inline | `VacacionesRanking` | Lista activos con barra progreso + días, colores por criticidad | `vacaciones-ranking.tsx` |

---

## Detalle de Widgets

### Masa Salarial Chart (`masa-salarial-chart.tsx`)

- Gráfico de área (Recharts `AreaChart`)
- Últimos 6 meses de masa salarial ARS
- Tooltip con formato `$currency`
- Server-side data fetching via Supabase RPC/query

### Próximos Eventos (`proximos-eventos.tsx`)

- Lista los próximos eventos en los siguientes 14 días
- Tipos: Reuniones (tabla `reuniones`) + Cumpleaños (tabla `empleados`)
- **Badge urgente** rojo si el evento es en ≤1 día
- Badge "próximo" azul si es en 2–7 días
- Badge "esta semana" verde si es en 8–14 días

### Empleados por Equipo (`bar-graph.tsx`)

- Gráfico de barras horizontales (Recharts `BarChart`)
- Cada barra: equipo → stacked (activos + inactivos)
- Colores: esmeralda (#10b981) activos, gris inactivos
- Query: `group by equipo, estado` en `empleados`

### Ranking Vacaciones (`vacaciones-ranking.tsx`)

- Lista simplificada de todos los empleados activos
- Barra de progreso: `dias_usados / dias_corresponden`
- Colores por criticidad:
  - 🟢 Verde: > 10 días restantes
  - 🟡 Amarillo: 5–10 días restantes
  - 🔴 Rojo: < 5 días restantes
- Muestra: nombre, barra, días usados, días totales

---

## Estructura de Archivos

```
src/features/overview/components/
├── masa-salarial-chart.tsx      # Área chart evolución ARS (6 meses)
├── proximos-eventos.tsx         # Lista próximos 14 días + badges urgencia
├── bar-graph.tsx                # Barras empleados por equipo
├── vacaciones-ranking.tsx       # Ranking vacaciones con barras progreso
├── area-graph.tsx               # (legacy/skeleton) gráfico área alternativo
├── pie-graph.tsx                # (legacy/skeleton) gráfico torta alternativo
├── recent-sales.tsx             # (legacy/skeleton) actividad reciente
├── area-graph-skeleton.tsx      # Skeleton loading para área chart
├── bar-graph-skeleton.tsx       # Skeleton loading para bar chart
├── pie-graph-skeleton.tsx       # Skeleton loading para pie chart
└── recent-sales-skeleton.tsx    # Skeleton loading para actividad

src/app/dashboard/overview/
├── layout.tsx                   # Server: KPI cards (4 tarjetas)
├── page.tsx                     # Server: Widgets en slots (@bar_stats, @sales, @area_stats)
├── @bar_stats/page.tsx          # Slot: masa salarial chart
├── @sales/page.tsx              # Slot: próximos eventos
└── @area_stats/page.tsx         # Slot: empleados por equipo
```

---

## Datos

- **Fuente:** Supabase `empleados`, `sueldos`, `reuniones`, `lineas_moviles`, `flota_laptops`
- **Cálculos KPIs:** Queries agregadas desde `layout.tsx` (server)
- **Gráficos:** Recharts `<AreaChart>`, `<BarChart>`, `<ResponsiveContainer>`

---

## Estados

| Estado | UI |
|--------|-----|
| **Loading** | Skeleton components (`*-skeleton.tsx`) |
| **Empty** | Mensaje "Sin datos disponibles" |
| **Error** | Mensaje de error genérico |
| **Loaded** | Gráficos + KPIs con datos reales |