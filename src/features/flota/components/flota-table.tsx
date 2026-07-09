'use client';

import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { columns } from './flota-table/columns';
import { getLineasMoviles } from '../api/service';
import { LineaMovilDialog } from './linea-movil-dialog';

export function FlotaTable() {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.name && { search: params.name })
  };

  const { data } = useSuspenseQuery({
    queryKey: ['flota', filters],
    queryFn: () => getLineasMoviles(filters)
  });

  const { table } = useDataTable({
    data: data.items,
    columns,
    pageCount: Math.ceil(data.total_items / params.perPage),
    shallow: true,
    debounceMs: 500,
    initialState: { columnPinning: { right: ['actions'] } }
  });

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <Button size='sm' onClick={() => setDialogOpen(true)}>
            <Icons.circleCheck className='mr-2 h-4 w-4' />
            Nueva Línea
          </Button>
        </DataTableToolbar>
      </DataTable>
      <LineaMovilDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}

export function FlotaTableSkeleton() {
  return (
    <div className='space-y-4 p-4'>
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-96 w-full' />
    </div>
  );
}
