'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Icons } from '@/components/icons';

function PinField({
  id,
  label,
  value,
  onChange
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className='grid gap-2'>
      <Label htmlFor={id}>{label}</Label>
      <InputOTP id={id} maxLength={6} value={value} onChange={onChange}>
        <InputOTPGroup>
          {Array.from({ length: 6 }).map((_, i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}

export function ChangePinForm() {
  const [current, setCurrent] = useState('');
  const [nuevo, setNuevo] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [loading, setLoading] = useState(false);

  const valid = current.length === 6 && nuevo.length === 6 && confirmacion.length === 6 && !loading;

  async function handleSubmit() {
    if (nuevo !== confirmacion) {
      toast.error('El nuevo PIN y su confirmación no coinciden');
      return;
    }
    if (nuevo === current) {
      toast.error('El nuevo PIN debe ser distinto al actual');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc('change_pin', {
      current_pin: current,
      new_pin: nuevo
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    const result = data as {
      ok: boolean;
      error?: string;
      locked?: boolean;
      retry_seconds?: number;
      remaining?: number;
    };

    if (!result.ok) {
      if (result.locked) {
        toast.error(
          `Demasiados intentos. Probá en ${Math.ceil((result.retry_seconds ?? 300) / 60)} min.`
        );
      } else if (result.error) {
        toast.error(result.error);
      } else {
        toast.error(`PIN actual incorrecto. Te quedan ${result.remaining ?? 0} intentos.`);
      }
      return;
    }

    toast.success('PIN actualizado correctamente');
    setCurrent('');
    setNuevo('');
    setConfirmacion('');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-base'>
          <Icons.lock className='h-4 w-4' /> PIN de acceso
        </CardTitle>
        <CardDescription>
          Cambiá el código de 6 dígitos con el que se ingresa al dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className='grid gap-4'>
        <PinField id='pin-actual' label='PIN actual' value={current} onChange={setCurrent} />
        <PinField id='pin-nuevo' label='Nuevo PIN' value={nuevo} onChange={setNuevo} />
        <PinField
          id='pin-confirmacion'
          label='Confirmar nuevo PIN'
          value={confirmacion}
          onChange={setConfirmacion}
        />
        <Button onClick={handleSubmit} disabled={!valid} className='justify-self-start'>
          {loading ? 'Guardando…' : 'Cambiar PIN'}
        </Button>
      </CardContent>
    </Card>
  );
}
