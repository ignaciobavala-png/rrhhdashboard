-- Corrige la política RLS de la tabla reuniones.
--
-- La política anterior (reuniones_tenant_isolation) requería que el cliente
-- configurara `app.empresa_id` en cada sesión de Supabase — mecanismo de
-- multi-tenancy que no está implementado en el frontend actual (sin auth).
-- Esto bloqueaba silenciosamente todos los INSERTs/UPDATEs/DELETEs desde
-- el cliente anon, causando el error "Error al guardar la reunión".
--
-- Se reemplaza por políticas simples (qual: true), alineadas con el patrón
-- del resto de las tablas (empleados, sueldos, vacaciones, etc.).

DROP POLICY IF EXISTS "reuniones_tenant_isolation" ON public.reuniones;

CREATE POLICY "reuniones_select" ON public.reuniones
  FOR SELECT USING (true);

CREATE POLICY "reuniones_write" ON public.reuniones
  FOR ALL USING (true);
