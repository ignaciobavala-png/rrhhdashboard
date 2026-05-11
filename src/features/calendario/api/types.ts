export type VacacionesDia = {
  id: number;
  mes: number;
  anio_uso: number;
  dias_usados: number;
  anio: number;
  empleado_id: number;
  nombre_apellido: string;
  fecha_inicio: string | null; // YYYY-MM-DD
  fecha_fin: string | null; // YYYY-MM-DD
};

export type EmpleadoCumpleanos = {
  id: number;
  nombre_apellido: string;
  fecha_nacimiento: string;
};

export type EventoCalendario = {
  id: string;
  fecha: string; // YYYY-MM-DD
  titulo: string;
  tipo: 'licencia' | 'estudio' | 'ausencia' | 'cumpleanos';
  empleado: string;
  empleadoId: number;
  descripcion?: string;
  readonly?: boolean;
};
