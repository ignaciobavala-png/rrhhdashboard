export type TipoDocumento = 'contrato' | 'dni' | 'certificado' | 'otro';

export type TipoArchivo = 'pdf' | 'word' | 'imagen';

export type Documento = {
  id: number;
  empresa_id: number;
  empleado_id: number;
  empleado_nombre: string | null;
  tipo: TipoDocumento;
  tipo_otro: string | null;
  storage_path: string | null;
  nombre_archivo: string | null;
  tipo_archivo: TipoArchivo | null;
  tamanio: number | null;
  created_at: string;
};

export type DocumentoUploadInput = {
  file: File;
  empleado_id: number;
  tipo: TipoDocumento;
  tipo_otro?: string;
};
