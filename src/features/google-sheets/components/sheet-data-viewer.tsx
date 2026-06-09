'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { getLatestSyncsByTab, getRowsForSync } from '../api/service';
import { detectColumnTypes } from '../lib/column-detector';
import { SmartCell } from './smart-cell';
import { SectionSuggestionBanner } from './section-suggestion-banner';
import type { SheetSync, SyncResult } from '../api/types';

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

type TabDataProps = {
  sync: SheetSync;
};

function TabData({ sync }: TabDataProps) {
  const { data: rows, isLoading } = useQuery({
    queryKey: ['sheet-rows', sync.id],
    queryFn: () => getRowsForSync(sync.id),
    enabled: !sync.error
  });

  if (isLoading) {
    return (
      <div className='space-y-2 pt-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-8 w-full' />
        ))}
      </div>
    );
  }

  if (sync.error) {
    return (
      <div className='text-destructive flex items-center gap-2 py-3 text-sm'>
        <Icons.alertCircle className='h-4 w-4' />
        {sync.error}
      </div>
    );
  }

  const headers = sync.headers;
  const rowData = (rows ?? []).map((r) => r.data);
  const columnTypes = detectColumnTypes(headers, rowData);

  const syncedAt = new Date(sync.synced_at).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className='space-y-3'>
      {sync.suggested_section && (
        <SectionSuggestionBanner
          tabName={sync.tab_name}
          suggestedSection={sync.suggested_section}
        />
      )}
      <p className='text-muted-foreground text-xs'>
        {sync.row_count} filas · Última sync: {syncedAt}
      </p>
      {headers.length === 0 ? (
        <p className='text-muted-foreground py-3 text-sm'>Esta pestaña está vacía.</p>
      ) : (
        <div className='overflow-x-auto rounded-md border'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/50'>
              <tr>
                {headers.map((h) => (
                  <th
                    key={h}
                    title={columnTypes[h]}
                    className='text-muted-foreground px-3 py-2 text-left font-medium whitespace-nowrap'
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

type Props = {
  sheetId: string;
  url: string;
};

export function SheetDataViewer({ sheetId, url }: Props) {
  const queryClient = useQueryClient();

  const { data: syncs, isLoading } = useQuery({
    queryKey: ['sheet-syncs', sheetId],
    queryFn: () => getLatestSyncsByTab(sheetId)
  });

  const syncMutation = useMutation({
    mutationFn: () => triggerSync(sheetId, url),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['sheet-syncs', sheetId] });
      result.tabs.forEach((t) => {
        queryClient.invalidateQueries({ queryKey: ['sheet-rows', t.syncId] });
      });
      const tabCount = result.tabs.length;
      toast.success(
        `${tabCount} ${tabCount === 1 ? 'pestaña sincronizada' : 'pestañas sincronizadas'}`
      );
    },
    onError: (err: Error) => toast.error(err.message)
  });

  if (isLoading) {
    return (
      <div className='space-y-2 pt-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-8 w-full' />
        ))}
      </div>
    );
  }

  if (!syncs || syncs.length === 0) {
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

  return (
    <div className='space-y-2'>
      <div className='flex justify-end'>
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
          {syncMutation.isPending ? 'Sincronizando…' : 'Sincronizar todo'}
        </Button>
      </div>

      {syncs.length === 1 ? (
        <TabData sync={syncs[0]} />
      ) : (
        <Tabs defaultValue={syncs[0].tab_name}>
          <TabsList className='mb-3'>
            {syncs.map((s) => (
              <TabsTrigger key={s.tab_name} value={s.tab_name}>
                {s.tab_name}
                {s.suggested_section && (
                  <Icons.sparkles className='ml-1.5 h-3 w-3 text-amber-500' />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {syncs.map((s) => (
            <TabsContent key={s.tab_name} value={s.tab_name}>
              <TabData sync={s} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
