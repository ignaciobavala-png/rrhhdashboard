'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Icons } from '@/components/icons';
import { showUndoToast } from '@/lib/undo-toast';
import type { LineaMovil } from '@/features/flota/api/types';
import { createLineaMovil, deleteLineaMovil } from '@/features/flota/api/service';
import { LineaMovilDialog } from '@/features/flota/components/linea-movil-dialog';

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

function EditCell({ linea }: { linea: LineaMovil }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant='ghost'
        size='icon'
        className='h-8 w-8'
        onClick={() => setOpen(true)}
        title='Editar'
      >
        <Icons.edit className='h-4 w-4' />
      </Button>
      <LineaMovilDialog open={open} onOpenChange={setOpen} linea={linea} />
    </>
  );
}

function DeleteCell({ linea }: { linea: LineaMovil }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const saved = { ...linea };
      await deleteLineaMovil(linea.id);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['flota'] });
      showUndoToast(`Línea eliminada: ${saved.numero}`, async () => {
        await createLineaMovil({
          numero: saved.numero,
          rol: saved.rol ?? '',
          usuario: saved.usuario ?? '',
          equipo: saved.equipo ?? '',
          estado: saved.estado
        });
        queryClient.invalidateQueries({ queryKey: ['flota'] });
      });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
        title='¿Eliminar línea?'
        description={`Se eliminará la línea "${linea.numero}". Podés deshacer el cambio durante 10 segundos.`}
        confirmLabel='Eliminar'
        onConfirm={handleConfirm}
        loading={loading}
        destructive
      />
    </>
  );
}

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
    id: 'empleado_nombre',
    accessorKey: 'empleado_nombre',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Empleado' />,
    cell: ({ row }) => {
      const nombre = row.original.empleado_nombre;
      if (!nombre) return <span className='text-muted-foreground text-xs'>Sin asignar</span>;
      return (
        <div className='flex items-center gap-2'>
          <Icons.user className='text-muted-foreground h-4 w-4' />
          <span className='text-sm font-medium'>{nombre}</span>
        </div>
      );
    },
    enableColumnFilter: true,
    meta: { label: 'Empleado', variant: 'text' }
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
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className='flex items-center'>
        <EditCell linea={row.original} />
        <DeleteCell linea={row.original} />
      </div>
    )
  }
];
