'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { EditableSection } from './editable-section';
import { updateEmpleado } from '../../api/service';

interface Props {
  empleadoId: number;
  movilidad: string | null;
}

export function SectionMovilidad({ empleadoId, movilidad }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(movilidad ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEmpleado(empleadoId, { movilidad: value || null });
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(movilidad ?? '');
    setEditing(false);
  };

  return (
    <EditableSection
      icon={<Icons.mobile className='h-4 w-4' />}
      title='Movilidad'
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={handleCancel}
      onSave={handleSave}
      saving={saving}
    >
      {editing ? (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder='Ej: Auto propio, Tren, etc.'
        />
      ) : (
        <span>{movilidad ?? '—'}</span>
      )}
    </EditableSection>
  );
}
