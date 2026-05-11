'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import type { Reunion } from '@/constants/mock-api-reuniones';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const columns: ColumnDef<Reunion>[] = [
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
    header: ({ column }) => <DataTableColumnHeader column={column} title='Resumen' />,
    cell: ({ cell }) => (
      <p className='text-muted-foreground line-clamp-2 max-w-xs text-sm'>
        {cell.getValue<string>()}
      </p>
    ),
    enableColumnFilter: true,
    meta: { label: 'Resumen', variant: 'text' }
  }
];
