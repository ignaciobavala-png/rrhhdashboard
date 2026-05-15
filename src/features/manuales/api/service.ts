import { supabase } from '@/lib/supabase';
import type { Manual, ManualesFilters, ManualesResponse } from './types';

export async function getManuales(filters: ManualesFilters = {}): Promise<ManualesResponse> {
  const { page = 1, limit = 10, search } = filters;
  const offset = (page - 1) * limit;

  let query = supabase.from('manuales').select('*', { count: 'exact' });

  if (search) {
    query = query.or(`tarea.ilike.%${search}%,area.ilike.%${search}%`);
  }

  query = query.order('area', { ascending: true }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  return { items: (data as Manual[]) ?? [], total_items: count ?? 0 };
}
