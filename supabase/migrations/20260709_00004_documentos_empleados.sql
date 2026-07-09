-- Expediente Digital: la página /dashboard/documents era un placeholder del
-- template (botón "Subir Documento" sin onClick, sin bucket, sin tabla).
-- Se crea la tabla y el bucket de storage, calcados del patrón ya usado
-- y funcional en "manuales".

create table if not exists documentos_empleados (
  id bigint primary key generated always as identity,
  empresa_id bigint not null default 1 references empresas(id) on delete cascade,
  empleado_id bigint not null references empleados(id) on delete cascade,
  tipo text not null check (tipo in ('contrato', 'dni', 'certificado', 'otro')),
  tipo_otro text,
  storage_path text,
  nombre_archivo text,
  tipo_archivo text,
  tamanio bigint,
  created_at timestamptz not null default now()
);

create index idx_documentos_empleados_empleado on documentos_empleados(empleado_id);

alter table documentos_empleados enable row level security;

create policy documentos_empleados_select on documentos_empleados for select to anon, authenticated using (true);
create policy documentos_empleados_write on documentos_empleados for all to anon, authenticated using (true) with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'expedientes',
  'expedientes',
  true,
  52428800,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ]
)
on conflict (id) do nothing;

create policy "expedientes_storage_select" on storage.objects
  for select to anon, authenticated using (bucket_id = 'expedientes');

create policy "expedientes_storage_insert" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'expedientes');

create policy "expedientes_storage_delete" on storage.objects
  for delete to anon, authenticated using (bucket_id = 'expedientes');
