-- Crea el bucket de storage para manuales y agrega columnas de metadata
-- a la tabla manuales para soportar archivos subidos directamente.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'manuales',
  'manuales',
  true,
  52428800,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "manuales_storage_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'manuales');

CREATE POLICY "manuales_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'manuales');

CREATE POLICY "manuales_storage_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'manuales');

ALTER TABLE public.manuales
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS nombre_archivo TEXT,
  ADD COLUMN IF NOT EXISTS tipo_archivo TEXT,
  ADD COLUMN IF NOT EXISTS tamanio BIGINT;

ALTER TABLE public.manuales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "manuales_select" ON public.manuales;
DROP POLICY IF EXISTS "manuales_write" ON public.manuales;

CREATE POLICY "manuales_select" ON public.manuales FOR SELECT USING (true);
CREATE POLICY "manuales_write" ON public.manuales FOR ALL USING (true);
