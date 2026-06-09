'use client';

import { useState } from 'react';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { getGoogleSheets, deleteGoogleSheet } from '../api/service';
import { AddSheetDialog } from './add-sheet-dialog';
import { SheetDataViewer } from './sheet-data-viewer';
import type { GoogleSheet, SyncResult } from '../api/types';

async function triggerSync(sheetId: string, url: string): Promise<SyncResult> {
  const res = await fetch('/api/sheets/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheetId, url })
  });
  if (!res.ok) throw new Error('Error al sincronizar');
  return res.json();
}

export function GoogleSheetsListing() {
  const queryClient = useQueryClient();
  const [syncingAll, setSyncingAll] = useState(false);

  const { data: sheets } = useSuspenseQuery({
    queryKey: ['google-sheets'],
    queryFn: getGoogleSheets
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGoogleSheet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-sheets'] });
      toast.success('Sheet eliminado');
    },
    onError: (err: Error) => toast.error(err.message)
  });

  const handleAdded = async (sheet: GoogleSheet) => {
    try {
      const result = await triggerSync(sheet.id, sheet.url);
      queryClient.invalidateQueries({ queryKey: ['sheet-syncs', sheet.id] });
      queryClient.invalidateQueries({ queryKey: ['calendario'] });
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });

      let totalImported = 0;
      for (const t of result.tabs) {
        totalImported += (t.importCreated ?? 0) + (t.importUpdated ?? 0);
      }
      const tabCount = result.tabs.length;
      let msg = `Sheet agregado — ${tabCount} ${tabCount === 1 ? 'pestaña' : 'pestañas'} sincronizada${tabCount === 1 ? '' : 's'}`;
      if (totalImported > 0) msg += `, ${totalImported} registros importados`;
      toast.success(msg);
    } catch {
      toast.error('Error al sincronizar el sheet');
    }
  };

  const handleSyncAll = async () => {
    if (sheets.length === 0) return;
    setSyncingAll(true);
    try {
      const results = await Promise.all(sheets.map((s) => triggerSync(s.id, s.url)));
      sheets.forEach((s) => queryClient.invalidateQueries({ queryKey: ['sheet-syncs', s.id] }));

      // Count total imported
      let totalImported = 0;
      const sections = new Set<string>();
      for (const r of results) {
        for (const t of r.tabs) {
          totalImported += (t.importCreated ?? 0) + (t.importUpdated ?? 0);
          if (t.suggestedSection) sections.add(t.suggestedSection);
        }
      }

      if (sections.has('Legajo') || sections.has('People'))
        queryClient.invalidateQueries({ queryKey: ['empleados'] });
      if (sections.has('Vacaciones')) queryClient.invalidateQueries({ queryKey: ['vacaciones'] });
      if (sections.has('Sueldos')) queryClient.invalidateQueries({ queryKey: ['sueldos'] });
      if (sections.has('Flota')) {
        queryClient.invalidateQueries({ queryKey: ['lineas-moviles'] });
        queryClient.invalidateQueries({ queryKey: ['laptops'] });
      }
      queryClient.invalidateQueries({ queryKey: ['calendario'] });
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });

      let msg = `${sheets.length} ${sheets.length === 1 ? 'sheet sincronizado' : 'sheets sincronizados'}`;
      if (totalImported > 0) msg += ` — ${totalImported} registros importados`;
      toast.success(msg);
    } catch {
      toast.error('Error al sincronizar');
    } finally {
      setSyncingAll(false);
    }
  };

  if (sheets.length === 0) {
    return (
      <div className='flex flex-col items-center gap-4 py-16 text-center'>
        <Icons.sheets className='text-muted-foreground h-12 w-12' />
        <div>
          <p className='font-medium'>No hay sheets conectados</p>
          <p className='text-muted-foreground text-sm'>
            Agregá un Google Sheet público para verlo aquí
          </p>
        </div>
        <AddSheetDialog onAdded={handleAdded} />
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-end gap-2'>
        <Button variant='outline' size='sm' onClick={handleSyncAll} disabled={syncingAll}>
          {syncingAll ? (
            <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <Icons.refresh className='mr-2 h-4 w-4' />
          )}
          {syncingAll ? 'Sincronizando…' : 'Sincronizar todo'}
        </Button>
        <AddSheetDialog onAdded={handleAdded} />
      </div>
      <Accordion type='multiple' className='space-y-2'>
        {sheets.map((sheet) => (
          <AccordionItem key={sheet.id} value={sheet.id} className='rounded-lg border px-4'>
            <AccordionTrigger className='hover:no-underline'>
              <div className='flex flex-1 items-center gap-3 text-left'>
                <Icons.sheets className='text-muted-foreground h-4 w-4 shrink-0' />
                <div className='min-w-0'>
                  <p className='font-medium'>{sheet.name}</p>
                  {sheet.description && (
                    <p className='text-muted-foreground truncate text-xs'>{sheet.description}</p>
                  )}
                </div>
                <Badge variant='secondary' className='ml-2 shrink-0 text-xs'>
                  Google Sheets
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className='pb-2'>
                <div className='mb-3 flex items-center justify-between'>
                  <a
                    href={sheet.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors'
                  >
                    <Icons.externalLink className='h-3 w-3' />
                    Abrir en Google Sheets
                  </a>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-destructive hover:text-destructive h-7 px-2'
                    onClick={() => deleteMutation.mutate(sheet.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Icons.trash className='h-3.5 w-3.5' />
                    Eliminar
                  </Button>
                </div>
                <SheetDataViewer sheetId={sheet.id} url={sheet.url} />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
