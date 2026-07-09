export type Notificacion = {
  id: number;
  entidad: string;
  entidad_id: number | null;
  accion: 'creacion' | 'modificacion' | 'eliminacion';
  descripcion: string;
  leida: boolean;
  created_at: string;
  valor_anterior: Record<string, unknown> | null;
  valor_nuevo: Record<string, unknown> | null;
};

export type ProximoEvento = {
  tipo: 'reunion' | 'cumpleanos';
  titulo: string;
  fecha: string;
  diasRestantes: number;
  hora?: string | null;
};
