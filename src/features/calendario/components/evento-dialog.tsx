'use client';

import { useState, useEffect } from 'react';
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
import type { EventoCalendario } from '@/features/calendario/api/types';

const tipos = [
  { value: 'estudio', label: 'Día de estudio' },
  { value: 'ausencia', label: 'Ausencia' },
  { value: 'licencia', label: 'Licencia / Vacaciones' }
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
  onDelete?: (id: string) => void;
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
    tipo: editingEvento?.tipo ?? 'estudio',
    empleado: editingEvento?.empleado ?? '',
    titulo: editingEvento?.titulo ?? '',
    descripcion: editingEvento?.descripcion ?? ''
  });

  useEffect(() => {
    setForm({
      tipo: editingEvento?.tipo ?? 'estudio',
      empleado: editingEvento?.empleado ?? '',
      titulo: editingEvento?.titulo ?? '',
      descripcion: editingEvento?.descripcion ?? ''
    });
  }, [editingEvento, open]);

  const handleSubmit = () => {
    if (!form.empleado.trim()) return;
    onSave({
      fecha: format(fecha),
      tipo: form.tipo as EventoCalendario['tipo'],
      titulo: form.titulo
        ? form.titulo
        : (tipos.find((t) => t.value === form.tipo)?.label ?? form.tipo),
      empleado: form.empleado,
      empleadoId: 0,
      descripcion: form.descripcion
    });
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
            <Label htmlFor='titulo'>Título (opcional)</Label>
            <Input
              id='titulo'
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              placeholder='Ej: Examen final, Baja médica...'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='descripcion'>Descripción (opcional)</Label>
            <Input
              id='descripcion'
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              placeholder='Notas adicionales'
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

function format(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
