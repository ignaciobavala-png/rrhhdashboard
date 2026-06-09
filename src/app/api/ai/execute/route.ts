import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { ExecuteRequest, ExecuteResponse } from '@/features/ai-assistant/api/types';

const ALLOWED_TABLES = [
  'empleados',
  'sueldos',
  'vacaciones',
  'lineas_moviles',
  'flota_laptops',
  'home_office_semanal',
  'reuniones',
  'manuales',
  'notificaciones',
  'puestos'
];

export async function POST(request: Request) {
  const body = (await request.json()) as ExecuteRequest;
  const { action } = body;

  if (!action?.type || !action?.table) {
    return NextResponse.json({ error: 'action.type y action.table requeridos' }, { status: 400 });
  }

  if (!ALLOWED_TABLES.includes(action.table)) {
    return NextResponse.json({ error: `Tabla no permitida: ${action.table}` }, { status: 403 });
  }

  if (!action.records || action.records.length === 0) {
    return NextResponse.json({ error: 'action.records requerido' }, { status: 400 });
  }

  let affected = 0;
  let errorMsg: string | undefined;

  if (action.type === 'upsert') {
    const { data, error } = await supabase
      .from(action.table as never)
      .upsert(action.records, { onConflict: action.conflict_column ?? 'id' })
      .select();
    if (error) errorMsg = error.message;
    else affected = (data as unknown[]).length;
  } else if (action.type === 'update' && action.match_column) {
    for (const record of action.records) {
      const matchVal = record[action.match_column];
      const { error } = await supabase
        .from(action.table as never)
        .update(record)
        .eq(action.match_column, matchVal);
      if (error) {
        errorMsg = error.message;
        break;
      }
      affected++;
    }
  } else if (action.type === 'delete' && action.match_column) {
    for (const record of action.records) {
      const matchVal = record[action.match_column];
      const { error } = await supabase
        .from(action.table as never)
        .update({ activo: false })
        .eq(action.match_column, matchVal);
      if (error) {
        errorMsg = error.message;
        break;
      }
      affected++;
    }
  } else {
    return NextResponse.json({ error: 'Tipo de acción no soportado' }, { status: 400 });
  }

  return NextResponse.json<ExecuteResponse>({ affected, error: errorMsg });
}
