import type { ColumnType } from '../api/types';

const SAMPLE_SIZE = 15;

function nonEmpty(values: string[]): string[] {
  return values.filter((v) => v && v.trim() !== '').slice(0, SAMPLE_SIZE);
}

export function detectColumnType(values: string[]): ColumnType {
  const samples = nonEmpty(values);
  if (samples.length === 0) return 'text';

  const all = (test: (v: string) => boolean) => samples.every(test);

  if (all((v) => /^-?[\d.,]+%$/.test(v))) return 'percentage';
  if (all((v) => /^[$€£¥₱]\s?[\d.,]+$/.test(v))) return 'currency';
  if (all((v) => /^[\d.,]+\s?[$€£¥₱]$/.test(v))) return 'currency';
  if (all((v) => /^-?[\d.,]+$/.test(v.replace(/\s/g, '')))) return 'number';
  if (all((v) => /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(v))) return 'date';
  if (all((v) => /^\d{4}-\d{2}-\d{2}/.test(v))) return 'date';
  if (all((v) => /^(si|no|sí|yes|true|false|activo|inactivo|✓|✗|x|-)$/i.test(v.trim())))
    return 'boolean';
  if (all((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))) return 'email';
  if (all((v) => /^https?:\/\//.test(v))) return 'url';

  return 'text';
}

export function detectColumnTypes(
  headers: string[],
  rows: Record<string, string>[]
): Record<string, ColumnType> {
  const result: Record<string, ColumnType> = {};
  for (const header of headers) {
    const values = rows.map((r) => r[header] ?? '');
    result[header] = detectColumnType(values);
  }
  return result;
}
