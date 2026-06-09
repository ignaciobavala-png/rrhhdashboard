'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { TabData } from './tab-data';
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

type Props = {
  sectionSlug: string;
};

export function SheetSectionView({ sectionSlug }: Props) {
  const queryClient = useQueryClient();
  const sectionName = sectionSlug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const { data: sections, isLoading } = useQuery({
    queryKey: ['sheet-sections', sectionName],
    queryFn: async () => {
      const { data } = await supabase
        .from('sheet_sections')
        .select('sync_id, sheet_id, tab_name')
        .eq('section_name', sectionName)
        .order('tab_name');
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000
  });

  const syncIds = [...new Set((sections ?? []).map((s) => s.sync_id))];
  const sheetIds = [...new Set((sections ?? []).map((s) => s.sheet_id))];
  const primarySheetId = sheetIds[0];

  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!primarySheetId) throw new Error('No hay sheet asociado');
      const { data: sheet } = await supabase
        .from('google_sheets')
        .select('url')
        .eq('id', primarySheetId)
        .single();
      if (!sheet?.url) throw new Error('URL del sheet no encontrada');
      return triggerSync(primarySheetId, sheet.url);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['sheet-sections', sectionName] });
      syncIds.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: ['sheet-rows', id] });
      });
      queryClient.invalidateQueries({ queryKey: ['calendario', 'sheets-vacaciones'] });
      const tabCount = result.tabs.length;
      toast.success(
        `${tabCount} ${tabCount === 1 ? 'pestaña sincronizada' : 'pestañas sincronizadas'}`
      );
    },
    onError: (err: Error) => toast.error(err.message)
  });

  if (isLoading) {
    return (
      <div className='space-y-4 pt-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-12 w-full' />
        ))}
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <div className='flex flex-col items-center gap-4 py-12 text-center'>
        <Icons.sparkles className='text-muted-foreground h-8 w-8 opacity-40' />
        <p className='text-muted-foreground text-sm'>
          No hay datos importados para la sección <strong>{sectionName}</strong>.
        </p>
        <p className='text-muted-foreground text-xs'>
          Conectá un Google Sheet con datos de {sectionName} desde la sección de integraciones.
        </p>
        <Button variant='outline' size='sm' asChild>
          <Link href='/dashboard/google-sheets'>Ir a Google Sheets</Link>
        </Button>
      </div>
    );
  }

  if (sections.length === 1) {
    const s = sections[0];
    return (
      <SheetSectionTab
        syncId={s.sync_id}
        sheetId={s.sheet_id}
        tabName={s.tab_name}
        onSync={() => syncMutation.mutate()}
        isSyncing={syncMutation.isPending}
      />
    );
  }

  return (
    <Tabs defaultValue={sections[0].tab_name}>
      <div className='mb-3 overflow-x-auto'>
        <TabsList className='flex h-9 w-max min-w-full justify-start'>
          {sections.map((s) => (
            <TabsTrigger key={s.tab_name} value={s.tab_name} className='flex-none'>
              {s.tab_name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {sections.map((s) => (
        <TabsContent key={s.tab_name} value={s.tab_name}>
          <SheetSectionTab
            syncId={s.sync_id}
            sheetId={s.sheet_id}
            tabName={s.tab_name}
            onSync={() => syncMutation.mutate()}
            isSyncing={syncMutation.isPending}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function SheetSectionTab({
  syncId,
  sheetId,
  tabName,
  onSync,
  isSyncing
}: {
  syncId: string;
  sheetId: string;
  tabName: string;
  onSync: () => void;
  isSyncing: boolean;
}) {
  const { data: sync, isLoading } = useQuery({
    queryKey: ['sheet-sync-by-id', syncId],
    queryFn: async (): Promise<SheetSync | null> => {
      const { data } = await supabase.from('sheet_syncs').select('*').eq('id', syncId).single();
      return data ?? null;
    }
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

  if (!sync) {
    return (
      <p className='text-muted-foreground text-sm py-4'>Datos no disponibles para {tabName}.</p>
    );
  }

  return <TabData sync={sync} sheetId={sheetId} onSync={onSync} isSyncing={isSyncing} />;
}
