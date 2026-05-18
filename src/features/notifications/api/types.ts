export type Notificacion = {
  id: number;
  entidad: string;
  entidad_id: number | null;
  accion: 'creacion' | 'modificacion' | 'eliminacion';
  descripcion: string;
  leida: boolean;
  created_at: string;
};

export type ProximoEvento = {
  tipo: 'reunion' | 'cumpleanos';
  titulo: string;
  fecha: string;
  diasRestantes: number;
  hora?: string | null;
};
