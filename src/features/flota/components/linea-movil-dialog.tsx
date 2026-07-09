'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { showUndoToast } from '@/lib/undo-toast';
import {
  createLineaMovil,
  deleteLineaMovil,
  getEmpleadosParaLinea,
  updateLineaMovil
} from '../api/service';
import type { LineaMovil, LineaMovilInput } from '../api/types';

const EMPTY: LineaMovilInput = {
  numero: '',
  rol: '',
  usuario: '',
  equipo: '',
  estado: 'disponible',
  empleado_id: null
};

function toInput(linea: LineaMovil): LineaMovilInput {
  return {
    numero: linea.numero,
    rol: linea.rol ?? '',
    usuario: linea.usuario ?? '',
    equipo: linea.equipo ?? '',
    estado: linea.estado,
    empleado_id: linea.empleado_id
  };
}

interface LineaMovilDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  linea?: LineaMovil;
}

export function LineaMovilDialog({ open, onOpenChange, linea }: LineaMovilDialogProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<LineaMovilInput>(() => (linea ? toInput(linea) : EMPTY));
  const [loading, setLoading] = useState(false);
  const wasOpen = useRef(false);

  const { data: empleados = [] } = useQuery({
    queryKey: ['flota', 'empleados'],
    queryFn: getEmpleadosParaLinea,
    enabled: open
  });

  useEffect(() => {
    if (open && !wasOpen.current) setForm(linea ? toInput(linea) : EMPTY);
    wasOpen.current = open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (key: keyof LineaMovilInput, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setEmpleadoId = (value: string) =>
    setForm((prev) => ({ ...prev, empleado_id: value ? Number(value) : null }));

  const handleClose = () => {
    setForm(linea ? toInput(linea) : EMPTY);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (linea) {
        await updateLineaMovil(linea.id, form);
        queryClient.invalidateQueries({ queryKey: ['flota'] });
        handleClose();
        toast.success('Línea actualizada correctamente');
      } else {
        const { id } = await createLineaMovil(form);
        queryClient.invalidateQueries({ queryKey: ['flota'] });
        handleClose();
        showUndoToast('Línea registrada correctamente', async () => {
          await deleteLineaMovil(id);
          queryClient.invalidateQueries({ queryKey: ['flota'] });
        });
      }
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
          <DialogTitle>{linea ? 'Editar Línea' : 'Nueva Línea'}</DialogTitle>
        </DialogHeader>

        <div className='grid grid-cols-2 gap-4 py-2'>
          <div className='space-y-1.5'>
            <Label className='text-xs'>Número</Label>
            <Input
              value={form.numero}
              onChange={(e) => set('numero', e.target.value)}
              placeholder='11 2345-6789'
              className='h-8 text-xs'
            />
          </div>
          <div className='space-y-1.5'>
            <Label className='text-xs'>Rol</Label>
            <Input
              value={form.rol}
              onChange={(e) => set('rol', e.target.value)}
              placeholder='Comercial, Gerencial...'
              className='h-8 text-xs'
            />
          </div>

          <div className='col-span-2 space-y-1.5'>
            <Label className='text-xs'>Empleado asignado</Label>
            <select
              value={form.empleado_id ?? ''}
              onChange={(e) => setEmpleadoId(e.target.value)}
              className='h-8 w-full rounded-md border bg-background px-2 text-xs'
            >
              <option value=''>Sin asignar</option>
              {empleados.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre_apellido}
                </option>
              ))}
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
            <Label className='text-xs'>Estado</Label>
            <select
              value={form.estado}
              onChange={(e) => set('estado', e.target.value as LineaMovilInput['estado'])}
              className='h-8 w-full rounded-md border bg-background px-2 text-xs'
            >
              <option value='disponible'>Disponible</option>
              <option value='asignado'>Asignado</option>
              <option value='baja'>De Baja</option>
            </select>
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
            ) : linea ? (
              'Guardar cambios'
            ) : (
              'Guardar línea'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
