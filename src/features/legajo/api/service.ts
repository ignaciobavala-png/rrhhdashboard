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

  const { data: empleados, error, count } = await query;

  if (error) throw new Error(error.message);

  const { data: puestos } = await supabase.from('puestos').select('empleado_id, puesto');
  const puestosMap = new Map((puestos ?? []).map((p) => [p.empleado_id, p.puesto]));

  const items = (empleados ?? []).map((emp) => ({
    ...emp,
    puesto: puestosMap.get(emp.id) ?? null
  }));

  return { items: items as Empleado[], total_items: count ?? 0 };
}

export async function getEmpleadoById(id: number): Promise<Empleado | null> {
  const { data: empleado, error } = await supabase
    .from('empleados')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;

  const { data: puestoData } = await supabase
    .from('puestos')
    .select('puesto')
    .eq('empleado_id', id)
    .maybeSingle();

  return {
    ...empleado,
    puesto: puestoData?.puesto ?? null
  } as Empleado;
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

  // Formato "PHONE I Nombre Parentesco": ' I ' separa teléfono de nombre/relación
  // Solo si lo que precede al ' I ' es un teléfono puro (dígitos, espacios, (), +, -)
  const iIdx = raw.indexOf(' I ');
  if (iIdx !== -1) {
    const beforeI = raw.slice(0, iIdx).trim();
    if (/^[\d\s()+-]+$/.test(beforeI)) {
      const telefono = beforeI.replace(/\s+/g, ' ').trim();
      const afterI = raw.slice(iIdx + 3).trim();
      const palabras = afterI.split(/\s+/).filter(Boolean);
      if (palabras.length === 0) return { telefono, nombre: '', parentesco: '' };
      if (palabras.length === 1) return { telefono, nombre: '', parentesco: palabras[0] };
      const parentesco = palabras[palabras.length - 1];
      const nombre = palabras.slice(0, -1).join(' ');
      return { telefono, nombre, parentesco };
    }
  }

  // Sin ' I ': el teléfono son todos los tokens iniciales compuestos solo de
  // dígitos/paréntesis (cubre "(236) 4 690836" sin partir en el primer espacio)
  const tokens = raw.split(/\s+/).filter(Boolean);
  let i = 0;
  while (i < tokens.length && /^[\d()+-]+$/.test(tokens[i])) i++;

  const telefono = tokens.slice(0, i).join(' ');
  const resto = tokens.slice(i);

  if (resto.length === 0) return { telefono: telefono || raw, nombre: '', parentesco: '' };
  if (resto.length === 1) return { telefono, nombre: '', parentesco: resto[0] };
  const parentesco = resto[resto.length - 1];
  const nombre = resto.slice(0, -1).join(' ');
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
      | 'dni'
      | 'equipo_ingreso'
      | 'fecha_ingreso'
      | 'nombre_apellido'
      | 'activo'
    >
  >
) {
  const { error } = await supabase.from('empleados').update(updates).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function upsertPuesto(empleadoId: number, puesto: string | null) {
  if (puesto) {
    const { data: existing } = await supabase
      .from('puestos')
      .select('id')
      .eq('empleado_id', empleadoId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('puestos')
        .update({ puesto })
        .eq('empleado_id', empleadoId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from('puestos').insert({ empleado_id: empleadoId, puesto });
      if (error) throw new Error(error.message);
    }
  } else {
    await supabase.from('puestos').delete().eq('empleado_id', empleadoId);
  }
}

export async function updateHomeOffice(id: number, modalidad: 'Presencial' | 'Remoto') {
  const { error } = await supabase.from('home_office_semanal').update({ modalidad }).eq('id', id);
  if (error) throw new Error(error.message);
}
