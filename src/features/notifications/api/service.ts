import { supabase } from '@/lib/supabase';
import type { Notificacion, ProximoEvento } from './types';

export async function getNotificaciones(): Promise<Notificacion[]> {
  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return (data ?? []) as Notificacion[];
}

export async function marcarLeida(id: number): Promise<void> {
  await supabase.from('notificaciones').update({ leida: true }).eq('id', id);
}

export async function marcarTodasLeidas(): Promise<void> {
  await supabase.from('notificaciones').update({ leida: true }).eq('leida', false);
}

export async function getProximosEventos(): Promise<ProximoEvento[]> {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const en5 = new Date(hoy);
  en5.setDate(hoy.getDate() + 5);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const eventos: ProximoEvento[] = [];

  // Reuniones en los próximos 5 días
  const { data: reuniones } = await supabase
    .from('reuniones')
    .select('id, titulo, fecha, hora')
    .gte('fecha', fmt(hoy))
    .lte('fecha', fmt(en5))
    .order('fecha');

  for (const r of reuniones ?? []) {
    const diff = Math.round(
      (new Date(r.fecha + 'T00:00:00').getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    );
    eventos.push({
      tipo: 'reunion',
      titulo: r.titulo,
      fecha: r.fecha,
      diasRestantes: diff,
      hora: r.hora
    });
  }

  // Cumpleaños en los próximos 5 días
  const { data: empleados } = await supabase
    .from('empleados')
    .select('id, nombre_apellido, fecha_nacimiento')
    .eq('activo', true)
    .not('fecha_nacimiento', 'is', null);

  for (const emp of empleados ?? []) {
    const bday = new Date(emp.fecha_nacimiento + 'T00:00:00');
    const esteAnio = new Date(hoy.getFullYear(), bday.getMonth(), bday.getDate());
    const proxAnio = new Date(hoy.getFullYear() + 1, bday.getMonth(), bday.getDate());

    let diff = Math.round((esteAnio.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) diff = Math.round((proxAnio.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diff >= 0 && diff <= 5) {
      eventos.push({
        tipo: 'cumpleanos',
        titulo: emp.nombre_apellido,
        fecha: fmt(esteAnio),
        diasRestantes: diff
      });
    }
  }

  return eventos.sort((a, b) => a.diasRestantes - b.diasRestantes);
}
