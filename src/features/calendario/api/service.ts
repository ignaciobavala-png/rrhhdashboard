import { supabase } from '@/lib/supabase';
import type { VacacionesDia, EmpleadoCumpleanos, EventoCalendarioRow } from './types';

export async function getVacacionesDias(): Promise<VacacionesDia[]> {
  const { data, error } = await supabase.rpc('get_vacaciones_calendario');
  if (error) {
    console.error('[calendario] vacaciones error:', error.message);
    return [];
  }
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as number,
    mes: r.mes as number,
    anio_uso: r.anio_uso as number,
    dias_usados: Number(r.dias_usados),
    anio: r.anio as number,
    empleado_id: r.empleado_id as number,
    nombre_apellido: r.nombre_apellido as string,
    fecha_inicio: r.fecha_inicio as string | null,
    fecha_fin: r.fecha_fin as string | null
  }));
}

export async function getEventosCalendario(): Promise<EventoCalendarioRow[]> {
  const { data, error } = await supabase.rpc('get_eventos_calendario');
  if (error) {
    console.error('[calendario] eventos error:', error.message);
    return [];
  }
  return (data ?? []) as EventoCalendarioRow[];
}

export async function getEmpleadosCumpleanos(): Promise<EmpleadoCumpleanos[]> {
  const { data, error } = await supabase
    .from('empleados')
    .select('id, nombre_apellido, fecha_nacimiento')
    .eq('activo', true)
    .not('fecha_nacimiento', 'is', null)
    .order('nombre_apellido');
  if (error) {
    console.error('[calendario] cumpleanos error:', error.message);
    return [];
  }
  return (data ?? []) as EmpleadoCumpleanos[];
}

export async function getEmpleadosActivos(): Promise<EmpleadoCumpleanos[]> {
  const { data, error } = await supabase
    .from('empleados')
    .select('id, nombre_apellido')
    .eq('activo', true)
    .order('nombre_apellido');
  if (error) {
    console.error('[calendario] empleados error:', error.message);
    return [];
  }
  return (data ?? []) as EmpleadoCumpleanos[];
}

export type EventoCalendarioInput = {
  empleado_id: number;
  tipo: 'estudio' | 'ausencia' | 'mudanza';
  fecha: string;
  descripcion?: string | null;
};

export async function crearEvento(input: EventoCalendarioInput): Promise<void> {
  const { error } = await supabase.from('eventos_calendario').insert(input);
  if (error) throw new Error(error.message);
}

export async function actualizarEvento(id: number, input: EventoCalendarioInput): Promise<void> {
  const { error } = await supabase.from('eventos_calendario').update(input).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function eliminarEvento(id: number): Promise<void> {
  const { error } = await supabase.from('eventos_calendario').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function registrarVacaciones(
  empleado_id: number,
  fecha_inicio: string,
  fecha_fin: string,
  periodo_anio: number
) {
  const { data, error } = await supabase.rpc('registrar_vacaciones', {
    p_empleado_id: empleado_id,
    p_fecha_inicio: fecha_inicio,
    p_fecha_fin: fecha_fin,
    p_periodo_anio: periodo_anio
  });
  if (error) {
    console.error('[calendario] registrar vacaciones error:', error.message);
    throw new Error(error.message);
  }
  return data;
}
