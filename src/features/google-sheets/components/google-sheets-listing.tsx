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
import type { GoogleSheet } from '../api/types';

async function triggerSync(sheetId: string, url: string) {
  await fetch('/api/sheets/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheetId, url })
  });
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
    await triggerSync(sheet.id, sheet.url);
    queryClient.invalidateQueries({ queryKey: ['sheet-syncs', sheet.id] });
  };

  const handleSyncAll = async () => {
    if (sheets.length === 0) return;
    setSyncingAll(true);
    try {
      await Promise.all(sheets.map((s) => triggerSync(s.id, s.url)));
      sheets.forEach((s) => queryClient.invalidateQueries({ queryKey: ['sheet-syncs', s.id] }));
      toast.success(
        `${sheets.length} ${sheets.length === 1 ? 'sheet sincronizado' : 'sheets sincronizados'}`
      );
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
