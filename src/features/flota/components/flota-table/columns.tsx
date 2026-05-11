'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import type { Celular } from '@/constants/mock-api-flota';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const estadoColors: Record<string, string> = {
  asignado: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  disponible: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  baja: 'bg-red-500/10 text-red-600 dark:text-red-400'
};

const estadoLabels: Record<string, string> = {
  asignado: 'Asignado',
  disponible: 'Disponible',
  baja: 'De Baja'
};

export const columns: ColumnDef<Celular>[] = [
  {
    id: 'empleado',
    accessorKey: 'empleado',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Empleado' />,
    cell: ({ cell }) => (
      <div className='flex items-center gap-2'>
        <Icons.user className='text-muted-foreground h-4 w-4' />
        <span className='font-medium'>{cell.getValue<string>()}</span>
      </div>
    ),
    enableColumnFilter: true,
    meta: { label: 'Empleado', placeholder: 'Buscar...', variant: 'text' }
  },
  {
    id: 'modelo',
    accessorKey: 'modelo',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Modelo' />,
    cell: ({ cell }) => (
      <div className='flex items-center gap-2'>
        <Icons.mobile className='text-muted-foreground h-4 w-4' />
        <span>{cell.getValue<string>()}</span>
      </div>
    ),
    enableColumnFilter: true,
    meta: { label: 'Modelo', placeholder: 'Buscar...', variant: 'text' }
  },
  {
    id: 'numero',
    accessorKey: 'numero',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Número' />,
    enableColumnFilter: true,
    meta: { label: 'Número', variant: 'text' }
  },
  {
    id: 'plan',
    accessorKey: 'plan',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Plan' />,
    cell: ({ cell }) => <Badge variant='outline'>{cell.getValue<string>()}</Badge>,
    enableColumnFilter: true,
    meta: { label: 'Plan', variant: 'text' }
  },
  {
    id: 'estado',
    accessorKey: 'estado',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Estado' />,
    cell: ({ cell }) => {
      const estado = cell.getValue<string>();
      return (
        <Badge variant='outline' className={estadoColors[estado] ?? ''}>
          {estadoLabels[estado] ?? estado}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: { label: 'Estado', variant: 'text' }
  },
  {
    id: 'fecha_asignacion',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Asignado' />,
    accessorFn: (row) => format(new Date(row.fecha_asignacion), 'dd/MM/yyyy', { locale: es }),
    enableColumnFilter: true,
    meta: { label: 'Asignado', variant: 'text' }
  }
];
