'use client';

import { useState, useMemo } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/ui/table/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { columns } from './manuales-table/columns';
import { getManuales } from '../api/service';
import type { Manual } from '../api/types';

export function ManualesTable() {
  const [search, setSearch] = useState('');

  const { data } = useSuspenseQuery({
    queryKey: ['manuales'],
    queryFn: getManuales
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((m: Manual) =>
      [m.tarea, m.area, m.nombre_archivo].some((v) => v?.toLowerCase().includes(q))
    );
  }, [data, search]);

  const { table } = useDataTable({
    data: filtered,
    columns,
    pageCount: 1,
    shallow: true,
    debounceMs: 300,
    initialState: { columnPinning: { right: ['actions'] } }
  });

  return (
    <div className='flex flex-1 flex-col space-y-3'>
      <div className='relative max-w-sm'>
        <Icons.search className='text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4' />
        <Input
          placeholder='Buscar por nombre, área...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='pl-8'
        />
      </div>
      {filtered.length === 0 && !search ? (
        <div className='flex flex-col items-center justify-center py-16 text-muted-foreground gap-2'>
          <Icons.manuals className='h-10 w-10 opacity-30' />
          <p className='text-sm'>No hay manuales cargados todavía.</p>
          <p className='text-xs'>Usá el uploader de arriba para subir el primero.</p>
        </div>
      ) : (
        <DataTable table={table} />
      )}
    </div>
  );
}

export function ManualesTableSkeleton() {
  return (
    <div className='space-y-4 p-4'>
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-96 w-full' />
    </div>
  );
}
