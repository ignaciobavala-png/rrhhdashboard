'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { EventoDialog } from './evento-dialog';
import type { EventoCalendario } from '@/constants/mock-api-calendario';

const tipoConfig: Record<string, { label: string; color: string; bg: string }> = {
  licencia: { label: 'Licencia', color: 'text-emerald-600', bg: 'bg-emerald-500' },
  sueldo: { label: 'Sueldo', color: 'text-blue-600', bg: 'bg-blue-500' },
  estudio: { label: 'Estudio', color: 'text-amber-600', bg: 'bg-amber-500' },
  ausencia: { label: 'Ausencia', color: 'text-red-600', bg: 'bg-red-500' }
};

export default function CalendarioPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4));
  const [selectedTipos, setSelectedTipos] = useState<Set<string>>(
    new Set(['licencia', 'sueldo', 'estudio', 'ausencia'])
  );
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingEvento, setEditingEvento] = useState<EventoCalendario | null>(null);

  useEffect(() => {
    async function load() {
      const { fakeCalendario } = await import('@/constants/mock-api-calendario');
      const data = await fakeCalendario.getEventosDelMes();
      setEventos(data);
    }
    load();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const eventosDelMes = useMemo(
    () =>
      eventos.filter((e) => {
        const d = new Date(e.fecha);
        return isSameMonth(d, currentMonth) && selectedTipos.has(e.tipo);
      }),
    [eventos, currentMonth, selectedTipos]
  );

  const eventosPorDia = useMemo(() => {
    const map = new Map<string, EventoCalendario[]>();
    for (const ev of eventosDelMes) {
      const key = format(new Date(ev.fecha), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [eventosDelMes]);

  const toggleTipo = (tipo: string) => {
    setSelectedTipos((prev) => {
      const next = new Set(prev);
      if (next.has(tipo)) next.delete(tipo);
      else next.add(tipo);
      return next;
    });
  };

  const handleDayKeyDown = (e: React.KeyboardEvent, day: Date) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDayClick(day);
    }
  };

  const handleEventoKeyDown = (e: React.KeyboardEvent, ev: EventoCalendario) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedDate(new Date(ev.fecha));
      setEditingEvento(ev);
      setDialogOpen(true);
    }
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setEditingEvento(null);
    setDialogOpen(true);
  };

  const handleEventoClick = (e: React.MouseEvent, ev: EventoCalendario) => {
    e.stopPropagation();
    setSelectedDate(new Date(ev.fecha));
    setEditingEvento(ev);
    setDialogOpen(true);
  };

  const handleSave = (evento: Omit<EventoCalendario, 'id'>) => {
    if (editingEvento) {
      setEventos((prev) =>
        prev.map((e) => (e.id === editingEvento.id ? { ...e, ...evento, id: editingEvento.id } : e))
      );
    } else {
      setEventos((prev) => [...prev, { ...evento, id: Math.max(0, ...prev.map((e) => e.id)) + 1 }]);
    }
  };

  const handleDelete = (id: number) => {
    setEventos((prev) => prev.filter((e) => e.id !== id));
  };

  const allTipos = ['licencia', 'sueldo', 'estudio', 'ausencia'] as const;
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-2'>
        {allTipos.map((tipo) => (
          <Badge
            key={tipo}
            variant={selectedTipos.has(tipo) ? 'default' : 'outline'}
            className={`cursor-pointer ${selectedTipos.has(tipo) ? tipoConfig[tipo].bg : ''}`}
            onClick={() => toggleTipo(tipo)}
          >
            {tipoConfig[tipo].label}
          </Badge>
        ))}
        <span className='text-muted-foreground ml-auto text-xs'>
          {eventos.length} eventos — hacé clic en un día para agregar
        </span>
      </div>

      <Card>
        <CardHeader className='pb-2'>
          <div className='flex items-center justify-between'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            >
              <Icons.chevronLeft className='h-4 w-4' />
            </Button>
            <CardTitle className='text-lg'>
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </CardTitle>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            >
              <Icons.chevronRight className='h-4 w-4' />
            </Button>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='grid grid-cols-7 border-b'>
            {dayNames.map((name) => (
              <div
                key={name}
                className='text-muted-foreground border-r p-2 text-center text-xs font-medium last:border-r-0'
              >
                {name}
              </div>
            ))}
          </div>
          <div className='grid grid-cols-7'>
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayEventos = eventosPorDia.get(key) ?? [];
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <div
                  key={key}
                  role='gridcell'
                  tabIndex={0}
                  onClick={() => handleDayClick(day)}
                  onKeyDown={(e) => handleDayKeyDown(e, day)}
                  className={`min-h-24 cursor-pointer border-b border-r p-1 last:border-r-0 hover:bg-accent/50 ${!isCurrentMonth ? 'bg-muted/50' : ''} ${isToday(day) ? 'bg-accent/30' : ''}`}
                >
                  <div
                    className={`mb-1 flex items-center justify-between ${isToday(day) ? 'bg-primary text-primary-foreground -mx-1 -mt-1 rounded-t-md px-1.5 pt-1' : ''}`}
                  >
                    <span
                      className={`text-xs font-medium tabular-nums ${!isCurrentMonth ? 'text-muted-foreground' : ''} ${isToday(day) ? 'text-primary-foreground' : ''}`}
                    >
                      {format(day, 'd')}
                    </span>
                    {isCurrentMonth && dayEventos.length === 0 && (
                      <Icons.add className='text-muted-foreground/50 h-3 w-3' />
                    )}
                  </div>
                  <div className='space-y-0.5'>
                    {dayEventos.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        role='button'
                        tabIndex={0}
                        onClick={(e) => handleEventoClick(e, ev)}
                        onKeyDown={(e) => handleEventoKeyDown(e, ev)}
                        className={`${tipoConfig[ev.tipo].bg} cursor-pointer rounded px-1 py-0.5 text-[10px] leading-tight text-white hover:opacity-80`}
                        title={`${ev.empleado}: ${ev.titulo}`}
                      >
                        {ev.empleado.split(' ')[0]}
                      </div>
                    ))}
                    {dayEventos.length > 3 && (
                      <div className='text-muted-foreground text-[10px]'>
                        +{dayEventos.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <EventoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        fecha={selectedDate}
        onSave={handleSave}
        onDelete={handleDelete}
        editingEvento={editingEvento}
      />
    </div>
  );
}
