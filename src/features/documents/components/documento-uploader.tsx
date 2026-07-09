'use client';

import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { showUndoToast } from '@/lib/undo-toast';
import { uploadDocumento, deleteDocumento, getEmpleadosParaDocumento } from '../api/service';
import type { TipoDocumento } from '../api/types';

const ACCEPT = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
const ACCEPT_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png'
];

const TIPOS: { value: TipoDocumento; label: string }[] = [
  { value: 'contrato', label: 'Contrato' },
  { value: 'dni', label: 'DNI / Identificación' },
  { value: 'certificado', label: 'Certificado' },
  { value: 'otro', label: 'Otro' }
];

interface DocumentoUploaderProps {
  empleadoIdFijo?: number;
}

export function DocumentoUploader({ empleadoIdFijo }: DocumentoUploaderProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [empleadoId, setEmpleadoId] = useState<number>(empleadoIdFijo ?? 0);
  const [tipo, setTipo] = useState<TipoDocumento>('contrato');
  const [tipoOtro, setTipoOtro] = useState('');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: empleados = [] } = useQuery({
    queryKey: ['documentos', 'empleados'],
    queryFn: getEmpleadosParaDocumento,
    enabled: !empleadoIdFijo
  });

  const handleFile = (f: File) => {
    if (!ACCEPT_MIME.includes(f.type)) {
      toast.error('Formato no soportado. Usá PDF, Word o imagen.');
      return;
    }
    setFile(f);
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

  const reset = () => {
    setFile(null);
    setTipoOtro('');
    if (!empleadoIdFijo) setEmpleadoId(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  const submit = async () => {
    if (!file) return;
    if (!empleadoId) {
      toast.error('Seleccioná un empleado.');
      return;
    }
    if (tipo === 'otro' && !tipoOtro.trim()) {
      toast.error('Ingresá una descripción para "Otro".');
      return;
    }
    setLoading(true);
    try {
      const documento = await uploadDocumento({
        file,
        empleado_id: empleadoId,
        tipo,
        tipo_otro: tipoOtro
      });
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      reset();
      showUndoToast('Documento subido correctamente', async () => {
        await deleteDocumento(documento);
        queryClient.invalidateQueries({ queryKey: ['documentos'] });
      });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al subir el documento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='rounded-lg border bg-card p-4 space-y-4'>
      <p className='text-sm font-medium'>Subir documento</p>

      <div
        role='button'
        tabIndex={0}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer
          ${dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
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
            <p className='text-xs text-muted-foreground mt-1'>PDF, Word o imagen — máx. 50 MB</p>
          </>
        )}
      </div>

      {file && (
        <div className='grid grid-cols-2 gap-3'>
          {!empleadoIdFijo && (
            <div className='space-y-1'>
              <label htmlFor='doc-empleado' className='text-xs font-medium'>
                Empleado
              </label>
              <select
                id='doc-empleado'
                value={empleadoId}
                onChange={(e) => setEmpleadoId(Number(e.target.value))}
                className='h-8 w-full rounded-md border bg-background px-2 text-xs'
              >
                <option value={0}>Seleccionar...</option>
                {empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre_apellido}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className='space-y-1'>
            <label htmlFor='doc-tipo' className='text-xs font-medium'>
              Tipo de documento
            </label>
            <select
              id='doc-tipo'
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoDocumento)}
              className='h-8 w-full rounded-md border bg-background px-2 text-xs'
            >
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          {tipo === 'otro' && (
            <div className='col-span-2 space-y-1'>
              <label htmlFor='doc-tipo-otro' className='text-xs font-medium'>
                Descripción
              </label>
              <Input
                id='doc-tipo-otro'
                value={tipoOtro}
                onChange={(e) => setTipoOtro(e.target.value)}
                placeholder='Ej: Constancia de CBU, Título...'
                className='h-8 text-xs'
              />
            </div>
          )}
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
              <Icons.upload className='mr-2 h-4 w-4' /> Subir documento
            </>
          )}
        </Button>
      )}
    </div>
  );
}
