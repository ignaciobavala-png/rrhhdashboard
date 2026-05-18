'use client';

import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { supabase } from '@/lib/supabase';

const chartConfig = {
  activos: { label: 'Activos', color: 'var(--chart-1)' },
  inactivos: { label: 'Inactivos', color: 'var(--chart-2)' }
} satisfies ChartConfig;

export function BarGraph() {
  const { data: chartData = [] } = useQuery({
    queryKey: ['overview', 'empleados-por-equipo'],
    queryFn: async () => {
      const { data, error } = await supabase.from('empleados').select('equipo_ingreso, activo');
      if (error) throw error;
      const map: Record<string, { activos: number; inactivos: number }> = {};
      for (const emp of data ?? []) {
        const equipo = emp.equipo_ingreso ?? 'Sin equipo';
        if (!map[equipo]) map[equipo] = { activos: 0, inactivos: 0 };
        if (emp.activo) map[equipo].activos++;
        else map[equipo].inactivos++;
      }
      return Object.entries(map)
        .sort((a, b) => b[1].activos - a[1].activos)
        .map(([equipo, counts]) => ({ equipo, ...counts }));
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Empleados por Equipo</CardTitle>
        <CardDescription>Activos e inactivos por área de ingreso</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className='text-muted-foreground text-sm italic'>Sin información disponible.</p>
        ) : (
          <ChartContainer config={chartConfig} className='max-h-[200px] w-full'>
            <BarChart accessibilityLayer data={chartData} margin={{ top: 4, bottom: 0 }}>
              <XAxis
                dataKey='equipo'
                tickLine={false}
                tickMargin={6}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => v.slice(0, 10)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 10 }}
                width={24}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='dashed' />} />
              <Bar dataKey='activos' fill='var(--color-activos)' radius={4} maxBarSize={32} />
              <Bar dataKey='inactivos' fill='var(--color-inactivos)' radius={4} maxBarSize={32} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
