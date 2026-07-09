-- INCIDENTE: la migración 20260709_00005_auditoria_produccion.sql borró
-- `app_config` creyendo que era una tabla huérfana sin uso (0 filas visibles,
-- sin referencias en el código TypeScript). Era un error: `verify_pin()` y
-- `change_pin()` la usan directamente en SQL para guardar el hash bcrypt del
-- PIN de acceso (key='pin_hash') y el estado de intentos fallidos
-- (key='pin_state') — invisible a un grep sobre el código de la app.
--
-- No existía ninguna migración local que creara esta tabla (drift: se había
-- aplicado directo en producción, igual que pasó después con esta misma
-- restauración). Se reconstruye el schema a partir de los cuerpos de
-- verify_pin/change_pin. El hash del PIN anterior no es recuperable (bcrypt
-- de un solo sentido + sin backup previo al DROP) — se generó y sembró un
-- PIN nuevo por separado, fuera de esta migración.
create table if not exists public.app_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- RLS habilitada sin policies: acceso solo vía las funciones SECURITY DEFINER
-- (verify_pin/change_pin), nunca directo desde anon/authenticated. Este es
-- el diseño original correcto, no un descuido.
alter table public.app_config enable row level security;

insert into public.app_config (key, value)
values ('pin_state', '{"failed": 0, "locked_until": null}'::jsonb)
on conflict (key) do nothing;
