export type Reunion = {
  id: number;
  empresa_id: number;
  titulo: string;
  fecha: string;
  hora: string;
  duracion: number;
  participantes: string[];
  resumen: string | null;
  created_at: string;
  updated_at: string;
};

export type ReunionesResponse = {
  items: Reunion[];
  total_items: number;
};

export type ReunionesFilters = {
  page?: number;
  limit?: number;
  search?: string;
};
