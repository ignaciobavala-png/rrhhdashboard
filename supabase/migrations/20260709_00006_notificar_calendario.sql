-- Notificaciones: eventos_calendario (estudio/ausencia/mudanza) y vacaciones
-- nunca generaban notificación porque no tenían el trigger notify_* que sí
-- tienen empleados/reuniones/manuales/flota_laptops/lineas_moviles/puestos.

create or replace function public.log_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_entidad_id  bigint;
  v_accion      text;
  v_descripcion text;
  v_nombre      text;
begin
  v_accion := case tg_op
    when 'INSERT' then 'creacion'
    when 'UPDATE' then 'modificacion'
    when 'DELETE' then 'eliminacion'
  end;

  if tg_op = 'DELETE' then
    v_entidad_id := old.id;
    case tg_table_name
      when 'empleados' then
        v_descripcion := 'Empleado eliminado: ' || old.nombre_apellido;
      when 'reuniones' then
        v_descripcion := 'Reunión eliminada: ' || old.titulo;
      when 'manuales' then
        v_descripcion := 'Manual eliminado: ' || old.tarea;
      when 'flota_laptops' then
        v_descripcion := 'Laptop eliminada: ' || coalesce(
          nullif(trim(coalesce(old.marca,'') || ' ' || coalesce(old.modelo,'')), ''),
          old.numero_serie, 'sin identificar');
      when 'lineas_moviles' then
        v_descripcion := 'Línea móvil eliminada: ' || old.numero;
      when 'puestos' then
        select nombre_apellido into v_nombre from public.empleados where id = old.empleado_id;
        v_descripcion := 'Puesto eliminado para: ' || coalesce(v_nombre, 'empleado #' || old.empleado_id::text);
      when 'eventos_calendario' then
        select nombre_apellido into v_nombre from public.empleados where id = old.empleado_id;
        v_descripcion := 'Evento de calendario eliminado (' || old.tipo || '): ' ||
          coalesce(v_nombre, 'empleado #' || old.empleado_id::text) || ' — ' ||
          to_char(old.fecha, 'DD/MM/YYYY');
      when 'vacaciones' then
        select nombre_apellido into v_nombre from public.empleados where id = old.empleado_id;
        v_descripcion := 'Vacaciones eliminadas: ' || coalesce(v_nombre, 'empleado #' || old.empleado_id::text) ||
          ' (' || old.anio || ')';
      else
        v_descripcion := tg_table_name || ' eliminado';
    end case;

  elsif tg_op = 'INSERT' then
    v_entidad_id := new.id;
    case tg_table_name
      when 'empleados' then
        v_descripcion := 'Nuevo empleado: ' || new.nombre_apellido;
      when 'reuniones' then
        v_descripcion := 'Nueva reunión: ' || new.titulo || ' — ' || to_char(new.fecha::date, 'DD/MM/YYYY');
      when 'manuales' then
        v_descripcion := 'Manual subido: ' || new.tarea;
      when 'flota_laptops' then
        v_descripcion := 'Nueva laptop: ' || coalesce(
          nullif(trim(coalesce(new.marca,'') || ' ' || coalesce(new.modelo,'')), ''),
          new.numero_serie, 'sin identificar');
      when 'lineas_moviles' then
        v_descripcion := 'Nueva línea móvil: ' || new.numero;
      when 'puestos' then
        select nombre_apellido into v_nombre from public.empleados where id = new.empleado_id;
        v_descripcion := 'Puesto asignado: ' || coalesce(v_nombre, 'empleado #' || new.empleado_id::text) || ' → ' || new.puesto;
      when 'eventos_calendario' then
        select nombre_apellido into v_nombre from public.empleados where id = new.empleado_id;
        v_descripcion := 'Nuevo evento de calendario (' || new.tipo || '): ' ||
          coalesce(v_nombre, 'empleado #' || new.empleado_id::text) || ' — ' ||
          to_char(new.fecha, 'DD/MM/YYYY');
      when 'vacaciones' then
        select nombre_apellido into v_nombre from public.empleados where id = new.empleado_id;
        v_descripcion := 'Vacaciones registradas: ' || coalesce(v_nombre, 'empleado #' || new.empleado_id::text) ||
          ' (' || new.anio || ')';
      else
        v_descripcion := 'Nuevo registro en ' || tg_table_name;
    end case;

  else -- UPDATE
    v_entidad_id := new.id;
    case tg_table_name
      when 'empleados' then
        v_descripcion := 'Empleado actualizado: ' || new.nombre_apellido;
      when 'reuniones' then
        v_descripcion := 'Reunión actualizada: ' || new.titulo;
      when 'manuales' then
        v_descripcion := 'Manual actualizado: ' || new.tarea;
      when 'flota_laptops' then
        v_descripcion := 'Laptop actualizada: ' || coalesce(
          nullif(trim(coalesce(new.marca,'') || ' ' || coalesce(new.modelo,'')), ''),
          new.numero_serie, 'sin identificar');
      when 'lineas_moviles' then
        v_descripcion := 'Línea móvil actualizada: ' || new.numero;
      when 'puestos' then
        select nombre_apellido into v_nombre from public.empleados where id = new.empleado_id;
        v_descripcion := 'Puesto actualizado: ' || coalesce(v_nombre, 'empleado #' || new.empleado_id::text) || ' → ' || new.puesto;
      when 'eventos_calendario' then
        select nombre_apellido into v_nombre from public.empleados where id = new.empleado_id;
        v_descripcion := 'Evento de calendario actualizado (' || new.tipo || '): ' ||
          coalesce(v_nombre, 'empleado #' || new.empleado_id::text) || ' — ' ||
          to_char(new.fecha, 'DD/MM/YYYY');
      when 'vacaciones' then
        select nombre_apellido into v_nombre from public.empleados where id = new.empleado_id;
        v_descripcion := 'Vacaciones actualizadas: ' || coalesce(v_nombre, 'empleado #' || new.empleado_id::text) ||
          ' (' || new.anio || ')';
      else
        v_descripcion := tg_table_name || ' actualizado';
    end case;
  end if;

  insert into public.notificaciones (entidad, entidad_id, accion, descripcion, valor_anterior, valor_nuevo)
  values (
    tg_table_name,
    v_entidad_id,
    v_accion,
    v_descripcion,
    case when tg_op = 'UPDATE' then to_jsonb(old) else null end,
    case when tg_op = 'UPDATE' then to_jsonb(new) else null end
  );

  return null;
end;
$function$;

drop trigger if exists notify_eventos_calendario on eventos_calendario;
create trigger notify_eventos_calendario
  after insert or update or delete on eventos_calendario
  for each row execute function public.log_change();

drop trigger if exists notify_vacaciones on vacaciones;
create trigger notify_vacaciones
  after insert or update or delete on vacaciones
  for each row execute function public.log_change();
