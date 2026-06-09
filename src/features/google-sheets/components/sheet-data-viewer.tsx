'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { getLatestSync, getRowsForSync } from '../api/service';
import { detectColumnTypes } from '../lib/column-detector';
import { SmartCell } from './smart-cell';
import type { SyncResult } from '../api/types';

async function triggerSync(sheetId: string, url: string): Promise<SyncResult> {
  const res = await fetch('/api/sheets/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheetId, url })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Error al sincronizar');
  return json as SyncResult;
}

type Props = {
  sheetId: string;
  url: string;
};

export function SheetDataViewer({ sheetId, url }: Props) {
  const queryClient = useQueryClient();

  const { data: latestSync, isLoading: loadingSync } = useQuery({
    queryKey: ['sheet-sync', sheetId],
    queryFn: () => getLatestSync(sheetId)
  });

  const { data: rows, isLoading: loadingRows } = useQuery({
    queryKey: ['sheet-rows', latestSync?.id],
    queryFn: () => getRowsForSync(latestSync!.id),
    enabled: !!latestSync?.id && !latestSync.error
  });

  const syncMutation = useMutation({
    mutationFn: () => triggerSync(sheetId, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sheet-sync', sheetId] });
      toast.success('Sheet sincronizado');
    },
    onError: (err: Error) => toast.error(err.message)
  });

  const isLoading = loadingSync || loadingRows;

  if (isLoading) {
    return (
      <div className='space-y-2 pt-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-8 w-full' />
        ))}
      </div>
    );
  }

  if (!latestSync) {
    return (
      <div className='flex flex-col items-center gap-3 py-6 text-center'>
        <p className='text-muted-foreground text-sm'>Sin datos — hacé la primera sincronización</p>
        <Button size='sm' onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
          {syncMutation.isPending && <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />}
          Sincronizar ahora
        </Button>
      </div>
    );
  }

  if (latestSync.error) {
    return (
      <div className='space-y-3 py-2'>
        <div className='text-destructive flex items-center gap-2 text-sm'>
          <Icons.alertCircle className='h-4 w-4' />
          {latestSync.error}
        </div>
        <Button
          size='sm'
          variant='outline'
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
        >
          {syncMutation.isPending && <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />}
          Reintentar
        </Button>
      </div>
    );
  }

  const headers = latestSync.headers;
  const rowData = (rows ?? []).map((r) => r.data);
  const columnTypes = detectColumnTypes(headers, rowData);

  const syncedAt = new Date(latestSync.synced_at).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <p className='text-muted-foreground text-xs'>
          {latestSync.row_count} filas · Última sync: {syncedAt}
        </p>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
        >
          {syncMutation.isPending ? (
            <Icons.spinner className='mr-1 h-3.5 w-3.5 animate-spin' />
          ) : (
            <Icons.refresh className='mr-1 h-3.5 w-3.5' />
          )}
          {syncMutation.isPending ? 'Sincronizando…' : 'Sincronizar'}
        </Button>
      </div>

      {headers.length === 0 ? (
        <p className='text-muted-foreground py-4 text-sm'>El sheet está vacío.</p>
      ) : (
        <div className='overflow-x-auto rounded-md border'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/50'>
              <tr>
                {headers.map((h) => (
                  <th
                    key={h}
                    className='text-muted-foreground px-3 py-2 text-left font-medium whitespace-nowrap'
                    title={columnTypes[h]}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowData.map((row, i) => (
                <tr key={i} className='hover:bg-muted/30 border-t transition-colors'>
                  {headers.map((h) => (
                    <td key={h} className='px-3 py-2 whitespace-nowrap'>
                      <SmartCell value={row[h] ?? ''} type={columnTypes[h]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
