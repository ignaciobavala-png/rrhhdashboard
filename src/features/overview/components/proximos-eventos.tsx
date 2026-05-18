'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const DIAS_SEMANA = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES_CORTOS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic'
];

type Evento = {
  tipo: 'reunion' | 'cumpleanos';
  titulo: string;
  fecha: Date;
  hora?: string;
  diasRestantes: number;
};

function labelDias(n: number): string {
  if (n === 0) return 'hoy';
  if (n === 1) return 'mañana';
  return `en ${n}d`;
}

function formatFecha(fecha: Date): string {
  return `${DIAS_SEMANA[fecha.getDay()]} ${fecha.getDate()} ${MESES_CORTOS[fecha.getMonth()]}`;
}

export function ProximosEventos() {
  const { data: eventos = [], isLoading } = useQuery({
    queryKey: ['overview', 'proximos-eventos'],
    queryFn: async (): Promise<Evento[]> => {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const limite = new Date(hoy);
      limite.setDate(limite.getDate() + 14);

      const fechaHoyStr = hoy.toISOString().split('T')[0];
      const fechaLimiteStr = limite.toISOString().split('T')[0];

      const [{ data: reuniones }, { data: empleados }] = await Promise.all([
        supabase
          .from('reuniones')
          .select('titulo, fecha, hora')
          .gte('fecha', fechaHoyStr)
          .lte('fecha', fechaLimiteStr)
          .order('fecha'),
        supabase
          .from('empleados')
          .select('nombre_apellido, fecha_nacimiento')
          .eq('activo', true)
          .not('fecha_nacimiento', 'is', null)
      ]);

      const resultado: Evento[] = [];

      for (const r of reuniones ?? []) {
        const fecha = new Date(r.fecha + 'T00:00:00');
        const diasRestantes = Math.round((fecha.getTime() - hoy.getTime()) / 86400000);
        resultado.push({
          tipo: 'reunion',
          titulo: r.titulo,
          fecha,
          hora: r.hora ?? undefined,
          diasRestantes
        });
      }

      for (const emp of empleados ?? []) {
        if (!emp.fecha_nacimiento) continue;
        const [, mesStr, diaStr] = emp.fecha_nacimiento.split('-');
        const mes = parseInt(mesStr, 10) - 1;
        const dia = parseInt(diaStr, 10);

        const cumpleEsteAnio = new Date(hoy.getFullYear(), mes, dia);
        cumpleEsteAnio.setHours(0, 0, 0, 0);
        const cumpleProxAnio = new Date(hoy.getFullYear() + 1, mes, dia);

        const candidato = cumpleEsteAnio >= hoy ? cumpleEsteAnio : cumpleProxAnio;
        const diasRestantes = Math.round((candidato.getTime() - hoy.getTime()) / 86400000);

        if (diasRestantes <= 14) {
          const nombre = (emp.nombre_apellido ?? '').split(' ')[0];
          resultado.push({
            tipo: 'cumpleanos',
            titulo: `Cumpleaños de ${nombre}`,
            fecha: candidato,
            diasRestantes
          });
        }
      }

      return resultado.sort((a, b) => a.diasRestantes - b.diasRestantes).slice(0, 8);
    },
    staleTime: 5 * 60 * 1000
  });

  return (
    <Card className='flex flex-col h-full'>
      <CardHeader className='pb-3'>
        <CardTitle>Próximos Eventos</CardTitle>
        <CardDescription>Reuniones y cumpleaños · próximos 14 días</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-2 flex-1'>
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className='h-12 rounded-lg bg-muted animate-pulse' />
          ))
        ) : eventos.length === 0 ? (
          <div className='flex flex-1 flex-col items-center justify-center text-muted-foreground gap-2 py-8'>
            <Icons.calendar className='h-8 w-8 opacity-30' />
            <p className='text-sm'>Sin eventos en los próximos 14 días.</p>
          </div>
        ) : (
          eventos.map((ev, i) => {
            const urgente = ev.diasRestantes <= 1;
            return (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-3 py-2.5',
                  urgente ? 'border-amber-500/40 bg-amber-500/5' : 'bg-muted/40'
                )}
              >
                <div
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                    ev.tipo === 'reunion'
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      : 'bg-pink-500/10 text-pink-600 dark:text-pink-400'
                  )}
                >
                  {ev.tipo === 'reunion' ? (
                    <Icons.meetings className='h-3.5 w-3.5' />
                  ) : (
                    <Icons.sparkles className='h-3.5 w-3.5' />
                  )}
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-medium truncate leading-tight'>{ev.titulo}</p>
                  <p className='text-[11px] text-muted-foreground'>
                    {formatFecha(ev.fecha)}
                    {ev.hora ? ` · ${ev.hora}` : ''}
                  </p>
                </div>
                <Badge
                  variant='outline'
                  className={cn(
                    'text-[10px] shrink-0',
                    urgente ? 'border-amber-500/50 text-amber-600 dark:text-amber-400' : ''
                  )}
                >
                  {labelDias(ev.diasRestantes)}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
