'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getSueldosByAnio, getAniosDisponibles } from '@/features/payroll/api/service';
import type { Sueldo, SueldosPorEmpleado } from '@/features/payroll/api/types';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatMonto(monto: number | null, moneda: 'PESOS ARG' | 'USD'): string {
  if (monto === null || monto === 0) return '—';
  if (moneda === 'USD') return `U$D ${monto.toLocaleString('es-AR')}`;
  if (monto >= 1_000_000) return `$${(monto / 1_000_000).toFixed(2)}M`;
  if (monto >= 1_000) return `$${(monto / 1_000).toFixed(0)}K`;
  return `$${monto}`;
}

function buildPivot(sueldos: Sueldo[], moneda: 'PESOS ARG' | 'USD'): SueldosPorEmpleado[] {
  const map = new Map<string, (number | null)[]>();
  for (const s of sueldos) {
    if (s.moneda !== moneda) continue;
    const nombre = s.empleados?.nombre_apellido ?? `ID ${s.empleado_id}`;
    if (!map.has(nombre)) map.set(nombre, Array(12).fill(null));
    const arr = map.get(nombre)!;
    arr[s.mes - 1] = s.monto;
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([nombre_apellido, meses]) => ({ nombre_apellido, moneda, meses }));
}

function SueldoTable({
  rows,
  moneda
}: {
  rows: SueldosPorEmpleado[];
  moneda: 'PESOS ARG' | 'USD';
}) {
  if (rows.length === 0) return null;
  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='flex items-center gap-3'>
          <CardTitle className='text-base'>
            {moneda === 'PESOS ARG' ? 'Pesos Argentinos' : 'Dólares (USD)'}
          </CardTitle>
          <Badge variant='outline' className='text-xs'>
            {rows.length} empleados
          </Badge>
        </div>
        <CardDescription>Sueldo mensual bruto por empleado</CardDescription>
      </CardHeader>
      <CardContent className='overflow-x-auto p-0'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b'>
              <th className='px-4 py-2 text-left font-medium text-muted-foreground min-w-[180px]'>
                Empleado
              </th>
              {MESES.map((m) => (
                <th
                  key={m}
                  className='px-2 py-2 text-right font-medium text-muted-foreground min-w-[80px]'
                >
                  {m}
                </th>
              ))}
              <th className='px-3 py-2 text-right font-medium text-muted-foreground min-w-[90px]'>
                Último
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const ultimo = [...row.meses].reverse().find((v) => v !== null) ?? null;
              return (
                <tr key={row.nombre_apellido} className='border-b last:border-0 hover:bg-muted/30'>
                  <td className='px-4 py-2 font-medium'>{row.nombre_apellido}</td>
                  {row.meses.map((monto, i) => (
                    <td
                      key={i}
                      className={`px-2 py-2 text-right tabular-nums ${
                        monto === null ? 'text-muted-foreground/40' : ''
                      }`}
                    >
                      {monto !== null ? formatMonto(monto, moneda) : '·'}
                    </td>
                  ))}
                  <td className='px-3 py-2 text-right font-semibold tabular-nums'>
                    {formatMonto(ultimo, moneda)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export function PayrollPage() {
  const [anio, setAnio] = useState<number>(2025);

  const { data: anios = [] } = useQuery({
    queryKey: ['payroll', 'anios'],
    queryFn: getAniosDisponibles
  });

  const { data: sueldos = [], isLoading } = useQuery({
    queryKey: ['payroll', 'sueldos', anio],
    queryFn: () => getSueldosByAnio(anio)
  });

  const pesos = buildPivot(sueldos, 'PESOS ARG');
  const usd = buildPivot(sueldos, 'USD');

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <span className='text-sm text-muted-foreground'>Período:</span>
        <Select value={String(anio)} onValueChange={(v) => setAnio(Number(v))}>
          <SelectTrigger className='w-[100px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {anios.map((a) => (
              <SelectItem key={a} value={String(a)}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className='text-muted-foreground text-sm italic'>Cargando...</p>
      ) : sueldos.length === 0 ? (
        <p className='text-muted-foreground text-sm italic'>Sin datos para {anio}.</p>
      ) : (
        <div className='space-y-4'>
          <SueldoTable rows={pesos} moneda='PESOS ARG' />
          <SueldoTable rows={usd} moneda='USD' />
        </div>
      )}
    </div>
  );
}
