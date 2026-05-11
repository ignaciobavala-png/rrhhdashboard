'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Empleado } from '@/features/legajo/api/types';

const SIN_INFO = <span className='text-muted-foreground italic text-xs'>Sin información</span>;

function initials(nombreApellido: string): string {
  const parts = nombreApellido.split(/[\s,]+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export const columns: ColumnDef<Empleado>[] = [
  {
    id: 'nombre_apellido',
    accessorKey: 'nombre_apellido',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Nombre' />,
    cell: ({ row }) => {
      const emp = row.original;
      return (
        <div className='flex items-center gap-2'>
          <Avatar className='h-8 w-8'>
            <AvatarFallback className='text-xs'>{initials(emp.nombre_apellido)}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-medium'>{emp.nombre_apellido}</span>
            <span className='text-muted-foreground text-xs'>{emp.email ?? 'Sin email'}</span>
          </div>
        </div>
      );
    },
    enableColumnFilter: true,
    meta: { label: 'Nombre', placeholder: 'Buscar...', variant: 'text' }
  },
  {
    id: 'dni',
    accessorKey: 'dni',
    header: ({ column }) => <DataTableColumnHeader column={column} title='DNI' />,
    cell: ({ cell }) => cell.getValue<string | null>() ?? SIN_INFO,
    enableColumnFilter: true,
    meta: { label: 'DNI', placeholder: 'Buscar...', variant: 'text' }
  },
  {
    id: 'equipo_ingreso',
    accessorKey: 'equipo_ingreso',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Equipo' />,
    cell: ({ cell }) => cell.getValue<string | null>() ?? SIN_INFO,
    enableColumnFilter: true,
    meta: { label: 'Equipo', placeholder: 'Filtrar...', variant: 'text' }
  },
  {
    id: 'fecha_ingreso',
    accessorKey: 'fecha_ingreso',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Ingreso' />,
    cell: ({ cell }) => {
      const val = cell.getValue<string | null>();
      if (!val) return SIN_INFO;
      return new Date(val).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    enableColumnFilter: true,
    meta: { label: 'Ingreso', variant: 'text' }
  },
  {
    id: 'activo',
    accessorKey: 'activo',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Estado' />,
    cell: ({ cell }) => {
      const activo = cell.getValue<boolean>();
      return (
        <Badge
          variant='outline'
          className={
            activo
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-slate-500/10 text-slate-500 dark:text-slate-400'
          }
        >
          {activo ? 'Activo' : 'Inactivo'}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: { label: 'Estado', variant: 'text' }
  },
  {
    id: 'modalidad',
    accessorKey: 'modalidad',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Modalidad' />,
    cell: ({ cell }) => {
      const modalidad = cell.getValue<string>();
      const colors: Record<string, string> = {
        home_office: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        presencial: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        hibrido: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
      };
      const labels: Record<string, string> = {
        home_office: 'Home Office',
        presencial: 'Presencial',
        hibrido: 'Híbrido'
      };
      return (
        <Badge variant='outline' className={colors[modalidad] ?? ''}>
          {labels[modalidad] ?? modalidad}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: { label: 'Modalidad', variant: 'text' }
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Button variant='ghost' className='h-8 w-8 p-0' asChild>
        <Link href={`/dashboard/legajo/${row.original.id}`}>
          <Icons.edit className='h-4 w-4' />
          <span className='sr-only'>Ver detalle</span>
        </Link>
      </Button>
    )
  }
];
