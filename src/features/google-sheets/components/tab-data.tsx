'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { showUndoToast } from '@/lib/undo-toast';
import { supabase } from '@/lib/supabase';
import { getEffectiveRowsForSync, deleteSheetRow } from '../api/service';
import { detectColumnTypes } from '../lib/column-detector';
import { SectionSuggestionBanner } from './section-suggestion-banner';
import { EditableCell } from './editable-cell';
import { AddRowDialog } from './add-row-dialog';
import type { SheetSync, SheetRowEffective } from '../api/types';

type Props = {
  sync: SheetSync;
  sheetId: string;
  onSync: () => void;
  isSyncing: boolean;
};

export function TabData({ sync, sheetId, onSync, isSyncing }: Props) {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SheetRowEffective | null>(null);
  const [addRowOpen, setAddRowOpen] = useState(false);

  const { data: rows, isLoading } = useQuery({
    queryKey: ['sheet-rows', sync.id],
    queryFn: () => getEffectiveRowsForSync(sync.id),
    enabled: !sync.error
  });

  const deleteMutation = useMutation({
    mutationFn: (row: SheetRowEffective) => deleteSheetRow(row.id),
    onMutate: async (row) => {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      await queryClient.cancelQueries({ queryKey: ['sheet-rows', sync.id] });
      const previous = queryClient.getQueryData<SheetRowEffective[]>(['sheet-rows', sync.id]);
      queryClient.setQueryData<SheetRowEffective[]>(['sheet-rows', sync.id], (old) =>
        (old ?? []).filter((r) => r.id !== row.id)
      );
      return { previous, row };
    },
    onError: (err: Error, _row, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['sheet-rows', sync.id], context.previous);
      }
      toast.error(err.message);
    },
    onSuccess: (_data, row) => {
      showUndoToast('Fila eliminada', async () => {
        await addSheetRowBypass(sync.id, sheetId, row.original_data);
        queryClient.invalidateQueries({ queryKey: ['sheet-rows', sync.id] });
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sheet-rows', sync.id] });
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

  if (sync.error) {
    return (
      <div className='text-destructive flex items-center gap-2 py-3 text-sm'>
        <Icons.alertCircle className='h-4 w-4' />
        {sync.error}
      </div>
    );
  }

  const headers = sync.headers;
  const effectiveRows = rows ?? [];
  const rowData = effectiveRows.map((r) => r.data);
  const columnTypes = detectColumnTypes(headers, rowData);
  const maxRowIndex = effectiveRows.reduce((max, r) => Math.max(max, r.row_index), 0);

  const syncedAt = new Date(sync.synced_at).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  const editedCount = effectiveRows.filter((r) => r.edited_data !== null).length;
  const manualCount = effectiveRows.filter((r) => r.is_manual).length;

  return (
    <div className='space-y-3'>
      {sync.suggested_section && (
        <SectionSuggestionBanner
          tabName={sync.tab_name}
          suggestedSection={sync.suggested_section}
        />
      )}
      <div className='flex items-center justify-between gap-2 flex-wrap'>
        <div className='flex items-center gap-2'>
          <p className='text-muted-foreground text-xs'>
            {effectiveRows.length} filas · Última sync: {syncedAt}
          </p>
          {editedCount > 0 && (
            <Badge variant='outline' className='text-[10px] text-blue-600 dark:text-blue-400'>
              {editedCount} {editedCount === 1 ? 'editada' : 'editadas'}
            </Badge>
          )}
          {manualCount > 0 && (
            <Badge variant='outline' className='text-[10px] text-emerald-600 dark:text-emerald-400'>
              {manualCount} {manualCount === 1 ? 'manual' : 'manuales'}
            </Badge>
          )}
        </div>
        <div className='flex items-center gap-2'>
          {headers.length > 0 && (
            <Button variant='outline' size='sm' onClick={() => setAddRowOpen(true)}>
              <Icons.plus className='mr-1 h-3.5 w-3.5' />
              Agregar fila
            </Button>
          )}
          <Button variant='outline' size='sm' onClick={onSync} disabled={isSyncing}>
            {isSyncing ? (
              <Icons.spinner className='mr-1 h-3.5 w-3.5 animate-spin' />
            ) : (
              <Icons.refresh className='mr-1 h-3.5 w-3.5' />
            )}
            {isSyncing ? 'Sincronizando…' : 'Sincronizar'}
          </Button>
        </div>
      </div>
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
                <th className='text-muted-foreground w-10 px-2 py-2' />
              </tr>
            </thead>
            <tbody>
              {effectiveRows.map((row) => (
                <tr key={row.id} className='hover:bg-muted/30 border-t transition-colors'>
                  {headers.map((h) => (
                    <td key={h} className='px-3 py-2 whitespace-nowrap'>
                      <EditableCell
                        rowId={row.id}
                        syncId={sync.id}
                        field={h}
                        value={row.data[h] ?? ''}
                        type={columnTypes[h]}
                        isEdited={row.edited_data !== null}
                      />
                    </td>
                  ))}
                  <td className='px-2 py-2'>
                    <div className='flex items-center gap-1'>
                      {row.is_manual && (
                        <Badge
                          variant='outline'
                          className='text-[9px] px-1 py-0 text-emerald-600 dark:text-emerald-400'
                          title='Fila agregada manualmente'
                        >
                          Manual
                        </Badge>
                      )}
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-6 w-6 text-muted-foreground hover:text-destructive'
                        onClick={() => {
                          setDeleteTarget(row);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Icons.trash className='h-3.5 w-3.5' />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title='¿Eliminar fila?'
        description='Esta fila se marcará como eliminada. Podés deshacer esta acción.'
        confirmLabel='Eliminar'
        destructive
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget);
        }}
        loading={deleteMutation.isPending}
      />

      <AddRowDialog
        open={addRowOpen}
        onOpenChange={setAddRowOpen}
        headers={headers}
        columnTypes={columnTypes}
        syncId={sync.id}
        sheetId={sheetId}
        nextRowIndex={maxRowIndex + 1}
      />
    </div>
  );
}

async function addSheetRowBypass(
  syncId: string,
  sheetId: string,
  data: Record<string, string>
): Promise<void> {
  const { error } = await supabase.from('sheet_rows').insert({
    sync_id: syncId,
    sheet_id: sheetId,
    row_index: 0,
    data,
    is_manual: false
  });
  if (error) throw new Error(error.message);
}
