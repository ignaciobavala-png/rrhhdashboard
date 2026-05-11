import PageContainer from '@/components/layout/page-container';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { supabase } from '@/lib/supabase';
import React from 'react';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatMiles(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default async function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  const [
    { count: totalActivos },
    { count: totalInactivos },
    { count: lineasAsignadas },
    { data: vacData },
    { data: sueldosData }
  ] = await Promise.all([
    supabase.from('empleados').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('empleados').select('*', { count: 'exact', head: true }).eq('activo', false),
    supabase
      .from('lineas_moviles')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'asignado'),
    supabase.from('vacaciones').select('saldo_actual').eq('anio', 2025),
    supabase.from('sueldos').select('monto, mes, anio').eq('moneda', 'PESOS ARG')
  ]);

  const saldoVacTotal = (vacData ?? []).reduce((acc, v) => acc + (v.saldo_actual ?? 0), 0);

  let maxAnio = 0;
  let maxMes = 0;
  for (const s of sueldosData ?? []) {
    if (s.anio > maxAnio || (s.anio === maxAnio && s.mes > maxMes)) {
      maxAnio = s.anio;
      maxMes = s.mes;
    }
  }
  const masaSalarial = (sueldosData ?? [])
    .filter((s) => s.anio === maxAnio && s.mes === maxMes)
    .reduce((acc, s) => acc + (s.monto ?? 0), 0);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>Panel de Recursos Humanos</h2>
        </div>

        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Empleados Activos</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {totalActivos ?? '—'}
              </CardTitle>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {totalInactivos ?? 0} inactivos · Total{' '}
                {(totalActivos ?? 0) + (totalInactivos ?? 0)}
              </div>
              <div className='text-muted-foreground'>Plantilla registrada</div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Líneas Móviles</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {lineasAsignadas ?? '—'}
              </CardTitle>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Asignadas <Icons.phone className='size-4' />
              </div>
              <div className='text-muted-foreground'>Flota celulares activa</div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Días de Vacaciones</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {saldoVacTotal > 0 ? saldoVacTotal.toFixed(0) : '—'}
              </CardTitle>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Saldo disponible 2025 <Icons.calendar className='size-4' />
              </div>
              <div className='text-muted-foreground'>Total acumulado equipo</div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Masa Salarial</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {masaSalarial > 0 ? formatMiles(masaSalarial) : '—'}
              </CardTitle>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {maxMes > 0 ? `${MESES[maxMes - 1]} ${maxAnio}` : 'Sin datos'}{' '}
                <Icons.payroll className='size-4' />
              </div>
              <div className='text-muted-foreground'>Pesos ARS · último mes</div>
            </CardFooter>
          </Card>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>{bar_stats}</div>
          <div className='col-span-4 md:col-span-3'>{sales}</div>
          <div className='col-span-4'>{area_stats}</div>
          <div className='col-span-4 min-h-0 md:col-span-3'>{pie_stats}</div>
        </div>
      </div>
    </PageContainer>
  );
}
