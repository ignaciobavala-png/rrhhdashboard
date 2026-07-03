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
import type { EventoCalendario, EmpleadoCumpleanos } from '@/features/calendario/api/types';
import type { EventoCalendarioInput } from '@/features/calendario/api/service';

const tipos = [
  { value: 'estudio', label: 'Día de estudio' },
  { value: 'ausencia', label: 'Ausencia' },
  { value: 'mudanza', label: 'Mudanza' }
] as const;

interface EventoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fecha: Date;
  empleados: EmpleadoCumpleanos[];
  onSave: (input: EventoCalendarioInput, eventoId?: number) => void;
  onDelete?: (eventoId: number) => void;
  editingEvento?: EventoCalendario | null;
}

export function EventoDialog({
  open,
  onOpenChange,
  fecha,
  empleados,
  onSave,
  onDelete,
  editingEvento
}: EventoDialogProps) {
  const [tipo, setTipo] = useState<string>('estudio');
  const [empleadoId, setEmpleadoId] = useState<string>('');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    const tipoValido = tipos.some((t) => t.value === editingEvento?.tipo);
    setTipo(tipoValido ? (editingEvento?.tipo as string) : 'estudio');
    setEmpleadoId(editingEvento?.empleadoId ? String(editingEvento.empleadoId) : '');
    setDescripcion(editingEvento?.descripcion ?? '');
  }, [editingEvento, open]);

  const handleSubmit = () => {
    if (!empleadoId) return;
    onSave(
      {
        empleado_id: Number(empleadoId),
        tipo: tipo as EventoCalendarioInput['tipo'],
        fecha: format(fecha),
        descripcion: descripcion.trim() || null
      },
      editingEvento?.eventoId
    );
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
            {' · '}Para vacaciones usá el botón «Vacaciones»
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label htmlFor='tipo'>Tipo</Label>
            <Select value={tipo} onValueChange={setTipo}>
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
            <Select value={empleadoId} onValueChange={setEmpleadoId}>
              <SelectTrigger id='empleado'>
                <SelectValue placeholder='Seleccionar empleado' />
              </SelectTrigger>
              <SelectContent>
                {empleados.map((e) => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    {e.nombre_apellido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='descripcion'>Descripción (opcional)</Label>
            <Input
              id='descripcion'
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder='Ej: Examen final, trámite personal...'
            />
          </div>
        </div>

        <DialogFooter className='gap-2'>
          {editingEvento?.eventoId !== undefined && onDelete && (
            <Button
              variant='destructive'
              onClick={() => {
                onDelete(editingEvento.eventoId!);
                onOpenChange(false);
              }}
            >
              <Icons.trash className='mr-1 h-4 w-4' /> Eliminar
            </Button>
          )}
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!empleadoId}>
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
