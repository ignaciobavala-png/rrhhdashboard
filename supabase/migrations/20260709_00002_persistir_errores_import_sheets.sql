-- Los errores/salteos del import "inteligente" (sheet → tabla de negocio,
-- ej. Legajo → empleados) se calculaban en import-engine.ts pero nunca se
-- persistían ni se mostraban: un fallo de import pasaba 100% desapercibido
-- (un alta nueva podía no llegar a la tabla y nadie se enteraba). Se agregan
-- columnas a sheet_syncs para dejar registro.

alter table sheet_syncs
  add column if not exists import_created integer,
  add column if not exists import_updated integer,
  add column if not exists import_skipped integer,
  add column if not exists import_error text;

comment on column sheet_syncs.import_error is 'Error del import a la tabla de negocio (ej. constraint violation), si lo hubo';
