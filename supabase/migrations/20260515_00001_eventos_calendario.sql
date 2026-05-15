-- ============================================================================
-- Migration: Eventos Calendario — PetraLabs RRHH
-- Agrega soporte para días de estudio, mudanza y ausencias en el calendario.
-- ============================================================================

-- 1. TABLA: eventos_calendario
-- ============================================================================
create table if not exists eventos_calendario (
  id bigint primary key generated always as identity,
  empleado_id bigint not null references empleados(id) on delete cascade,
  tipo text not null check (tipo in ('estudio', 'mudanza', 'ausencia')),
  fecha date not null,
  descripcion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(empleado_id, tipo, fecha)
);

comment on table eventos_calendario is 'Eventos del calendario: días de estudio, mudanza, ausencias';
comment on column eventos_calendario.tipo is 'estudio | mudanza | ausencia';

create index idx_eventos_calendario_empleado on eventos_calendario(empleado_id);
create index idx_eventos_calendario_tipo on eventos_calendario(tipo);
create index idx_eventos_calendario_fecha on eventos_calendario(fecha);

-- 2. RLS
-- ============================================================================
alter table eventos_calendario enable row level security;

create policy "eventos_calendario_tenant_isolation" on eventos_calendario
  for all using (empleado_id in (
    select id from empleados where empresa_id = (select current_setting('app.empresa_id', true)::bigint)
  ));

-- 3. TRIGGER: updated_at automático
-- ============================================================================
create trigger set_updated_at before update on eventos_calendario
  for each row execute function trigger_set_updated_at();

-- 4. RPC: get_eventos_calendario
-- ============================================================================
-- Retorna todos los eventos (estudio, mudanza, ausencia) con nombre del empleado
create or replace function get_eventos_calendario()
returns table (
  id bigint,
  empleado_id bigint,
  nombre_apellido text,
  tipo text,
  fecha date,
  descripcion text
)
language sql stable
as $$
  select
    e.id,
    e.empleado_id,
    emp.nombre_apellido,
    e.tipo,
    e.fecha,
    e.descripcion
  from eventos_calendario e
  join empleados emp on emp.id = e.empleado_id
  where emp.activo = true
  order by e.fecha asc;
$$;

-- 5. RPC: registrar_vacaciones
-- ============================================================================
-- Registra un período de vacaciones para un empleado.
-- Crea/actualiza el registro en vacaciones y los días en vacaciones_dias.
create or replace function registrar_vacaciones(
  p_empleado_id bigint,
  p_fecha_inicio date,
  p_fecha_fin date,
  p_periodo_anio integer
)
returns jsonb
language plpgsql
as $$
declare
  v_vacaciones_id bigint;
  v_dias_usados integer;
  v_mes integer;
  v_mes_inicio integer;
  v_mes_fin integer;
  v_dias_en_mes integer;
  v_result jsonb;
begin
  -- Validar fechas
  if p_fecha_inicio > p_fecha_fin then
    raise exception 'La fecha de inicio debe ser anterior o igual a la fecha de fin';
  end if;

  -- Calcular días corridos (inclusive)
  v_dias_usados := (p_fecha_fin - p_fecha_inicio) + 1;

  -- Crear o obtener registro en vacaciones
  insert into vacaciones (empleado_id, anio, saldo_inicial, dias_correspondientes, saldo_actual)
  values (p_empleado_id, p_periodo_anio, v_dias_usados, v_dias_usados, 0)
  on conflict (empleado_id, anio)
  do update set
    saldo_inicial = vacaciones.saldo_inicial + v_dias_usados,
    dias_correspondientes = vacaciones.dias_correspondientes + v_dias_usados,
    saldo_actual = vacaciones.saldo_actual - v_dias_usados
  returning id into v_vacaciones_id;

  -- Insertar por cada mes afectado
  v_mes_inicio := extract(month from p_fecha_inicio);
  v_mes_fin := extract(month from p_fecha_fin);

  for v_mes in v_mes_inicio..v_mes_fin loop
    -- Calcular días en este mes
    if v_mes = v_mes_inicio and v_mes = v_mes_fin then
      v_dias_en_mes := v_dias_usados;
    elsif v_mes = v_mes_inicio then
      v_dias_en_mes := (date_trunc('month', p_fecha_inicio) + interval '1 month' - date_trunc('day', p_fecha_inicio))::integer;
    elsif v_mes = v_mes_fin then
      v_dias_en_mes := extract(day from p_fecha_fin);
    else
      v_dias_en_mes := extract(day from date_trunc('month', make_date(extract(year from p_fecha_fin)::int, v_mes, 1)) + interval '1 month' - interval '1 day');
    end if;

    insert into vacaciones_dias (vacaciones_id, mes, dias_usados, fecha_inicio, fecha_fin, anio_uso)
    values (v_vacaciones_id, v_mes, v_dias_en_mes,
      case when v_mes = v_mes_inicio then p_fecha_inicio else null end,
      case when v_mes = v_mes_fin then p_fecha_fin else null end,
      extract(year from p_fecha_inicio)::int)
    on conflict (vacaciones_id, mes)
    do update set
      dias_usados = vacaciones_dias.dias_usados + v_dias_en_mes;
  end loop;

  -- Armar resultado
  v_result := jsonb_build_object(
    'success', true,
    'vacaciones_id', v_vacaciones_id,
    'dias_usados', v_dias_usados,
    'periodo', p_periodo_anio
  );

  return v_result;
end;
$$;
