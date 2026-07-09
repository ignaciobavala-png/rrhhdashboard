'use client';

import { useState, useMemo } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTable } from '@/components/ui/table/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { columns } from './laptops-table/columns';
import { getLaptops } from '../api/service';
import { LaptopDialog } from './laptop-dialog';
import type { Laptop } from '../api/types';

export function LaptopsTable() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data } = useSuspenseQuery({
    queryKey: ['flota-laptops'],
    queryFn: () => getLaptops()
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return data.items;
    const q = search.toLowerCase();
    return data.items.filter((l: Laptop) =>
      [l.marca, l.modelo, l.numero_serie, l.empleado_nombre, l.usuario, l.equipo, l.ubicacion].some(
        (v) => v?.toLowerCase().includes(q)
      )
    );
  }, [data.items, search]);

  const { table } = useDataTable({
    data: filtered,
    columns,
    pageCount: 1,
    shallow: true,
    debounceMs: 300,
    initialState: { columnPinning: { left: ['orden'] } }
  });

  return (
    <div className='flex flex-1 flex-col space-y-3'>
      <div className='flex items-center gap-3'>
        <div className='relative max-w-sm flex-1'>
          <Icons.search className='text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4' />
          <Input
            placeholder='Buscar por marca, usuario, equipo...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-8'
          />
        </div>
        <Button size='sm' onClick={() => setDialogOpen(true)}>
          <Icons.circleCheck className='mr-2 h-4 w-4' />
          Nueva Laptop
        </Button>
      </div>

      {filtered.length === 0 && !search ? (
        <div className='flex flex-col items-center justify-center py-24 text-muted-foreground gap-2'>
          <Icons.laptop className='h-10 w-10 opacity-30' />
          <p className='text-sm'>No hay laptops registradas todavía.</p>
          <Button variant='outline' size='sm' className='mt-2' onClick={() => setDialogOpen(true)}>
            Registrar la primera laptop
          </Button>
        </div>
      ) : (
        <DataTable table={table} />
      )}

      <LaptopDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

export function LaptopsTableSkeleton() {
  return (
    <div className='space-y-4 p-4'>
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-96 w-full' />
    </div>
  );
}
