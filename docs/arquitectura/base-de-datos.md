# Base de Datos — PetraLabs RRHH

> **Última actualización:** Mayo 2026

---

## Proveedor

**Supabase PostgreSQL** — acceso via cliente anon (sin auth), RLS `USING (true)` en todas las tablas.

---

## Migraciones Aplicadas

| Archivo | Fecha | Contenido |
|---------|-------|-----------|
| `20260510_00001_schema_inicial.sql` | May 10 | Esquema base: empresas, empleados, HO, vacaciones, sueldos, etc. |
| `20260515_00001_eventos_calendario.sql` | May 15 | RPCs `get_vacaciones_calendario` + `get_eventos_calendario` |
| `20260515_00002_actualizar_movilidad.sql` | May 15 | Ajuste columna `movilidad` en empleados |
| `20260515_00003_crear_tabla_puestos.sql` | May 15 | Tabla `puestos` con FK a empleados |
| `20260515_00004_cargar_bonos.sql` | May 15 | Columna `bono_anual` en sueldos |
| `20260515_00005_arreglar_rls_puestos.sql` | May 15 | RLS `USING (true)` para puestos |
| `20260518_00001_fix_reuniones_rls.sql` | May 18 | Fix RLS reuniones para writes anon |
| `20260518_00002_manuales_storage.sql` | May 18 | Bucket `manuales` en Storage + columnas |
| `flota_laptops_table` | May 18 | Tabla `flota_laptops` + FK, checks, RLS, indexes |
| `flota_laptops_add_detail_columns` | May 18 | Columnas: usuario, equipo, ubicacion, comentarios |
| `notificaciones_tabla_y_triggers` | May 18 | Tabla `notificaciones` + función `log_change()` + 6 triggers |

---

## Esquema — Tablas (10 tablas)

```
empresas                        # Tenant multi-empresa
├── empleados                   # Datos personales + laborales (40+ columnas)
│   ├── puestos                 # Cargo/puesto (upsert desde legajo)
│   ├── home_office_semanal     # Modalidad semanal (Lu-Vi)
│   ├── vacaciones              # Saldos vacacionales por año
│   │   └── vacaciones_dias     # Detalle mensual de días usados
│   ├── lineas_moviles          # Flota de celulares
│   ├── sueldos                 # Historial salarial mensual + bono_anual
│   └── flota_laptops           # Laptops asignadas
├── manuales                    # Manuales por área (storage_path a bucket)
├── reuniones                   # Minutas (título, fecha, asistentes, resumen)
└── notificaciones              # Log de actividad (triggers automáticos)
```

### Tabla: `empleados`

Columnas principales (40+): `id`, `empresa_id`, `nombre_apellido`, `dni`, `fecha_nacimiento`, `celular`, `email`, `direccion`, `movilidad`, `fecha_ingreso`, `equipo`, `rol`, `estado` (activo/inactivo), `modalidad` (presencial/home_office/hibrido), `emergencia_nombre`, `emergencia_telefono`, `updated_at`, `created_at`.

### Tabla: `puestos`

`id`, `empleado_id` (FK → empleados.id, UNIQUE), `puesto` (text).

### Tabla: `home_office_semanal`

`id`, `empleado_id` (FK), `lunes`, `martes`, `miercoles`, `jueves`, `viernes` (cada una: oficina/remoto/licencia).

### Tabla: `vacaciones`

`id`, `empleado_id` (FK), `anio`, `dias_corresponden`, `dias_restantes`.

### Tabla: `vacaciones_dias`

`id`, `vacacion_id` (FK), `mes`, `dias_usados`.

### Tabla: `lineas_moviles`

`id`, `empresa_id` (FK), `empleado_id` (FK nullable), `numero`, `rol`, `usuario`, `contrasena`, `codigo`.

### Tabla: `flota_laptops`

`id`, `empresa_id` (FK), `empleado_id` (FK nullable), `marca`, `modelo`, `numero_serie`, `usuario`, `equipo`, `ubicacion`, `comentarios`, `estado` (activo/inactivo/en reparacion).

### Tabla: `sueldos`

