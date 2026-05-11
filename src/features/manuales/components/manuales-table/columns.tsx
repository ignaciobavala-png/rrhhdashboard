'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { Manual } from '@/constants/mock-api-manuales';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const categoriaColors: Record<string, string> = {
  RRHH: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  Seguridad: 'bg-red-500/10 text-red-600 dark:text-red-400',
  Calidad: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Procesos: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  TI: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  Marketing: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Ventas: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  Finanzas: 'bg-green-500/10 text-green-600 dark:text-green-400'
};

export const columns: ColumnDef<Manual>[] = [
  {
    id: 'titulo',
    accessorKey: 'titulo',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Título' />,
    cell: ({ cell }) => (
      <div className='flex items-center gap-2'>
        <Icons.fileTypePdf className='text-muted-foreground h-4 w-4' />
        <span className='font-medium'>{cell.getValue<string>()}</span>
      </div>
    ),
    enableColumnFilter: true,
    meta: { label: 'Título', placeholder: 'Buscar...', variant: 'text' }
  },
  {
    id: 'descripcion',
    accessorKey: 'descripcion',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Descripción' />,
    cell: ({ cell }) => (
      <p className='text-muted-foreground line-clamp-1 max-w-xs text-sm'>
        {cell.getValue<string>()}
      </p>
    ),
    enableColumnFilter: true,
    meta: { label: 'Descripción', variant: 'text' }
  },
  {
    id: 'categoria',
    accessorKey: 'categoria',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Categoría' />,
    cell: ({ cell }) => {
      const cat = cell.getValue<string>();
      return (
        <Badge variant='outline' className={categoriaColors[cat] ?? ''}>
          {cat}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: { label: 'Categoría', variant: 'text' }
  },
  {
    id: 'version',
    accessorKey: 'version',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Versión' />,
    enableColumnFilter: true,
    meta: { label: 'Versión', variant: 'text' }
  },
  {
    id: 'autor',
    accessorKey: 'autor',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Autor' />,
    enableColumnFilter: true,
    meta: { label: 'Autor', variant: 'text' }
  },
  {
    id: 'fecha_actualizacion',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Actualizado' />,
    accessorFn: (row) => format(new Date(row.fecha_actualizacion), 'dd/MM/yyyy', { locale: es }),
    enableColumnFilter: true,
    meta: { label: 'Actualizado', variant: 'text' }
  },
  {
    id: 'actions',
    cell: () => (
      <Button variant='ghost' size='sm'>
        <Icons.fileTypePdf className='mr-1 h-4 w-4' /> PDF
      </Button>
    )
  }
];
