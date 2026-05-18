import { supabase } from '@/lib/supabase';
import type { Manual, ManualUploadInput, TipoArchivo } from './types';

const BUCKET = 'manuales';

function detectTipo(file: File): TipoArchivo {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'doc' || ext === 'docx') return 'word';
  return 'excel';
}

export async function getManuales(): Promise<Manual[]> {
  const { data, error } = await supabase
    .from('manuales')
    .select('*')
    .not('storage_path', 'is', null)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Manual[];
}

export async function uploadManual({ file, tarea, area }: ManualUploadInput): Promise<void> {
  const ext = file.name.split('.').pop() ?? '';
  const storagePath = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const tipo = detectTipo(file);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { error: dbError } = await supabase.from('manuales').insert({
    empresa_id: 1,
    tarea,
    area,
    storage_path: storagePath,
    nombre_archivo: file.name,
    tipo_archivo: tipo,
    tamanio: file.size
  });

  if (dbError) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw new Error(dbError.message);
  }
}

export async function deleteManual(manual: Manual): Promise<void> {
  if (manual.storage_path) {
    await supabase.storage.from(BUCKET).remove([manual.storage_path]);
  }
  const { error } = await supabase.from('manuales').delete().eq('id', manual.id);
  if (error) throw new Error(error.message);
}

export function getDownloadUrl(storagePath: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export function formatTamanio(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