`id`, `empleado_id` (FK), `anio`, `mes`, `sueldo_pesos`, `sueldo_usd`, `bono_anual`, `moneda_bono` (ARS/USD).

### Tabla: `manuales`

`id`, `empresa_id` (FK), `titulo`, `descripcion`, `categoria` (enum: RRHH/Seguridad/Calidad/Procesos/TI/Marketing/Ventas/Finanzas), `version`, `autor`, `fecha_actualizacion`, `storage_path`, `nombre_archivo`, `tamanio`, `tipo_archivo`.

### Tabla: `reuniones`

`id`, `empresa_id` (FK), `titulo`, `fecha`, `hora`, `asistentes` (text[]), `resumen`, `duracion`.

### Tabla: `notificaciones`

`id`, `entidad` (text), `accion` (INSERT/UPDATE/DELETE), `descripcion` (text), `leida` (boolean default false), `created_at`.

---

## Row Level Security (RLS)

Todas las tablas tienen RLS habilitada con política:

```sql
CREATE POLICY "anon_access" ON <tabla>
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

No hay restricción por `empresa_id` porque es single-tenant con un solo usuario admin. Si se agrega multi-tenancy, cambiar a `USING (empresa_id = auth.uid())`.

---

## Supabase Storage

### Bucket: `manuales`

| Propiedad | Valor |
|-----------|-------|
| **Límite** | 50 MB por archivo |
| **Tipos** | PDF, Word (.doc/.docx), Excel (.xls/.xlsx) |
| **Acceso** | Público via signed URL |
| **RLS Storage** | Habilidata para operaciones del cliente anon |

#### Operaciones

```typescript
// Subir
const { data } = await supabase.storage.from('manuales').upload(path, file)
// Descargar
const { data } = supabase.storage.from('manuales').getPublicUrl(path)
// Eliminar
const { error } = await supabase.storage.from('manuales').remove([path])
```

---

## Triggers de Actividad (log_change)

La función `log_change()` (SECURITY DEFINER) registra automáticamente en `notificaciones` cualquier cambio en las siguientes tablas:

| Tabla | Eventos | Descripción registrada |
|-------|---------|----------------------|
| `empleados` | INSERT, UPDATE, DELETE | "Empleado {nombre} creado/actualizado/eliminado" |
| `puestos` | INSERT, UPDATE, DELETE | "Puesto de {empleado} actualizado" |
| `reuniones` | INSERT, UPDATE, DELETE | "Reunión {título} creada/actualizada/eliminada" |
| `manuales` | INSERT, UPDATE, DELETE | "Manual {título} subido/actualizado/eliminado" |
| `flota_laptops` | INSERT, UPDATE, DELETE | "Laptop {marca} {modelo} asignada/actualizada/eliminada" |
| `lineas_moviles` | INSERT, UPDATE, DELETE | "Línea {numero} asignada/actualizada/eliminada" |

Los triggers son `AFTER INSERT OR UPDATE OR DELETE ON <tabla> FOR EACH ROW EXECUTE FUNCTION log_change()`.

---

## RPCs (Remote Procedure Calls)

### `get_vacaciones_calendario`
Obtiene eventos de vacaciones para el calendario (por mes/año).

### `get_eventos_calendario`
Obtiene todos los eventos (vacaciones + feriados + otros) para el calendario.

---

## Datos Origen

Archivos Excel en `data-raw/`:

| Archivo | Tablas pobladas |
|---------|----------------|
| Legajo Colaboradores.xlsx | `empleados`, `puestos`, `home_office_semanal`, `vacaciones`, `lineas_moviles` |
| 💰Sueldos Contexto.xlsx | `sueldos` |
| Listado de Manuales por Area.xlsx | `manuales` |

---

## Conectar desde el Cliente

```typescript
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Query
const { data } = await supabase
  .from('empleados')
  .select('*, puestos(puesto), home_office_semanal(*)')
  .eq('estado', 'activo')
  .order('nombre_apellido')

// Mutate
const { error } = await supabase
  .from('empleados')
  .update({ celular: '5491166667777' })
  .eq('id', 1)

// RPC
const { data } = await supabase
  .rpc('get_vacaciones_calendario', { mes: 5, anio: 2026 })
```