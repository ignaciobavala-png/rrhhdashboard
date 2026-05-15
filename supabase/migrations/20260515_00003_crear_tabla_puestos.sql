-- ============================================================================
-- Migration: Tabla Puestos — PetraLabs RRHH
-- Origen: Legajo Colaboradores.xlsx — hoja "Nombre puestos"
-- ============================================================================

create table if not exists puestos (
  id bigint primary key generated always as identity,
  empleado_id bigint references empleados(id) on delete cascade,
  puesto text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(empleado_id)
);

comment on table puestos is 'Puestos/cargos de los empleados';
comment on column puestos.puesto is 'Nombre del puesto (CEO, Financial Advisor, etc.)';

create index idx_puestos_empleado on puestos(empleado_id);

-- RLS
alter table puestos enable row level security;

create policy "puestos_tenant_isolation" on puestos
  for all using (empleado_id in (
    select id from empleados where empresa_id = (select current_setting('app.empresa_id', true)::bigint)
  ));

-- Trigger updated_at
create trigger set_updated_at before update on puestos
  for each row execute function trigger_set_updated_at();

-- ============================================================================
-- Insertar datos desde Excel "Nombre puestos"
-- ============================================================================

INSERT INTO puestos (empleado_id, puesto) VALUES
((select id from empleados where nombre_apellido = 'MARTINEZ, Valeria'), 'Admin Analyst'),
((select id from empleados where nombre_apellido = 'ROZEMBERG, Tomas'), 'CEO'),
((select id from empleados where nombre_apellido = 'HERNANDEZ, Ignacio'), 'Financial Advisor'),
((select id from empleados where nombre_apellido = 'REINERO, Nicolas'), 'Financial Advisor'),
((select id from empleados where nombre_apellido = 'TEJERINA, Franco'), 'Financial Advisor'),
((select id from empleados where nombre_apellido = 'FENOGLIO CARRIZO, Agustin'), 'New Business Director'),
((select id from empleados where nombre_apellido = 'GUARDIOLA, Fernanda'), 'Office Assistant'),
((select id from empleados where nombre_apellido = 'COSCIONE, Jonathan'), 'Office Manager'),
((select id from empleados where nombre_apellido = 'LIDERMAN, Stephanie'), 'Operations Director'),
((select id from empleados where nombre_apellido = 'STRANO, Brian'), 'Sales Trader'),
((select id from empleados where nombre_apellido = 'VIENNI, Gabriel'), 'Strategy Director'),
((select id from empleados where nombre_apellido = 'BANDIERI, Mariano'), 'Team Leader - Financial Advisor'),
((select id from empleados where nombre_apellido = 'GEMIO, Veronica'), 'Middle Office Analyst'),
((select id from empleados where nombre_apellido = 'CIRAVEGNA, Franco'), 'Sales Trader'),
((select id from empleados where nombre_apellido = 'TUBIO, Eliana'), 'Middle Office Analyst'),
((select id from empleados where nombre_apellido = 'TORASSA, Maximo'), 'Financial Advisor'),
((select id from empleados where nombre_apellido = 'OLIVERA, Mercedes'), 'Middle Office Analyst');