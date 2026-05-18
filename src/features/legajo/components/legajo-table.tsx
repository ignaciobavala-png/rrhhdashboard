'use client';

import { useState, useMemo } from 'react';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { getSortingStateParser } from '@/lib/parsers';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/ui/table/data-table';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { showUndoToast } from '@/lib/undo-toast';
import { columns } from './legajo-table/columns';
import { getEmpleados, updateEmpleado, upsertPuesto } from '../api/service';
import type { Empleado } from '../api/types';

export function LegajoTable() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');

  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(50),
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
    const original = data.items.find((e: Empleado) => e.id === editingId);
    const toUpdate: Record<string, unknown> = {};
    for (const f of fields) {
      if (f in editData) {
        toUpdate[f] = editData[f] === '' ? null : editData[f];
      }
    }
    const originalPuesto = original?.puesto;
    try {
      await updateEmpleado(editingId, toUpdate as Parameters<typeof updateEmpleado>[1]);
      if ('puesto' in editData) {
        await upsertPuesto(editingId, editData.puesto ?? null);
      }
      queryClient.invalidateQueries({ queryKey: ['legajo'] });
      const id = editingId;
      setEditingId(null);
      setEditData({});
      showUndoToast('Empleado actualizado', async () => {
        if (original) {
          const revert: Record<string, unknown> = {};
          for (const f of fields) revert[f] = original[f] ?? null;
          await updateEmpleado(id, revert as Parameters<typeof updateEmpleado>[1]);
          await upsertPuesto(id, originalPuesto ?? null);
          queryClient.invalidateQueries({ queryKey: ['legajo'] });
        }
      });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al actualizar');
    }
  };

  const updateEditData = (key: string, value: unknown) => {
    setEditData((prev) => ({ ...prev, [key]: value }));
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return data.items;
    const q = search.toLowerCase();
    return data.items.filter((e: Empleado) =>
      [e.nombre_apellido, e.dni, e.equipo_ingreso, e.puesto, e.email].some((v) =>
        v?.toLowerCase().includes(q)
      )
    );
  }, [data.items, search]);

  const { table } = useDataTable({
    data: filtered,
    columns,
    pageCount: Math.ceil(filtered.length / params.perPage),
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
    <div className='flex flex-1 flex-col space-y-3'>
      <div className='relative max-w-sm'>
        <Icons.search className='text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4' />
        <Input
          placeholder='Buscar por nombre, DNI, equipo, puesto...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='pl-8'
        />
      </div>
      <DataTable table={table} />
    </div>
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
