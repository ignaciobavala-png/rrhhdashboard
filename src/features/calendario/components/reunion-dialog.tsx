'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { showUndoToast } from '@/lib/undo-toast';
import { createReunion, updateReunion, deleteReunion } from '@/features/reuniones/api/service';
import type { Reunion } from '@/features/reuniones/api/types';

function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface ReunionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fecha: Date;
  editingReunion?: Reunion | null;
}

type FormState = {
  titulo: string;
  fecha: string;
  hora: string;
  duracion: string;
  participantes: string;
  resumen: string;
};

export function ReunionDialog({ open, onOpenChange, fecha, editingReunion }: ReunionDialogProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>({
    titulo: '',
    fecha: toIsoDate(fecha),
    hora: '09:00',
    duracion: '60',
    participantes: '',
    resumen: ''
  });

  useEffect(() => {
    if (editingReunion) {
      setForm({
        titulo: editingReunion.titulo,
        fecha: editingReunion.fecha,
        hora: editingReunion.hora,
        duracion: String(editingReunion.duracion),
        participantes: editingReunion.participantes.join(', '),
        resumen: editingReunion.resumen ?? ''
      });
    } else {
      setForm({
        titulo: '',
        fecha: toIsoDate(fecha),
        hora: '09:00',
        duracion: '60',
        participantes: '',
        resumen: ''
      });
    }
  }, [editingReunion, open, fecha]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['reuniones'] });
    queryClient.invalidateQueries({ queryKey: ['calendario', 'reuniones'] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const participantes = form.participantes
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      const payload = {
        titulo: form.titulo.trim(),
        fecha: form.fecha,
        hora: form.hora,
        duracion: Number(form.duracion) || 60,
        participantes,
        resumen: form.resumen.trim() || null,
        empresa_id: 1
      };
      if (editingReunion) {
        const prev = { ...editingReunion };
        const updated = await updateReunion(editingReunion.id, payload);
        return { type: 'update' as const, updated, prev };
      }
      const created = await createReunion(payload);
      return { type: 'create' as const, created };
    },
    onSuccess: (result) => {
      invalidate();
      onOpenChange(false);
      if (result.type === 'create') {
        showUndoToast('Reunión creada', async () => {
          await deleteReunion(result.created.id);
          invalidate();
        });
      } else {
        showUndoToast('Reunión actualizada', async () => {
          await updateReunion(result.prev.id, {
            titulo: result.prev.titulo,
            fecha: result.prev.fecha,
            hora: result.prev.hora,
            duracion: result.prev.duracion,
            participantes: result.prev.participantes,
            resumen: result.prev.resumen
          });
          invalidate();
        });
      }
    },
    onError: () => toast.error('Error al guardar la reunión')
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const saved = { ...editingReunion! };
      await deleteReunion(editingReunion!.id);
      return saved;
    },
    onSuccess: (saved) => {
      invalidate();
      onOpenChange(false);
      showUndoToast('Reunión eliminada', async () => {
        await createReunion({
          titulo: saved.titulo,
          fecha: saved.fecha,
          hora: saved.hora,
          duracion: saved.duracion,
          participantes: saved.participantes,
          resumen: saved.resumen,
          empresa_id: saved.empresa_id
        });
        invalidate();
      });
    },
    onError: () => toast.error('Error al eliminar la reunión')
  });

  const field = (key: keyof FormState) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  });

  const loading = saveMutation.isPending || deleteMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{editingReunion ? 'Editar Reunión' : 'Nueva Reunión'}</DialogTitle>
          <DialogDescription>
            {editingReunion
              ? 'Editá los datos o agregá anotaciones post-reunión.'
              : 'Completá los datos para agendar una reunión.'}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-3 py-2'>
          <div className='space-y-1'>
            <Label htmlFor='titulo'>Título *</Label>
            <Input id='titulo' placeholder='Ej: Revisión de objetivos Q2' {...field('titulo')} />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1'>
              <Label htmlFor='fecha'>Fecha</Label>
              <Input id='fecha' type='date' {...field('fecha')} />
            </div>
            <div className='space-y-1'>
              <Label htmlFor='hora'>Hora</Label>
              <Input id='hora' type='time' {...field('hora')} />
            </div>
          </div>

          <div className='space-y-1'>
            <Label htmlFor='duracion'>Duración (minutos)</Label>
            <Input id='duracion' type='number' min={15} step={15} {...field('duracion')} />
          </div>

          <div className='space-y-1'>
            <Label htmlFor='participantes'>Participantes</Label>
            <Input
              id='participantes'
              placeholder='Ej: Ana García, Juan López'
              {...field('participantes')}
            />
            <p className='text-muted-foreground text-xs'>Separados por coma</p>
          </div>

          <div className='space-y-1'>
            <Label htmlFor='resumen'>Anotaciones</Label>
            <Textarea
              id='resumen'
              placeholder='Resumen, decisiones tomadas, próximos pasos...'
              rows={3}
              {...field('resumen')}
            />
          </div>
        </div>

        <DialogFooter className='gap-2'>
          {editingReunion && (
            <Button
              variant='destructive'
              size='sm'
              onClick={() => deleteMutation.mutate()}
              disabled={loading}
            >
              <Icons.trash className='mr-1 h-4 w-4' /> Eliminar
            </Button>
          )}
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={loading || !form.titulo.trim()}>
            {editingReunion ? 'Guardar' : 'Agendar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
