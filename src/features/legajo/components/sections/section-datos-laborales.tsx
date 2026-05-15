'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { EditableSection } from './editable-section';
import { updateEmpleado, upsertPuesto } from '../../api/service';

interface Props {
  empleadoId: number;
  dni: string | null;
  equipo_ingreso: string | null;
  fecha_ingreso: string | null;
  puesto: string | null;
}

const SIN_INFO = (
  <span className='text-muted-foreground italic text-xs'>Sin informaci&oacute;n</span>
);

export function SectionDatosLaborales({
  empleadoId,
  dni,
  equipo_ingreso,
  fecha_ingreso,
  puesto
}: Props) {
  const [editing, setEditing] = useState(false);
  const [dniVal, setDniVal] = useState(dni ?? '');
  const [equipoVal, setEquipoVal] = useState(equipo_ingreso ?? '');
  const [fechaIVal, setFechaIVal] = useState(fecha_ingreso ?? '');
  const [puestoVal, setPuestoVal] = useState(puesto ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateEmpleado(empleadoId, {
          dni: dniVal || null,
          equipo_ingreso: equipoVal || null,
          fecha_ingreso: fechaIVal || null
        }),
        upsertPuesto(empleadoId, puestoVal || null)
      ]);
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDniVal(dni ?? '');
    setEquipoVal(equipo_ingreso ?? '');
    setFechaIVal(fecha_ingreso ?? '');
    setPuestoVal(puesto ?? '');
    setEditing(false);
  };

  const fmtDate = (d: string | null) => {
    if (!d) return SIN_INFO;
    return new Date(d).toLocaleDateString('es-AR');
  };

  return (
    <EditableSection
      icon={<Icons.building className='h-4 w-4' />}
      title='Datos Laborales'
      editing={editing}
      onEdit={() => setEditing(true)}
      onCancel={handleCancel}
      onSave={handleSave}
      saving={saving}
    >
      <div className='space-y-3'>
        <div className='flex items-center justify-between gap-4'>
          <span className='text-muted-foreground shrink-0'>DNI</span>
          {editing ? (
            <Input
              value={dniVal}
              onChange={(e) => setDniVal(e.target.value)}
              placeholder='DNI'
              className='h-8 w-48 text-right'
            />
          ) : (
            <span>{dni ?? SIN_INFO}</span>
          )}
        </div>
        <div className='flex items-center justify-between gap-4'>
          <span className='text-muted-foreground shrink-0'>Equipo</span>
          {editing ? (
            <Input
              value={equipoVal}
              onChange={(e) => setEquipoVal(e.target.value)}
              placeholder='Equipo'
              className='h-8 w-48 text-right'
            />
          ) : (
            <span>{equipo_ingreso ?? SIN_INFO}</span>
          )}
        </div>
        <div className='flex items-center justify-between gap-4'>
          <span className='text-muted-foreground shrink-0'>Fecha de Ingreso</span>
          {editing ? (
            <Input
              type='date'
              value={fechaIVal}
              onChange={(e) => setFechaIVal(e.target.value)}
              className='h-8 w-48 text-right'
            />
          ) : (
            <span>{fmtDate(fecha_ingreso)}</span>
          )}
        </div>
        <div className='flex items-center justify-between gap-4'>
          <span className='text-muted-foreground shrink-0'>Puesto</span>
          {editing ? (
            <Input
              value={puestoVal}
              onChange={(e) => setPuestoVal(e.target.value)}
              placeholder='Puesto'
              className='h-8 w-48 text-right'
            />
          ) : (
            <span>{puesto ?? SIN_INFO}</span>
          )}
        </div>
      </div>
    </EditableSection>
  );
}
