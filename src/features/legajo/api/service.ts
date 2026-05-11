import { supabase } from '@/lib/supabase';
import type { Empleado, EmpleadosFilters, EmpleadosResponse } from './types';

export async function getEmpleados(filters: EmpleadosFilters = {}): Promise<EmpleadosResponse> {
  const { page = 1, limit = 10, search, sort } = filters;
  const offset = (page - 1) * limit;

  let query = supabase.from('empleados').select('*', { count: 'exact' });

  if (search) {
    query = query.or(
      `nombre_apellido.ilike.%${search}%,dni.ilike.%${search}%,email.ilike.%${search}%,equipo_ingreso.ilike.%${search}%`
    );
  }

  if (sort) {
    try {
      const sortItems = JSON.parse(sort) as { id: string; desc: boolean }[];
      if (sortItems.length > 0) {
        const { id, desc } = sortItems[0];
        const validColumns: (keyof Empleado)[] = [
          'nombre_apellido',
          'dni',
          'equipo_ingreso',
          'fecha_ingreso',
          'modalidad',
          'activo'
        ];
        if (validColumns.includes(id as keyof Empleado)) {
          query = query.order(id, { ascending: !desc });
        }
      }
    } catch {
      // ignore invalid sort
    }
  } else {
    query = query.order('nombre_apellido', { ascending: true });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  return { items: (data as Empleado[]) ?? [], total_items: count ?? 0 };
}

export async function getEmpleadoById(id: number): Promise<Empleado | null> {
  const { data, error } = await supabase.from('empleados').select('*').eq('id', id).single();
  if (error) return null;
  return data as Empleado;
}
