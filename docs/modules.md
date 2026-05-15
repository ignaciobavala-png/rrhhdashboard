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
- Datos desde Supabase (empleados + home_office_semanal)

**Stack:** Server Components paralelos (`@bar_stats`, `@area_stats`, `@pie_stats`, `@sales`), Recharts, Supabase

---

## Legajo (`/dashboard/legajo`)

Ficha completa de empleados con tabla paginada y vista de detalle.

**Tabla:** DataTable con 50 empleados reales de Supabase. **Edición inline** — al cliquear editar, las celdas se vuelven inputs/dropdowns/date pickers editables. Toast de confirmación al guardar.

**Columnas editables:** Nombre, DNI, Equipo, Fecha Ingreso, Estado (activo/inactivo), Modalidad (home_office/presencial/hibrido), Nacimiento, Celular, Emergencia, Dirección, Movilidad, Puesto

**Columnas con filtro:** Nombre, DNI, Equipo, Ingreso, Estado, Modalidad

**Pin de columnas:** Nombre (left), Acciones (right)

**Detalle (`/dashboard/legajo/[id]`):**
- Header con avatar, nombre, puesto, estado
- Secciones editables: Fecha de Nacimiento, Celular, Presencialidad, Email, Dirección, Movilidad
- Section "Datos Laborales": DNI, Equipo, Fecha de Ingreso, Puesto

**Puesto:** Columna `puesto` en tabla `puestos` (relacionada por `empleado_id`). Upsert desde la edición inline.

**Modalidad de trabajo:** `presencial | home_office | hibrido` con badges de colores.

**Archivos:**
```
src/features/legajo/
  api/service.ts                      → Queries Supabase (empleados + puestos + HO)
  api/types.ts                        → Tipo Empleado con puesto: string | null
  components/
    legajo-listing.tsx                 → Server component con prefetch
    legajo-table.tsx                   → Client component con edición inline
    legajo-table/columns.tsx           → ColumnDef con render de edición
    legajo-view-page.tsx               → Detalle del empleado
    sections/section-datos-laborales.tsx
    sections/section-fecha-nacimiento.tsx
    sections/section-celular.tsx
    sections/section-presencialidad.tsx
    sections/section-email.tsx
    sections/section-direccion.tsx
    sections/section-movilidad.tsx
src/app/dashboard/legajo/
  page.tsx                             → Listado
  [id]/page.tsx                        → Detalle
```

---

## Calendario (`/dashboard/calendario`)

Calendario mensual con eventos agrupados por tipo. Datos reales desde Supabase (RPCs + tabla empleados). **Responsive** — flexbox layout con grid dinámico de semanas.

**Tipos de eventos (con filtro por tipo):**
| Tipo | Color |
|------|-------|
| Vacaciones | Verde esmeralda |
| Cumpleaños | Rosa |
| Feriado | Azul |
| Estudio/Mudanza | Ámbar |

**Funcionalidades:**
- Navegación entre meses
- Filtro por tipo de evento (badges clickeables)
- Clic en un día → dialog para registrar vacaciones con período
- Los eventos se muestran como chips de color dentro de cada celda
- Máximo 2 eventos visibles por celda + indicador de "+N más"
- Layout responsivo con `flex flex-col flex-1 min-h-0`

**Datos:** RPC `get_vacaciones_calendario` + `get_eventos_calendario` + cumpleaños desde tabla `empleados`.

**Archivos:**
```
src/features/calendario/
  api/service.ts                       → Supabase RPCs + tabla empleados
  components/
    calendario-page.tsx                 → Grid calendario + estado local
    evento-dialog.tsx                   → Dialog crear vacaciones
src/app/dashboard/calendario/page.tsx
```

---

## Talento (`/dashboard/talent`)

**Placeholder.** UI estática con mensajes "Sin información disponible aún". Evaluaciones y Objetivos sin datos.

**Archivos:**
```
src/features/talent/components/
  talent-listing.tsx                    → Placeholder con mensajes vacíos
src/app/dashboard/talent/page.tsx
```

---

## Reuniones (`/dashboard/reuniones`)

Resúmenes y minutas de reuniones con datos reales desde Supabase.

**Tabla DataTable con reuniones reales:**
- Título, Fecha, Hora, Duración, Participantes (badges), Resumen
- Búsqueda global, paginación
- Ordenadas por fecha descendente

**Archivos:**
```
src/features/reuniones/
  api/service.ts                        → Supabase query tabla reuniones
  api/types.ts
  components/
    reuniones-listing.tsx               → Server component con prefetch
    reuniones-table.tsx                 → Client component con useSuspenseQuery
    reuniones-table/columns.tsx
src/app/dashboard/reuniones/page.tsx
```

---

## Manuales (`/dashboard/manuales`)

Repositorio de manuales y documentación interna con datos reales desde Supabase.

**Tabla DataTable con manuales reales:**
- Título (con icono PDF), Descripción, Categoría (con color), Versión, Autor, Fecha de actualización
- Búsqueda global, paginación

**Categorías:** RRHH, Seguridad, Calidad, Procesos, TI, Marketing, Ventas, Finanzas (cada una con su color).

**Archivos:**
```
src/features/manuales/
  api/service.ts                        → Supabase query tabla manuales
  components/
    manuales-listing.tsx
    manuales-table.tsx
    manuales-table/columns.tsx
src/app/dashboard/manuales/page.tsx
```

