import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { extractSheetId } from '@/features/google-sheets/api/service';
import { suggestSection } from '@/features/google-sheets/lib/section-detector';
import { importSheetData } from '@/features/google-sheets/lib/import-engine';
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
    const ref = sheet['!ref'];
    if (!ref) return { name, index, headers: [], rows: [] };

    const range = XLSX.utils.decode_range(ref);

    // Extract headers from first row
    const headers: string[] = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c })];
      const val = cell ? String(XLSX.utils.format_cell(cell)).trim() : '';
      if (val) headers.push(val);
    }
    if (headers.length === 0) return { name, index, headers: [], rows: [] };

    // Extract rows — prefer cell.l.Target (hyperlink URL) over display text
    const rows: Record<string, string>[] = [];
    for (let r = range.s.r + 1; r <= range.e.r; r++) {
      const obj: Record<string, string> = {};
      let hasValue = false;
      for (let ci = 0; ci < headers.length; ci++) {
        const cell = sheet[XLSX.utils.encode_cell({ r, c: range.s.c + ci })];
        if (!cell) {
          obj[headers[ci]] = '';
          continue;
        }
        const val =
          cell.l?.Target ??
          (cell.t === 'd'
            ? (cell.v as Date).toLocaleDateString('es-AR')
            : String(XLSX.utils.format_cell(cell)).trim());
        obj[headers[ci]] = val;
        if (val) hasValue = true;
      }
      if (hasValue) rows.push(obj);
    }

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
    const suggestedSection = suggestSection(tab.headers, tab.name);

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

    // Remove any previous classification for this (sheet, tab) pair — ensures
    // each tab belongs to exactly one section and reclassifications take effect.
    await supabase.from('sheet_sections').delete().eq('sheet_id', sheetId).eq('tab_name', tab.name);

    if (suggestedSection) {
      await supabase.from('sheet_sections').insert({
        section_name: suggestedSection,
        sheet_id: sheetId,
        sync_id: sync.id,
        tab_name: tab.name
      });
    }

    result.tabs.push({
      tabName: tab.name,
      tabGid: tab.index,
      syncId: sync.id,
      rowCount: tab.rows.length,
      headers: tab.headers,
      suggestedSection
    });

    // ── Importar a tabla de negocio ─────────────────────────────────────────
    if (suggestedSection) {
      try {
        const importResult = await importSheetData(
          suggestedSection,
          tab.rows,
          tab.headers,
          tab.name
        );
        if (importResult) {
          const last = result.tabs[result.tabs.length - 1];
          last.importCreated = importResult.created;
          last.importUpdated = importResult.updated;
          last.importSkipped = importResult.skipped;
        }
      } catch (importError) {
        const last = result.tabs[result.tabs.length - 1];
        last.importError = (importError as Error).message;
      }
    }
  }

  return NextResponse.json(result);
}
