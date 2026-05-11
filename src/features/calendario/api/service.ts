import { supabase } from '@/lib/supabase';
import type { VacacionesDia, EmpleadoCumpleanos } from './types';

export async function getVacacionesDias(): Promise<VacacionesDia[]> {
  const { data, error } = await supabase.rpc('get_vacaciones_calendario');
  if (error) {
    console.error('[calendario] vacaciones error:', error.message);
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => ({
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
