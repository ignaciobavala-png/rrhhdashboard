import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { ExecuteRequest, ExecuteResponse } from '@/features/ai-assistant/api/types';

export const dynamic = 'force-dynamic';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurada');
  return createClient(url, key);
}

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

  const db = getAdminClient();
  let affected = 0;
  let errorMsg: string | undefined;

  if (action.type === 'upsert') {
    const { data, error } = await db
      .from(action.table as never)
      .upsert(action.records, { onConflict: action.conflict_column ?? 'id' })
      .select();
    if (error) errorMsg = error.message;
    else affected = (data as unknown[]).length;
  } else if (action.type === 'update' && action.match_column) {
    for (const record of action.records) {
      const matchVal = record[action.match_column];
      const { error } = await db
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
    // Solo empleados tiene columna `activo`; en el resto es borrado real
    const softDelete = action.table === 'empleados';
    for (const record of action.records) {
      const matchVal = record[action.match_column];
      const query = db.from(action.table as never);
      const { error } = softDelete
        ? await query.update({ activo: false }).eq(action.match_column, matchVal)
        : await query.delete().eq(action.match_column, matchVal);
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
