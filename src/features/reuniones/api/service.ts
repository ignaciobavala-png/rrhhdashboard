import { supabase } from '@/lib/supabase';
import { ilikePattern } from '@/lib/utils';
import type { Reunion, ReunionInput, ReunionesFilters, ReunionesResponse } from './types';

export async function getReuniones(filters: ReunionesFilters = {}): Promise<ReunionesResponse> {
  const { page = 1, limit = 10, search } = filters;
  const offset = (page - 1) * limit;

  let query = supabase.from('reuniones').select('*', { count: 'exact' });

  if (search) {
    const q = ilikePattern(search);
    query = query.or(`titulo.ilike.${q},resumen.ilike.${q}`);
  }

  query = query.order('fecha', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  return { items: (data as Reunion[]) ?? [], total_items: count ?? 0 };
}

export async function getTodasLasReuniones(): Promise<Reunion[]> {
  const { data, error } = await supabase
    .from('reuniones')
    .select('*')
    .order('fecha', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Reunion[]) ?? [];
}

export async function createReunion(input: ReunionInput): Promise<Reunion> {
  const { data, error } = await supabase.from('reuniones').insert(input).select().single();
  if (error) throw new Error(error.message);
  return data as Reunion;
}

export async function updateReunion(id: number, input: Partial<ReunionInput>): Promise<Reunion> {
  const { data, error } = await supabase
    .from('reuniones')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Reunion;
}

export async function deleteReunion(id: number): Promise<void> {
  const { error } = await supabase.from('reuniones').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
