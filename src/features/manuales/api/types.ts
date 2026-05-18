export type TipoArchivo = 'pdf' | 'word' | 'excel';

export type Manual = {
  id: number;
  empresa_id: number;
  tarea: string;
  area: string | null;
  storage_path: string | null;
  nombre_archivo: string | null;
  tipo_archivo: TipoArchivo | null;
  tamanio: number | null;
  created_at: string;
  updated_at: string;
};

export type ManualUploadInput = {
  file: File;
  tarea: string;
  area: string;
};
