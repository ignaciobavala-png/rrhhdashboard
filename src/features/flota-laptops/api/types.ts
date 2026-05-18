export type Laptop = {
  id: number;
  empresa_id: number;
  empleado_id: number | null;
  empleado_nombre: string | null;
  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;
  usuario: string | null;
  equipo: string | null;
  ubicacion: string | null;
  comentarios: string | null;
  estado: 'asignado' | 'disponible' | 'baja';
  created_at: string;
  updated_at: string;
};

export type LaptopInput = {
  marca: string;
  modelo: string;
  numero_serie: string;
  usuario: string;
  equipo: string;
  ubicacion: string;
  comentarios: string;
  estado: 'asignado' | 'disponible' | 'baja';
};

export type LaptopsResponse = {
  items: Laptop[];
  total_items: number;
};

export type LaptopsFilters = {
  page?: number;
  limit?: number;
  search?: string;
};