---

## Flota de Celulares (`/dashboard/flota`)

Gestión de equipos móviles asignados al personal con datos reales desde Supabase.

**Tabla DataTable con equipos reales — join a empleados:**
- Número, Rol, Empleado (nombre del empleado asignado), Usuario, Contraseña, Código
- Sin asignar → "Sin asignar"
- Empleado con avatar + nombre via join `empleados(nombre_apellido)`

**Archivos:**
```
src/features/flota/
  api/service.ts                        → Supabase query con join a empleados
  api/types.ts                          → empleado_nombre en tipo
  components/
    flota-listing.tsx
    flota-table/columns.tsx
src/app/dashboard/flota/page.tsx
```

---

## Sueldos (`/dashboard/payroll`)

Historial salarial mensual con datos reales desde Supabase.

**UI con Accordion (tres secciones colapsables):**
1. **Pesos Argentinos** — tabla por empleado con columnas Ene–Dic + última
2. **Dólares (USD)** — tabla por empleado con columnas Ene–Dic + última
3. **Bonos Anuales** — tabla con empleado, monto, moneda + totales ARS/USD (verde esmeralda)

**Selector de año** con años disponibles desde la DB.

**Archivos:**
```
src/features/payroll/
  api/service.ts                        → Supabase query sueldos + join empleados
  api/types.ts                          → Sueldo con bono_anual + empleados relation
  components/
    payroll-page.tsx                    → Accordion + SueldoTable + BonosTable
src/app/dashboard/payroll/page.tsx
```

---

## Módulos sin backend

| Ruta | Módulo | Estado |
|------|--------|--------|
| `/dashboard/talent` | Gestión de Talento | Placeholder — UI estática |
| `/dashboard/talent/new` | Nuevo Empleado | Placeholder |
| `/dashboard/talent/[id]` | Perfil de Empleado | Placeholder |
| `/dashboard/documents` | Expedientes | Placeholder |
| `/dashboard/operations` | Operaciones | Placeholder |
| `/dashboard/admin` | Admin Center | Placeholder |
| `/dashboard/profile` | Perfil | Placeholder |
| `/dashboard/notifications` | Notificaciones | Zustand en memoria (sin persistencia) |

---

## Base de Datos (Supabase)

**Migraciones aplicadas (6 archivos):**

| Archivo | Fecha | Contenido |
|---------|-------|-----------|
| `20260510_00001_schema_inicial.sql` | May 10 | Esquema base |
| `20260515_00001_eventos_calendario.sql` | May 15 | RPCs eventos calendario |
| `20260515_00002_actualizar_movilidad.sql` | May 15 | Ajuste columna movilidad |
| `20260515_00003_crear_tabla_puestos.sql` | May 15 | Tabla puestos |
| `20260515_00004_cargar_bonos.sql` | May 15 | Columna bono_anual |
| `20260515_00005_arreglar_rls_puestos.sql` | May 15 | RLS para puestos |

**Esquema (10 tablas):**

```
empresas
  ├── empleados            (Legajo Colaboradores.xlsx — Legajo)
  │     ├── puestos                 (cargo/puesto, upsert desde legajo)
  │     ├── home_office_semanal     (Legajo Colaboradores.xlsx — HO)
  │     ├── vacaciones              (Legajo Colaboradores.xlsx — Vacaciones 2025)
  │     │     └── vacaciones_dias
  │     ├── lineas_moviles          (Legajo Colaboradores.xlsx — Lineas Móviles)
  │     └── sueldos                 (💰Sueldos Contexto.xlsx + bono_anual)
  ├── manuales              (Listado de Manuales por Area.xlsx)
  └── reuniones             (minutas)
```

**RLS:** Todas las tablas tienen Row Level Security con aislamiento por `empresa_id`.

**Archivos Excel originales:** `data-raw/`

---

## Mock Data — Archivos legacy (sin uso)

Todos los archivos en `src/constants/mock-api-*.ts` son código muerto heredado de la fase inicial. Ninguno es importado por los módulos activos. Quedan como referencia histórica.

| Archivo | Entidad | Estado |
|---------|---------|--------|
| `src/constants/mock-api-legajo.ts` | LegajoEmpleado | Muerto |
| `src/constants/mock-api-calendario.ts` | EventoCalendario | Muerto |
| `src/constants/mock-api-talento.ts` | Evaluacion + Objetivo | Muerto |
| `src/constants/mock-api-reuniones.ts` | Reunion | Muerto |
| `src/constants/mock-api-manuales.ts` | Manual | Muerto |
| `src/constants/mock-api-flota.ts` | Celular | Muerto |

---

## Patrón de creación de módulos

Cada módulo nuevo sigue esta estructura:

```
src/features/<modulo>/
  api/
    service.ts                         → Queries a Supabase
    types.ts                           → Tipos TS
  components/
    <modulo>-listing.tsx               → Server component (prefetch + HydrationBoundary)
    <modulo>-table.tsx                 → Client component (useSuspenseQuery + useDataTable)
    <modulo>-table/columns.tsx         → ColumnDef + CellAction
    (<modulo>-view-page.tsx)           → Detalle (opcional)
    sections/                          → Secciones del detalle (opcional)
src/app/dashboard/<modulo>/
  page.tsx                              → Page route
  ([id]/page.tsx)                       → Detail route (opcional)
```
