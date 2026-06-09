import { supabase } from '@/lib/supabase';

// ── types ────────────────────────────────────────────────────────────────────

export type ImportResult = {
  section: string;
  tabName: string;
  created: number;
  updated: number;
  skipped: number;
  error?: string;
};

type ColumnMap = Record<string, string[]>;

// ── normalisation ────────────────────────────────────────────────────────────

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function tokens(text: string): string[] {
  return normalize(text).split('_').filter(Boolean);
}

function matchPattern(sheetCol: string, patterns: string[]): boolean {
  const colTokens = tokens(sheetCol);
  return patterns.some((pattern) => {
    const pTokens = tokens(pattern);
    return pTokens.every((pt) => colTokens.some((ct) => ct.includes(pt)));
  });
}

function detectColumns(headers: string[], columnMap: ColumnMap): Record<string, string> {
  const result: Record<string, string> = {};
  for (const header of headers) {
    for (const [dbCol, patterns] of Object.entries(columnMap)) {
      if (result[dbCol]) continue;
      if (matchPattern(header, patterns)) {
        result[dbCol] = header;
        break;
      }
    }
  }
  return result;
}

// ── value parsers ────────────────────────────────────────────────────────────

function parseDate(val: string): string | null {
  if (!val || typeof val !== 'string') return null;
  const ddmmyyyy = val.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (ddmmyyyy) {
    const [, d, m, y] = ddmmyyyy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(val)) return val.slice(0, 10);
  return null;
}

function parseBool(val: string): boolean | null {
  const clean = val.trim().toLowerCase();
  if (['si', 'sí', 'yes', 'true', 'activo', '1', '✓'].includes(clean)) return true;
  if (['no', 'false', 'inactivo', '0', '✗', 'x', '-'].includes(clean)) return false;
  return null;
}

