'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

type VacRow = { nombre: string; iniciales: string; saldo: number };

function color(saldo: number) {
  if (saldo === 0)
    return { bar: 'bg-red-400/70 dark:bg-red-500/60', text: 'text-red-600 dark:text-red-400' };
  if (saldo <= 3)
    return {
      bar: 'bg-amber-400/80 dark:bg-amber-500/70',
      text: 'text-amber-600 dark:text-amber-400'
    };
  return {
    bar: 'bg-emerald-500/70 dark:bg-emerald-400/60',
    text: 'text-emerald-700 dark:text-emerald-400'
  };
}

function iniciales(nombreCompleto: string): string {
  const partes = nombreCompleto.replace(',', '').split(' ').filter(Boolean);
  return partes
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

function nombreCorto(nombreCompleto: string): string {
  const [apellido, nombre] = nombreCompleto.split(', ');
  if (!nombre) return apellido;
  const primerNombre = nombre.split(' ')[0];
  return `${primerNombre} ${apellido.split(' ')[0]}`;
}

export function VacacionesRanking() {
  const { data, isLoading } = useQuery({
    queryKey: ['overview', 'vacaciones-ranking'],
    queryFn: async (): Promise<VacRow[]> => {
      const [{ data: empActivos }, { data: vacData, error }] = await Promise.all([
        supabase.from('empleados').select('id, nombre_apellido').eq('activo', true),
        supabase.from('vacaciones').select('empleado_id, saldo_actual').eq('anio', 2025)
      ]);
      if (error) throw error;

      const empMap = new Map((empActivos ?? []).map((e) => [e.id, e.nombre_apellido ?? '']));
      const vacMap = new Map(
        (vacData ?? []).map((v) => [v.empleado_id, Number(v.saldo_actual ?? 0)])
      );

      return [...empMap.entries()]
        .map(([id, nombre]) => ({
          nombre,
          iniciales: iniciales(nombre),
          saldo: vacMap.get(id) ?? 0
        }))
        .sort((a, b) => b.saldo - a.saldo);
    }
  });

  const rows = data ?? [];
  const maxSaldo = rows[0]?.saldo ?? 1;
  const totalDias = rows.reduce((acc, r) => acc + r.saldo, 0);
  const sinSaldo = rows.filter((r) => r.saldo === 0).length;

  return (
    <Card className='flex flex-col h-full'>
      <CardHeader className='pb-2'>
        <CardTitle>Saldo de Vacaciones</CardTitle>
        <CardDescription>
          Días disponibles · 2025
          {rows.length > 0 && (
            <span className='ml-2 text-foreground font-medium'>
              {totalDias}d totales
              {sinSaldo > 0 && (
                <span className='ml-2 text-red-600 dark:text-red-400 text-[11px]'>
                  · {sinSaldo} sin días
                </span>
              )}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-1 overflow-y-auto pr-1'>
        {isLoading ? (
          <div className='flex flex-col gap-2'>
            {[...Array(6)].map((_, i) => (
              <div key={i} className='h-8 rounded bg-muted animate-pulse' />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className='text-muted-foreground text-sm italic'>Sin datos disponibles.</p>
        ) : (
          <div className='flex flex-col gap-1'>
            {rows.map((row) => {
              const c = color(row.saldo);
              const pct = maxSaldo > 0 ? (row.saldo / maxSaldo) * 100 : 0;
              return (
                <div key={row.nombre} className='flex items-center gap-2.5 py-1'>
                  <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground'>
                    {row.iniciales}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center justify-between gap-1 mb-0.5'>
                      <span className='text-xs font-medium truncate'>
                        {nombreCorto(row.nombre)}
                      </span>
                      <span className={cn('text-xs font-bold tabular-nums shrink-0', c.text)}>
                        {row.saldo}d
                      </span>
                    </div>
                    <div className='h-1.5 w-full rounded-full bg-muted overflow-hidden'>
                      <div
                        className={cn('h-full rounded-full transition-all', c.bar)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
