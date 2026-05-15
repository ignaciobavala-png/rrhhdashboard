import { supabase } from '@/lib/supabase';
import type {
  Empleado,
  EmpleadosFilters,
  EmpleadosResponse,
  ContactoEmergencia,
  HomeOfficeDia
} from './types';

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

export async function getHomeOfficeEmpleado(empleadoId: number): Promise<HomeOfficeDia[]> {
  const { data, error } = await supabase
    .from('home_office_semanal')
    .select('*')
    .eq('empleado_id', empleadoId)
    .is('fecha_hasta', null)
    .order('dia_semana');
  if (error) {
    console.error('[legajo] home_office error:', error.message);
    return [];
  }
  return (data ?? []) as HomeOfficeDia[];
}

export async function getEmpleadoDetalle(id: number): Promise<Empleado | null> {
  const [emp] = await Promise.all([getEmpleadoById(id), getHomeOfficeEmpleado(id)]);
  if (!emp) return null;
  return emp;
}

export function parseContactoEmergencia(raw: string | null): ContactoEmergencia | null {
  if (!raw) return null;
  const parts = raw.split(' I ');
  if (parts.length < 2) {
    return { telefono: parts[0] ?? '', nombre: '', parentesco: '' };
  }
  const telefono = parts[0].trim();
  const resto = parts.slice(1).join(' I ').trim();
  const palabras = resto.split(/\s+/);
  if (palabras.length === 1) {
    return { telefono, nombre: '', parentesco: palabras[0] };
  }
  const parentesco = palabras[palabras.length - 1];
  const nombre = palabras.slice(0, -1).join(' ');
  return { telefono, nombre, parentesco };
}

export function formatContactoEmergencia(c: ContactoEmergencia): string {
  const parts = [c.telefono];
  if (c.nombre || c.parentesco) {
    const resto = [c.nombre, c.parentesco].filter(Boolean).join(' ');
    parts.push('I', resto);
  }
  return parts.join(' ');
}

export async function updateEmpleado(
  id: number,
  updates: Partial<
    Pick<
      Empleado,
      | 'fecha_nacimiento'
      | 'celular'
      | 'email'
      | 'direccion'
      | 'movilidad'
      | 'modalidad'
      | 'contacto_emergencia'
    >
  >
) {
  const { error } = await supabase.from('empleados').update(updates).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updateHomeOffice(id: number, modalidad: 'Presencial' | 'Remoto') {
  const { error } = await supabase.from('home_office_semanal').update({ modalidad }).eq('id', id);
  if (error) throw new Error(error.message);
}
