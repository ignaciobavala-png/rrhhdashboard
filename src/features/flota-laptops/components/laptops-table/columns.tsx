'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Laptop } from '@/features/flota-laptops/api/types';
import { deleteLaptop } from '@/features/flota-laptops/api/service';

const SIN_INFO = <span className='text-muted-foreground italic text-xs'>—</span>;

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

function DeleteCell({ laptop }: { laptop: Laptop }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar laptop ${laptop.marca ?? ''} ${laptop.modelo ?? ''}?`)) return;
    try {
      await deleteLaptop(laptop.id);
      toast.success('Laptop eliminada');
      queryClient.invalidateQueries({ queryKey: ['flota-laptops'] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar');
    }
  };

  return (
    <Button
      variant='ghost'
      size='icon'
      className='h-8 w-8 text-destructive hover:text-destructive'
      onClick={handleDelete}
      title='Eliminar'
    >
      <Icons.trash className='h-4 w-4' />
    </Button>
  );
}

export const columns: ColumnDef<Laptop>[] = [
  {
    id: 'marca',
    accessorKey: 'marca',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Marca / Modelo' />,
    cell: ({ row }) => {
      const { marca, modelo } = row.original;
      return (
        <div className='flex items-center gap-2'>
          <Icons.laptop className='text-muted-foreground h-4 w-4 shrink-0' />
          <div className='flex flex-col leading-tight'>
            <span className='text-xs font-medium'>{marca ?? '—'}</span>
            {modelo && <span className='text-muted-foreground text-[10px]'>{modelo}</span>}
          </div>
        </div>
      );
    },
    enableSorting: true
  },
  {
    id: 'numero_serie',
    accessorKey: 'numero_serie',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Nº de Serie' />,
    cell: ({ cell }) => (
      <span className='text-xs tabular-nums'>{cell.getValue<string | null>() ?? SIN_INFO}</span>
    ),
    enableSorting: false
  },
  {
    id: 'usuario',
    accessorKey: 'usuario',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Usuario' />,
    cell: ({ cell }) => {
      const val = cell.getValue<string | null>();
      if (!val) return SIN_INFO;
      return (
        <div className='flex items-center gap-1.5'>
          <Icons.user className='text-muted-foreground h-3.5 w-3.5' />
          <span className='text-xs'>{val}</span>
        </div>
      );
    },
    enableSorting: true
  },
  {
    id: 'equipo',
    accessorKey: 'equipo',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Equipo / Área' />,
    cell: ({ cell }) => {
      const val = cell.getValue<string | null>();
      if (!val) return SIN_INFO;
      return (
        <Badge variant='outline' className='text-xs'>
          {val}
        </Badge>
      );
    },
    enableSorting: true
  },
  {
    id: 'ubicacion',
    accessorKey: 'ubicacion',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Ubicación' />,
    cell: ({ cell }) => (
      <span className='text-xs'>{cell.getValue<string | null>() ?? SIN_INFO}</span>
    ),
    enableSorting: false
  },
  {
    id: 'comentarios',
    accessorKey: 'comentarios',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Comentarios' />,
    cell: ({ cell }) => {
      const val = cell.getValue<string | null>();
      if (!val) return SIN_INFO;
      return (
        <span className='text-xs text-muted-foreground line-clamp-2 max-w-[200px]'>{val}</span>
      );
    },
    enableSorting: false
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
    enableSorting: true
  },
  {
    id: 'actions',
    cell: ({ row }) => <DeleteCell laptop={row.original} />
  }
];
