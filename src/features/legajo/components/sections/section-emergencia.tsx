'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { EditableSection } from './editable-section';
import {
  parseContactoEmergencia,
  formatContactoEmergencia,
  updateEmpleado
} from '../../api/service';
import type { ContactoEmergencia } from '../../api/types';

interface Props {
  empleadoId: number;
  contactoEmergencia: string | null;
}

export function SectionEmergencia({ empleadoId, contactoEmergencia }: Props) {
  const parsed = parseContactoEmergencia(contactoEmergencia);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ContactoEmergencia>(
    parsed ?? { telefono: '', nombre: '', parentesco: '' }
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const raw = formatContactoEmergencia(form);
      await updateEmpleado(empleadoId, { contacto_emergencia: raw || null });
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(
      parseContactoEmergencia(contactoEmergencia) ?? { telefono: '', nombre: '', parentesco: '' }
    );
    setEditing(false);
  };

  return (
    <EditableSection
      icon={<Icons.user className='h-4 w-4' />}
      title='Contacto de Emergencia'
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={handleCancel}
      onSave={handleSave}
      saving={saving}
    >
      {editing ? (
        <div className='space-y-3'>
          <div className='space-y-1'>
            <Label className='text-xs'>Teléfono</Label>
            <Input
              type='tel'
              value={form.telefono}
              onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
              placeholder='Ej: 1131535679'
            />
          </div>
          <div className='space-y-1'>
            <Label className='text-xs'>Nombre</Label>
            <Input
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              placeholder='Ej: Sonia'
            />
          </div>
          <div className='space-y-1'>
            <Label className='text-xs'>Parentesco</Label>
            <Input
              value={form.parentesco}
              onChange={(e) => setForm((f) => ({ ...f, parentesco: e.target.value }))}
              placeholder='Ej: Madre, Hermana, etc.'
            />
          </div>
        </div>
      ) : parsed ? (
        <>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Teléfono</span>
            <span>{parsed.telefono || '—'}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Nombre</span>
            <span>{parsed.nombre || '—'}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Parentesco</span>
            <span>{parsed.parentesco || '—'}</span>
          </div>
        </>
      ) : (
        <span className='text-muted-foreground italic'>Sin información</span>
      )}
    </EditableSection>
  );
}
