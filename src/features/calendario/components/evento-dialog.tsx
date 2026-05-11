'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
type EventoCalendario = {
  id: number;
  fecha: string;
  titulo: string;
  tipo: 'licencia' | 'sueldo' | 'estudio' | 'ausencia';
  empleado: string;
  empleadoId: number;
  descripcion?: string;
};

const tipos = [
  { value: 'licencia', label: 'Licencia' },
  { value: 'sueldo', label: 'Sueldo' },
  { value: 'estudio', label: 'Estudio' },
  { value: 'ausencia', label: 'Ausencia' }
] as const;

type EventoForm = {
  tipo: string;
  empleado: string;
  titulo: string;
  descripcion: string;
};

interface EventoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fecha: Date;
  onSave: (evento: Omit<EventoCalendario, 'id'>) => void;
  onDelete?: (id: number) => void;
  editingEvento?: EventoCalendario | null;
}

export function EventoDialog({
  open,
  onOpenChange,
  fecha,
  onSave,
  onDelete,
  editingEvento
}: EventoDialogProps) {
  const [form, setForm] = useState<EventoForm>({
    tipo: editingEvento?.tipo ?? 'licencia',
    empleado: editingEvento?.empleado ?? '',
    titulo: editingEvento?.titulo ?? '',
    descripcion: editingEvento?.descripcion ?? ''
  });

  const handleSubmit = () => {
    if (!form.empleado.trim()) return;
    onSave({
      fecha: fecha.toISOString(),
      tipo: form.tipo as EventoCalendario['tipo'],
      titulo: form.titulo,
      empleado: form.empleado,
      empleadoId: 0,
      descripcion: form.descripcion
    });
    setForm({ tipo: 'licencia', empleado: '', titulo: '', descripcion: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingEvento ? 'Editar Evento' : 'Nuevo Evento'}</DialogTitle>
          <DialogDescription>
            {fecha.toLocaleDateString('es-AR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label htmlFor='tipo'>Tipo</Label>
            <Select value={form.tipo} onValueChange={(v) => setForm((f) => ({ ...f, tipo: v }))}>
              <SelectTrigger id='tipo'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tipos.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='empleado'>Empleado</Label>
            <Input
              id='empleado'
              value={form.empleado}
              onChange={(e) => setForm((f) => ({ ...f, empleado: e.target.value }))}
              placeholder='Nombre del empleado'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='titulo'>Título</Label>
            <Input
              id='titulo'
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              placeholder='Ej: Licencia médica, Pago mensual...'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='descripcion'>Descripción</Label>
            <Input
              id='descripcion'
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              placeholder='Descripción opcional'
            />
          </div>
        </div>

        <DialogFooter className='gap-2'>
          {editingEvento && onDelete && (
            <Button
              variant='destructive'
              onClick={() => {
                onDelete(editingEvento.id);
                onOpenChange(false);
              }}
            >
              <Icons.trash className='mr-1 h-4 w-4' /> Eliminar
            </Button>
          )}
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!form.empleado.trim()}>
            {editingEvento ? 'Guardar' : 'Agregar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
