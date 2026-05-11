'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import type { LegajoEmpleado } from '@/constants/mock-api-legajo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const estadoColors: Record<string, string> = {
  Activo: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Vacaciones: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Licencia: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Ausente: 'bg-red-500/10 text-red-600 dark:text-red-400'
};

export const columns: ColumnDef<LegajoEmpleado>[] = [
  {
    id: 'nombre',
    accessorKey: 'nombre',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Nombre' />,
    cell: ({ row }) => {
      const emp = row.original;
      const initials = `${emp.nombre[0]}${emp.apellido[0]}`;
      return (
        <div className='flex items-center gap-2'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={emp.avatar} alt={emp.nombre} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-medium'>
              {emp.nombre} {emp.apellido}
            </span>
            <span className='text-muted-foreground text-xs'>{emp.email}</span>
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
    enableColumnFilter: true,
    meta: { label: 'DNI', placeholder: 'Buscar...', variant: 'text' }
  },
  {
    id: 'puesto',
    accessorKey: 'puesto',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Puesto' />,
    enableColumnFilter: true,
    meta: { label: 'Puesto', placeholder: 'Buscar...', variant: 'text' }
  },
  {
    id: 'departamento',
    accessorKey: 'departamento',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Departamento' />,
    enableColumnFilter: true,
    meta: { label: 'Departamento', placeholder: 'Filtrar...', variant: 'text' }
  },
  {
    id: 'seniority',
    accessorKey: 'seniority',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Seniority' />,
    cell: ({ cell }) => (
      <Badge variant='outline' className='capitalize'>
        {cell.getValue<string>()}
      </Badge>
    ),
    enableColumnFilter: true,
    meta: { label: 'Seniority', variant: 'text' }
  },
  {
    id: 'salario',
    accessorKey: 'salario',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Salario' />,
    cell: ({ cell }) => (
      <span className='tabular-nums'>${cell.getValue<number>().toLocaleString()}</span>
    ),
    enableColumnFilter: true,
    meta: { label: 'Salario', variant: 'text' }
  },
  {
    id: 'estado',
    accessorKey: 'estado',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Estado' />,
    cell: ({ cell }) => {
      const estado = cell.getValue<string>();
      return (
        <Badge variant='outline' className={estadoColors[estado] ?? ''}>
          {estado}
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
