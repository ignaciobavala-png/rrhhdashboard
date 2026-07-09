-- Documenta el esquema de "notificaciones" (creado manualmente, sin migración
-- trackeada hasta ahora — drift de esquema) y agrega columnas de diff
-- antes/después para poder mostrar qué cambió en una modificación.

create table if not exists notificaciones (
  id bigint primary key generated always as identity,
  empresa_id bigint not null default 1 references empresas(id) on delete cascade,
  entidad text not null,
  entidad_id bigint,
  accion text not null check (accion in ('creacion', 'modificacion', 'eliminacion')),
  descripcion text not null,
  leida boolean not null default false,
  created_at timestamptz not null default now()
);

alter table notificaciones enable row level security;

drop policy if exists notificaciones_select on notificaciones;
create policy notificaciones_select on notificaciones for select using (true);

drop policy if exists notificaciones_write on notificaciones;
create policy notificaciones_write on notificaciones for all using (true);

alter table notificaciones
  add column if not exists valor_anterior jsonb,
  add column if not exists valor_nuevo jsonb;

comment on column notificaciones.valor_anterior is 'Snapshot de la fila antes del cambio (solo en modificacion)';
comment on column notificaciones.valor_nuevo is 'Snapshot de la fila despues del cambio (solo en modificacion)';

-- Redefine el trigger existente para poblar el diff en modificaciones,
-- preservando la lógica de descripción por tabla ya existente en producción.
create or replace function log_change()
returns trigger
language plpgsql
security definer
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

-- Documenta las 5 asociaciones de trigger ya existentes en producción
-- (drift, no estaban en ninguna migración trackeada).
drop trigger if exists notify_empleados on empleados;
create trigger notify_empleados
  after insert or update or delete on empleados
  for each row execute function log_change();

drop trigger if exists notify_reuniones on reuniones;
create trigger notify_reuniones
  after insert or update or delete on reuniones
  for each row execute function log_change();

drop trigger if exists notify_manuales on manuales;
create trigger notify_manuales
  after insert or update or delete on manuales
  for each row execute function log_change();

drop trigger if exists notify_flota_laptops on flota_laptops;
create trigger notify_flota_laptops
  after insert or update or delete on flota_laptops
  for each row execute function log_change();

drop trigger if exists notify_lineas_moviles on lineas_moviles;
create trigger notify_lineas_moviles
  after insert or update or delete on lineas_moviles
  for each row execute function log_change();

drop trigger if exists notify_puestos on puestos;
create trigger notify_puestos
  after insert or update or delete on puestos
  for each row execute function log_change();
