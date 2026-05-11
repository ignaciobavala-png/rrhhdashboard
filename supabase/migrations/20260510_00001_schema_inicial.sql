-- ============================================================================
-- Migration: Schema Inicial — PetraLabs RRHH
-- Basado en los archivos Excel de Contexto Investments:
--   - Legajo Colaboradores.xlsx
--   - Listado de Manuales por Area.xlsx
--   - 💰Sueldos Contexto.xlsx
-- ============================================================================

-- 0. EXTENSIONES
-- ============================================================================
create extension if not exists "pgcrypto" with schema extensions;
create extension if not exists "pgjwt" with schema extensions;

-- 1. TABLA: empresas
-- ============================================================================
-- Cada empresa cliente del SaaS ve solo sus datos via RLS.
create table if not exists empresas (
  id bigint primary key generated always as identity,
  nombre text not null,
  slug text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. TABLA: empleados
-- ============================================================================
-- Origen: Legajo Colaboradores.xlsx — hoja "Legajo"
create table if not exists empleados (
  id bigint primary key generated always as identity,
  empresa_id bigint not null references empresas(id) on delete cascade,
  nombre_apellido text not null,
  activo boolean not null default true,
  fecha_nacimiento date,
  dni text,
  celular text,
  contacto_emergencia text,
  equipo_ingreso text,                  -- departamento/asignación inicial
  fecha_ingreso date,
  email text,
  direccion text,
  movilidad text,                       -- medio de transporte / movilidad
  modalidad text check (modalidad in ('presencial', 'home_office', 'hibrido')) default 'presencial',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(empresa_id, dni),
  unique(empresa_id, email)
);

comment on column empleados.equipo_ingreso is 'Departamento o equipo al que ingresa (Finanzas, Comercial, etc.)';
comment on column empleados.movilidad is 'Medio de movilidad registrado (auto, tren, etc.)';
comment on column empleados.modalidad is 'Modalidad laboral: presencial, home_office o hibrido';

-- 3. TABLA: home_office_semanal
-- ============================================================================
-- Origen: Legajo Colaboradores.xlsx — hoja "HO"
-- Registro día por día de la modalidad semanal de cada empleado.
create table if not exists home_office_semanal (
  id bigint primary key generated always as identity,
  empleado_id bigint not null references empleados(id) on delete cascade,
  dia_semana text not null check (dia_semana in ('lu', 'ma', 'mi', 'ju', 'vi')),
  modalidad text not null check (modalidad in ('Presencial', 'Remoto')),
  fecha_desde date not null default current_date,
  fecha_hasta date,
  created_at timestamptz not null default now(),
  unique(empleado_id, dia_semana, fecha_desde)
);

comment on table home_office_semanal is 'Agenda semanal de modalidad por empleado';

-- 4. TABLA: vacaciones
-- ============================================================================
-- Origen: Legajo Colaboradores.xlsx — hoja "Vacaciones 2025"
create table if not exists vacaciones (
  id bigint primary key generated always as identity,
  empleado_id bigint not null references empleados(id) on delete cascade,
  anio integer not null,
  saldo_inicial numeric(10,2) not null default 0,
  dias_correspondientes integer not null default 0,
  saldo_actual numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  unique(empleado_id, anio)
);

-- Detalle mensual de días de vacaciones usados
create table if not exists vacaciones_dias (
  id bigint primary key generated always as identity,
  vacaciones_id bigint not null references vacaciones(id) on delete cascade,
  mes integer not null check (mes between 1 and 12),
  dias_usados numeric(4,1) not null default 0,
  created_at timestamptz not null default now(),
  unique(vacaciones_id, mes)
);

-- 5. TABLA: lineas_moviles (Flota de Celulares)
-- ============================================================================
-- Origen: Legajo Colaboradores.xlsx — hoja "Lineas Móviles"
create table if not exists lineas_moviles (
  id bigint primary key generated always as identity,
  empleado_id bigint references empleados(id) on delete set null,
  empresa_id bigint not null references empresas(id) on delete cascade,
  numero text not null,
  rol text,
  usuario text,
  equipo text,
  estado text not null default 'asignado' check (estado in ('asignado', 'disponible', 'baja')),
  created_at timestamptz not null default now(),
  unique(numero)
);

comment on column lineas_moviles.rol is 'Rol de la línea (Asesoramiento, Compliance, etc.)';
comment on column lineas_moviles.usuario is 'Iniciales del usuario asignado';

-- 6. TABLA: sueldos
-- ============================================================================
-- Origen: 💰Sueldos Contexto.xlsx
create table if not exists sueldos (
  id bigint primary key generated always as identity,
  empleado_id bigint not null references empleados(id) on delete cascade,
  empresa_id bigint not null references empresas(id) on delete cascade,
  moneda text not null check (moneda in ('PESOS ARG', 'USD')),
  mes integer not null check (mes between 1 and 12),
  anio integer not null default 2025,
  monto numeric(15,2),
  bono_anual numeric(15,2),
  created_at timestamptz not null default now(),
  unique(empleado_id, mes, anio)
);

comment on column sueldos.bono_anual is 'Bono anual percibido en el período';

-- 7. TABLA: manuales
-- ============================================================================
-- Origen: Listado de Manuales por Area.xlsx
create table if not exists manuales (
  id bigint primary key generated always as identity,
  empresa_id bigint not null references empresas(id) on delete cascade,
  tarea text not null,
  link_manual text,
  area text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table manuales is 'Manuales de procedimientos por área';

-- ============================================================================
-- ÍNDICES
-- ============================================================================

-- empleados
create index idx_empleados_empresa on empleados(empresa_id);
create index idx_empleados_activo on empleados(activo) where activo = true;
create index idx_empleados_modalidad on empleados(modalidad);

-- home_office_semanal
create index idx_home_office_empleado on home_office_semanal(empleado_id);
create index idx_home_office_vigente on home_office_semanal(empleado_id, dia_semana) where fecha_hasta is null;

-- vacaciones
create index idx_vacaciones_empleado on vacaciones(empleado_id, anio);

-- lineas_moviles
create index idx_lineas_moviles_empresa on lineas_moviles(empresa_id);
create index idx_lineas_moviles_estado on lineas_moviles(estado) where estado = 'asignado';

-- sueldos
create index idx_sueldos_empleado on sueldos(empleado_id, anio);
create index idx_sueldos_empresa on sueldos(empresa_id);

-- manuales
create index idx_manuales_area on manuales(area);
create index idx_manuales_empresa on manuales(empresa_id);

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

alter table empresas enable row level security;
alter table empleados enable row level security;
alter table home_office_semanal enable row level security;
alter table vacaciones enable row level security;
alter table vacaciones_dias enable row level security;
alter table lineas_moviles enable row level security;
alter table sueldos enable row level security;
alter table manuales enable row level security;

-- Políticas: cada usuario ve solo los datos de su empresa.
-- El tenant_id se obtiene del claim en la JWT (empresa_id).
create policy "empresas_tenant_isolation" on empresas
  for all using (id = (select current_setting('app.empresa_id', true)::bigint));

create policy "empleados_tenant_isolation" on empleados
  for all using (empresa_id = (select current_setting('app.empresa_id', true)::bigint));

create policy "home_office_tenant_isolation" on home_office_semanal
  for all using (empleado_id in (
    select id from empleados where empresa_id = (select current_setting('app.empresa_id', true)::bigint)
  ));

create policy "vacaciones_tenant_isolation" on vacaciones
  for all using (empleado_id in (
    select id from empleados where empresa_id = (select current_setting('app.empresa_id', true)::bigint)
  ));

create policy "vacaciones_dias_tenant_isolation" on vacaciones_dias
  for all using (vacaciones_id in (
    select v.id from vacaciones v join empleados e on e.id = v.empleado_id
    where e.empresa_id = (select current_setting('app.empresa_id', true)::bigint)
  ));

create policy "lineas_moviles_tenant_isolation" on lineas_moviles
  for all using (empresa_id = (select current_setting('app.empresa_id', true)::bigint));

create policy "sueldos_tenant_isolation" on sueldos
  for all using (empresa_id = (select current_setting('app.empresa_id', true)::bigint));

create policy "manuales_tenant_isolation" on manuales
  for all using (empresa_id = (select current_setting('app.empresa_id', true)::bigint));

-- ============================================================================
-- TRIGGER: updated_at automático
-- ============================================================================

create or replace function trigger_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on empresas
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on empleados
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on manuales
  for each row execute function trigger_set_updated_at();
