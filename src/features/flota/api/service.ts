import { supabase } from '@/lib/supabase';
import { ilikePattern } from '@/lib/utils';
import type {
  EmpleadoOption,
  LineaMovil,
  LineaMovilInput,
  LineasMovilesFilters,
  LineasMovilesResponse
} from './types';

export async function getEmpleadosParaLinea(): Promise<EmpleadoOption[]> {
  const { data, error } = await supabase
    .from('empleados')
    .select('id, nombre_apellido')
    .eq('activo', true)
    .order('nombre_apellido');
  if (error) throw new Error(error.message);
  return (data ?? []) as EmpleadoOption[];
}

export async function getLineasMoviles(
  filters: LineasMovilesFilters = {}
): Promise<LineasMovilesResponse> {
  const { page = 1, limit = 10, search } = filters;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('lineas_moviles')
    .select('*, empleados(nombre_apellido)', { count: 'exact' });

  if (search) {
    const q = ilikePattern(search);
    query = query.or(`numero.ilike.${q},rol.ilike.${q},usuario.ilike.${q},equipo.ilike.${q}`);
  }

  query = query.order('orden', { ascending: true }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  const items = (data ?? []).map((linea) => ({
    ...linea,
    empleado_nombre: linea.empleados?.nombre_apellido ?? null
  }));

  return { items: items as LineaMovil[], total_items: count ?? 0 };
}

export async function createLineaMovil(input: LineaMovilInput): Promise<{ id: number }> {
  const { count } = await supabase
    .from('lineas_moviles')
    .select('id', { count: 'exact', head: true });

  const { data, error } = await supabase
    .from('lineas_moviles')
    .insert({
      empresa_id: 1,
      numero: input.numero,
      rol: input.rol || null,
      usuario: input.usuario || null,
      equipo: input.equipo || null,
      estado: input.estado,
      empleado_id: input.empleado_id,
      orden: (count ?? 0) + 1
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data as { id: number };
}

export async function swapOrdenLineaMovil(
  a: { id: number; orden: number },
  b: { id: number; orden: number }
): Promise<void> {
  const { error: e1 } = await supabase
    .from('lineas_moviles')
    .update({ orden: b.orden })
    .eq('id', a.id);
  if (e1) throw new Error(e1.message);

  const { error: e2 } = await supabase
    .from('lineas_moviles')
    .update({ orden: a.orden })
    .eq('id', b.id);
  if (e2) throw new Error(e2.message);
}

export async function updateLineaMovil(id: number, input: LineaMovilInput): Promise<void> {
  const { error } = await supabase
    .from('lineas_moviles')
    .update({
      numero: input.numero,
      rol: input.rol || null,
      usuario: input.usuario || null,
      equipo: input.equipo || null,
      estado: input.estado,
      empleado_id: input.empleado_id
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteLineaMovil(id: number): Promise<void> {
  const { error } = await supabase.from('lineas_moviles').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
