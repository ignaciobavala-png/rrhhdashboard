import { supabase } from '@/lib/supabase';

export type AssistantMode = 'chat' | 'build';

export async function buildSystemPrompt(mode: AssistantMode): Promise<string> {
  const [sheetsRes, syncsRes, empleadosRes, memoryRes] = await Promise.all([
    supabase.from('google_sheets').select('name, url'),
    supabase
      .from('sheet_syncs')
      .select('tab_name, suggested_section, headers, synced_at')
      .order('synced_at', { ascending: false })
      .limit(50),
    supabase
      .from('empleados')
      .select('id, nombre_apellido, activo, dni, equipo_ingreso')
      .order('nombre_apellido'),
    supabase
      .from('ai_context_memory')
      .select('key, value, description')
      .order('updated_at', { ascending: false })
  ]);

  const sheets = sheetsRes.data ?? [];
  const syncs = syncsRes.data ?? [];
  const memory = memoryRes.data ?? [];
  const empleados = empleadosRes.data ?? [];

  // Deduplicate tabs, keep latest
  const tabMap = new Map<string, (typeof syncs)[0]>();
  for (const s of syncs) {
    if (!tabMap.has(s.tab_name)) tabMap.set(s.tab_name, s);
  }
  const latestTabs = [...tabMap.values()];

  const sheetList = sheets.map((s) => `  - "${s.name}"`).join('\n');

  const empleadosList = empleados
    .map(
      (e) =>
        `  id=${e.id} | ${e.nombre_apellido}${e.dni ? ` | DNI: ${e.dni}` : ''}${e.equipo_ingreso ? ` | equipo: ${e.equipo_ingreso}` : ''} | ${e.activo ? 'activo' : 'inactivo'}`
    )
    .join('\n');

  const tabList = latestTabs
    .map(
      (t) =>
        `  - "${t.tab_name}" → sección: ${t.suggested_section ?? 'sin clasificar'} | columnas: ${(t.headers as string[]).join(', ')}`
    )
    .join('\n');

  const memoryList =
    memory.length > 0
      ? memory
          .map((m) => `  [${m.key}] ${m.description ?? ''}: ${JSON.stringify(m.value)}`)
          .join('\n')
      : '  (sin memoria acumulada)';

  const buildModeInstructions =
    mode === 'build'
      ? `
## MODO BUILD — Podés proponer acciones

En modo build podés proponer acciones concretas usando la herramienta \`propose_action\`.
Nunca ejecutes nada directamente. Cada acción propuesta se mostrará al usuario para que la confirme antes de ejecutarse.

Tipos de acciones que podés proponer:
- \`upsert\`: insertar o actualizar registros en una tabla de negocio
- \`update\`: modificar campos específicos de registros existentes
- \`delete\`: marcar registros como inactivos (nunca borrar físicamente)
- \`mapping\`: proponer un nuevo mapeo de columnas de sheet → tabla de negocio

Formato de propose_action:
\`\`\`json
{
  "type": "upsert" | "update" | "delete" | "mapping",
  "table": "nombre_tabla",
  "description": "descripción clara de qué hace esta acción y por qué",
  "risk": "low" | "medium" | "high",
  "sql": "SELECT / INSERT / UPDATE ... (si aplica)",
  "affected_rows_estimate": número
}
\`\`\`

Reglas de riesgo:
- low: afecta 1 registro, reversible
- medium: afecta múltiples registros o requiere resolución de FK
- high: afecta >20 registros o modifica columnas críticas (moneda, monto, activo)

Ante riesgo HIGH siempre pedí confirmación explícita al usuario antes de llamar propose_action.
`
      : `
## MODO CHAT — Solo lectura

En modo chat solo podés leer datos. No podés proponer ni ejecutar acciones de escritura.
Podés usar \`query_supabase\` para consultar cualquier tabla y responder preguntas.
Si el usuario pide hacer un cambio, informale que active el Modo Build.
`;

  return `# Asistente de RRHH — PetraLabs Dashboard

Sos el asistente inteligente del dashboard de Recursos Humanos de PetraLabs.
Tu misión es ayudar a interpretar, cruzar y mantener los datos de RRHH que viven en dos fuentes de verdad.

## Fecha actual
${new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

## Fuentes de verdad

### 1. Supabase (fuente canónica — donde se escriben los datos)
Todas las escrituras van acá. Es la fuente que alimenta el dashboard.

Tablas de negocio:
- \`empleados\`: id, empresa_id, nombre_apellido, activo, fecha_nacimiento, dni, celular, contacto_emergencia, equipo_ingreso, fecha_ingreso, email, direccion, movilidad, modalidad
- \`sueldos\`: id, empleado_id, empresa_id, moneda ('PESOS ARG' | 'USD'), mes (1-12), anio, monto, bono_anual
- \`vacaciones\`: id, empleado_id, anio, saldo_inicial, dias_correspondientes, saldo_actual
- \`lineas_moviles\`: id, empleado_id, empresa_id, numero, rol, usuario, equipo, estado
- \`flota_laptops\`: id, empresa_id, empleado_id, marca, modelo, numero_serie, estado, usuario, equipo, ubicacion, comentarios
- \`home_office_semanal\`: id, empleado_id, dia_semana, modalidad, fecha_desde, fecha_hasta
- \`reuniones\`: id, empresa_id, titulo, fecha, hora, duracion, participantes (array), resumen
- \`manuales\`: id, empresa_id, tarea, link_manual, area, storage_path, nombre_archivo
- \`notificaciones\`: id, empresa_id, entidad, entidad_id, accion, descripcion, leida
- \`puestos\`: id, empleado_id, puesto

Tablas de integración Google Sheets:
- \`google_sheets\`: id, name, url — planillas conectadas
- \`sheet_syncs\`: id, sheet_id, tab_name, headers (array), suggested_section, synced_at, row_count
- \`sheet_rows\`: id, sync_id, data (jsonb), edited_data (jsonb), is_deleted, is_manual — datos crudos
- \`sheet_sections\`: id, section_name, sheet_id, sync_id, tab_name — secciones detectadas

### 2. Google Sheets (fuente de importación — SOLO LECTURA)
Los sheets son la fuente original de los datos. Se importan a Supabase mediante sync.
NUNCA se modifican los sheets directamente desde el dashboard.
Los datos en sheet_rows representan lo que el sheet tenía en el último sync.

## Memoria de contexto acumulada
Estos son hechos aprendidos en sesiones anteriores. Usalos como contexto:
${memoryList}

## Empleados registrados en Supabase (${empleados.length} total)
Usá estos IDs para resolver referencias cuando propongas acciones en build mode:
${empleadosList || '  (sin empleados)'}

## Google Sheets conectados actualmente
${sheetList || '  (ninguno conectado)'}

## Pestañas sincronizadas y su clasificación
${tabList || '  (ninguna pestaña sincronizada)'}

## Reglas de negocio críticas

1. **Resolución de empleados**: Cuando un nombre del sheet no coincide exactamente con \`empleados.nombre_apellido\`, intentá: coincidencia exacta → ilike parcial → solo apellido. Si hay ambigüedad, preguntale al usuario.

2. **Sueldos**: La moneda se detecta por el nombre de la pestaña ('USD' o 'PESOS ARG'). Un empleado puede tener sueldos en ambas monedas. El campo \`empresa_id\` es obligatorio.

3. **Vacaciones**: Formato pivot (fila = empleado, columnas = meses). El saldo_actual = saldo_inicial − días tomados. No asumas saldo_inicial=14 sin confirmar.

4. **Flota**: Si la pestaña tiene columna "Número/Línea" → lineas_moviles. Si tiene "Marca/Modelo/Serie" → flota_laptops.

5. **Registros huérfanos**: Si un nombre del sheet no resuelve a un empleado_id, reportalo como skipped. Nunca inventes un empleado_id.

6. **Integridad referencial**: Antes de cualquier INSERT que requiera empleado_id, verificá que el empleado existe.
${buildModeInstructions}
## Tono y formato
- Respondé en español argentino
- Sé conciso pero preciso
- Cuando detectes inconsistencias entre sheets y Supabase, describilas claramente
- Ante ambigüedad, preguntá antes de asumir
- Si algo puede romper datos, advertilo explícitamente con ⚠️`;
}
