'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { getLatestSyncsByTab } from '../api/service';
import { TabData } from './tab-data';
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

      // Invalidate dashboard queries based on imported sections
      const sections = new Set(
        result.tabs.filter((t) => t.suggestedSection).map((t) => t.suggestedSection!)
      );
      if (sections.has('Legajo') || sections.has('People')) {
        queryClient.invalidateQueries({ queryKey: ['empleados'] });
      }
      if (sections.has('Vacaciones')) {
        queryClient.invalidateQueries({ queryKey: ['vacaciones'] });
      }
      if (sections.has('Sueldos')) {
        queryClient.invalidateQueries({ queryKey: ['sueldos'] });
      }
      if (sections.has('Flota')) {
        queryClient.invalidateQueries({ queryKey: ['lineas-moviles'] });
        queryClient.invalidateQueries({ queryKey: ['laptops'] });
      }
      queryClient.invalidateQueries({ queryKey: ['calendario'] });
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });

      // Build toast message with import stats
      const totalImported = result.tabs.reduce(
        (acc, t) => acc + (t.importCreated ?? 0) + (t.importUpdated ?? 0),
        0
      );
      const tabCount = result.tabs.length;
      let msg = `${tabCount} ${tabCount === 1 ? 'pestaña' : 'pestañas'} sincronizada${tabCount === 1 ? '' : 's'}`;
      if (totalImported > 0) {
        msg += ` — ${totalImported} registros importados al dashboard`;
      }
      toast.success(msg);
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
      {syncs.length === 1 ? (
        <TabData
          sync={syncs[0]}
          sheetId={sheetId}
          onSync={() => syncMutation.mutate()}
          isSyncing={syncMutation.isPending}
        />
      ) : (
        <Tabs defaultValue={syncs[0].tab_name}>
          <div className='mb-3 overflow-x-auto'>
            <TabsList className='flex h-9 w-max min-w-full justify-start'>
              {syncs.map((s) => (
                <TabsTrigger key={s.tab_name} value={s.tab_name} className='flex-none'>
                  {s.tab_name}
                  {s.suggested_section && (
                    <Icons.sparkles className='ml-1.5 h-3 w-3 text-amber-500' />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {syncs.map((s) => (
            <TabsContent key={s.tab_name} value={s.tab_name}>
              <TabData
                sync={s}
                sheetId={sheetId}
                onSync={() => syncMutation.mutate()}
                isSyncing={syncMutation.isPending}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
