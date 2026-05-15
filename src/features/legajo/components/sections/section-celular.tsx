'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { EditableSection } from './editable-section';
import { updateEmpleado } from '../../api/service';

interface Props {
  empleadoId: number;
  celular: string | null;
}

export function SectionCelular({ empleadoId, celular }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(celular ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEmpleado(empleadoId, { celular: value || null });
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(celular ?? '');
    setEditing(false);
  };

  return (
    <EditableSection
      icon={<Icons.phone className='h-4 w-4' />}
      title='Celular'
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={handleCancel}
      onSave={handleSave}
      saving={saving}
    >
      {editing ? (
        <Input
          type='tel'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder='Ej: 1131535679'
        />
      ) : (
        <span>{celular ?? '—'}</span>
      )}
    </EditableSection>
  );
}
