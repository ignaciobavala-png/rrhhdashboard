export type SueldoRow = {
  monto: number | null;
  mes: number;
  anio: number;
  moneda: string;
};

export type MesRef = { anio: number; mes: number };

// La planilla trae sueldos cargados por adelantado para algún empleado puntual
// (ej. un solo monto en Sep 2026 cuando el mes completo es Jun). Tomar el mes
// más nuevo a secas hace que la masa salarial muestre un solo sueldo como si
// fuera el total. Un mes se considera representativo si tiene al menos la
// mitad de las filas del mes mejor cubierto de esa moneda.
export function ultimoMesRepresentativo(rows: SueldoRow[], moneda: string): MesRef | null {
  const conteo = new Map<string, { anio: number; mes: number; filas: number }>();
  for (const r of rows) {
    if (r.moneda !== moneda) continue;
    const key = `${r.anio}-${r.mes}`;
    const actual = conteo.get(key) ?? { anio: r.anio, mes: r.mes, filas: 0 };
    actual.filas++;
    conteo.set(key, actual);
  }
  if (conteo.size === 0) return null;

  const maxFilas = Math.max(...[...conteo.values()].map((m) => m.filas));
  const umbral = Math.ceil(maxFilas / 2);

  let ultimo: MesRef | null = null;
  for (const m of conteo.values()) {
    if (m.filas < umbral) continue;
    if (!ultimo || m.anio > ultimo.anio || (m.anio === ultimo.anio && m.mes > ultimo.mes)) {
      ultimo = { anio: m.anio, mes: m.mes };
    }
  }
  return ultimo;
}

export function mesAnterior(ref: MesRef): MesRef {
  return ref.mes === 1 ? { anio: ref.anio - 1, mes: 12 } : { anio: ref.anio, mes: ref.mes - 1 };
}

export function masaDelMes(rows: SueldoRow[], moneda: string, ref: MesRef | null): number {
  if (!ref) return 0;
  return rows
    .filter((r) => r.moneda === moneda && r.anio === ref.anio && r.mes === ref.mes)
    .reduce((acc, r) => acc + (r.monto ?? 0), 0);
}
