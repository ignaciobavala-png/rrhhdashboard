-- Auditoría de producción: search_path fijo en funciones, buckets públicos sin
-- listado abierto, tabla app_config sin uso, políticas RLS duplicadas e índices
-- de FK faltantes.

-- 1. search_path fijo (mitiga schema injection en funciones sin invoker seguro)
alter function public.get_vacaciones_calendario() set search_path = public, pg_temp;
alter function public.get_eventos_calendario() set search_path = public, pg_temp;
alter function public.registrar_vacaciones(bigint, date, date, integer) set search_path = public, pg_temp;
alter function public.trigger_set_updated_at() set search_path = public, pg_temp;
alter function public.update_ai_session_timestamp() set search_path = public, pg_temp;
alter function public.log_change() set search_path = public, pg_temp;

-- 2. Buckets públicos: la URL pública no requiere policy de SELECT sobre
-- storage.objects (eso solo habilita listar todos los archivos vía API).
drop policy if exists expedientes_storage_select on storage.objects;
drop policy if exists manuales_storage_select on storage.objects;

-- 3. app_config: RLS habilitada sin ninguna policy, no referenciada en el código.
drop table if exists public.app_config;

-- 4. Políticas RLS duplicadas: cada tabla tenía una policy "_select" (SELECT)
-- y otra "_write" (ALL con using(true)) que ya cubre SELECT. Antes de borrar la
-- redundante, se alinean vacaciones/vacaciones_dias al patrón anon+authenticated
-- ya usado en el resto del proyecto (su _write solo cubría "authenticated").
drop policy if exists vacaciones_write on vacaciones;
create policy vacaciones_write on vacaciones for all to anon, authenticated using (true) with check (true);

drop policy if exists vacaciones_dias_write on vacaciones_dias;
create policy vacaciones_dias_write on vacaciones_dias for all to anon, authenticated using (true) with check (true);

drop policy if exists documentos_empleados_select on documentos_empleados;
drop policy if exists empleados_select on empleados;
drop policy if exists eventos_calendario_select on eventos_calendario;
drop policy if exists flota_laptops_select on flota_laptops;
drop policy if exists home_office_select on home_office_semanal;
drop policy if exists lineas_moviles_select on lineas_moviles;
drop policy if exists manuales_select on manuales;
drop policy if exists notificaciones_select on notificaciones;
drop policy if exists reuniones_select on reuniones;
drop policy if exists sueldos_select on sueldos;
drop policy if exists vacaciones_select on vacaciones;
drop policy if exists vacaciones_dias_select on vacaciones_dias;

-- 5. Índices faltantes en foreign keys
create index if not exists idx_documentos_empleados_empresa on documentos_empleados(empresa_id);
create index if not exists idx_lineas_moviles_empleado on lineas_moviles(empleado_id);
create index if not exists idx_sheet_sections_sheet on sheet_sections(sheet_id);
create index if not exists idx_sheet_sections_sync on sheet_sections(sync_id);
create index if not exists idx_sheet_syncs_sheet on sheet_syncs(sheet_id);
