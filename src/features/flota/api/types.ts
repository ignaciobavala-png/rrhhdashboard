export type LineaMovil = {
  id: number;
  empresa_id: number;
  empleado_id: number | null;
  empleado_nombre: string | null;
  numero: string;
  rol: string | null;
  usuario: string | null;
  equipo: string | null;
  estado: 'asignado' | 'disponible' | 'baja';
  created_at: string;
};

export type LineasMovilesResponse = {
  items: LineaMovil[];
  total_items: number;
};

export type LineasMovilesFilters = {
  page?: number;
  limit?: number;
  search?: string;
};

export type LineaMovilInput = {
  numero: string;
  rol: string;
  usuario: string;
  equipo: string;
  estado: 'asignado' | 'disponible' | 'baja';
};
