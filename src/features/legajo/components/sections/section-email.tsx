'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { EditableSection } from './editable-section';
import { updateEmpleado } from '../../api/service';

interface Props {
  empleadoId: number;
  email: string | null;
}

export function SectionEmail({ empleadoId, email }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(email ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEmpleado(empleadoId, { email: value || null });
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(email ?? '');
    setEditing(false);
  };

  return (
    <EditableSection
      icon={<Icons.send className='h-4 w-4' />}
      title='Email'
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={handleCancel}
      onSave={handleSave}
      saving={saving}
    >
      {editing ? (
        <Input
          type='email'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder='email@empresa.com'
        />
      ) : (
        <span>{email ?? '—'}</span>
      )}
    </EditableSection>
  );
}
