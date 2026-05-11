'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { getEmpleadoById } from '@/features/legajo/api/service';

const SIN_INFO = <span className='text-muted-foreground italic text-xs'>Sin información</span>;

function initials(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function LegajoViewPage({ empleadoId }: { empleadoId: string }) {
  const { data: empleado } = useSuspenseQuery({
    queryKey: ['legajo', empleadoId],
    queryFn: () => getEmpleadoById(Number(empleadoId))
  });

  if (!empleado) notFound();

  const modalidadLabel =
    empleado.modalidad === 'home_office'
      ? 'Home Office'
      : empleado.modalidad === 'hibrido'
        ? 'Híbrido'
        : 'Presencial';

  const modalidadClass =
    empleado.modalidad === 'home_office'
      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      : empleado.modalidad === 'hibrido'
        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400';

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Avatar className='h-16 w-16'>
          <AvatarFallback className='text-lg'>{initials(empleado.nombre_apellido)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className='text-xl font-semibold'>{empleado.nombre_apellido}</h3>
          <p className='text-muted-foreground text-sm'>{empleado.equipo_ingreso ?? 'Sin equipo'}</p>
          <Badge
            variant='outline'
            className={
              empleado.activo
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 text-red-600 dark:text-red-400'
            }
          >
            {empleado.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Icons.user className='h-4 w-4' /> Datos Personales
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>DNI</span>
              <span>{empleado.dni ?? SIN_INFO}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Email</span>
              <span>{empleado.email ?? SIN_INFO}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Celular</span>
              <span>{empleado.celular ?? SIN_INFO}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Dirección</span>
              <span>{empleado.direccion ?? SIN_INFO}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Fecha de Nacimiento</span>
              <span>
                {empleado.fecha_nacimiento
                  ? new Date(empleado.fecha_nacimiento).toLocaleDateString('es-AR')
                  : SIN_INFO}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Contacto emergencia</span>
              <span>{empleado.contacto_emergencia ?? SIN_INFO}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Icons.building className='h-4 w-4' /> Datos Laborales
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Equipo</span>
              <span>{empleado.equipo_ingreso ?? SIN_INFO}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Fecha de Ingreso</span>
              <span>
                {empleado.fecha_ingreso
                  ? new Date(empleado.fecha_ingreso).toLocaleDateString('es-AR')
                  : SIN_INFO}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Modalidad</span>
              <Badge variant='outline' className={modalidadClass}>
                {modalidadLabel}
              </Badge>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Movilidad</span>
              <span>{empleado.movilidad ?? SIN_INFO}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
