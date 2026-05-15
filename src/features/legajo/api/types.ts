export type Empleado = {
  id: number;
  empresa_id: number;
  nombre_apellido: string;
  activo: boolean;
  fecha_nacimiento: string | null;
  dni: string | null;
  celular: string | null;
  contacto_emergencia: string | null;
  equipo_ingreso: string | null;
  fecha_ingreso: string | null;
  email: string | null;
  direccion: string | null;
  movilidad: string | null;
  modalidad: 'presencial' | 'home_office' | 'hibrido';
  created_at: string;
  updated_at: string;
};

export type EmpleadosResponse = {
  items: Empleado[];
  total_items: number;
};

export type EmpleadosFilters = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
};

export type ContactoEmergencia = {
  telefono: string;
  nombre: string;
  parentesco: string;
};

export type HomeOfficeDia = {
  id: number;
  empleado_id: number;
  dia_semana: string;
  modalidad: 'Presencial' | 'Remoto';
  fecha_desde: string;
  fecha_hasta: string | null;
};

export type EmpleadoDetalle = Empleado & {
  home_office: HomeOfficeDia[];
};
