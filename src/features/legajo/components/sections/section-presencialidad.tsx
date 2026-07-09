'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { EditableSection } from './editable-section';
import { updateEmpleado, updateHomeOffice } from '../../api/service';
import type { HomeOfficeDia } from '../../api/types';

interface Props {
  empleadoId: number;
  modalidad: string;
  homeOffice: HomeOfficeDia[];
  onDataChange: () => void;
}

const modalidadOptions = [
  { value: 'presencial', label: 'Presencial', color: 'bg-blue-500/10 text-blue-600' },
  { value: 'home_office', label: 'Home Office', color: 'bg-emerald-500/10 text-emerald-600' },
  { value: 'hibrido', label: 'Híbrido', color: 'bg-amber-500/10 text-amber-600' },
  { value: 'n/a', label: 'N/A', color: 'bg-gray-500/10 text-gray-600' }
] as const;

const diaLabels: Record<string, string> = {
  lu: 'Lun',
  ma: 'Mar',
  mi: 'Mié',
  ju: 'Jue',
  vi: 'Vie'
};

export function SectionPresencialidad({ empleadoId, modalidad, homeOffice, onDataChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [editModalidad, setEditModalidad] = useState(modalidad);
  const [editHO, setEditHO] = useState<Record<string, 'Presencial' | 'Remoto'>>(() => {
    const map: Record<string, 'Presencial' | 'Remoto'> = {};
    for (const h of homeOffice) {
      map[h.dia_semana] = h.modalidad;
    }
    return map;
  });
  const [saving, setSaving] = useState(false);

  const currentLabel = modalidadOptions.find((o) => o.value === modalidad);
  const currentColor = currentLabel?.color ?? '';

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEmpleado(empleadoId, {
        modalidad: editModalidad as 'presencial' | 'home_office' | 'hibrido' | 'n/a'
      });
      for (const h of homeOffice) {
        const newMod = editHO[h.dia_semana];
        if (newMod && newMod !== h.modalidad) {
          await updateHomeOffice(h.id, newMod);
        }
      }
      setEditing(false);
      onDataChange();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditModalidad(modalidad);
    const map: Record<string, 'Presencial' | 'Remoto'> = {};
    for (const h of homeOffice) {
      map[h.dia_semana] = h.modalidad;
    }
    setEditHO(map);
    setEditing(false);
  };

  const toggleHO = (dia: string) => {
    setEditHO((prev) => ({
      ...prev,
      [dia]: prev[dia] === 'Presencial' ? 'Remoto' : 'Presencial'
    }));
  };

  return (
    <EditableSection
      icon={<Icons.clock className='h-4 w-4' />}
      title='Presencialidad'
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={handleCancel}
      onSave={handleSave}
      saving={saving}
    >
      <div className='flex justify-between'>
        <span className='text-muted-foreground'>Modalidad</span>
        {editing ? (
          <div className='flex gap-1'>
            {modalidadOptions.map((opt) => (
              <Badge
                key={opt.value}
                variant='outline'
                className={`cursor-pointer ${editModalidad === opt.value ? opt.color : ''}`}
                onClick={() => setEditModalidad(opt.value)}
              >
                {opt.label}
              </Badge>
            ))}
          </div>
        ) : (
          <Badge variant='outline' className={currentColor}>
            {currentLabel?.label ?? modalidad}
          </Badge>
        )}
      </div>

      <div className='space-y-1'>
        <span className='text-muted-foreground text-xs'>Semana</span>
        {['lu', 'ma', 'mi', 'ju', 'vi'].map((dia) => {
          const mod = editing
            ? editHO[dia]
            : homeOffice.find((h) => h.dia_semana === dia)?.modalidad;
          return (
            <div key={dia} className='flex justify-between'>
              <span className='text-muted-foreground text-xs'>{diaLabels[dia]}</span>
              {editing ? (
                <Badge
                  variant='outline'
                  className={`cursor-pointer text-xs ${mod === 'Remoto' ? 'bg-emerald-500/10 text-emerald-600' : ''}`}
                  onClick={() => toggleHO(dia)}
                >
                  {mod === 'Remoto' ? 'Remoto' : 'Presencial'}
                </Badge>
              ) : (
                <span className='text-xs'>{mod === 'Remoto' ? '🌐 Remoto' : '🏢 Presencial'}</span>
              )}
            </div>
          );
        })}
      </div>
    </EditableSection>
  );
}
