import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { extractSheetId } from '@/features/google-sheets/api/service';
import { suggestSection } from '@/features/google-sheets/lib/section-detector';
import type { SyncResult } from '@/features/google-sheets/api/types';

type ParsedTab = {
  name: string;
  index: number;
  headers: string[];
  rows: Record<string, string>[];
};

async function parseXlsxFromGoogle(googleSheetId: string): Promise<ParsedTab[]> {
  const url = `https://docs.google.com/spreadsheets/d/${googleSheetId}/export?format=xlsx`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok)
    throw new Error(
      'No se pudo descargar el sheet. Verificá que esté compartido como "Cualquiera con el enlace puede ver".'
    );

  const buffer = await res.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

  return workbook.SheetNames.map((name, index) => {
    const sheet = workbook.Sheets[name];
    const raw = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' });

    const headers = (raw[0] ?? []).map((h) => String(h).trim()).filter(Boolean);
    if (headers.length === 0) return { name, index, headers: [], rows: [] };

    const rows = (raw.slice(1) as unknown[][])
      .filter((row) => row.some((v) => v !== '' && v !== null && v !== undefined))
      .map((row) => {
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          const val = row[i];
          obj[h] = val instanceof Date ? val.toLocaleDateString('es-AR') : String(val ?? '').trim();
        });
        return obj;
      });

    return { name, index, headers, rows };
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { sheetId: string; url: string };
  const { sheetId, url } = body;

  if (!sheetId || !url) {
    return NextResponse.json({ error: 'Missing sheetId or url' }, { status: 400 });
  }

  const googleSheetId = extractSheetId(url);
  if (!googleSheetId) {
    return NextResponse.json({ error: 'URL de Google Sheets inválida' }, { status: 400 });
  }

  let tabs: ParsedTab[];
  try {
    tabs = await parseXlsxFromGoogle(googleSheetId);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  const result: SyncResult = { tabs: [] };

  for (const tab of tabs) {
    const suggestedSection = tab.headers.length > 0 ? suggestSection(tab.headers) : null;

    const { data: sync, error: syncError } = await supabase
      .from('sheet_syncs')
      .insert({
        sheet_id: sheetId,
        row_count: tab.rows.length,
        headers: tab.headers,
        tab_name: tab.name,
        tab_gid: tab.index,
        suggested_section: suggestedSection
      })
      .select()
      .single();

    if (syncError || !sync) {
      result.tabs.push({
        tabName: tab.name,
        tabGid: tab.index,
        syncId: '',
        rowCount: 0,
        headers: [],
        suggestedSection: null,
        error: syncError?.message
      });
      continue;
    }

    if (tab.rows.length > 0) {
      await supabase.from('sheet_rows').insert(
        tab.rows.map((data, row_index) => ({
          sync_id: sync.id,
          sheet_id: sheetId,
          row_index,
          data
        }))
      );
    }

    result.tabs.push({
      tabName: tab.name,
      tabGid: tab.index,
      syncId: sync.id,
      rowCount: tab.rows.length,
      headers: tab.headers,
      suggestedSection
    });
  }

  return NextResponse.json(result);
}
