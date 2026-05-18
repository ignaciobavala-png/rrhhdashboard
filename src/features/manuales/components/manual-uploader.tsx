'use client';

import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { uploadManual } from '../api/service';

const ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx';
const ACCEPT_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

export function ManualUploader() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [tarea, setTarea] = useState('');
  const [area, setArea] = useState('');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = (f: File) => {
    if (!ACCEPT_MIME.includes(f.type)) {
      toast.error('Formato no soportado. Usá PDF, Word o Excel.');
      return;
    }
    setFile(f);
    if (!tarea) setTarea(f.name.replace(/\.[^.]+$/, '').replace(/_/g, ' '));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const submit = async () => {
    if (!file) return;
    if (!tarea.trim()) {
      toast.error('Ingresá un nombre para el manual.');
      return;
    }
    setLoading(true);
    try {
      await uploadManual({ file, tarea: tarea.trim(), area: area.trim() || 'General' });
      toast.success('Manual subido correctamente');
      queryClient.invalidateQueries({ queryKey: ['manuales'] });
      setFile(null);
      setTarea('');
      setArea('');
      if (inputRef.current) inputRef.current.value = '';
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al subir el manual');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='rounded-lg border bg-card p-4 space-y-4'>
      <p className='text-sm font-medium'>Subir manual</p>

      <div
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer
          ${dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type='file'
          accept={ACCEPT}
          className='hidden'
          onChange={onInputChange}
        />
        {file ? (
          <div className='flex items-center gap-2 text-sm'>
            <Icons.page className='h-5 w-5 text-primary' />
            <span className='font-medium'>{file.name}</span>
            <button
              className='ml-2 text-muted-foreground hover:text-destructive'
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setTarea('');
                if (inputRef.current) inputRef.current.value = '';
              }}
            >
              <Icons.close className='h-4 w-4' />
            </button>
          </div>
        ) : (
          <>
            <Icons.upload className='h-8 w-8 text-muted-foreground mb-2' />
            <p className='text-sm text-muted-foreground text-center'>
              Arrastrá un archivo o hacé click para seleccionar
            </p>
            <p className='text-xs text-muted-foreground mt-1'>PDF, Word o Excel — máx. 50 MB</p>
          </>
        )}
      </div>

      {file && (
        <div className='grid grid-cols-2 gap-3'>
          <div className='space-y-1'>
            <label className='text-xs font-medium'>Nombre del manual</label>
            <Input
              value={tarea}
              onChange={(e) => setTarea(e.target.value)}
              placeholder='Ej. Manual de incorporación'
              className='h-8 text-xs'
            />
          </div>
          <div className='space-y-1'>
            <label className='text-xs font-medium'>Área (opcional)</label>
            <Input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder='Ej. Comercial, RRHH...'
              className='h-8 text-xs'
            />
          </div>
        </div>
      )}

      {file && (
        <Button size='sm' onClick={submit} disabled={loading} className='w-full'>
          {loading ? (
            <>
              <Icons.spinner className='mr-2 h-4 w-4 animate-spin' /> Subiendo...
            </>
          ) : (
            <>
              <Icons.upload className='mr-2 h-4 w-4' /> Subir manual
            </>
          )}
        </Button>
      )}
    </div>
  );
}
