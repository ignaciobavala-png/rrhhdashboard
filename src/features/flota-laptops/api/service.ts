import { supabase } from '@/lib/supabase';
import { ilikePattern } from '@/lib/utils';
import type { Laptop, LaptopInput, LaptopsFilters, LaptopsResponse } from './types';

export async function getLaptops(filters: LaptopsFilters = {}): Promise<LaptopsResponse> {
  const { page = 1, limit = 50, search } = filters;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('flota_laptops')
    .select('*, empleados(nombre_apellido)', { count: 'exact' });

  if (search) {
    const q = ilikePattern(search);
    query = query.or(`marca.ilike.${q},modelo.ilike.${q},numero_serie.ilike.${q}`);
  }

  query = query.order('orden', { ascending: true }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  const items = (data ?? []).map((laptop) => ({
    ...laptop,
    empleado_nombre: laptop.empleados?.nombre_apellido ?? null
  }));

  return { items: items as Laptop[], total_items: count ?? 0 };
}

export async function createLaptop(input: LaptopInput): Promise<{ id: number }> {
  const { count } = await supabase
    .from('flota_laptops')
    .select('id', { count: 'exact', head: true });

  const { data, error } = await supabase
    .from('flota_laptops')
    .insert({
      empresa_id: 1,
      marca: input.marca || null,
      modelo: input.modelo || null,
      numero_serie: input.numero_serie || null,
      usuario: input.usuario || null,
      equipo: input.equipo || null,
      ubicacion: input.ubicacion || null,
      comentarios: input.comentarios || null,
      estado: input.estado,
      orden: (count ?? 0) + 1
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data as { id: number };
}

export async function swapOrdenLaptop(
  a: { id: number; orden: number },
  b: { id: number; orden: number }
): Promise<void> {
  const { error: e1 } = await supabase
    .from('flota_laptops')
    .update({ orden: b.orden })
    .eq('id', a.id);
  if (e1) throw new Error(e1.message);

  const { error: e2 } = await supabase
    .from('flota_laptops')
    .update({ orden: a.orden })
    .eq('id', b.id);
  if (e2) throw new Error(e2.message);
}

export async function updateLaptop(id: number, input: LaptopInput): Promise<void> {
  const { error } = await supabase
    .from('flota_laptops')
    .update({
      marca: input.marca || null,
      modelo: input.modelo || null,
      numero_serie: input.numero_serie || null,
      usuario: input.usuario || null,
      equipo: input.equipo || null,
      ubicacion: input.ubicacion || null,
      comentarios: input.comentarios || null,
      estado: input.estado
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteLaptop(id: number): Promise<void> {
  const { error } = await supabase.from('flota_laptops').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
