import { supabase } from '@/lib/supabase';
import type { Sueldo } from './types';

export async function getSueldosByAnio(anio: number): Promise<Sueldo[]> {
  const { data, error } = await supabase
    .from('sueldos')
    .select('*, empleados(nombre_apellido)')
    .eq('anio', anio)
    .order('mes', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Sueldo[];
}

export async function getAniosDisponibles(): Promise<number[]> {
  const { data, error } = await supabase.from('sueldos').select('anio');
  if (error) return [];
  const set = new Set((data ?? []).map((r) => r.anio as number));
  return Array.from(set).sort((a, b) => b - a);
}
