import { addMinutes, format, parse } from 'date-fns';
import type { Reunion } from '../api/types';

function toGoogleDateTime(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss");
}

export function buildGoogleCalendarLink(reunion: Reunion): string {
  const inicio = parse(`${reunion.fecha} ${reunion.hora}`, 'yyyy-MM-dd HH:mm', new Date());
  const fin = addMinutes(inicio, reunion.duracion);

  const detalles = [
    reunion.participantes.length > 0 ? `Participantes: ${reunion.participantes.join(', ')}` : null,
    reunion.resumen
  ]
    .filter(Boolean)
    .join('\n\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: reunion.titulo,
    dates: `${toGoogleDateTime(inicio)}/${toGoogleDateTime(fin)}`,
    details: detalles
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
}
