'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { addSheetRow } from '../api/service';
import type { ColumnType } from '../api/types';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headers: string[];
  columnTypes: Record<string, ColumnType>;
  syncId: string;
  sheetId: string;
  nextRowIndex: number;
};

function inputType(colType: ColumnType): string {
  switch (colType) {
    case 'number':
    case 'currency':
    case 'percentage':
      return 'number';
    case 'date':
      return 'date';
    case 'email':
      return 'email';
    case 'url':
      return 'url';
    default:
      return 'text';
  }
}

export function AddRowDialog({
  open,
  onOpenChange,
  headers,
  columnTypes,
  syncId,
  sheetId,
  nextRowIndex
}: Props) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});

  const reset = useCallback(() => {
    const empty: Record<string, string> = {};
    for (const h of headers) empty[h] = '';
    setValues(empty);
  }, [headers]);

  const setField = useCallback((field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const mutation = useMutation({
    mutationFn: () => addSheetRow(syncId, sheetId, values, nextRowIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sheet-rows', syncId] });
      toast.success('Fila agregada');
      reset();
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message)
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Agregar fila</DialogTitle>
          <DialogDescription>
            Completá los campos para agregar un nuevo registro manual.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-3 max-h-[60vh] overflow-y-auto pt-2'>
          {headers.map((h) => (
            <div key={h} className='space-y-1'>
              <Label htmlFor={`add-field-${h}`}>{h}</Label>
              <Input
                id={`add-field-${h}`}
                type={inputType(columnTypes[h] ?? 'text')}
                placeholder={h}
                value={values[h] ?? ''}
                onChange={(e) => setField(h, e.target.value)}
              />
            </div>
          ))}
          <Button
            className='w-full'
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Icons.plus className='mr-2 h-4 w-4' />
            )}
            Agregar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
