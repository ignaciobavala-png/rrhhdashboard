'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { Manual } from '@/features/manuales/api/types';

const SIN_INFO = <span className='text-muted-foreground italic text-xs'>Sin información</span>;

const areaColors: Record<string, string> = {
  Comercial: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Administración: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
};

export const columns: ColumnDef<Manual>[] = [
  {
    id: 'tarea',
    accessorKey: 'tarea',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Tarea / Procedimiento' />,
    cell: ({ cell }) => (
      <div className='flex items-center gap-2'>
        <Icons.fileTypePdf className='text-muted-foreground h-4 w-4 shrink-0' />
        <span className='font-medium line-clamp-2 max-w-xs'>{cell.getValue<string>()}</span>
      </div>
    ),
    enableColumnFilter: true,
    meta: { label: 'Tarea', placeholder: 'Buscar...', variant: 'text' }
  },
  {
    id: 'area',
    accessorKey: 'area',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Área' />,
    cell: ({ cell }) => {
      const area = cell.getValue<string>();
      return (
        <Badge variant='outline' className={areaColors[area] ?? ''}>
          {area}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: { label: 'Área', variant: 'text' }
  },
  {
    id: 'link_manual',
    accessorKey: 'link_manual',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Manual' />,
    cell: ({ cell }) => {
      const link = cell.getValue<string | null>();
      if (!link) return SIN_INFO;
      return (
        <span className='text-muted-foreground max-w-xs truncate text-xs' title={link}>
          {link}
        </span>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const link = row.original.link_manual;
      if (!link) return null;
      return (
        <Button variant='ghost' size='sm' asChild>
          <a href={link} target='_blank' rel='noopener noreferrer'>
            <Icons.fileTypePdf className='mr-1 h-4 w-4' /> Abrir
          </a>
        </Button>
      );
    }
  }
];
