import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractSheetId, buildCsvUrl } from '@/features/google-sheets/api/service';
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

  // Fetch CSV
  let parsed: ParsedSheet;
  try {
    const res = await fetch(buildCsvUrl(googleSheetId));
    if (!res.ok) {
      const { data: sync } = await supabase
        .from('sheet_syncs')
        .insert({
          sheet_id: sheetId,
          row_count: 0,
          headers: [],
          error: 'No se pudo acceder al sheet. Verificá que esté publicado.'
        })
        .select()
        .single();
      return NextResponse.json(
        { error: 'No se pudo acceder al sheet', syncId: sync?.id },
        { status: 502 }
      );
    }
    const text = await res.text();
    parsed = parseCsv(text);
  } catch (e) {
    return NextResponse.json({ error: 'Error al leer el sheet' }, { status: 500 });
  }

  // Create sync record
  const { data: sync, error: syncError } = await supabase
    .from('sheet_syncs')
    .insert({
      sheet_id: sheetId,
      row_count: parsed.rows.length,
      headers: parsed.headers
    })
    .select()
    .single();

  if (syncError || !sync) {
    return NextResponse.json(
      { error: syncError?.message ?? 'Error al guardar sync' },
      { status: 500 }
    );
  }

  // Bulk insert rows
  if (parsed.rows.length > 0) {
    const rowInserts = parsed.rows.map((data, row_index) => ({
      sync_id: sync.id,
      sheet_id: sheetId,
      row_index,
      data
    }));

    const { error: rowsError } = await supabase.from('sheet_rows').insert(rowInserts);
    if (rowsError) {
      return NextResponse.json({ error: rowsError.message }, { status: 500 });
    }
  }

  const result: SyncResult = {
    syncId: sync.id,
    rowCount: parsed.rows.length,
    headers: parsed.headers
  };

  return NextResponse.json(result);
}
