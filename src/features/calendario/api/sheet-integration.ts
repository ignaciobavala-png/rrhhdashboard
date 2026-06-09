import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import type { EventoCalendario } from './types';

const MESES_MAP: Record<string, number> = {
  ene: 1,
  feb: 2,
  mar: 3,
  abr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  ago: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dic: 12
};

function detectYearFromTabName(name: string): number {
  const m = name.match(/\b(20\d{2})\b/);
  return m ? parseInt(m[1]) : new Date().getFullYear();
}

// Find the column that contains employee names (non-numeric string values)
function detectNameColumn(headers: string[], rows: Record<string, string>[]): string | null {
  const sample = rows.slice(0, 8);
  for (const h of headers) {
    const vals = sample.map((r) => r[h] ?? '').filter(Boolean);
    if (vals.length === 0) continue;
    const nonNumeric = vals.filter((v) => isNaN(Number(v.replace(/[.,\s]/g, ''))));
    if (nonNumeric.length >= Math.ceil(vals.length * 0.6)) return h;
  }
  return null;
}

// "BANDIERI, Mariano" → "Bandieri"
function normalizeNombre(raw: string): string {
  const first = raw.split(',')[0].trim();
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

export async function getVacacionesDesdeSheets(): Promise<EventoCalendario[]> {
  // Use ilike on tab_name — more reliable than .or() with encoding issues
  const { data: syncs, error } = await supabase
    .from('sheet_syncs')
    .select('id, tab_name, headers, synced_at')
    .ilike('tab_name', '%vacacion%')
    .order('synced_at', { ascending: false });

  if (error || !syncs || syncs.length === 0) return [];

  // Keep only the latest sync per tab
  const seen = new Set<string>();
  const latest = (
    syncs as { id: string; tab_name: string; headers: string[]; synced_at: string }[]
  ).filter((s) => {
    if (seen.has(s.tab_name)) return false;
    seen.add(s.tab_name);
    return true;
  });

  const eventos: EventoCalendario[] = [];

  for (const sync of latest) {
    const year = detectYearFromTabName(sync.tab_name);
    const headers = sync.headers as string[];

    const { data: rowsRaw } = await supabase
      .from('sheet_rows')
      .select('data')
      .eq('sync_id', sync.id)
      .order('row_index');

    if (!rowsRaw) continue;
    const rows = rowsRaw.map((r) => r.data as Record<string, string>);

    const nameCol = detectNameColumn(headers, rows);
    if (!nameCol) continue;

    const mesHeaders = headers.filter((h) => MESES_MAP[h.toLowerCase().slice(0, 3)] !== undefined);

    for (const row of rows) {
      const rawNombre = (row[nameCol] ?? '').trim();
      if (!rawNombre || !isNaN(Number(rawNombre.replace(/[.,\s]/g, '')))) continue;
      const nombre = normalizeNombre(rawNombre);

      for (const mesHeader of mesHeaders) {
        const dias = parseInt(row[mesHeader] ?? '');
        if (!dias || isNaN(dias) || dias <= 0) continue;

        const mes = MESES_MAP[mesHeader.toLowerCase().slice(0, 3)];
        const fecha = format(new Date(year, mes - 1, 1), 'yyyy-MM-dd');

        eventos.push({
          id: `sheet-vac-${sync.id}-${nombre}-${mesHeader}`,
          fecha,
          titulo: `${dias} ${dias === 1 ? 'día' : 'días'} vacaciones`,
          tipo: 'licencia',
          empleado: nombre,
          empleadoId: 0,
          readonly: true
        });
      }
    }
  }

  return eventos;
}
