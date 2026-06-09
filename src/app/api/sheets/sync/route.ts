import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractSheetId } from '@/features/google-sheets/api/service';
import { discoverTabs, buildCsvUrl } from '@/features/google-sheets/lib/tab-discovery';
import { suggestSection } from '@/features/google-sheets/lib/section-detector';
import type { ParsedSheet, SyncResult } from '@/features/google-sheets/api/types';

function parseCsv(text: string): ParsedSheet {
  const lines = text.split('\n').filter((l) => l.trim() !== '');
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? '';
    });
    return row;
  });

  return { headers, rows };
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

  // Discover all tabs
  const tabs = await discoverTabs(googleSheetId);

  // Fetch all CSVs in parallel
  const csvResults = await Promise.all(
    tabs.map(async (tab) => {
      try {
        const res = await fetch(buildCsvUrl(googleSheetId, tab.gid));
        if (!res.ok)
          return {
            tab,
            parsed: null,
            error: 'No se pudo acceder al sheet. Verificá que esté publicado.'
          };
        const text = await res.text();
        return { tab, parsed: parseCsv(text), error: null };
      } catch {
        return { tab, parsed: null, error: 'Error al leer la pestaña' };
      }
    })
  );

  // Persist syncs sequentially (Supabase insert per tab)
  const result: SyncResult = { tabs: [] };

  for (const { tab, parsed, error } of csvResults) {
    if (!parsed || error) {
      const { data: sync } = await supabase
        .from('sheet_syncs')
        .insert({
          sheet_id: sheetId,
          row_count: 0,
          headers: [],
          tab_name: tab.name,
          tab_gid: tab.gid,
          error
        })
        .select()
        .single();
      result.tabs.push({
        tabName: tab.name,
        tabGid: tab.gid,
        syncId: sync?.id ?? '',
        rowCount: 0,
        headers: [],
        suggestedSection: null,
        error: error ?? undefined
      });
      continue;
    }

    const suggestedSection = suggestSection(parsed.headers);

    const { data: sync, error: syncError } = await supabase
      .from('sheet_syncs')
      .insert({
        sheet_id: sheetId,
        row_count: parsed.rows.length,
        headers: parsed.headers,
        tab_name: tab.name,
        tab_gid: tab.gid,
        suggested_section: suggestedSection
      })
      .select()
      .single();

    if (syncError || !sync) {
      result.tabs.push({
        tabName: tab.name,
        tabGid: tab.gid,
        syncId: '',
        rowCount: 0,
        headers: [],
        suggestedSection: null,
        error: syncError?.message
      });
      continue;
    }

    if (parsed.rows.length > 0) {
      await supabase
        .from('sheet_rows')
        .insert(
          parsed.rows.map((data, row_index) => ({
            sync_id: sync.id,
            sheet_id: sheetId,
            row_index,
            data
          }))
        );
    }

    result.tabs.push({
      tabName: tab.name,
      tabGid: tab.gid,
      syncId: sync.id,
      rowCount: parsed.rows.length,
      headers: parsed.headers,
      suggestedSection
    });
  }

  return NextResponse.json(result);
}
