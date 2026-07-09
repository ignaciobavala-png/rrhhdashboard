import { supabase } from '@/lib/supabase';
import type { Documento, DocumentoUploadInput, TipoArchivo } from './types';

const BUCKET = 'expedientes';

function detectTipo(file: File): TipoArchivo {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') return 'imagen';
  return 'word';
}

export async function getDocumentos(empleadoId?: number): Promise<Documento[]> {
  let query = supabase
    .from('documentos_empleados')
    .select('*, empleados(nombre_apellido)')
    .not('storage_path', 'is', null)
    .order('created_at', { ascending: false });

  if (empleadoId) query = query.eq('empleado_id', empleadoId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((d) => ({
    ...d,
    empleado_nombre: d.empleados?.nombre_apellido ?? null
  })) as Documento[];
}

export async function uploadDocumento({
  file,
  empleado_id,
  tipo,
  tipo_otro
}: DocumentoUploadInput): Promise<Documento> {
  const storagePath = `${empleado_id}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const tipoArchivo = detectTipo(file);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { data, error: dbError } = await supabase
    .from('documentos_empleados')
    .insert({
      empresa_id: 1,
      empleado_id,
      tipo,
      tipo_otro: tipo === 'otro' ? (tipo_otro?.trim() ?? null) : null,
      storage_path: storagePath,
      nombre_archivo: file.name,
      tipo_archivo: tipoArchivo,
      tamanio: file.size
    })
    .select('*, empleados(nombre_apellido)')
    .single();

  if (dbError) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw new Error(dbError.message);
  }

  return {
    ...data,
    empleado_nombre: data.empleados?.nombre_apellido ?? null
  } as Documento;
}

export async function deleteDocumento(documento: Documento): Promise<void> {
  if (documento.storage_path) {
    await supabase.storage.from(BUCKET).remove([documento.storage_path]);
  }
  const { error } = await supabase.from('documentos_empleados').delete().eq('id', documento.id);
  if (error) throw new Error(error.message);
}

export function getDownloadUrl(storagePath: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export type EmpleadoOption = { id: number; nombre_apellido: string };

export async function getEmpleadosParaDocumento(): Promise<EmpleadoOption[]> {
  const { data, error } = await supabase
    .from('empleados')
    .select('id, nombre_apellido')
    .eq('activo', true)
    .order('nombre_apellido');
  if (error) throw new Error(error.message);
  return (data ?? []) as EmpleadoOption[];
}

export function formatTamanio(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
