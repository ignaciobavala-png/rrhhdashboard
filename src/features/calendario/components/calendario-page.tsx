'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  isToday,
  getYear,
  parseISO,
  addDays
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { EventoDialog } from './evento-dialog';
import { getVacacionesDias, getEmpleadosCumpleanos } from '@/features/calendario/api/service';
import type { EventoCalendario } from '@/features/calendario/api/types';

const tipoConfig: Record<string, { label: string; bg: string; chip: string }> = {
  licencia: { label: 'Vacaciones', bg: 'bg-emerald-500', chip: 'bg-emerald-500 text-white' },
  estudio: { label: 'Estudio', bg: 'bg-amber-500', chip: 'bg-amber-500 text-white' },
  ausencia: { label: 'Ausencia', bg: 'bg-red-500', chip: 'bg-red-500 text-white' },
  cumpleanos: { label: 'Cumpleaños', bg: 'bg-purple-500', chip: 'bg-purple-500 text-white' }
};

const allTipos = ['licencia', 'estudio', 'ausencia', 'cumpleanos'] as const;
const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function shortName(nombreApellido: string): string {
  return nombreApellido.split(',')[0].trim();
}

export default function CalendarioPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4));
  const [selectedTipos, setSelectedTipos] = useState<Set<string>>(
    new Set(['licencia', 'estudio', 'ausencia', 'cumpleanos'])
  );
  const [manualEventos, setManualEventos] = useState<EventoCalendario[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingEvento, setEditingEvento] = useState<EventoCalendario | null>(null);

  const { data: vacDias = [] } = useQuery({
    queryKey: ['calendario', 'vacaciones'],
    queryFn: getVacacionesDias
  });

  const { data: empleados = [] } = useQuery({
    queryKey: ['calendario', 'cumpleanos'],
    queryFn: getEmpleadosCumpleanos
  });

  const viewYear = getYear(currentMonth);

  const eventosBase = useMemo<EventoCalendario[]>(() => {
    const result: EventoCalendario[] = [];

    for (const vd of vacDias) {
      if (!vd.anio_uso) continue;
      const nombre = shortName(vd.nombre_apellido);
      if (vd.fecha_inicio && vd.fecha_fin) {
        // Expand range: one event per day
        const start = parseISO(vd.fecha_inicio);
        const end = parseISO(vd.fecha_fin);
        let cur = start;
        while (cur <= end) {
          const fecha = format(cur, 'yyyy-MM-dd');
          result.push({
            id: `vac-${vd.id}-${fecha}`,
            fecha,
            titulo: `Vacaciones (${vd.dias_usados}d)`,
            tipo: 'licencia',
            empleado: nombre,
            empleadoId: vd.empleado_id,
            readonly: true
          });
          cur = addDays(cur, 1);
        }
      } else {
        // Fallback: show on day 1 of month
        result.push({
          id: `vac-${vd.id}`,
          fecha: format(new Date(vd.anio_uso, vd.mes - 1, 1), 'yyyy-MM-dd'),
          titulo: `${vd.dias_usados} días vacaciones`,
          tipo: 'licencia',
          empleado: nombre,
          empleadoId: vd.empleado_id,
          readonly: true
        });
      }
    }

    for (const emp of empleados) {
      if (!emp.fecha_nacimiento) continue;
      const parts = emp.fecha_nacimiento.split('-').map(Number);
      const [, mm, dd] = parts;
      result.push({
        id: `bday-${emp.id}-${viewYear}`,
        fecha: format(new Date(viewYear, mm - 1, dd), 'yyyy-MM-dd'),
        titulo: 'Cumpleaños',
        tipo: 'cumpleanos',
        empleado: shortName(emp.nombre_apellido),
        empleadoId: emp.id,
        readonly: true
      });
    }

    return result;
  }, [vacDias, empleados, viewYear]);

  const allEventos = useMemo(
    () => [...eventosBase, ...manualEventos],
    [eventosBase, manualEventos]
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const eventosDelMes = useMemo(() => {
    return allEventos.filter((e) => {
      const parts = e.fecha.split('-').map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return isSameMonth(d, currentMonth) && selectedTipos.has(e.tipo);
    });
  }, [allEventos, currentMonth, selectedTipos]);

  const eventosPorDia = useMemo(() => {
    const map = new Map<string, EventoCalendario[]>();
    for (const ev of eventosDelMes) {
      if (!map.has(ev.fecha)) map.set(ev.fecha, []);
      map.get(ev.fecha)!.push(ev);
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

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setEditingEvento(null);
    setDialogOpen(true);
  };

  const handleEventoClick = (e: React.MouseEvent, ev: EventoCalendario) => {
    e.stopPropagation();
    if (ev.readonly) return;
    setSelectedDate(new Date(ev.fecha.replace(/-/g, '/')));
    setEditingEvento(ev);
    setDialogOpen(true);
  };

  const handleDayKeyDown = (e: React.KeyboardEvent, day: Date) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDayClick(day);
    }
  };

  const handleSave = (evento: Omit<EventoCalendario, 'id'>) => {
    if (editingEvento) {
      setManualEventos((prev) =>
        prev.map((e) => (e.id === editingEvento.id ? { ...e, ...evento } : e))
      );
    } else {
      setManualEventos((prev) => [...prev, { ...evento, id: `manual-${Date.now()}` }]);
    }
  };

  const handleDelete = (id: string) => {
    setManualEventos((prev) => prev.filter((e) => e.id !== id));
  };

  const totalVisible = eventosDelMes.length;

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-2'>
        {allTipos.map((tipo) => (
          <Badge
            key={tipo}
            variant={selectedTipos.has(tipo) ? 'default' : 'outline'}
            className={`cursor-pointer select-none ${selectedTipos.has(tipo) ? tipoConfig[tipo].bg : ''}`}
            onClick={() => toggleTipo(tipo)}
          >
            {tipoConfig[tipo].label}
          </Badge>
        ))}
        <span className='text-muted-foreground ml-auto text-xs'>
          {totalVisible} eventos · clic en un día para agregar
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
            <CardTitle className='text-lg capitalize'>
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
                  className={`min-h-24 cursor-pointer border-b border-r p-1 last:border-r-0 hover:bg-accent/50 ${
                    !isCurrentMonth ? 'bg-muted/50' : ''
                  } ${isToday(day) ? 'bg-accent/30' : ''}`}
                >
                  <div
                    className={`mb-1 flex items-center justify-between ${
                      isToday(day)
                        ? 'bg-primary text-primary-foreground -mx-1 -mt-1 rounded-t-md px-1.5 pt-1'
                        : ''
                    }`}
                  >
                    <span
                      className={`text-xs font-medium tabular-nums ${
                        !isCurrentMonth ? 'text-muted-foreground' : ''
                      } ${isToday(day) ? 'text-primary-foreground' : ''}`}
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
                        role={ev.readonly ? undefined : 'button'}
                        tabIndex={ev.readonly ? undefined : 0}
                        onClick={(e) => handleEventoClick(e, ev)}
                        className={`${tipoConfig[ev.tipo].chip} rounded px-1 py-0.5 text-[10px] leading-tight ${
                          ev.readonly ? 'cursor-default' : 'cursor-pointer hover:opacity-80'
                        }`}
                        title={`${ev.empleado}: ${ev.titulo}`}
                      >
                        {ev.tipo === 'cumpleanos' ? `🎂 ${ev.empleado}` : ev.empleado}
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
