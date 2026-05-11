'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import type { LineaMovil } from '@/features/flota/api/types';

const SIN_INFO = <span className='text-muted-foreground italic text-xs'>Sin información</span>;

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

export const columns: ColumnDef<LineaMovil>[] = [
  {
    id: 'numero',
    accessorKey: 'numero',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Número' />,
    cell: ({ cell }) => (
      <div className='flex items-center gap-2'>
        <Icons.mobile className='text-muted-foreground h-4 w-4' />
        <span className='font-medium tabular-nums'>{cell.getValue<string>()}</span>
      </div>
    ),
    enableColumnFilter: true,
    meta: { label: 'Número', placeholder: 'Buscar...', variant: 'text' }
  },
  {
    id: 'rol',
    accessorKey: 'rol',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Rol' />,
    cell: ({ cell }) => cell.getValue<string | null>() ?? SIN_INFO,
    enableColumnFilter: true,
    meta: { label: 'Rol', placeholder: 'Buscar...', variant: 'text' }
  },
  {
    id: 'usuario',
    accessorKey: 'usuario',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Usuario' />,
    cell: ({ cell }) => {
      const val = cell.getValue<string | null>();
      if (!val) return SIN_INFO;
      return (
        <div className='flex items-center gap-2'>
          <Icons.user className='text-muted-foreground h-4 w-4' />
          <span>{val}</span>
        </div>
      );
    },
    enableColumnFilter: true,
    meta: { label: 'Usuario', variant: 'text' }
  },
  {
    id: 'equipo',
    accessorKey: 'equipo',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Equipo' />,
    cell: ({ cell }) => cell.getValue<string | null>() ?? SIN_INFO,
    enableColumnFilter: true,
    meta: { label: 'Equipo', variant: 'text' }
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
  }
];
