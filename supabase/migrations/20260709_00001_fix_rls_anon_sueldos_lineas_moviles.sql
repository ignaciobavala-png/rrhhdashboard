-- La app no usa Supabase Auth (login propio por PIN), por lo que el cliente
-- del navegador siempre opera con el rol "anon". Las políticas de escritura
-- de sueldos y lineas_moviles solo autorizaban al rol "authenticated" (nunca
-- usado acá), causando "new row violates row-level security policy" al
-- insertar/actualizar desde la UI. Se alinean con el resto de tablas
-- (empleados, eventos_calendario, flota_laptops, reuniones), que sí incluyen
-- "anon".

drop policy if exists sueldos_write on sueldos;
create policy sueldos_write on sueldos for all to anon, authenticated using (true) with check (true);

drop policy if exists lineas_moviles_write on lineas_moviles;
create policy lineas_moviles_write on lineas_moviles for all to anon, authenticated using (true) with check (true);