function parseNumber(val: string): number | null {
  const cleaned = val.replace(/[^0-9.,-]/g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

// ── FK resolvers ─────────────────────────────────────────────────────────────

async function resolveEmpleadoId(name: string): Promise<number | null> {
  const clean = name.trim();
  if (!clean) return null;

  // Try exact match first
  const { data: exact } = await supabase
    .from('empleados')
    .select('id,nombre_apellido')
    .eq('nombre_apellido', clean)
    .maybeSingle();
  if (exact) return exact.id;

  // Try ilike
  const { data: fuzzy } = await supabase
    .from('empleados')
    .select('id,nombre_apellido')
    .ilike('nombre_apellido', `%${clean}%`)
    .limit(1);
  if (fuzzy && fuzzy.length > 0) return fuzzy[0].id;

  // Try without first name ("BANDIERI, Mariano" → just "Bandieri")
  const surname = clean.split(',')[0].trim();
  if (surname.length >= 3) {
    const { data: bySurname } = await supabase
      .from('empleados')
      .select('id,nombre_apellido')
      .ilike('nombre_apellido', `%${surname}%`)
      .limit(1);
    if (bySurname && bySurname.length > 0) return bySurname[0].id;
  }

  return null;
}

// ── column definitions ───────────────────────────────────────────────────────

const LEGAJO_COLUMNS: ColumnMap = {
  nombre_apellido: [
    'Nombre & Apellido',
    'Nombre y Apellido',
    'nombre_apellido',
    'Empleado',
    'Nombre'
  ],
  activo: ['Activo'],
  fecha_nacimiento: ['Fecha de Nacimiento', 'Nacimiento', 'fecha_nacimiento'],
  dni: ['DNI', 'Documento', 'dni'],
  celular: ['Celular', 'Teléfono', 'celular'],
  contacto_emergencia: ['Contacto Emergencia', 'contacto_emergencia', 'Emergencia'],
  equipo_ingreso: ['Equipo ingreso', 'equipo_ingreso', 'Área', 'Area'],
  fecha_ingreso: ['Fecha de Ingreso', 'fecha_ingreso', 'Ingreso'],
  email: ['Mail Contexto', 'Mail', 'Email', 'Correo', 'email'],
  direccion: ['Dirección', 'Direccion', 'Domicilio', 'direccion'],
  movilidad: ['Movilidad', 'movilidad'],
  modalidad: ['Modalidad', 'modalidad']
};

const FLOTA_LINEAS_COLUMNS: ColumnMap = {
  numero: ['Numero', 'Número', 'Línea', 'Linea', 'numero', 'Tel', 'Teléfono'],
  rol: ['Rol', 'rol', 'Uso', 'Tipo'],
  usuario: ['Usuario', 'usuario', 'Empleado', 'Asignado a', 'asignado_a'],
  equipo: ['Equipo', 'equipo', 'Marca', 'Modelo'],
  estado: ['Estado', 'estado', 'Activo']
};

const FLOTA_LAPTOPS_COLUMNS: ColumnMap = {
  marca: ['Marca', 'marca', 'Fabricante'],
  modelo: ['Modelo', 'modelo'],
  numero_serie: ['Numero de Serie', 'Número de Serie', 'Serie', 'numero_serie', 'N° Serie', 'SN'],
  usuario: ['Usuario', 'usuario', 'Empleado', 'Asignado a', 'asignado_a'],
  equipo: ['Equipo', 'equipo', 'Nombre Equipo', 'Hostname'],
  ubicacion: ['Ubicación', 'Ubicacion', 'ubicacion', 'Sede'],
  estado: ['Estado', 'estado', 'Activo'],
  comentarios: ['Comentarios', 'comentarios', 'Notas', 'Observaciones']
};

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

// ── importers ────────────────────────────────────────────────────────────────

async function importLegajo(
  rows: Record<string, string>[],
  headers: string[]
): Promise<Omit<ImportResult, 'tabName'>> {
  const colMap = detectColumns(headers, LEGAJO_COLUMNS);
  let created = 0,
    updated = 0,
    skipped = 0;

  for (const row of rows) {
    const mapped: Record<string, unknown> = {};

    for (const [dbCol, sheetCol] of Object.entries(colMap)) {
      const raw = (row[sheetCol] ?? '').trim();
      if (!raw) continue;

      if (dbCol === 'fecha_nacimiento' || dbCol === 'fecha_ingreso') {
        const d = parseDate(raw);
        if (d) mapped[dbCol] = d;
      } else if (dbCol === 'activo') {
        const b = parseBool(raw);
        if (b !== null) mapped[dbCol] = b;
      } else {
        mapped[dbCol] = raw;
      }
    }

    if (!mapped.nombre_apellido && !mapped.dni) {
      skipped++;
      continue;
    }

    let existing: { id: number } | null = null;
    if (mapped.dni) {
      const { data } = await supabase
        .from('empleados')
        .select('id')
        .eq('dni', mapped.dni as string)
        .maybeSingle();
      existing = data;
    }
    if (!existing && mapped.nombre_apellido) {
      const { data } = await supabase
        .from('empleados')
        .select('id')
        .eq('nombre_apellido', mapped.nombre_apellido as string)
        .maybeSingle();
      existing = data;
    }

    if (existing) {
      await supabase.from('empleados').update(mapped).eq('id', existing.id);
      updated++;
    } else {
      await supabase.from('empleados').insert(mapped);
      created++;
    }
  }

  return { section: 'Legajo', created, updated, skipped };
}

async function importVacaciones(
  rows: Record<string, string>[],
  headers: string[],
  tabName: string
): Promise<Omit<ImportResult, 'tabName'>> {
  let created = 0,
    updated = 0,
    skipped = 0;

  // Detect year from tab name
  const yearMatch = tabName.match(/\b(20\d{2})\b/);
  const anio = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

  // Detect name column (first non-numeric column)
  const sample = rows.slice(0, 8);
  let nameCol: string | null = null;
  for (const h of headers) {
    const vals = sample.map((r) => r[h] ?? '').filter(Boolean);
    if (vals.length === 0) continue;
    const nonNumeric = vals.filter((v) => isNaN(Number(v.replace(/[.,\s]/g, ''))));
    if (nonNumeric.length >= Math.ceil(vals.length * 0.6)) {
      nameCol = h;
      break;
    }
  }
  if (!nameCol) return { section: 'Vacaciones', created: 0, updated: 0, skipped: rows.length };

  // Detect month columns
  const monthCols = headers.filter((h) => MESES_MAP[normalize(h).slice(0, 3)] !== undefined);

  for (const row of rows) {
    const rawName = (row[nameCol] ?? '').trim();
    if (!rawName) {
      skipped++;
      continue;
    }

    const empleadoId = await resolveEmpleadoId(rawName);
    if (!empleadoId) {
      skipped++;
      continue;
    }

    // Sum total vacation days from month columns
    let totalDias = 0;
    for (const mh of monthCols) {
      const val = parseNumber(row[mh] ?? '');
      if (val && val > 0) totalDias += val;
    }

    // Upsert into vacaciones
    const { data: existing } = await supabase
      .from('vacaciones')
      .select('id, saldo_inicial, saldo_actual')
      .eq('empleado_id', empleadoId)
      .eq('anio', anio)
      .maybeSingle();

    const saldoInicial = existing?.saldo_inicial ?? 14;
    const saldoActual = saldoInicial - totalDias;

    if (existing) {
      await supabase
        .from('vacaciones')
        .update({ saldo_actual: saldoActual, dias_correspondientes: saldoInicial })
        .eq('id', existing.id);
      updated++;
    } else {
      await supabase.from('vacaciones').insert({
        empleado_id: empleadoId,
        anio,
        saldo_inicial: saldoInicial,
        dias_correspondientes: saldoInicial,
        saldo_actual: saldoActual
      });
      created++;
    }
  }

  return { section: 'Vacaciones', created, updated, skipped };
}

async function importLineasMoviles(
  rows: Record<string, string>[],
  headers: string[]
): Promise<Omit<ImportResult, 'tabName'>> {
  const colMap = detectColumns(headers, FLOTA_LINEAS_COLUMNS);
  let created = 0,
    updated = 0,
    skipped = 0;

  for (const row of rows) {
    const mapped: Record<string, unknown> = {};

    for (const [dbCol, sheetCol] of Object.entries(colMap)) {
      const raw = (row[sheetCol] ?? '').trim();
      if (!raw) continue;
      mapped[dbCol] = raw;
    }

    if (!mapped.numero) {
      skipped++;
      continue;
    }

    // Resolve empleado if usuario name is provided
    if (mapped.usuario && typeof mapped.usuario === 'string') {
      const id = await resolveEmpleadoId(mapped.usuario);
      if (id) mapped.empleado_id = id;
    }

    const { data: existing } = await supabase
      .from('lineas_moviles')
      .select('id')
      .eq('numero', mapped.numero as string)
      .maybeSingle();

    if (existing) {
      await supabase.from('lineas_moviles').update(mapped).eq('id', existing.id);
      updated++;
    } else {
      await supabase.from('lineas_moviles').insert(mapped);
      created++;
    }
  }

  return { section: 'Flota', created, updated, skipped };
}

async function importLaptops(
  rows: Record<string, string>[],
  headers: string[]
): Promise<Omit<ImportResult, 'tabName'>> {
  const colMap = detectColumns(headers, FLOTA_LAPTOPS_COLUMNS);
  let created = 0,
    updated = 0,
    skipped = 0;

  for (const row of rows) {
    const mapped: Record<string, unknown> = {};

    for (const [dbCol, sheetCol] of Object.entries(colMap)) {
      const raw = (row[sheetCol] ?? '').trim();
      if (!raw) continue;
      mapped[dbCol] = raw;
    }

    if (!mapped.numero_serie && !mapped.modelo) {
      skipped++;
      continue;
    }

    if (mapped.usuario && typeof mapped.usuario === 'string') {
      const id = await resolveEmpleadoId(mapped.usuario);
      if (id) mapped.empleado_id = id;
    }

    let existing: { id: number } | null = null;
    if (mapped.numero_serie) {
      const { data } = await supabase
        .from('flota_laptops')
        .select('id')
        .eq('numero_serie', mapped.numero_serie as string)
        .maybeSingle();
      existing = data;
    }

    if (existing) {
      await supabase.from('flota_laptops').update(mapped).eq('id', existing.id);
      updated++;
    } else {
      await supabase.from('flota_laptops').insert(mapped);
      created++;
    }
  }

  return { section: 'Flota', created, updated, skipped };
}

async function importSueldos(
  rows: Record<string, string>[],
  headers: string[],
  tabName: string
): Promise<Omit<ImportResult, 'tabName'>> {
  let created = 0,
    updated = 0,
    skipped = 0;

  // Detect currency from tab name
  const normalizedTab = normalize(tabName);
  const moneda = normalizedTab.includes('usd') ? 'USD' : 'PESOS ARG';

  // Try pivot format: employee column + month columns
  const sample = rows.slice(0, 8);
  let nameCol: string | null = null;
  for (const h of headers) {
    const vals = sample.map((r) => r[h] ?? '').filter(Boolean);
    if (vals.length === 0) continue;
    const nonNumeric = vals.filter((v) => isNaN(Number(v.replace(/[.,\s]/g, ''))));
    if (nonNumeric.length >= Math.ceil(vals.length * 0.6)) {
      nameCol = h;
      break;
    }
  }

  // Detect month columns (numeric headers that could be months)
  const yearMatch = tabName.match(/\b(20\d{2})\b/);
  const anio = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

  const monthCols: { header: string; month: number }[] = [];
  for (const h of headers) {
    if (h === nameCol) continue;
    const m = MESES_MAP[normalize(h).slice(0, 3)];
    if (m !== undefined) monthCols.push({ header: h, month: m });
  }

  if (!nameCol || monthCols.length === 0) {
    // Try flat format: column-based (empleado, mes, monto)
    const colMap = detectColumns(headers, {
      nombre: ['Nombre', 'Empleado', 'nombre_apellido'],
      mes: ['Mes', 'mes', 'Periodo'],
      anio: ['Año', 'Anio', 'anio', 'Año'],
      monto: ['Monto', 'monto', 'Sueldo', 'Neto', 'Salario', 'Total']
    });

    for (const row of rows) {
      const empName = (colMap.nombre ? row[colMap.nombre] : '')?.trim();
      if (!empName) {
        skipped++;
        continue;
      }

      const empleadoId = await resolveEmpleadoId(empName);
      if (!empleadoId) {
        skipped++;
        continue;
      }

      let mes = colMap.mes ? parseInt(row[colMap.mes] ?? '') : 0;
      let rowAnio = colMap.anio ? parseInt(row[colMap.anio] ?? '') : anio;
      const monto = colMap.monto ? parseNumber(row[colMap.monto] ?? '') : null;

      if (!monto || isNaN(mes) || isNaN(rowAnio)) {
        skipped++;
        continue;
      }

      const { data: existing } = await supabase
        .from('sueldos')
        .select('id')
        .eq('empleado_id', empleadoId)
        .eq('mes', mes)
        .eq('anio', rowAnio)
        .eq('moneda', moneda)
        .maybeSingle();

      if (existing) {
        await supabase.from('sueldos').update({ monto }).eq('id', existing.id);
        updated++;
      } else {
        await supabase
          .from('sueldos')
          .insert({ empleado_id: empleadoId, mes, anio: rowAnio, moneda, monto });
        created++;
      }
    }
    return { section: 'Sueldos', created, updated, skipped };
  }

  // Pivot format: employee rows × month columns
  for (const row of rows) {
    const empName = (row[nameCol] ?? '').trim();
    if (!empName) {
      skipped++;
      continue;
    }

    const empleadoId = await resolveEmpleadoId(empName);
    if (!empleadoId) {
      skipped++;
      continue;
    }

    for (const { header, month } of monthCols) {
      const monto = parseNumber(row[header] ?? '');
      if (!monto) continue;

      const { data: existing } = await supabase
        .from('sueldos')
        .select('id')
        .eq('empleado_id', empleadoId)
        .eq('mes', month)
        .eq('anio', anio)
        .eq('moneda', moneda)
        .maybeSingle();

      if (existing) {
        await supabase.from('sueldos').update({ monto }).eq('id', existing.id);
        updated++;
      } else {
        await supabase
          .from('sueldos')
          .insert({ empleado_id: empleadoId, mes: month, anio, moneda, monto });
        created++;
      }
    }
  }

  return { section: 'Sueldos', created, updated, skipped };
}

// ── main entry ───────────────────────────────────────────────────────────────

export async function importSheetData(
  section: string | null,
  rows: Record<string, string>[],
  headers: string[],
  tabName: string
): Promise<ImportResult | null> {
  if (!section || rows.length === 0) return null;

  let result: Omit<ImportResult, 'tabName'>;

  switch (section) {
    case 'Legajo':
      result = await importLegajo(rows, headers);
      break;
    case 'Vacaciones':
      result = await importVacaciones(rows, headers, tabName);
      break;
    case 'Sueldos':
      result = await importSueldos(rows, headers, tabName);
      break;
    case 'Flota':
      // Try lines first (look for "numero" column), fallback to laptops
      if (headers.some((h) => matchPattern(h, ['Numero', 'Número', 'Línea', 'Linea']))) {
        result = await importLineasMoviles(rows, headers);
      } else {
        result = await importLaptops(rows, headers);
      }
      break;
    default:
      return null;
  }

  return { ...result, tabName };
}
