'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Icons } from '@/components/icons';

const tipoColors: Record<string, string> = {
  desempeño: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  objetivos: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  feedback: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  promoción: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
};

const estadoColors: Record<string, string> = {
  pendiente: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  completada: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  reprogramada: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
};

const prioridadColors: Record<string, string> = {
  alta: 'bg-red-500/10 text-red-600 dark:text-red-400',
  media: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  baja: 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
};

export default function TalentListingPage() {
  const { data: evaluaciones = [] } = useQuery({
    queryKey: ['talento', 'evaluaciones'],
    queryFn: async () => {
      const { fakeTalento } = await import('@/constants/mock-api-talento');
      return fakeTalento.getEvaluaciones();
    }
  });

  const { data: objetivos = [] } = useQuery({
    queryKey: ['talento', 'objetivos'],
    queryFn: async () => {
      const { fakeTalento } = await import('@/constants/mock-api-talento');
      return fakeTalento.getObjetivos();
    }
  });

  const { data: resumen } = useQuery({
    queryKey: ['talento', 'resumen'],
    queryFn: async () => {
      const { fakeTalento } = await import('@/constants/mock-api-talento');
      return fakeTalento.getResumenTalento();
    }
  });

  return (
    <div className='space-y-6'>
      {resumen && (
        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>Evaluaciones Completadas</CardDescription>
              <CardTitle className='text-3xl'>{resumen.completadas}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>Pendientes</CardDescription>
              <CardTitle className='text-3xl'>{resumen.pendientes}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>Promedio General</CardDescription>
              <CardTitle className='text-3xl'>{resumen.promedio}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardDescription>Objetivos Completados</CardDescription>
              <CardTitle className='text-3xl'>{resumen.objetivosCompletados}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Icons.attendance className='h-4 w-4' /> Evaluaciones
            </CardTitle>
            <CardDescription>Últimas evaluaciones de desempeño</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {evaluaciones.slice(0, 8).map((ev) => (
              <div key={ev.id} className='flex items-center justify-between gap-2'>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium'>{ev.empleado}</p>
                  <p className='text-muted-foreground text-xs'>{ev.puesto}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className={tipoColors[ev.tipo]}>
                    {ev.tipo}
                  </Badge>
                  <Badge variant='outline' className={estadoColors[ev.estado]}>
                    {ev.estado}
                  </Badge>
                  <span className='text-muted-foreground tabular-nums text-sm'>
                    {ev.puntaje}/10
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Icons.trendingUp className='h-4 w-4' /> Objetivos
            </CardTitle>
            <CardDescription>Seguimiento de objetivos activos</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {objetivos.slice(0, 6).map((obj) => (
              <div key={obj.id} className='space-y-1.5'>
                <div className='flex items-center justify-between'>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium'>{obj.titulo}</p>
                    <p className='text-muted-foreground text-xs'>{obj.empleado}</p>
                  </div>
                  <Badge variant='outline' className={prioridadColors[obj.prioridad]}>
                    {obj.prioridad}
                  </Badge>
                </div>
                <div className='flex items-center gap-2'>
                  <Progress value={obj.progreso} className='h-2' />
                  <span className='text-muted-foreground tabular-nums text-xs'>
                    {obj.progreso}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
