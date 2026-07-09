'use client';

import { LabelList, Pie, PieChart } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { supabase } from '@/lib/supabase';
import { SectionHelp } from '@/components/ui/section-help';
import { sectionHelp } from '@/config/section-help';

const chartConfig = {
  cantidad: { label: 'Empleados' },
  presencial: { label: 'Presencial', color: 'var(--chart-1)' },
  home_office: { label: 'Home Office', color: 'var(--chart-2)' },
  hibrido: { label: 'Híbrido', color: 'var(--chart-3)' },
  'n/a': { label: 'N/A', color: 'var(--chart-4)' }
} satisfies ChartConfig;

const labels: Record<string, string> = {
  presencial: 'Presencial',
  home_office: 'Home Office',
  hibrido: 'Híbrido',
  'n/a': 'N/A'
};

const colors: Record<string, string> = {
  presencial: 'var(--chart-1)',
  home_office: 'var(--chart-2)',
  hibrido: 'var(--chart-3)',
  'n/a': 'var(--chart-4)'
};

export function PieGraph() {
  const { data: chartData = [] } = useQuery({
    queryKey: ['overview', 'modalidad'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empleados')
        .select('modalidad')
        .eq('activo', true);
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const emp of data ?? []) {
        counts[emp.modalidad] = (counts[emp.modalidad] ?? 0) + 1;
      }
      return Object.entries(counts).map(([modalidad, cantidad]) => ({
        modalidad,
        cantidad,
        label: labels[modalidad] ?? modalidad,
        fill: colors[modalidad] ?? 'var(--chart-4)'
      }));
    }
  });

  return (
    <Card className='flex h-full flex-col'>
      <CardHeader className='items-center pb-0'>
        <div className='flex items-center gap-2'>
          <CardTitle>Modalidad de Trabajo</CardTitle>
          <SectionHelp title={sectionHelp.modalidadTrabajo.title}>
            {sectionHelp.modalidadTrabajo.body}
          </SectionHelp>
        </div>
        <CardDescription>Distribución de empleados activos</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-1 items-center justify-center pb-0'>
        {chartData.length === 0 ? (
          <p className='text-muted-foreground text-sm italic'>Sin información disponible.</p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className='[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[300px] min-h-[250px]'
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey='label' hideLabel />} />
              <Pie
                data={chartData}
                innerRadius={30}
                dataKey='cantidad'
                cornerRadius={8}
                paddingAngle={4}
              >
                <LabelList
                  dataKey='cantidad'
                  stroke='none'
                  fontSize={12}
                  fontWeight={500}
                  fill='currentColor'
                  formatter={(value: number) => value.toString()}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
