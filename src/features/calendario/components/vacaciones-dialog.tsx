'use client';

import { useState, useEffect } from 'react';
import { useAppForm } from '@/components/ui/tanstack-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { format, differenceInCalendarDays } from 'date-fns';
import { es } from 'date-fns/locale';
import type { EmpleadoCumpleanos } from '@/features/calendario/api/types';
import {
  vacacionesSchema,
  type VacacionesFormValues
} from '@/features/calendario/schemas/vacaciones';
import * as z from 'zod';

interface VacacionesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empleados: EmpleadoCumpleanos[];
  onSave: (values: VacacionesFormValues) => Promise<void>;
}

const periodos = Array.from({ length: 8 }, (_, i) => 2023 + i);

export function VacacionesDialog({ open, onOpenChange, empleados, onSave }: VacacionesDialogProps) {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      empleado_id: 0,
      fecha_inicio: '',
      fecha_fin: '',
      periodo_anio: new Date().getFullYear()
    } as VacacionesFormValues,
    validators: {
      onSubmit: vacacionesSchema
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setSaving(true);
      try {
        await onSave(value);
        form.reset();
        setDateRange({});
        onOpenChange(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al guardar');
      } finally {
        setSaving(false);
      }
    }
  });

  useEffect(() => {
    if (dateRange.from) {
      form.setFieldValue('fecha_inicio', format(dateRange.from, 'yyyy-MM-dd'));
    }
    if (dateRange.to) {
      form.setFieldValue('fecha_fin', format(dateRange.to, 'yyyy-MM-dd'));
    }
  }, [dateRange, form]);

  useEffect(() => {
    if (!open) {
      form.reset();
      setDateRange({});
      setError(null);
    }
  }, [open, form]);

  const diasCalculados =
    dateRange.from && dateRange.to ? differenceInCalendarDays(dateRange.to, dateRange.from) + 1 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <form.AppForm>
          <form.Form id='vacaciones-form' className='space-y-4 p-0 md:p-0'>
            <DialogHeader>
              <DialogTitle>Registrar Vacaciones</DialogTitle>
              <DialogDescription>
                Seleccioná empleado, período de fechas y año de imputación.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-2'>
              <div className='space-y-2'>
                <Label htmlFor='empleado'>Empleado</Label>
                <form.AppField
                  name='empleado_id'
                  validators={{ onBlur: z.number().min(1, 'Seleccioná un empleado') }}
                >
                  {(field) => (
                    <Select
                      value={field.state.value ? String(field.state.value) : ''}
                      onValueChange={(v) => {
                        field.handleChange(Number(v));
                        field.handleBlur();
                      }}
                    >
                      <SelectTrigger id='empleado'>
                        <SelectValue placeholder='Seleccionar empleado...' />
                      </SelectTrigger>
                      <SelectContent>
                        {empleados.map((emp) => (
                          <SelectItem key={emp.id} value={String(emp.id)}>
                            {emp.nombre_apellido}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </form.AppField>
              </div>

              <div className='space-y-2'>
                <Label>Rango de fechas</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateRange.from && 'text-muted-foreground'
                      )}
                    >
                      <Icons.calendar className='mr-2 h-4 w-4' />
                      {dateRange.from && dateRange.to
                        ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
                        : dateRange.from
                          ? `${format(dateRange.from, 'dd/MM/yyyy')} - ?`
                          : 'Seleccionar rango...'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='range'
                      selected={dateRange as DateRange | undefined}
                      onSelect={(range: DateRange | undefined) => setDateRange(range ?? {})}
                      locale={es}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                {diasCalculados > 0 && (
                  <p className='text-muted-foreground text-xs'>
                    {diasCalculados} día{diasCalculados !== 1 ? 's' : ''} corrido
                    {diasCalculados !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='periodo'>Período / Año de imputación</Label>
                <form.AppField
                  name='periodo_anio'
                  validators={{ onBlur: z.number().min(2020, 'Seleccioná un período') }}
                >
                  {(field) => (
                    <Select
                      value={String(field.state.value)}
                      onValueChange={(v) => {
                        field.handleChange(Number(v));
                        field.handleBlur();
                      }}
                    >
                      <SelectTrigger id='periodo'>
                        <SelectValue placeholder='Seleccionar período...' />
                      </SelectTrigger>
                      <SelectContent>
                        {periodos.map((anio) => (
                          <SelectItem key={anio} value={String(anio)}>
                            {anio}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </form.AppField>
              </div>

              {error && <p className='text-destructive text-sm'>{error}</p>}
            </div>

            <DialogFooter className='gap-2'>
              <Button variant='outline' type='button' onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <form.SubmitButton disabled={!diasCalculados}>
                <Icons.check className='mr-1 h-4 w-4' />
                {saving ? 'Guardando...' : 'Registrar'}
              </form.SubmitButton>
            </DialogFooter>
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}
