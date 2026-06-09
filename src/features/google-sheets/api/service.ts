import { supabase } from '@/lib/supabase';
import type {
  GoogleSheet,
  GoogleSheetInsert,
  SheetSync,
  SheetRow,
  SheetRowEffective
} from './types';

export async function getGoogleSheets(): Promise<GoogleSheet[]> {
  const { data, error } = await supabase
    .from('google_sheets')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as GoogleSheet[];
}

export async function addGoogleSheet(insert: GoogleSheetInsert): Promise<GoogleSheet> {
  const { data, error } = await supabase.from('google_sheets').insert(insert).select().single();
  if (error) throw new Error(error.message);
  return data as GoogleSheet;
}

export async function deleteGoogleSheet(id: string): Promise<void> {
  const { error } = await supabase.from('google_sheets').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Returns the latest sync per tab for a given sheet
export async function getLatestSyncsByTab(sheetId: string): Promise<SheetSync[]> {
  const { data, error } = await supabase
    .from('sheet_syncs')
    .select('*')
    .eq('sheet_id', sheetId)
    .order('synced_at', { ascending: false });
  if (error) throw new Error(error.message);

  // Deduplicate: keep only the most recent sync per tab
  const seen = new Set<string>();
  return ((data ?? []) as SheetSync[]).filter((s) => {
    if (seen.has(s.tab_name)) return false;
    seen.add(s.tab_name);
    return true;
  });
}

export async function getRowsForSync(syncId: string): Promise<SheetRow[]> {
  const { data, error } = await supabase
    .from('sheet_rows')
    .select('*')
    .eq('sync_id', syncId)
    .order('row_index', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as SheetRow[];
}

export function extractSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match?.[1] ?? null;
}

export async function updateSheetRowField(
  rowId: string,
  field: string,
  value: string
): Promise<void> {
  const { data: row } = await supabase
    .from('sheet_rows')
    .select('edited_data, data')
    .eq('id', rowId)
    .single();

  const current = (row?.edited_data ?? row?.data ?? {}) as Record<string, string>;
  const updated = { ...current, [field]: value };

  const { error } = await supabase
    .from('sheet_rows')
    .update({ edited_data: updated })
    .eq('id', rowId);

  if (error) throw new Error(error.message);
}

export async function deleteSheetRow(rowId: string): Promise<void> {
  const { error } = await supabase.from('sheet_rows').update({ is_deleted: true }).eq('id', rowId);
  if (error) throw new Error(error.message);
}

export async function addSheetRow(
  syncId: string,
  sheetId: string,
  data: Record<string, string>,
  rowIndex: number
): Promise<SheetRow> {
  const { data: inserted, error } = await supabase
    .from('sheet_rows')
    .insert({
      sync_id: syncId,
      sheet_id: sheetId,
      row_index: rowIndex,
      data,
      is_manual: true
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return inserted as SheetRow;
}

export async function getEffectiveRowsForSync(syncId: string): Promise<SheetRowEffective[]> {
  const { data, error } = await supabase
    .from('sheet_rows_effective')
    .select('*')
    .eq('sync_id', syncId)
    .order('row_index', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as SheetRowEffective[];
}
