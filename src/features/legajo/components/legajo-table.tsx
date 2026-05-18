'use client';

import { useState } from 'react';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { getSortingStateParser } from '@/lib/parsers';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { columns } from './legajo-table/columns';
import { getEmpleados, updateEmpleado, upsertPuesto } from '../api/service';
import type { Empleado } from '../api/types';

export function LegajoTable() {
  const queryClient = useQueryClient();

  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(50),
    name: parseAsString,
    sort: getSortingStateParser([
      'nombre_apellido',
      'dni',
      'equipo_ingreso',
      'fecha_ingreso',
      'modalidad',
      'activo'
    ]).withDefault([])
  });

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.name && { search: params.name }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) })
  };

  const { data } = useSuspenseQuery({
    queryKey: ['legajo', filters],
    queryFn: () => getEmpleados(filters)
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Empleado>>({});

  const startEdit = (id: number) => {
    const emp = data.items.find((e: Empleado) => e.id === id);
    if (!emp) return;
    setEditingId(id);
    setEditData({ ...emp });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const fields: (keyof Empleado)[] = [
      'nombre_apellido',
      'dni',
      'celular',
      'email',
      'direccion',
      'movilidad',
      'equipo_ingreso',
      'modalidad',
      'fecha_nacimiento',
      'fecha_ingreso',
      'activo',
      'contacto_emergencia'
    ];
    const toUpdate: Record<string, unknown> = {};
    for (const f of fields) {
      if (f in editData) {
        toUpdate[f] = editData[f] === '' ? null : editData[f];
      }
    }
    try {
      await updateEmpleado(editingId, toUpdate as Parameters<typeof updateEmpleado>[1]);
      if ('puesto' in editData) {
        await upsertPuesto(editingId, editData.puesto ?? null);
      }
      toast.success('Empleado actualizado');
      queryClient.invalidateQueries({ queryKey: ['legajo'] });
      setEditingId(null);
      setEditData({});
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al actualizar');
    }
  };

  const updateEditData = (key: string, value: unknown) => {
    setEditData((prev) => ({ ...prev, [key]: value }));
  };

  const { table } = useDataTable({
    data: data.items,
    columns,
    pageCount: Math.ceil(data.total_items / params.perPage),
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { left: ['nombre_apellido'], right: ['actions'] }
    },
    meta: {
      editingId,
      editData,
      startEdit,
      saveEdit,
      cancelEdit,
      updateEditData
    }
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}

export function LegajoTableSkeleton() {
  return (
    <div className='space-y-4 p-4'>
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-96 w-full' />
    </div>
  );
}
