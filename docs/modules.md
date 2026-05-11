# Módulos RRHH

## Navegación

```
Panel Principal
  └─ Resumen

Gestión de Personas
  ├─ Legajo           → /dashboard/legajo
  ├─ Calendario       → /dashboard/calendario
  ├─ Talento          → /dashboard/talent
  └─ Sueldos          → /dashboard/payroll

Administración
  ├─ Reuniones        → /dashboard/reuniones
  ├─ Manuales         → /dashboard/manuales
  ├─ Flota Celulares  → /dashboard/flota
  └─ Expedientes      → /dashboard/documents

Configuración
  ├─ Admin Center     → /dashboard/admin
  ├─ Perfil           → /dashboard/profile
  └─ Notificaciones   → /dashboard/notifications
```

---

## Resumen (`/dashboard/overview`)

- 4 KPI cards: Total Empleados, Ausentes Hoy, Vacaciones Pendientes, Masa Salarial
- 4 gráficos Recharts en paralelo: barras, áreas, torta, actividad reciente
- Cada slot tiene su propio skeleton + error boundary

**Stack:** Server Components paralelos (`@bar_stats`, `@area_stats`, `@pie_stats`, `@sales`), Recharts, mock data

---

## Legajo (`/dashboard/legajo`)

Ficha completa de empleados con tabla paginada y vista de detalle.

**Tabla:** DataTable con 50 empleados mock, columnas:
- Nombre (avatar + email)
- DNI, Puesto, Departamento, Seniority, Salario, Estado, Modalidad
- Búsqueda global, filtros por columna, ordenamiento
- Acción → detalle del empleado

**Detalle (`/dashboard/legajo/[id]`):**
- Header con avatar, nombre, puesto, estado
- Card "Datos Personales": DNI, Email, Teléfono, Dirección, Fecha de Nacimiento
- Card "Datos Laborales": Puesto, Departamento, Seniority, Salario, Modalidad, Fecha de Ingreso

**Modalidad de trabajo:** `presencial | home_office | hibrido` con badges de colores.

**Archivos:**
```
src/constants/mock-api-legajo.ts       → Mock data (50 empleados)
src/features/legajo/
  components/
    legajo-listing.tsx                 → Server component con prefetch
    legajo-table.tsx                   → Client component data-table
    legajo-table/columns.tsx           → Columnas + CellAction
    legajo-view-page.tsx               → Detalle del empleado
src/app/dashboard/legajo/
  page.tsx                             → Listado
  [id]/page.tsx                        → Detalle
```

---

## Calendario (`/dashboard/calendario`)

Calendario mensual con eventos agrupados por tipo. **Editable.**

**Tipos de eventos (con filtro por tipo):**
| Tipo | Color |
|------|-------|
| Licencia | Verde esmeralda |
| Sueldo | Azul |
| Estudio | Ámbar |
| Ausencia | Rojo |

**Funcionalidades:**
- Navegación entre meses
- Filtro por tipo de evento (badges clickeables)
- Clic en un día → dialog para **agregar** nuevo evento
- Clic en un evento existente → dialog para **editar o eliminar**
- Los eventos se muestran como pills de color dentro de cada celda
- Máximo 3 eventos visibles por celda + indicador de "más"

**Datos:** Mock con ~45 eventos distribuidos en 3 meses.

**Archivos:**
```
src/constants/mock-api-calendario.ts    → Mock data (~45 eventos)
src/features/calendario/components/
  calendario-page.tsx                   → Grid calendario + estado local
  evento-dialog.tsx                     → Dialog create/edit/delete
src/app/dashboard/calendario/page.tsx
```

---

## Talento (`/dashboard/talent`)

Gestión de talento continua: evaluaciones, objetivos y seguimiento.

**KPIs (4 cards):**
- Evaluaciones Completadas
- Pendientes
- Promedio General
- Objetivos Completados

**Panel izquierdo — Evaluaciones (últimas 8):**
- Empleado, puesto, tipo (desempeño/objetivos/feedback/promoción), estado, puntaje
- Badges de color por tipo y estado

**Panel derecho — Objetivos (últimos 6):**
- Título, empleado, prioridad (alta/media/baja)
- Barra de progreso con porcentaje

**Archivos:**
```
src/constants/mock-api-talento.ts       → Evaluaciones + Objetivos
src/features/talent/components/
  talent-listing.tsx                    → KPIs + listas
src/app/dashboard/talent/page.tsx       → Usa el nuevo componente
```

---

## Reuniones (`/dashboard/reuniones`)

Resúmenes y minutas de reuniones.

