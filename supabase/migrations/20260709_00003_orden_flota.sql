-- Agrega columna de orden manual para poder reordenar filas (subir/bajar)
-- en Flota > Celulares y Laptops. Se backfillea según el orden actual
-- (created_at, id) para no alterar el orden visible existente.

alter table lineas_moviles add column if not exists orden integer;
alter table flota_laptops add column if not exists orden integer;

with numerado as (
  select id, row_number() over (partition by empresa_id order by created_at, id) as rn
  from lineas_moviles
)
update lineas_moviles l set orden = n.rn
from numerado n
where l.id = n.id and l.orden is null;

with numerado as (
  select id, row_number() over (partition by empresa_id order by created_at, id) as rn
  from flota_laptops
)
update flota_laptops f set orden = n.rn
from numerado n
where f.id = n.id and f.orden is null;
