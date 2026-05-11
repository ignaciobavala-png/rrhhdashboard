export type Sueldo = {
  id: number;
  empleado_id: number;
  empresa_id: number;
  moneda: 'PESOS ARG' | 'USD';
  mes: number;
  anio: number;
  monto: number | null;
  bono_anual: number | null;
  empleados: { nombre_apellido: string } | null;
};

export type SueldosPorEmpleado = {
  nombre_apellido: string;
  moneda: 'PESOS ARG' | 'USD';
  meses: (number | null)[];
};
