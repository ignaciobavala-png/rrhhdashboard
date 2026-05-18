'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { supabase } from '@/lib/supabase';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const chartConfig = {
  ars: { label: 'ARS (miles)', color: 'var(--chart-1)' }
} satisfies ChartConfig;

function formatTick(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

export function MasaSalarialChart() {
  const { data: chartData = [] } = useQuery({
    queryKey: ['overview', 'masa-salarial'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sueldos')
        .select('monto, mes, anio, moneda')
        .eq('moneda', 'PESOS ARG')
        .order('anio')
        .order('mes');
      if (error) throw error;

      const byMonth: Record<string, { ars: number; label: string }> = {};
      for (const row of data ?? []) {
        const key = `${row.anio}-${String(row.mes).padStart(2, '0')}`;
        if (!byMonth[key]) byMonth[key] = { ars: 0, label: `${MESES[row.mes - 1]} ${row.anio}` };
        byMonth[key].ars += row.monto ?? 0;
      }

      const sorted = Object.entries(byMonth)
        .toSorted(([a], [b]) => a.localeCompare(b))
        .slice(-6);

      return sorted.map(([, v]) => ({ mes: v.label, ars: v.ars }));
    }
  });

  const total = chartData.at(-1)?.ars ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución Masa Salarial</CardTitle>
        <CardDescription>
          Últimos meses · ARS
          {total > 0 && (
            <span className='ml-2 font-semibold text-foreground'>
              {formatTick(total)} último mes
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className='text-muted-foreground text-sm italic'>Sin datos de sueldos disponibles.</p>
        ) : (
          <ChartContainer config={chartConfig} className='max-h-[280px] w-full'>
            <AreaChart accessibilityLayer data={chartData}>
              <defs>
                <linearGradient id='fillArs' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='var(--color-ars)' stopOpacity={0.4} />
                  <stop offset='95%' stopColor='var(--color-ars)' stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray='3 3' />
              <XAxis
                dataKey='mes'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 10 }}
                tickFormatter={formatTick}
                width={56}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent formatter={(value) => formatTick(Number(value))} />}
              />
              <Area
                dataKey='ars'
                type='monotone'
                fill='url(#fillArs)'
                stroke='var(--color-ars)'
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
