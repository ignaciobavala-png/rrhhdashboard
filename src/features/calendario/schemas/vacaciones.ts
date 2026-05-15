import * as z from 'zod';

export const vacacionesSchema = z.object({
  empleado_id: z.number({ message: 'Seleccioná un empleado' }),
  fecha_inicio: z
    .string({ message: 'Fecha de inicio requerida' })
    .min(1, 'Fecha de inicio requerida'),
  fecha_fin: z.string({ message: 'Fecha de fin requerida' }).min(1, 'Fecha de fin requerida'),
  periodo_anio: z
    .number({ message: 'Seleccioná el período' })
    .min(2020, 'Período inválido')
    .max(2030, 'Período inválido')
});

export type VacacionesFormValues = z.infer<typeof vacacionesSchema>;
