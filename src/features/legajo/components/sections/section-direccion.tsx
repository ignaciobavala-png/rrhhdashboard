'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { EditableSection } from './editable-section';
import { updateEmpleado } from '../../api/service';

interface Props {
  empleadoId: number;
  direccion: string | null;
}

export function SectionDireccion({ empleadoId, direccion }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(direccion ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEmpleado(empleadoId, { direccion: value || null });
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(direccion ?? '');
    setEditing(false);
  };

  return (
    <EditableSection
      icon={<Icons.building className='h-4 w-4' />}
      title='Dirección'
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
          placeholder='Dirección completa'
        />
      ) : (
        <span>{direccion ?? '—'}</span>
      )}
    </EditableSection>
  );
}
