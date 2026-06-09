import { supabase } from '@/lib/supabase';
import type { GoogleSheet, GoogleSheetInsert, SheetSync, SheetRow } from './types';

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

export async function getLatestSync(sheetId: string): Promise<SheetSync | null> {
  const { data, error } = await supabase
    .from('sheet_syncs')
    .select('*')
    .eq('sheet_id', sheetId)
    .order('synced_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as SheetSync | null;
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

export function buildCsvUrl(sheetId: string): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
}
