'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { showUndoToast } from '@/lib/undo-toast';
import { addGoogleSheet, deleteGoogleSheet } from '../api/service';
import type { GoogleSheet } from '../api/types';

type Props = {
  onAdded?: (sheet: GoogleSheet) => void;
};

export function AddSheetDialog({ onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      addGoogleSheet({
        name: name.trim(),
        url: url.trim(),
        description: description.trim() || null
      }),
    onSuccess: (sheet) => {
      queryClient.invalidateQueries({ queryKey: ['google-sheets'] });
      setOpen(false);
      setName('');
      setUrl('');
      setDescription('');
      onAdded?.(sheet);
      showUndoToast('Sheet agregado — sincronizando datos…', async () => {
        await deleteGoogleSheet(sheet.id);
        queryClient.invalidateQueries({ queryKey: ['google-sheets'] });
      });
    },
    onError: (err: Error) => toast.error(err.message)
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm'>
          <Icons.plus className='mr-2 h-4 w-4' />
          Agregar Sheet
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Conectar Google Sheet</DialogTitle>
          <DialogDescription>
            Pegá la URL de un Google Sheet público para verlo en el dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 pt-2'>
          <div className='space-y-1'>
            <Label htmlFor='sheet-name'>Nombre</Label>
            <Input
              id='sheet-name'
              placeholder='Ej: Nómina Mayo 2025'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className='space-y-1'>
            <Label htmlFor='sheet-url'>URL del Sheet</Label>
            <Input
              id='sheet-url'
              placeholder='https://docs.google.com/spreadsheets/d/...'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className='text-muted-foreground text-xs'>
              El sheet debe estar publicado: Archivo → Compartir → Publicar en la web
            </p>
          </div>
          <div className='space-y-1'>
            <Label htmlFor='sheet-desc'>Descripción (opcional)</Label>
            <Input
              id='sheet-desc'
              placeholder='Ej: Datos de sueldos del mes'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button
            className='w-full'
            onClick={() => mutation.mutate()}
            disabled={!name.trim() || !url.trim() || mutation.isPending}
          >
            {mutation.isPending ? <Icons.spinner className='mr-2 h-4 w-4 animate-spin' /> : null}
            Conectar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
