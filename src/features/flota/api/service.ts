import { supabase } from '@/lib/supabase';
import type { LineaMovil, LineasMovilesFilters, LineasMovilesResponse } from './types';

export async function getLineasMoviles(
  filters: LineasMovilesFilters = {}
): Promise<LineasMovilesResponse> {
  const { page = 1, limit = 10, search } = filters;
  const offset = (page - 1) * limit;

  let query = supabase.from('lineas_moviles').select('*', { count: 'exact' });

  if (search) {
    query = query.or(
      `numero.ilike.%${search}%,rol.ilike.%${search}%,usuario.ilike.%${search}%,equipo.ilike.%${search}%`
    );
  }

  query = query.order('numero', { ascending: true }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  return { items: (data as LineaMovil[]) ?? [], total_items: count ?? 0 };
}
