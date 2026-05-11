'use client';

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
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
  presencial: { label: 'Presencial', color: 'var(--chart-1)' },
  remoto: { label: 'Remoto', color: 'var(--chart-2)' }
} satisfies ChartConfig;

export function AreaGraph() {
  const { data: chartData = [] } = useQuery({
    queryKey: ['overview', 'home-office-mensual'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_office_semanal')
        .select('modalidad, dia_semana');
      if (error) throw error;
      const counts = { presencial: 0, remoto: 0 };
      for (const row of data ?? []) {
        if (row.modalidad === 'Presencial') counts.presencial++;
        else counts.remoto++;
      }
      return MESES.map((mes) => ({
        mes,
        presencial: counts.presencial,
        remoto: counts.remoto
      }));
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Presencialidad Semanal</CardTitle>
        <CardDescription>Días presenciales vs. remotos configurados</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className='text-muted-foreground text-sm italic'>Sin información disponible.</p>
        ) : (
          <ChartContainer config={chartConfig}>
            <AreaChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray='3 3' />
              <XAxis dataKey='mes' tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area
                dataKey='remoto'
                type='natural'
                fill='var(--color-remoto)'
                fillOpacity={0.3}
                stroke='var(--color-remoto)'
                stackId='a'
                strokeWidth={1.5}
              />
              <Area
                dataKey='presencial'
                type='natural'
                fill='var(--color-presencial)'
                fillOpacity={0.3}
                stroke='var(--color-presencial)'
                stackId='a'
                strokeWidth={1.5}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
