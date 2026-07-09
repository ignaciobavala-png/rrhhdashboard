import PageContainer from '@/components/layout/page-container';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { supabase } from '@/lib/supabase';
import { VacacionesRanking } from '@/features/overview/components/vacaciones-ranking';
import {
  masaDelMes,
  mesAnterior,
  ultimoMesRepresentativo,
  type SueldoRow
} from '@/features/overview/lib/sueldos-kpi';
import { SectionHelp } from '@/components/ui/section-help';
import { sectionHelp } from '@/config/section-help';
import React from 'react';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatMiles(n: number): string {
  return `$${n.toLocaleString('es-AR', { maximumFractionDigits: 2 })}`;
}

function formatUSD(n: number): string {
  return `U$S ${n.toLocaleString('es-AR', { maximumFractionDigits: 2 })}`;
}

export default async function OverViewLayout({
  sales,
  bar_stats,
  area_stats,
  pie_stats
}: {
  sales: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
  pie_stats: React.ReactNode;
}) {
  const [
    { count: totalActivos },
    { count: totalInactivos },
    { count: lineasAsignadas },
    { count: laptopsAsignadas },
    { data: sueldosData }
  ] = await Promise.all([
    supabase.from('empleados').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('empleados').select('*', { count: 'exact', head: true }).eq('activo', false),
    supabase
      .from('lineas_moviles')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'asignado'),
    supabase
      .from('flota_laptops')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'asignado'),
    supabase.from('sueldos').select('monto, mes, anio, moneda')
  ]);

  const sueldos = (sueldosData ?? []) as SueldoRow[];
  const refARS = ultimoMesRepresentativo(sueldos, 'PESOS ARG');
  const refUSD = ultimoMesRepresentativo(sueldos, 'USD');

  const masaARS = masaDelMes(sueldos, 'PESOS ARG', refARS);
  const masaUSD = masaDelMes(sueldos, 'USD', refUSD);

  const masaARSPrev = refARS ? masaDelMes(sueldos, 'PESOS ARG', mesAnterior(refARS)) : 0;
  const deltaARS =
    masaARSPrev > 0 ? Math.round(((masaARS - masaARSPrev) / masaARSPrev) * 100) : null;

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>Panel de Recursos Humanos</h2>
        </div>

        {/* KPI cards */}
        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          <Card className='@container/card'>
            <CardHeader>
              <div className='flex items-center justify-between gap-2'>
                <CardDescription>Empleados Activos</CardDescription>
                <SectionHelp title={sectionHelp.empleadosActivos.title}>
                  {sectionHelp.empleadosActivos.body}
                </SectionHelp>
              </div>
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
              <div className='flex items-center justify-between gap-2'>
                <CardDescription>Flota Asignada</CardDescription>
                <SectionHelp title={sectionHelp.flotaAsignada.title}>
                  {sectionHelp.flotaAsignada.body}
                </SectionHelp>
              </div>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {(lineasAsignadas ?? 0) + (laptopsAsignadas ?? 0)}
              </CardTitle>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {lineasAsignadas ?? 0} líneas · {laptopsAsignadas ?? 0} laptops
              </div>
              <div className='text-muted-foreground'>Equipos activos en uso</div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <div className='flex items-center justify-between gap-2'>
                <CardDescription>Masa Salarial ARS</CardDescription>
                <SectionHelp title={sectionHelp.masaSalarialARS.title}>
                  {sectionHelp.masaSalarialARS.body}
                </SectionHelp>
              </div>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {masaARS > 0 ? formatMiles(masaARS) : '—'}
              </CardTitle>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {refARS ? `${MESES[refARS.mes - 1]} ${refARS.anio}` : 'Sin datos'}
                {deltaARS !== null && (
                  <span
                    className={
                      deltaARS >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }
                  >
                    {deltaARS >= 0 ? '+' : ''}
                    {deltaARS}% vs mes ant.
                  </span>
                )}
              </div>
              <div className='text-muted-foreground'>Pesos ARS · último mes</div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <div className='flex items-center justify-between gap-2'>
                <CardDescription>Masa Salarial USD</CardDescription>
                <SectionHelp title={sectionHelp.masaSalarialUSD.title}>
                  {sectionHelp.masaSalarialUSD.body}
                </SectionHelp>
              </div>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {masaUSD > 0 ? formatUSD(masaUSD) : '—'}
              </CardTitle>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                {refUSD ? `${MESES[refUSD.mes - 1]} ${refUSD.anio}` : 'Sin datos'}{' '}
                <Icons.payroll className='size-4' />
              </div>
              <div className='text-muted-foreground'>Dólares · último mes</div>
            </CardFooter>
          </Card>
        </div>

        {/* Charts row 1 */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>{bar_stats}</div>
          <div className='col-span-4 md:col-span-3'>{sales}</div>
        </div>

        {/* Charts row 2 */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>{area_stats}</div>
          <div className='col-span-4 md:col-span-3'>{pie_stats}</div>
        </div>

        {/* Charts row 3 */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4 md:col-span-7'>
            <VacacionesRanking />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