**Tabla DataTable con 15 reuniones mock:**
- Título, Fecha, Hora, Duración, Participantes (badges), Resumen
- Búsqueda global, paginación
- Ordenadas por fecha descendente

**Archivos:**
```
src/constants/mock-api-reuniones.ts
src/features/reuniones/components/
  reuniones-listing.tsx
  reuniones-table.tsx
  reuniones-table/columns.tsx
src/app/dashboard/reuniones/page.tsx
```

---

## Manuales (`/dashboard/manuales`)

Repositorio de manuales y documentación interna.

**Tabla DataTable con 12 manuales mock:**
- Título (con icono PDF), Descripción, Categoría (con color), Versión, Autor, Fecha de actualización
- Búsqueda global, paginación

**Categorías:** RRHH, Seguridad, Calidad, Procesos, TI, Marketing, Ventas, Finanzas (cada una con su color).

**Archivos:**
```
src/constants/mock-api-manuales.ts
src/features/manuales/components/
  manuales-listing.tsx
  manuales-table.tsx
  manuales-table/columns.tsx
src/app/dashboard/manuales/page.tsx
```

---

## Flota de Celulares (`/dashboard/flota`)

Gestión de equipos móviles asignados al personal.

**Tabla DataTable con 20 equipos mock:**
- Empleado (asignado/disponible), Modelo (con icono móvil), Número, Plan, Estado, Fecha de asignación

**Estados:** Asignado (verde), Disponible (azul), De Baja (rojo).

**Planes:** Prepago, Postpago Básico, Postpago Premium, Corporativo.

**Archivos:**
```
src/constants/mock-api-flota.ts
src/features/flota/components/
  flota-listing.tsx
  flota-table.tsx
  flota-table/columns.tsx
src/app/dashboard/flota/page.tsx
```

---

## Módulos existentes sin cambios

| Ruta | Módulo | Descripción |
|------|--------|-------------|
| `/dashboard/payroll` | Sueldos | Placeholder (heredero del starter) |
| `/dashboard/documents` | Expedientes | Placeholder |
| `/dashboard/operations` | Operaciones | Placeholder |
| `/dashboard/admin` | Admin Center | Placeholder |
| `/dashboard/profile` | Perfil | Placeholder |
| `/dashboard/notifications` | Notificaciones | Funcional con mock data + Zustand store |

---

---

## Base de Datos (Supabase)

Migración inicial: `supabase/migrations/20260510_00001_schema_inicial.sql`

**Esquema (8 tablas):**

```
empresas
  ├── empleados            (Legajo Colaboradores.xlsx — Legajo)
  │     ├── home_office_semanal    (Legajo Colaboradores.xlsx — HO)
  │     ├── vacaciones             (Legajo Colaboradores.xlsx — Vacaciones 2025)
  │     │     └── vacaciones_dias
  │     ├── lineas_moviles         (Legajo Colaboradores.xlsx — Lineas Móviles)
  │     └── sueldos                (💰Sueldos Contexto.xlsx)
  └── manuales              (Listado de Manuales por Area.xlsx)
```

**RLS:** Todas las tablas tienen Row Level Security con aislamiento por `empresa_id`.

**Archivos Excel originales:** `data-raw/`

---

## Mock Data — todos los archivos

| Archivo | Entidad | Cantidad |
|---------|---------|----------|
| `src/constants/mock-api.ts` | Product (legacy) | 20 |
| `src/constants/mock-api-legajo.ts` | LegajoEmpleado | 50 |
| `src/constants/mock-api-calendario.ts` | EventoCalendario | ~45 |
| `src/constants/mock-api-talento.ts` | Evaluacion + Objetivo | 25 + 20 |
| `src/constants/mock-api-reuniones.ts` | Reunion | 15 |
| `src/constants/mock-api-manuales.ts` | Manual | 12 |
| `src/constants/mock-api-flota.ts` | Celular | 20 |

---

## Patrón de creación de módulos

Cada módulo nuevo sigue esta estructura:

```
src/constants/mock-api-<modulo>.ts     → Mock data con faker + matchSorter
src/features/<modulo>/
  components/
    <modulo>-listing.tsx               → Server component (prefetch + HydrationBoundary)
    <modulo>-table.tsx                 → Client component (useSuspenseQuery + useDataTable)
    <modulo>-table/columns.tsx         → ColumnDef + CellAction
    (<modulo>-view-page.tsx)           → Detalle (opcional)
src/app/dashboard/<modulo>/
  page.tsx                              → Page route
  ([id]/page.tsx)                       → Detail route (opcional)
```
