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
    [
      'nombre_apellido',
      'nombre',
      'empleado',
      'fecha_ingreso',
      'fecha_egreso',
      'dni',
      'cuil',
      'legajo',
      'activo',
      'ingreso',
      'nacimiento',
      'contacto_emergencia',
      'email',
      'mail',
      'direccion',
      'movilidad'
    ]
  ],
  [
    'Sueldos',
    [
      'sueldo',
      'salario',
      'neto',
      'bruto',
      'haberes',
      'remuneracion',
      'descuento',
      'adicional',
      'pesos',
      'usd',
      'moneda',
      'bono',
      'monto'
    ]
  ],
  [
    'Asistencia',
    [
      'asistencia',
      'presente',
      'ausente',
      'tardanza',
      'hora_entrada',
      'hora_salida',
      'fichaje',
      'home_office',
      'dia_semana'
    ]
  ],
  [
    'Flota',
    [
      'celular',
      'laptop',
      'dispositivo',
      'equipo',
      'numero_serie',
      'imei',
      'modelo',
      'marca',
      'linea',
      'movil',
      'numero',
      'telefono',
      'asignado'
    ]
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
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function matchesKeyword(normalizedHeader: string, keyword: string): boolean {
  const headerTokens = normalizedHeader.split('_').filter(Boolean);
  const keywordTokens = keyword.split('_').filter(Boolean);
  return keywordTokens.every((kt) => headerTokens.some((ht) => ht.includes(kt)));
}

export function suggestSection(headers: string[], tabName?: string): string | null {
  const normalized = headers.map(normalize);

  let bestSection: string | null = null;
  let bestScore = 0;

  for (const [section, keywords] of SECTION_KEYWORDS) {
    const score = keywords.filter((kw) => normalized.some((h) => matchesKeyword(h, kw))).length;
    if (score > bestScore) {
      bestScore = score;
      bestSection = section;
    }
  }

  // Tab name takes priority when headers give weak evidence (score < 2)
  if (tabName) {
    const normalizedTab = normalize(tabName);
    for (const [section, keywords] of SECTION_KEYWORDS) {
      if (keywords.some((kw) => matchesKeyword(normalizedTab, kw))) {
        if (bestScore < 2) return section;
        break;
      }
    }
  }

  return bestScore > 0 ? bestSection : null;
}
