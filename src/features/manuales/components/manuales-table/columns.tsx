'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { Manual, TipoArchivo } from '@/features/manuales/api/types';
import { deleteManual, formatTamanio, getDownloadUrl } from '@/features/manuales/api/service';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const tipoIcon: Record<TipoArchivo, React.ReactNode> = {
  pdf: <Icons.fileTypePdf className='h-4 w-4 text-red-500 shrink-0' />,
  word: <Icons.fileTypeDoc className='h-4 w-4 text-blue-500 shrink-0' />,
  excel: <Icons.fileTypeXls className='h-4 w-4 text-emerald-600 shrink-0' />
};

function ActionsCell({ row }: { row: { original: Manual } }) {
  const queryClient = useQueryClient();
  const manual = row.original;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    if (!manual.storage_path) return;
    const url = getDownloadUrl(manual.storage_path);
    const a = document.createElement('a');
    a.href = url;
    a.download = manual.nombre_archivo ?? manual.tarea;
    a.click();
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteManual(manual);
      setOpen(false);
      toast.success('Manual eliminado');
      queryClient.invalidateQueries({ queryKey: ['manuales'] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex gap-1'>
      <Button
        variant='ghost'
        size='icon'
        className='h-8 w-8'
        onClick={handleDownload}
        title='Descargar'
      >
        <Icons.download className='h-4 w-4' />
      </Button>
      <Button
        variant='ghost'
        size='icon'
        className='h-8 w-8 text-destructive hover:text-destructive'
        onClick={() => setOpen(true)}
        title='Eliminar'
      >
        <Icons.trash className='h-4 w-4' />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title='¿Eliminar manual?'
        description={`Se eliminará "${manual.tarea}" y su archivo del servidor. Esta acción no se puede deshacer.`}
        confirmLabel='Eliminar'
        onConfirm={handleDelete}
        loading={loading}
        destructive
      />
    </div>
  );
}

export const columns: ColumnDef<Manual>[] = [
  {
    id: 'tarea',
    accessorKey: 'tarea',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Nombre' />,
    cell: ({ row }) => {
      const manual = row.original;
      const icon = manual.tipo_archivo ? (
        tipoIcon[manual.tipo_archivo]
      ) : (
        <Icons.page className='h-4 w-4 text-muted-foreground shrink-0' />
      );
      return (
        <div className='flex items-center gap-2 max-w-xs'>
          {icon}
          <span className='font-medium text-sm truncate'>{manual.tarea}</span>
        </div>
      );
    },
    enableSorting: true
  },
  {
    id: 'area',
    accessorKey: 'area',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Área' />,
    cell: ({ row }) => {
      const area = row.original.area;
      if (!area) return null;
      return (
        <Badge variant='outline' className='text-xs'>
          {area}
        </Badge>
      );
    },
    enableSorting: true
  },
  {
    id: 'nombre_archivo',
    accessorKey: 'nombre_archivo',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Archivo' />,
    cell: ({ row }) => (
      <span className='text-xs text-muted-foreground truncate max-w-[180px] inline-block'>
        {row.original.nombre_archivo ?? '—'}
      </span>
    ),
    enableSorting: false
  },
  {
    id: 'tamanio',
    accessorKey: 'tamanio',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Tamaño' />,
    cell: ({ row }) => (
      <span className='text-xs text-muted-foreground'>{formatTamanio(row.original.tamanio)}</span>
    ),
    enableSorting: false
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Fecha' />,
    cell: ({ row }) => {
      const val = row.original.created_at;
      if (!val) return null;
      return (
        <span className='text-xs text-muted-foreground'>
          {new Date(val).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </span>
      );
    },
    enableSorting: true
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionsCell row={row} />
  }
];
