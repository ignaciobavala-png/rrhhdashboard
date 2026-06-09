// Keyword sets per known dashboard section
const SECTION_KEYWORDS: [string, string[]][] = [
  [
    'Vacaciones',
    [
      'vacacion',
      'vacaciones',
      'ausencia',
      'licencia',
      'dias_tomados',
      'dias_disponibles',
      'dias_libre',
      'permiso'
    ]
  ],
  [
    'Legajo',
    ['nombre_apellido', 'empleado', 'fecha_ingreso', 'fecha_egreso', 'dni', 'cuil', 'legajo']
  ],
  [
    'Sueldos',
    ['sueldo', 'salario', 'neto', 'bruto', 'haberes', 'remuneracion', 'descuento', 'adicional']
  ],
  [
    'Asistencia',
    ['asistencia', 'presente', 'ausente', 'tardanza', 'hora_entrada', 'hora_salida', 'fichaje']
  ],
  [
    'Flota',
    ['celular', 'laptop', 'dispositivo', 'equipo', 'numero_serie', 'imei', 'modelo', 'marca']
  ],
  [
    'People',
    ['reunion', 'meeting', 'feedback', 'performance', 'objetivo', 'capacitacion', 'entrenamiento']
  ]
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '_');
}

export function suggestSection(headers: string[], tabName?: string): string | null {
  const normalized = headers.map(normalize);

  let bestSection: string | null = null;
  let bestScore = 0;

  for (const [section, keywords] of SECTION_KEYWORDS) {
    const score = keywords.filter((kw) => normalized.some((h) => h.includes(kw))).length;
    if (score > bestScore) {
      bestScore = score;
      bestSection = section;
    }
  }

  // Tab name takes priority when headers give weak evidence (score < 2)
  if (tabName) {
    const normalizedTab = normalize(tabName);
    for (const [section, keywords] of SECTION_KEYWORDS) {
      if (keywords.some((kw) => normalizedTab.includes(kw))) {
        if (bestScore < 2) return section;
        break;
      }
    }
  }

  return bestScore > 0 ? bestSection : null;
}
