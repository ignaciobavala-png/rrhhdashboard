-- Reversa exacta de registrar_vacaciones(), para poder deshacer un registro
-- de vacaciones sin corromper otros registros acumulados en el mismo mes.
create or replace function public.revertir_vacaciones(
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
  v_anio_uso integer;
  v_saldo_inicial integer;
  v_dias_correspondientes integer;
begin
  select id into v_vacaciones_id
  from vacaciones
  where empleado_id = p_empleado_id and anio = p_periodo_anio;

  if v_vacaciones_id is null then
    raise exception 'No hay vacaciones registradas para este empleado en el año %', p_periodo_anio;
  end if;

  v_dias_usados := (p_fecha_fin - p_fecha_inicio) + 1;
  v_anio_uso := extract(year from p_fecha_inicio)::int;
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
      v_dias_en_mes := extract(day from date_trunc('month', make_date(v_anio_uso, v_mes, 1)) + interval '1 month' - interval '1 day');
    end if;

    update vacaciones_dias
    set dias_usados = dias_usados - v_dias_en_mes
    where vacaciones_id = v_vacaciones_id and mes = v_mes and anio_uso = v_anio_uso;

    delete from vacaciones_dias
    where vacaciones_id = v_vacaciones_id and mes = v_mes and anio_uso = v_anio_uso and dias_usados <= 0;
  end loop;

  update vacaciones
  set saldo_inicial = saldo_inicial - v_dias_usados,
      dias_correspondientes = dias_correspondientes - v_dias_usados,
      saldo_actual = saldo_actual + v_dias_usados
  where id = v_vacaciones_id
  returning saldo_inicial, dias_correspondientes into v_saldo_inicial, v_dias_correspondientes;

  if v_saldo_inicial <= 0 and v_dias_correspondientes <= 0 then
    delete from vacaciones where id = v_vacaciones_id;
  end if;

  return jsonb_build_object(
    'success', true,
    'vacaciones_id', v_vacaciones_id,
    'dias_revertidos', v_dias_usados
  );
end;
$function$;
