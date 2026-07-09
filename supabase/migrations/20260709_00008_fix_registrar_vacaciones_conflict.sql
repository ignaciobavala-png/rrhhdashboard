-- registrar_vacaciones() usaba `on conflict (vacaciones_id, mes)` pero la
-- única constraint real de vacaciones_dias es (vacaciones_id, anio_uso, mes).
-- Esto hacía que la función fallara siempre (error de Postgres al no matchear
-- ninguna constraint), por lo que nunca se pudo registrar una vacación desde
-- el dashboard: las tablas vacaciones/vacaciones_dias estaban vacías.
create or replace function public.registrar_vacaciones(
  p_empleado_id bigint,
  p_fecha_inicio date,
  p_fecha_fin date,
  p_periodo_anio integer
)
returns jsonb
language plpgsql
set search_path = public, pg_temp
as $function$
declare
  v_vacaciones_id bigint;
  v_dias_usados integer;
  v_mes integer;
  v_mes_inicio integer;
  v_mes_fin integer;
  v_dias_en_mes integer;
  v_result jsonb;
begin
  if p_fecha_inicio > p_fecha_fin then
    raise exception 'La fecha de inicio debe ser anterior o igual a la fecha de fin';
  end if;

  v_dias_usados := (p_fecha_fin - p_fecha_inicio) + 1;

  insert into vacaciones (empleado_id, anio, saldo_inicial, dias_correspondientes, saldo_actual)
  values (p_empleado_id, p_periodo_anio, v_dias_usados, v_dias_usados, 0)
  on conflict (empleado_id, anio)
  do update set
    saldo_inicial = vacaciones.saldo_inicial + v_dias_usados,
    dias_correspondientes = vacaciones.dias_correspondientes + v_dias_usados,
    saldo_actual = vacaciones.saldo_actual - v_dias_usados
  returning id into v_vacaciones_id;

  v_mes_inicio := extract(month from p_fecha_inicio);
  v_mes_fin := extract(month from p_fecha_fin);

  for v_mes in v_mes_inicio..v_mes_fin loop
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
    on conflict (vacaciones_id, anio_uso, mes)
    do update set
      dias_usados = vacaciones_dias.dias_usados + v_dias_en_mes;
  end loop;

  v_result := jsonb_build_object(
    'success', true,
    'vacaciones_id', v_vacaciones_id,
    'dias_usados', v_dias_usados,
    'periodo', p_periodo_anio
  );

  return v_result;
end;
$function$;
