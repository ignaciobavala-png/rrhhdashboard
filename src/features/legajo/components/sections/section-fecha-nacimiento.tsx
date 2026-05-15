'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { EditableSection } from './editable-section';
import { updateEmpleado } from '../../api/service';

interface Props {
  empleadoId: number;
  fechaNacimiento: string | null;
}

export function SectionFechaNacimiento({ empleadoId, fechaNacimiento }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(fechaNacimiento ?? '');
  const [saving, setSaving] = useState(false);

  const edad = fechaNacimiento
    ? Math.floor((Date.now() - new Date(fechaNacimiento).getTime()) / 31557600000)
    : null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEmpleado(empleadoId, { fecha_nacimiento: value || null });
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(fechaNacimiento ?? '');
    setEditing(false);
  };

  return (
    <EditableSection
      icon={<Icons.calendar className='h-4 w-4' />}
      title='Fecha de Nacimiento'
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={handleCancel}
      onSave={handleSave}
      saving={saving}
    >
      {editing ? (
        <Input type='date' value={value} onChange={(e) => setValue(e.target.value)} />
      ) : (
        <>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Fecha</span>
            <span>
              {fechaNacimiento ? new Date(fechaNacimiento).toLocaleDateString('es-AR') : '—'}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Edad</span>
            <span>{edad !== null ? `${edad} años` : '—'}</span>
          </div>
        </>
      )}
    </EditableSection>
  );
}
