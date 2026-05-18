'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { showUndoToast } from '@/lib/undo-toast';
import { createLaptop, deleteLaptop } from '../api/service';
import type { LaptopInput } from '../api/types';

const EMPTY: LaptopInput = {
  marca: '',
  modelo: '',
  numero_serie: '',
  usuario: '',
  equipo: '',
  ubicacion: '',
  comentarios: '',
  estado: 'disponible'
};

interface LaptopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LaptopDialog({ open, onOpenChange }: LaptopDialogProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<LaptopInput>(EMPTY);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof LaptopInput, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleClose = () => {
    setForm(EMPTY);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { id } = await createLaptop(form);
      queryClient.invalidateQueries({ queryKey: ['flota-laptops'] });
      handleClose();
      showUndoToast('Laptop registrada correctamente', async () => {
        await deleteLaptop(id);
        queryClient.invalidateQueries({ queryKey: ['flota-laptops'] });
      });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Nueva Laptop</DialogTitle>
        </DialogHeader>

        <div className='grid grid-cols-2 gap-4 py-2'>
          <div className='space-y-1.5'>
            <Label className='text-xs'>Marca</Label>
            <Input
              value={form.marca}
              onChange={(e) => set('marca', e.target.value)}
              placeholder='Dell, HP, Lenovo...'
              className='h-8 text-xs'
            />
          </div>
          <div className='space-y-1.5'>
            <Label className='text-xs'>Modelo</Label>
            <Input
              value={form.modelo}
              onChange={(e) => set('modelo', e.target.value)}
              placeholder='Latitude 5540...'
              className='h-8 text-xs'
            />
          </div>

          <div className='space-y-1.5'>
            <Label className='text-xs'>Nº de Serie</Label>
            <Input
              value={form.numero_serie}
              onChange={(e) => set('numero_serie', e.target.value)}
              placeholder='SN-12345...'
              className='h-8 text-xs'
            />
          </div>
          <div className='space-y-1.5'>
            <Label className='text-xs'>Estado</Label>
            <select
              value={form.estado}
              onChange={(e) => set('estado', e.target.value as LaptopInput['estado'])}
              className='h-8 w-full rounded-md border bg-background px-2 text-xs'
            >
              <option value='disponible'>Disponible</option>
              <option value='asignado'>Asignado</option>
              <option value='baja'>De Baja</option>
            </select>
          </div>

          <div className='space-y-1.5'>
            <Label className='text-xs'>Usuario</Label>
            <Input
              value={form.usuario}
              onChange={(e) => set('usuario', e.target.value)}
              placeholder='jperez, juan.perez...'
              className='h-8 text-xs'
            />
          </div>
          <div className='space-y-1.5'>
            <Label className='text-xs'>Equipo / Área</Label>
            <Input
              value={form.equipo}
              onChange={(e) => set('equipo', e.target.value)}
              placeholder='Comercial, RRHH...'
              className='h-8 text-xs'
            />
          </div>

          <div className='col-span-2 space-y-1.5'>
            <Label className='text-xs'>Ubicación</Label>
            <Input
              value={form.ubicacion}
              onChange={(e) => set('ubicacion', e.target.value)}
              placeholder='Oficina central, Remoto...'
              className='h-8 text-xs'
            />
          </div>

          <div className='col-span-2 space-y-1.5'>
            <Label className='text-xs'>Comentarios / Detalles</Label>
            <Textarea
              value={form.comentarios}
              onChange={(e) => set('comentarios', e.target.value)}
              placeholder='Observaciones, accesorios, estado físico...'
              className='min-h-[80px] text-xs resize-none'
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' size='sm' onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button size='sm' onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Icons.spinner className='mr-2 h-4 w-4 animate-spin' /> Guardando...
              </>
            ) : (
              'Guardar laptop'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
