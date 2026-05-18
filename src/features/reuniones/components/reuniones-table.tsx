'use client';

import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { Skeleton } from '@/components/ui/skeleton';
import { columns } from './reuniones-table/columns';
import { getReuniones } from '@/features/reuniones/api/service';
import { NotasDialog } from './notas-dialog';
import type { Reunion } from '@/features/reuniones/api/types';

export function ReunionesTable() {
  const [notasOpen, setNotasOpen] = useState(false);
  const [selectedReunion, setSelectedReunion] = useState<Reunion | null>(null);

  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString
  });

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.name && { search: params.name })
  };

  const { data } = useSuspenseQuery({
    queryKey: ['reuniones', filters],
    queryFn: async () => getReuniones(filters)
  });

  const { table } = useDataTable({
    data: data.items,
    columns,
    pageCount: Math.ceil(data.total_items / params.perPage),
    shallow: true,
    debounceMs: 500,
    initialState: { columnPinning: { right: ['actions'] } },
    meta: {
      openNotas: (reunion: Reunion) => {
        setSelectedReunion(reunion);
        setNotasOpen(true);
      }
    }
  });

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
      <NotasDialog open={notasOpen} onOpenChange={setNotasOpen} reunion={selectedReunion} />
    </>
  );
}

export function ReunionesTableSkeleton() {
  return (
    <div className='space-y-4 p-4'>
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-96 w-full' />
    </div>
  );
}
