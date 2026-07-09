'use client';

import type { ColumnDef, Table } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { Reunion } from '@/features/reuniones/api/types';
import { buildGoogleCalendarLink } from '@/features/reuniones/lib/google-calendar-link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type ReunionesTableMeta = { openNotas: (reunion: Reunion) => void };
const getMeta = (table: Table<Reunion>) => table.options.meta as ReunionesTableMeta;

export const columns: ColumnDef<Reunion, unknown>[] = [
  {
    id: 'titulo',
    accessorKey: 'titulo',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Título' />,
    cell: ({ cell }) => <span className='font-medium'>{cell.getValue<string>()}</span>,
    enableColumnFilter: true,
    meta: { label: 'Título', placeholder: 'Buscar...', variant: 'text' }
  },
  {
    id: 'fecha',
    accessorKey: 'fecha',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Fecha' />,
    cell: ({ cell }) => (
      <span>{format(new Date(cell.getValue<string>()), 'dd/MM/yyyy', { locale: es })}</span>
    ),
    enableColumnFilter: true,
    meta: { label: 'Fecha', variant: 'text' }
  },
  {
    id: 'hora',
    accessorKey: 'hora',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Hora' />,
    enableColumnFilter: true,
    meta: { label: 'Hora', variant: 'text' }
  },
  {
    id: 'duracion',
    accessorKey: 'duracion',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Duración' />,
    cell: ({ cell }) => <span>{cell.getValue<number>()} min</span>,
    enableColumnFilter: true,
    meta: { label: 'Duración', variant: 'text' }
  },
  {
    id: 'participantes',
    accessorKey: 'participantes',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Participantes' />,
    cell: ({ cell }) => (
      <div className='flex flex-wrap gap-1'>
        {cell.getValue<string[]>().map((p, i) => (
          <Badge key={i} variant='secondary' className='text-xs'>
            {p}
          </Badge>
        ))}
      </div>
    ),
    enableColumnFilter: true,
    meta: { label: 'Participantes', variant: 'text' }
  },
  {
    id: 'resumen',
    accessorKey: 'resumen',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Anotaciones' />,
    cell: ({ cell }) => (
      <p className='text-muted-foreground line-clamp-2 max-w-xs text-sm'>
        {cell.getValue<string | null>() ?? (
          <span className='italic opacity-50'>Sin anotaciones</span>
        )}
      </p>
    ),
    enableColumnFilter: true,
    meta: { label: 'Anotaciones', variant: 'text' }
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const meta = getMeta(table);
      return (
        <div className='flex items-center'>
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            title='Editar anotaciones'
            onClick={() => meta.openNotas(row.original)}
          >
            <Icons.edit className='h-3.5 w-3.5' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            title='Agregar a Google Calendar'
            asChild
          >
            <a
              href={buildGoogleCalendarLink(row.original)}
              target='_blank'
              rel='noopener noreferrer'
            >
              <Icons.calendar className='h-3.5 w-3.5' />
            </a>
          </Button>
        </div>
      );
    }
  }
];
