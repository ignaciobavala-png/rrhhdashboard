export type VacacionesDia = {
  id: number;
  mes: number;
  anio_uso: number;
  dias_usados: number;
  anio: number;
  empleado_id: number;
  nombre_apellido: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
};

export type EmpleadoCumpleanos = {
  id: number;
  nombre_apellido: string;
  fecha_nacimiento: string;
};

export type EventoCalendario = {
  id: string;
  fecha: string;
  titulo: string;
  tipo: 'licencia' | 'estudio' | 'ausencia' | 'cumpleanos' | 'mudanza';
  empleado: string;
  empleadoId: number;
  descripcion?: string;
  readonly?: boolean;
};

export type EventoCalendarioRow = {
  id: number;
  empleado_id: number;
  nombre_apellido: string;
  tipo: string;
  fecha: string;
  descripcion: string | null;
};
