import { supabase } from '@/lib/supabase';
import type { Laptop, LaptopInput, LaptopsFilters, LaptopsResponse } from './types';

export async function getLaptops(filters: LaptopsFilters = {}): Promise<LaptopsResponse> {
  const { page = 1, limit = 50, search } = filters;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('flota_laptops')
    .select('*, empleados(nombre_apellido)', { count: 'exact' });

  if (search) {
    query = query.or(
      `marca.ilike.%${search}%,modelo.ilike.%${search}%,numero_serie.ilike.%${search}%`
    );
  }

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  const items = (data ?? []).map((laptop) => ({
    ...laptop,
    empleado_nombre: laptop.empleados?.nombre_apellido ?? null
  }));

  return { items: items as Laptop[], total_items: count ?? 0 };
}

export async function createLaptop(input: LaptopInput): Promise<void> {
  const { error } = await supabase.from('flota_laptops').insert({
    empresa_id: 1,
    marca: input.marca || null,
    modelo: input.modelo || null,
    numero_serie: input.numero_serie || null,
    usuario: input.usuario || null,
    equipo: input.equipo || null,
    ubicacion: input.ubicacion || null,
    comentarios: input.comentarios || null,
    estado: input.estado
  });
  if (error) throw new Error(error.message);
}

export async function deleteLaptop(id: number): Promise<void> {
  const { error } = await supabase.from('flota_laptops').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
