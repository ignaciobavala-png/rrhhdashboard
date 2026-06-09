# Sueldos / Payroll — `/dashboard/payroll`

> **Estado:** ✅ Datos reales — Supabase + accordion ARS/USD + bonos
> **Archivos:** `src/features/payroll/`
> **Ruta:** `/dashboard/payroll`

---

## Descripción

Historial salarial mensual organizado en accordion con tres secciones colapsables: Pesos ARS, Dólares USD, y Bonos Anuales.

---

## UI

### Accordion (3 secciones)

| Sección | Contenido |
|---------|-----------|
| **Pesos Argentinos** | Tabla: empleado × meses (Ene–Dic) + columna "Última" |
| **Dólares (USD)** | Tabla: empleado × meses (Ene–Dic) + columna "Última" |
| **Bonos Anuales** | Tabla: empleado, monto, moneda + totales ARS/USD |

### Selector de Año

Dropdown con años disponibles desde la base de datos. Al cambiar, se recargan las 3 secciones.

### Tabla Sueldos ARS/USD

- **Filas:** Empleados activos con sueldo en esa moneda
- **Columnas:** Ene, Feb, Mar, Abr, May, Jun, Jul, Ago, Sep, Oct, Nov, Dic, Última
- **Celdas:** Valor formateado como moneda ($) o "—" si no hay dato
- **Columna "Última":** Último mes con dato registrado

### Tabla Bonos Anuales

- **Filas:** Empleados con bono registrado para el año
- **Columnas:** Empleado, Monto, Moneda (ARS/USD badge)
- **Footer:** Totales ARS y USD (verde esmeralda `#10b981`)

---

## API & Datos

### Service (`api/service.ts`)

```typescript
// Obtener sueldos por año
const { data } = await supabase
  .from('sueldos')
  .select('*, empleados(nombre_apellido)')
  .eq('anio', anio)
  .order('mes');

// Agrupar por empleado para tabla pivote
const porEmpleado = groupBy(data, 'empleado_id');

// Bonos anuales
const bonos = data.filter(s => s.bono_anual > 0);
const totalARS = bonos.filter(b => b.moneda_bono === 'ARS').reduce((sum, b) => sum + b.bono_anual, 0);
const totalUSD = bonos.filter(b => b.moneda_bono === 'USD').reduce((sum, b) => sum + b.bono_anual, 0);
```

### Tipos (`api/types.ts`)

```typescript
interface Sueldo {
  id: number;
  empleado_id: number;
  anio: number;
  mes: number;               // 1-12
  sueldo_pesos: number | null;
  sueldo_usd: number | null;
  bono_anual: number | null;
  moneda_bono: 'ARS' | 'USD' | null;
  empleados?: {
    nombre_apellido: string;
  };
}

interface EmpleadoSueldo {
  empleado_id: number;
  nombre: string;
  meses: (number | null)[];   // [ene, feb, ..., dic]
  ultima: number | null;
}
```

### Tabla Supabase

`sueldos` — (id, empleado_id FK, anio, mes, sueldo_pesos, sueldo_usd, bono_anual, moneda_bono)

---

## Estructura de Archivos

```
src/features/payroll/
├── api/
│   ├── service.ts              # Supabase queries sueldos + join empleados
│   └── types.ts                # Sueldo con bono_anual + empleados relation
└── components/
    └── payroll-page.tsx        # Accordion + SueldoTable + BonosTable

src/app/dashboard/payroll/
└── page.tsx                    # Ruta payroll
```

---

## Estados

| Estado | UI |
|--------|-----|
| **Loading** | Skeleton accordion |
| **Sin datos año** | "No hay sueldos registrados para {año}" |
| **Accordion cerrado** | Solo título de sección visible |
| **Accordion abierto** | Tabla completa con datos |
| **Cambiando año** | Skeleton mientras carga nuevo año |
| **Sin bonos** | "No hay bonos registrados para {año}" |
| **Error** | Toast rojo "Error al cargar sueldos" |